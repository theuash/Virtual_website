import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { Client } from '../models/Client.js';
import { Freelancer } from '../models/Freelancer.js';
import { MomentumSupervisor } from '../models/MomentumSupervisor.js';
import { User } from '../models/User.js';
import { findUserByEmail, modelForRole } from '../utils/findUser.js';
import { generateOtpCode } from './pythonOtp.service.js';
import { sendWhatsAppOtp, maskPhoneNumber } from './whatsapp.service.js';

const OTP_EXPIRY_MS = 10 * 60 * 1000;

// Temporary in-memory storage for pending signups
const pendingSignups = new Map();
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of pendingSignups.entries()) {
    if (data.expiresAt < now) pendingSignups.delete(key);
  }
}, 60_000);

export const generateTokens = (id) => ({
  token:        jwt.sign({ id }, process.env.JWT_SECRET,         { expiresIn: process.env.JWT_EXPIRES_IN }),
  refreshToken: jwt.sign({ id }, process.env.JWT_REFRESH_SECRET, { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN }),
});

const normalizePhone = (phone) => {
  const trimmed = String(phone || '').trim();
  if (!trimmed) return '';
  const normalized = trimmed.replace(/[^\d+]/g, '');
  if (!normalized) return '';
  return normalized.startsWith('+') ? normalized : `+${normalized}`;
};

export const sanitizeUser = (user) => {
  const obj = user.toObject();
  delete obj.passwordHash;
  delete obj.otpCodeHash;
  return obj;
};

const ensureOtpIsActive = (user, expectedContext) => {
  if (!user.otpCodeHash || !user.otpExpiresAt || user.otpContext !== expectedContext)
    throw new Error('No active verification code found. Please request a new code.');
  if (user.otpExpiresAt.getTime() < Date.now())
    throw new Error('Verification code expired. Please request a new code.');
};

const issuePhoneOtp = async (user, context) => {
  const normalizedPhone = normalizePhone(user.phone);
  if (!normalizedPhone) throw new Error('A valid phone number is required for OTP verification.');

  const otp = await generateOtpCode();
  const salt = await bcrypt.genSalt(10);
  user.otpCodeHash    = await bcrypt.hash(otp, salt);
  user.otpContext     = context;
  user.otpExpiresAt   = new Date(Date.now() + OTP_EXPIRY_MS);
  user.otpSentAt      = new Date();
  user.loginOtpPending = context === 'login';
  user.phone          = normalizedPhone;
  await user.save();

  const delivery = await sendWhatsAppOtp(normalizedPhone, otp, context);
  return { otpSent: true, destination: delivery.destination || maskPhoneNumber(normalizedPhone), previewCode: delivery.preview };
};

// ── Register (OTP flow) ───────────────────────────────────────────
export const registerUser = async (data) => {
  const { email, password, phone, role } = data;
  const normalizedPhone = normalizePhone(phone);

  if (!email)           throw new Error('Email is required');
  if (!password)        throw new Error('Password is required');
  if (!normalizedPhone) throw new Error('Valid phone number is required');

  // Check duplicates across all collections
  const existingEmail = await findUserByEmail(email);
  if (existingEmail) throw new Error('Email already registered. Please login or use a different email.');

  const Model = modelForRole(role);
  const existingPhone = await Model.findOne({ phone: normalizedPhone });
  if (existingPhone) throw new Error('Phone number already registered. Please use a different number.');

  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(password, salt);

  const otp = await generateOtpCode();
  const otpSalt = await bcrypt.genSalt(10);
  const otpCodeHash = await bcrypt.hash(otp, otpSalt);

  const pendingKey = `${email}:${normalizedPhone}`;
  pendingSignups.set(pendingKey, {
    ...data,
    email,
    phone: normalizedPhone,
    passwordHash,
    otpCodeHash,
    otpExpiresAt: Date.now() + OTP_EXPIRY_MS,
    expiresAt:    Date.now() + OTP_EXPIRY_MS,
  });

  const delivery = await sendWhatsAppOtp(normalizedPhone, otp, 'signup');

  return {
    success: true,
    requiresTwoFactor: true,
    user: { email, phone: normalizedPhone, fullName: data.fullName, role },
    message: `Verification code sent to ${delivery.destination}. Verify to complete signup.`,
    otpSent: delivery.delivered,
    previewCode: delivery.preview,
  };
};

export const registerWithOtp = registerUser;

