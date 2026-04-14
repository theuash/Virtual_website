import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { User } from '../models/User.js';
import { Client } from '../models/Client.js';
import { Freelancer } from '../models/Freelancer.js';
import { generateOtpCode } from './pythonOtp.service.js';
import { sendWhatsAppOtp, maskPhoneNumber } from './whatsapp.service.js';

const OTP_EXPIRY_MS = 10 * 60 * 1000;

// Temporary in-memory storage for pending signups (key: email+phone combo)
const pendingSignups = new Map();

// Auto-cleanup old entries
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of pendingSignups.entries()) {
    if (data.expiresAt < now) {
      pendingSignups.delete(key);
    }
  }
}, 60000); // Clean every minute

export const generateTokens = (id) => {
  const token = jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN });
  const refreshToken = jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN });
  return { token, refreshToken };
};

const normalizePhone = (phone) => {
  const trimmed = String(phone || '').trim();
  if (!trimmed) return '';
  const normalized = trimmed.replace(/[^\d+]/g, '');
  if (!normalized) return '';
  return normalized.startsWith('+') ? normalized : `+${normalized}`;
};

const sanitizeUser = (user) => {
  const userObj = user.toObject();
  delete userObj.passwordHash;
  delete userObj.otpCodeHash;
  return userObj;
};

const ensureOtpIsActive = (user, expectedContext) => {
  if (!user.otpCodeHash || !user.otpExpiresAt || user.otpContext !== expectedContext) {
    throw new Error('No active verification code found. Please request a new code.');
  }

  if (user.otpExpiresAt.getTime() < Date.now()) {
    throw new Error('Verification code expired. Please request a new code.');
  }
};

const issuePhoneOtp = async (user, context) => {
  const normalizedPhone = normalizePhone(user.phone);

  if (!normalizedPhone) {
    throw new Error('A valid phone number is required for OTP verification.');
  }

  const otp = await generateOtpCode();
  const salt = await bcrypt.genSalt(10);
  const otpCodeHash = await bcrypt.hash(otp, salt);
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  user.phone = normalizedPhone;
  user.otpCodeHash = otpCodeHash;
  user.otpContext = context;
  user.otpExpiresAt = otpExpiresAt;
  user.otpSentAt = new Date();
  user.loginOtpPending = context === 'login';

  await user.save();

  const delivery = await sendWhatsAppOtp(normalizedPhone, otp, context);

  return {
    otpSent: true,
    destination: delivery.destination || maskPhoneNumber(normalizedPhone),
    previewCode: delivery.preview,
  };
};

const createUserByRole = async (data, passwordHash) => {
  const { role, email, fullName, skill, dob, company, phone, portfolioUrl } = data;
  const normalizedPhone = normalizePhone(phone);

  if (!normalizedPhone) {
    throw new Error('Phone number is required');
  }

  const commonFields = {
    email,
    passwordHash,
    role,
    fullName,
    phone: normalizedPhone,
    authMethod: 'password',
  };

  if (role === 'client') {
    return Client.create({ ...commonFields, companyName: company });
  }

  if (role === 'freelancer') {
    return Freelancer.create({
      ...commonFields,
      primarySkill: skill,
      dateOfBirth: dob,
      portfolioUrl,
    });
  }

  if (role === 'admin') {
    return User.create(commonFields);
  }

  throw new Error('Invalid role');
};

export const registerUser = async (data) => {
  const { email, password, phone } = data;
  const normalizedPhone = normalizePhone(phone);

  if (!email) throw new Error('Email is required');
  if (!password) throw new Error('Password is required');
  if (!normalizedPhone) throw new Error('Valid phone number is required');

  // Check for duplicate email in User collection
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    throw new Error('Email already registered. Please login or use a different email.');
  }

  // Check for duplicate phone in User collection
  const existingPhone = await User.findOne({ phone: normalizedPhone });
  if (existingPhone) {
    throw new Error('Phone number already registered. Please login or use a different number.');
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  // Generate OTP
  const otp = await generateOtpCode();
  const otpSalt = await bcrypt.genSalt(10);
  const otpCodeHash = await bcrypt.hash(otp, otpSalt);
  const otpExpiresAt = new Date(Date.now() + OTP_EXPIRY_MS);

  // Store in temporary pending signups (NOT in User collection)
  const pendingKey = `${email}:${normalizedPhone}`;
  pendingSignups.set(pendingKey, {
    ...data,
    email,
    phone: normalizedPhone,
    passwordHash,
    otpCodeHash,
    otpExpiresAt: otpExpiresAt.getTime(),
    expiresAt: Date.now() + OTP_EXPIRY_MS,
  });

  // Send OTP
  const delivery = await sendWhatsAppOtp(normalizedPhone, otp, 'signup');

  return {
    success: true,
    requiresTwoFactor: true,
    user: {
      email,
      phone: normalizedPhone,
      fullName: data.fullName,
      role: data.role,
    },
    message: `Verification code sent to ${delivery.destination}. Verify to complete signup.`,
    otpSent: delivery.delivered,
    previewCode: delivery.preview,
  };
};

export const registerWithOtp = registerUser;

