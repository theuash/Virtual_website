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
      const userData = { ...data.user, token: data.token };
      setUser(userData);
      localStorage.setItem('virtual_user', JSON.stringify(userData));
      return userData;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (formData) => {
    setLoading(true);
    try {
      const { data } = await api.post('/auth/signup', formData);
      const userData = { ...data.user, token: data.token };
      setUser(userData);
      localStorage.setItem('virtual_user', JSON.stringify(userData));
      return userData;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem('virtual_user');
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, signup, setUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
