import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('virtual_user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', { email, password });
      
      // If backend requires 2FA, we would handle it here
      // For now, let's assume if the user has a phone, we'll ask for OTP in the UI
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', formData);
      return data;
    } finally {
      setLoading(false);
    }
  }, []);

  const verifyOTP = useCallback(async (userId, otp) => {
    setLoading(true);
    try {
      // Mocking OTP verification
      // const { data } = await api.post('/auth/verify-otp', { userId, otp });
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (otp === '123456') { // Mock success code
        return { success: true };
      } else {
        throw new Error('Invalid verification code');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('virtual_user');
  }, []);

  const completeAuth = useCallback((userData) => {
    const finalData = { ...userData.user, token: userData.token };
    setUser(finalData);
    localStorage.setItem('virtual_user', JSON.stringify(finalData));
    return finalData;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, verifyOTP, completeAuth, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