export const loginUser = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('Invalid email or password');
  }

  if (!user.passwordHash) {
    throw new Error('This account is missing a password. Please reset it before logging in.');
  }

  if (!(await user.matchPassword(password))) {
    throw new Error('Invalid email or password');
  }

  if (user.isSuspended) throw new Error('Account suspended');
  if (!user.isVerified) throw new Error('Please complete phone verification before logging in.');

  if (!user.phoneVerified || !user.phone) {
    const { token, refreshToken } = generateTokens(user._id);
    return {
      user: sanitizeUser(user),
      token,
      refreshToken,
      requiresTwoFactor: false,
    };
  }

  const otpResult = await issuePhoneOtp(user, 'login');

  return {
    requiresTwoFactor: true,
    email: user.email,
    phone: otpResult.destination,
    otpSent: otpResult.otpSent,
    previewCode: otpResult.previewCode,
    message: `Verification code sent to ${otpResult.destination}.`,
  };
};

export const loginWithOtpRequest = async (email) => {
  const user = await User.findOne({ email });

  if (!user) {
    throw new Error('User not found');
  }

  if (user.isSuspended) {
    throw new Error('Account suspended');
  }

  if (!user.loginOtpPending || user.otpContext !== 'login') {
    throw new Error('Complete your password step before requesting another login code.');
  }

  const otpResult = await issuePhoneOtp(user, 'login');

  return {
    success: true,
    message: `Verification code sent to ${otpResult.destination}.`,
    otpSent: true,
    phone: otpResult.destination,
    previewCode: otpResult.previewCode,
  };
};

export const requestSignupOtp = async (email) => {
  if (!email) throw new Error('Email is required');

  // For resend, we need to check if there's a pending signup for this email
  // Find the pending entry by email (it might have multiple phone variants, so we search)
  let tempData = null;
  let pendingKey = null;

  for (const [key, data] of pendingSignups.entries()) {
    if (data.email === email) {
      tempData = data;
      pendingKey = key;
      break;
    }
  }

  if (!tempData) {
    throw new Error('No pending signup found for this email. Please register again.');
  }

  // Generate new OTP
  const otp = await generateOtpCode();
  const otpSalt = await bcrypt.genSalt(10);
  const otpCodeHash = await bcrypt.hash(otp, otpSalt);
  const otpExpiresAt = Date.now() + OTP_EXPIRY_MS;

  // Update temp data with new OTP
  tempData.otpCodeHash = otpCodeHash;
  tempData.otpExpiresAt = otpExpiresAt;
  tempData.expiresAt = Date.now() + OTP_EXPIRY_MS;
  pendingSignups.set(pendingKey, tempData);

  // Send OTP again
  const delivery = await sendWhatsAppOtp(tempData.phone, otp, 'signup');

  return {
    success: true,
    message: `Verification code resent to ${delivery.destination}.`,
    otpSent: true,
    phone: delivery.destination,
    previewCode: delivery.preview,
  };
};

export const verifyOtpAndLogin = async (email, token) => {
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error('User not found');
  }

  ensureOtpIsActive(user, 'login');

  const isValidCode = await bcrypt.compare(token, user.otpCodeHash);
  if (!isValidCode) {
    throw new Error('Invalid verification code');
  }

  user.otpVerified = true;
  user.isVerified = true;
  user.phoneVerified = true;
  user.phoneVerifiedAt = new Date();
  user.loginOtpPending = false;
  user.otpCodeHash = undefined;
  user.otpContext = null;
  user.otpExpiresAt = undefined;
  await user.save();

  const { token: appToken, refreshToken } = generateTokens(user._id);

  return {
    user: sanitizeUser(user),
    token: appToken,
    refreshToken,
    otpVerified: true,
  };
};

export const verifySignupOtp = async (email, token, signupData) => {
  if (!email) throw new Error('Email is required');
  if (!token) throw new Error('OTP is required');
  if (!signupData) throw new Error('Signup data is missing. Please register again.');

  const { phone, password, role } = signupData;
  const normalizedPhone = normalizePhone(phone);

  // Get from temp storage
  const pendingKey = `${email}:${normalizedPhone}`;
  const tempData = pendingSignups.get(pendingKey);

  if (!tempData) {
    throw new Error('Signup data expired or not found. Please register again.');
  }

  // Check if OTP expired
  if (tempData.otpExpiresAt < Date.now()) {
    pendingSignups.delete(pendingKey);
    throw new Error('Verification code expired. Please register again.');
  }

  // Verify OTP
  const isValidCode = await bcrypt.compare(token, tempData.otpCodeHash);
  if (!isValidCode) {
    throw new Error('Invalid verification code');
  }

  // Final duplicate check before creating user
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    pendingSignups.delete(pendingKey);
    throw new Error('Email was registered by someone else. Please use a different email.');
  }

  const existingPhone = await User.findOne({ phone: normalizedPhone });
  if (existingPhone) {
    pendingSignups.delete(pendingKey);
    throw new Error('Phone number was registered by someone else. Please use a different number.');
  }

  // NOW create the user (only after OTP verification)
  const user = await createUserByRole({
    ...signupData,
    email,
    phone: normalizedPhone,
  }, tempData.passwordHash);

  // Mark as verified immediately
  user.isVerified = true;
  user.phoneVerified = true;
  user.phoneVerifiedAt = new Date();
  await user.save();

  // Clean up temp data
  pendingSignups.delete(pendingKey);

  // Generate tokens
  const { token: appToken, refreshToken } = generateTokens(user._id);

  return {
    user: sanitizeUser(user),
    token: appToken,
    refreshToken,
    message: 'Account created and verified successfully!',
  };
};
