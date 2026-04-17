import { OAuth2Client } from 'google-auth-library';
import { findUserByEmail, modelForRole } from '../utils/findUser.js';
import { generateTokens, sanitizeUser } from './auth.service.js';

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

const fetchGoogleProfile = async (accessToken) => {
  const response = await fetch('https://openidconnect.googleapis.com/v1/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Invalid Google access token (${response.status}): ${body}`);
  }
  return response.json();
};

export const verifyGoogleToken = async (token) => {
  try {
    const ticket = await client.verifyIdToken({ idToken: token, audience: process.env.GOOGLE_CLIENT_ID });
    return ticket.getPayload();
  } catch {
    try {
      const profile = await fetchGoogleProfile(token);
      if (!profile.email) throw new Error('Google profile missing email');
      return {
        email: profile.email,
        name: profile.name || profile.given_name || profile.email.split('@')[0],
        picture: profile.picture,
        email_verified: profile.email_verified,
        sub: profile.sub,
      };
    } catch (fallbackError) {
      throw new Error(fallbackError?.message || 'Invalid Google token');
    }
  }
};

export const signupWithGoogle = async (googleToken, role) => {
  try {
    const googleData = await verifyGoogleToken(googleToken);

    const existing = await findUserByEmail(googleData.email);
    if (existing) {
      if (existing.authMethod !== 'google') {
        existing.authMethod = 'google';
        if (googleData.picture && !existing.avatar) existing.avatar = googleData.picture;
        await existing.save();
      }
      const { token, refreshToken } = generateTokens(existing._id);
      return { user: sanitizeUser(existing), token, refreshToken, message: 'Already registered. Logged in with Google.', isNewUser: false };
    }

    const Model = modelForRole(role);
    const newUser = await Model.create({
      email:      googleData.email,
      role,
      fullName:   googleData.name,
      avatar:     googleData.picture,
      authMethod: 'google',
      isVerified: true,
      ...(role === 'client' && { companyName: '' }),
    });

    const { token, refreshToken } = generateTokens(newUser._id);
    return { user: sanitizeUser(newUser), token, refreshToken, message: 'Account created with Google.', isNewUser: true };
  } catch (error) {
    throw new Error(`Google signup failed: ${error.message}`);
  }
};

export const loginWithGoogle = async (googleToken) => {
  try {
    const googleData = await verifyGoogleToken(googleToken);
    const user = await findUserByEmail(googleData.email);
    if (!user) throw new Error('No account found with this Google email. Please sign up first.');

    if (user.authMethod !== 'google') {
      user.authMethod = 'google';
      if (googleData.picture && !user.avatar) user.avatar = googleData.picture;
      await user.save();
    }

    const { token, refreshToken } = generateTokens(user._id);
    return { user: sanitizeUser(user), token, refreshToken, message: 'Logged in with Google.' };
  } catch (error) {
    throw new Error(`Google login failed: ${error.message}`);
  }
};
