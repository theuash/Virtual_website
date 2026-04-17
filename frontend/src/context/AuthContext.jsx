import { createContext, useCallback, useContext, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

const unwrapResponse = (response) => response?.data?.data ?? response?.data ?? response;
const normalizeRequestError = (error, fallbackMessage) => {
  if (error?.code === 'ECONNABORTED') {
    return new Error('Request timed out while waiting for the OTP service. Make sure WhatsApp is connected, then try again.');
  }

  const message = error?.response?.data?.message || error?.message || fallbackMessage;
  return new Error(message);
};

const mapSignupPayload = (formData) => ({
  role: formData.role,
  email: formData.email.trim().toLowerCase(),
  password: formData.password,
  fullName: formData.name.trim(),
  phone: formData.phone?.trim() || '',
  company: formData.company?.trim() || '',
  skill: formData.skill || '',
  dob: formData.dob || '',
  portfolioUrl: formData.portfolioUrl?.trim() || '',
});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('virtual_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password,
      });
      return unwrapResponse(response);
    } catch (error) {
      throw normalizeRequestError(error, 'Login failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (formData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/register-otp', mapSignupPayload(formData));
      return unwrapResponse(response);
    } catch (error) {
      throw normalizeRequestError(error, 'Signup failed');
    } finally {
      setLoading(false);
    }
  }, []);

  const requestSignupOTP = useCallback(async (email) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/otp/request-signup', {
        email: email.trim().toLowerCase(),
      });
      return unwrapResponse(response);
    } catch (error) {
      throw normalizeRequestError(error, 'Unable to resend signup OTP');
    } finally {
      setLoading(false);
    }
  }, []);

  const verifySignupOTP = useCallback(async (email, otp, signupData) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/otp/verify-signup', {
        email: email.trim().toLowerCase(),
        token: otp,
        signupData, // Pass full signup data so user is created after verification
      });
      return unwrapResponse(response);
    } catch (error) {
      throw normalizeRequestError(error, 'Unable to verify signup OTP');
    } finally {
      setLoading(false);
    }
  }, []);

  const requestLoginOTP = useCallback(async (email) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/otp/request-login', {
        email: email.trim().toLowerCase(),
      });
      return unwrapResponse(response);
    } catch (error) {
      throw normalizeRequestError(error, 'Unable to request login OTP');
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyLoginOTP = useCallback(async (email, otp) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/otp/verify-login', {
        email: email.trim().toLowerCase(),
        token: otp,
      });
      return unwrapResponse(response);
    } catch (error) {
      throw normalizeRequestError(error, 'Unable to verify login OTP');
    } finally {
      setLoading(false);
    }
  }, []);

  const loginWithGoogle = useCallback(async (googleToken) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/google/login', {
        token: googleToken,
      });
      return unwrapResponse(response);
    } catch (error) {
      throw normalizeRequestError(error, 'Google login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const signupWithGoogle = useCallback(async (googleToken, role) => {
    setLoading(true);
    try {
      const response = await api.post('/auth/google/signup', {
        token: googleToken,
        role,
      });
      return unwrapResponse(response);
    } catch (error) {
      throw normalizeRequestError(error, 'Google signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('virtual_user');
  }, []);

  const completeAuth = useCallback((authData) => {
    const finalData = {
      ...authData.user,
      token: authData.token,
      refreshToken: authData.refreshToken,
    };
    setUser(finalData);
    localStorage.setItem('virtual_user', JSON.stringify(finalData));
    return finalData;
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        login,
        logout,
        signup,
        requestSignupOTP,
        verifySignupOTP,
        requestLoginOTP,
        verifyLoginOTP,
        loginWithGoogle,
        signupWithGoogle,
        completeAuth,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
};
