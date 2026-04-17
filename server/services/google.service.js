import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';
import { Client } from '../models/Client.js';
import { Freelancer } from '../models/Freelancer.js';
import { generateTokens } from './auth.service.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

export const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    return payload;
  } catch (error) {
    throw new Error('Invalid Google token');
  }
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

const createUserByRole = async (googleData, role) => {
  const { email, name, picture } = googleData;

  const commonFields = {
    email,
    role,
    fullName: name,
    authMethod: 'google',
    profilePicture: picture,
    passwordHash: '', // No password for OAuth users
  };

  try {
    if (role === 'client') {
      return await Client.create({
        ...commonFields,
        companyName: '',
      });
    }

    if (role === 'freelancer') {
      return await Freelancer.create({
        ...commonFields,
        primarySkill: '',
      });
    }

    if (role === 'admin') {
      return await User.create(commonFields);
    }

    throw new Error('Invalid role');
  } catch (error) {
    // If user already exists, just return the existing user
    if (error.message.includes('duplicate key')) {
      const existingUser = await User.findOne({ email });
      return existingUser;
    }
    throw error;
  }
};

export const signupWithGoogle = async (googleToken, role) => {
  try {
    const googleData = await verifyGoogleToken(googleToken);

    // Check if user already exists
    const existingUser = await User.findOne({ email: googleData.email });

    if (existingUser) {
      // Update auth method if not already set
      if (!existingUser.authMethod || existingUser.authMethod !== 'google') {
        existingUser.authMethod = 'google';
        if (googleData.picture && !existingUser.profilePicture) {
          existingUser.profilePicture = googleData.picture;
        }
        await existingUser.save();
      }
      return {
        user: sanitizeUser(existingUser),
        tokens: generateTokens(existingUser._id),
        message: 'User already exists. Logged in with Google.',
        isNewUser: false,
      };
    }

    // Create new user
    const newUser = await createUserByRole(googleData, role);

    return {
      user: sanitizeUser(newUser),
      tokens: generateTokens(newUser._id),
      message: 'User created and logged in successfully with Google.',
      isNewUser: true,
    };
  } catch (error) {
    throw new Error(`Google signup failed: ${error.message}`);
  }
};

export const loginWithGoogle = async (googleToken) => {
  try {
    const googleData = await verifyGoogleToken(googleToken);

    // Find user by email
    const user = await User.findOne({ email: googleData.email });

    if (!user) {
      throw new Error('No account found with this Google email. Please sign up first.');
    }

    // Update auth method if needed
    if (!user.authMethod || user.authMethod !== 'google') {
      user.authMethod = 'google';
      if (googleData.picture && !user.profilePicture) {
        user.profilePicture = googleData.picture;
      }
      await user.save();
    }

    return {
      user: sanitizeUser(user),
      tokens: generateTokens(user._id),
      message: 'Logged in successfully with Google.',
    };
  } catch (error) {
    throw new Error(`Google login failed: ${error.message}`);
  }
};