// ── Login ─────────────────────────────────────────────────────────
export const loginUser = async (email, password) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('Invalid email or password');
  if (!user.passwordHash) throw new Error('This account uses a different login method.');
  if (!(await user.matchPassword(password))) throw new Error('Invalid email or password');
  if (user.isSuspended) throw new Error('Account suspended');
  if (!user.isVerified) throw new Error('Please complete phone verification before logging in.');

  // Internal staff (momentum_supervisor, admin) log in with password only — no OTP
  const isInternalRole = ['momentum_supervisor', 'admin'].includes(user.role);
  if (isInternalRole || !user.phoneVerified || !user.phone) {
    const { token, refreshToken } = generateTokens(user._id);
    return { user: sanitizeUser(user), token, refreshToken, requiresTwoFactor: false };
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

// ── OTP login request ─────────────────────────────────────────────
export const loginWithOtpRequest = async (email) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('User not found');
  if (user.isSuspended) throw new Error('Account suspended');
  if (!user.loginOtpPending || user.otpContext !== 'login')
    throw new Error('Complete your password step before requesting another login code.');

  const otpResult = await issuePhoneOtp(user, 'login');
  return { success: true, message: `Verification code sent to ${otpResult.destination}.`, otpSent: true, phone: otpResult.destination, previewCode: otpResult.previewCode };
};

// ── Resend signup OTP ─────────────────────────────────────────────
export const requestSignupOtp = async (email) => {
  if (!email) throw new Error('Email is required');

  let tempData = null;
  let pendingKey = null;
  for (const [key, data] of pendingSignups.entries()) {
    if (data.email === email) { tempData = data; pendingKey = key; break; }
  }
  if (!tempData) throw new Error('No pending signup found for this email. Please register again.');

  const otp = await generateOtpCode();
  const salt = await bcrypt.genSalt(10);
  tempData.otpCodeHash = await bcrypt.hash(otp, salt);
  tempData.otpExpiresAt = Date.now() + OTP_EXPIRY_MS;
  tempData.expiresAt    = Date.now() + OTP_EXPIRY_MS;
  pendingSignups.set(pendingKey, tempData);

  const delivery = await sendWhatsAppOtp(tempData.phone, otp, 'signup');
  return { success: true, message: `Verification code resent to ${delivery.destination}.`, otpSent: true, phone: delivery.destination, previewCode: delivery.preview };
};

// ── Verify OTP → login ────────────────────────────────────────────
export const verifyOtpAndLogin = async (email, token) => {
  const user = await findUserByEmail(email);
  if (!user) throw new Error('User not found');

  ensureOtpIsActive(user, 'login');
  if (!(await bcrypt.compare(token, user.otpCodeHash))) throw new Error('Invalid verification code');

  user.otpVerified     = true;
  user.isVerified      = true;
  user.phoneVerified   = true;
  user.phoneVerifiedAt = new Date();
  user.loginOtpPending = false;
  user.otpCodeHash     = undefined;
  user.otpContext      = null;
  user.otpExpiresAt    = undefined;
  await user.save();

  const { token: appToken, refreshToken } = generateTokens(user._id);
  return { user: sanitizeUser(user), token: appToken, refreshToken, otpVerified: true };
};

// ── Verify OTP → complete signup ──────────────────────────────────
export const verifySignupOtp = async (email, token, signupData) => {
  if (!email)      throw new Error('Email is required');
  if (!token)      throw new Error('OTP is required');
  if (!signupData) throw new Error('Signup data is missing. Please register again.');

  const normalizedPhone = normalizePhone(signupData.phone);
  const pendingKey = `${email}:${normalizedPhone}`;
  const tempData = pendingSignups.get(pendingKey);

  if (!tempData)                          throw new Error('Signup data expired or not found. Please register again.');
  if (tempData.otpExpiresAt < Date.now()) { pendingSignups.delete(pendingKey); throw new Error('Verification code expired. Please register again.'); }
  if (!(await bcrypt.compare(token, tempData.otpCodeHash))) throw new Error('Invalid verification code');

  // Final duplicate check
  const existingEmail = await findUserByEmail(email);
  if (existingEmail) { pendingSignups.delete(pendingKey); throw new Error('Email was registered by someone else. Please use a different email.'); }

  // Create in the correct collection
  const Model = modelForRole(signupData.role);
  const user = await Model.create({
    email,
    passwordHash: tempData.passwordHash,
    role: signupData.role,
    fullName: signupData.fullName,
    phone: normalizedPhone,
    authMethod: 'password',
    isVerified: true,
    phoneVerified: true,
    phoneVerifiedAt: new Date(),
    ...(signupData.role === 'client' && { companyName: signupData.company || '' }),
  });

  pendingSignups.delete(pendingKey);

  const { token: appToken, refreshToken } = generateTokens(user._id);
  return { user: sanitizeUser(user), token: appToken, refreshToken, message: 'Account created and verified successfully!' };
};
