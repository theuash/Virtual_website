import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.warn('Supabase credentials not configured. OTP features will be limited.');
}

const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

/**
 * Send OTP to user's email via Supabase
 * @param {string} email - User's email address
 * @param {string} type - Either 'signup' or 'login'
 * @returns {Promise<{success: boolean, message: string}>}
 */
export const sendOtp = async (email, type = 'signup') => {
  // For testing purposes, skip Supabase call if in development and rate limited
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_SUPABASE_OTP === 'true') {
    console.log(`[TEST MODE] Would send OTP to ${email} for ${type}`);
    return {
      success: true,
      message: 'OTP sent successfully to your email (TEST MODE)',
      sessionId: 'test-session-id'
    };
  }

  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    // Use Supabase native OTP sending
    const { data, error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${process.env.CLIENT_URL}/auth/verify-otp`,
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      message: 'OTP sent successfully to your email',
      sessionId: data?.session?.id
    };
  } catch (error) {
    console.error('Error sending OTP:', error);
    throw error;
  }
};

/**
 * Verify OTP token
 * @param {string} email - User's email
 * @param {string} token - OTP token from email
 * @returns {Promise<{user, session}>}
 */
export const verifyOtp = async (email, token) => {
  // For testing purposes, accept any 6-digit token in test mode
  if (process.env.NODE_ENV === 'development' && process.env.SKIP_SUPABASE_OTP === 'true') {
    if (token && token.length === 6 && /^\d{6}$/.test(token)) {
      console.log(`[TEST MODE] Verified OTP ${token} for ${email}`);
      return {
        success: true,
        user: {
          id: 'test-user-id',
          email: email,
          email_confirmed_at: new Date().toISOString()
        },
        session: {
          access_token: 'test-access-token',
          refresh_token: 'test-refresh-token'
        }
      };
    } else {
      throw new Error('Token has expired or is invalid');
    }
  }

  if (!supabase) {
    throw new Error('Supabase not configured');
  }

  try {
    // Verify the OTP token with Supabase
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email'
    });

    if (error) {
      throw new Error(error.message);
    }

    return {
      success: true,
      user: data.user,
      session: data.session
    };
  } catch (error) {
    console.error('Error verifying OTP:', error);
    throw error;
  }
};

/**
 * Check if Supabase is configured
 * @returns {boolean}
 */
export const isSupabaseConfigured = () => {
  return supabase !== null;
};

/**
 * Get Supabase client
 * @returns {SupabaseClient|null}
 */
export const getSupabaseClient = () => {
  return supabase;
};
