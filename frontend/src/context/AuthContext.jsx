import { createContext, useCallback, useContext, useState, useEffect } from 'react';
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

// Decode JWT payload and check expiry — no libraries, just atob
const isTokenValid = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (!payload.exp) return true; // no expiry claim — treat as valid
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // loading stays true until the initial token check is complete
  const [loading, setLoading] = useState(true);

  // On mount: restore session from localStorage if token is still valid,
  // then fetch fresh user data from /auth/me to pick up any profile changes
  // (e.g. primarySkill set during onboarding after the original login)
  useEffect(() => {
    const restore = async () => {
      try {
        const stored = localStorage.getItem('virtual_user');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.token && isTokenValid(parsed.token)) {
            // Set header first so the /me request is authenticated
            api.defaults.headers.common['Authorization'] = `Bearer ${parsed.token}`;
            // Restore from localStorage immediately (avoids flash)
            setUser(parsed);
            // Then fetch fresh data to pick up any changes since last login
            try {
              const { data } = await api.get('/auth/me');
              const fresh = data?.data ?? data;
              if (fresh) {
                const updated = { ...parsed, ...fresh };
                setUser(updated);
                localStorage.setItem('virtual_user', JSON.stringify(updated));
              }
            } catch {
              // /me failed (e.g. network) — keep the cached user, still usable
            }
          } else {
            // Token missing or expired — clear storage
            localStorage.removeItem('virtual_user');
            delete api.defaults.headers.common['Authorization'];
          }
        }
      } catch {
        localStorage.removeItem('virtual_user');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };
    restore();
  }, []);

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
        signupData,
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
    delete api.defaults.headers.common['Authorization'];
  }, []);

  const completeAuth = useCallback((authData) => {
    const token = authData.token ?? authData.tokens?.token;
    const refreshToken = authData.refreshToken ?? authData.tokens?.refreshToken;
    const finalData = {
      ...authData.user,
      token,
      refreshToken,
    };
    setUser(finalData);
    localStorage.setItem('virtual_user', JSON.stringify(finalData));
    // Set axios default header so all subsequent requests are authenticated
    if (token) api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
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
