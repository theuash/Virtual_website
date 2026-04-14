# Frontend Authentication Integration Guide

## Overview
Your frontend needs to be updated to work with the new backend authentication system. This guide shows you how to integrate both password and OTP authentication.

## API Service Setup

Update your `frontend/src/services/api.js` to include authentication endpoints:

```javascript
import axios from 'axios';

const API_BASE = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ===== AUTHENTICATION ENDPOINTS =====

// PASSWORD-BASED AUTHENTICATION
export const authAPI = {
  // Register with password
  registerPassword: (data) =>
    api.post('/auth/register', {
      email: data.email,
      password: data.password,
      fullName: data.fullName,
      role: data.role,
      company: data.company,
      skill: data.skill,
      dob: data.dob,
    }),

  // Login with password
  loginPassword: (email, password) =>
    api.post('/auth/login', { email, password }),

  // OTP AUTHENTICATION
  
  // Step 1: Request OTP for registration
  registerWithOTP: (data) =>
    api.post('/auth/register-otp', {
      email: data.email,
      fullName: data.fullName,
      role: data.role,
      company: data.company,
      skill: data.skill,
    }),

  // Step 2: Verify OTP during registration
  verifySignupOTP: (email, token) =>
    api.post('/auth/otp/verify-signup', { email, token }),

  // Step 1: Request OTP for login
  requestLoginOTP: (email) =>
    api.post('/auth/otp/request-login', { email }),

  // Step 2: Verify OTP during login
  verifyLoginOTP: (email, token) =>
    api.post('/auth/otp/verify-login', { email, token }),

  // Get current user info
  getCurrentUser: () =>
    api.get('/auth/me'),
};

export default api;
```

---

## Authentication Context Update

Update your `frontend/src/context/AuthContext.jsx`:

```javascript
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authAPI } from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check if user is logged in on mount
  useEffect(() => {
    if (token) {
      fetchCurrentUser();
    } else {
      setLoading(false);
    }
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const response = await authAPI.getCurrentUser();
      setUser(response.data.data);
      setError(null);
    } catch (err) {
      console.error('Error fetching user:', err);
      setToken(null);
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  // PASSWORD AUTHENTICATION
  
  const registerWithPassword = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.registerPassword(data);
      const { token, refreshToken, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const loginWithPassword = async (email, password) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.loginPassword(email, password);
      const { token, refreshToken, user } = response.data.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('refreshToken', refreshToken);
      setToken(token);
      setUser(user);
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Login failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // OTP AUTHENTICATION
  
  const registerWithOTP = async (data) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.registerWithOTP(data);
      
      // Store email temporarily for OTP verification
      localStorage.setItem('pendingEmail', data.email);
      localStorage.setItem('pendingRole', data.role);
      
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'OTP registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifySignupOTP = async (email, token) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.verifySignupOTP(email, token);
      const { token: authToken, refreshToken, user } = response.data.data;
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.removeItem('pendingEmail');
      localStorage.removeItem('pendingRole');
      
      setToken(authToken);
      setUser(user);
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'OTP verification failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const requestLoginOTP = async (email) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.requestLoginOTP(email);
      
      // Store email temporarily
      localStorage.setItem('pendingEmail', email);
      
      return { success: true, message: response.data.message };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Failed to send OTP';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const verifyLoginOTP = async (email, token) => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.verifyLoginOTP(email, token);
      const { token: authToken, refreshToken, user } = response.data.data;
      
      localStorage.setItem('token', authToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.removeItem('pendingEmail');
      
      setToken(authToken);
      setUser(user);
      
      return { success: true, user };
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'OTP verification failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('pendingEmail');
  };

  const value = {
    user,
    token,
    loading,
    error,
    registerWithPassword,
    loginWithPassword,
    registerWithOTP,
    verifySignupOTP,
    requestLoginOTP,
    verifyLoginOTP,
    logout,
    isAuthenticated: !!token && !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};
```

---

## Component Examples

### Password Registration Component

```javascript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const SignupPasswordPage = () => {
  const { registerWithPassword, error, loading } = useAuth();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'client',
    company: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await registerWithPassword(formData);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      <h2 className="text-2xl font-bold mb-4">Sign Up</h2>
      
      {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Role</label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
          >
            <option value="client">Client</option>
            <option value="freelancer">Freelancer</option>
          </select>
        </div>

        {formData.role === 'client' && (
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Company</label>
            <input
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
        >
          {loading ? 'Signing up...' : 'Sign Up'}
        </button>
      </form>
    </div>
  );
};
```

### OTP Registration Component

```javascript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const SignupOTPPage = () => {
  const { registerWithOTP, loading, error } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: form, 2: OTP verification
  
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    role: 'client',
    company: '',
  });

  const [otp, setOtp] = useState('');

  const handleFormChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    const result = await registerWithOTP(formData);
    
    if (result.success) {
      setStep(2); // Move to OTP verification step
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const result = await useAuth().verifySignupOTP(formData.email, otp);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      {step === 1 ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Sign Up with OTP</h2>
          
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          
          <form onSubmit={handleFormSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Full Name</label>
              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Role</label>
              <select
                name="role"
                value={formData.role}
                onChange={handleFormChange}
                className="w-full px-3 py-2 border rounded-lg"
              >
                <option value="client">Client</option>
                <option value="freelancer">Freelancer</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP to Email'}
            </button>
          </form>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">Verify Email</h2>
          <p className="text-gray-600 mb-4">Enter the 6-digit code sent to {formData.email}</p>
          
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          
          <form onSubmit={handleOtpSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">OTP Code</label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-3 py-2 border rounded-lg text-center text-2xl tracking-widest"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify OTP'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full mt-2 text-blue-600 py-2"
            >
              Back
            </button>
          </form>
        </>
      )}
    </div>
  );
};
```

### OTP Login Component

```javascript
import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export const LoginOTPPage = () => {
  const { requestLoginOTP, verifyLoginOTP, loading, error } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1); // 1: email, 2: OTP
  
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    const result = await requestLoginOTP(email);
    
    if (result.success) {
      setStep(2);
    }
  };

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const result = await verifyLoginOTP(email, otp);
    
    if (result.success) {
      navigate('/dashboard');
    }
  };

  return (
    <div className="max-w-md mx-auto p-6">
      {step === 1 ? (
        <>
          <h2 className="text-2xl font-bold mb-4">Login with OTP</h2>
          
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          
          <form onSubmit={handleEmailSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </form>
        </>
      ) : (
        <>
          <h2 className="text-2xl font-bold mb-4">Enter OTP</h2>
          <p className="text-gray-600 mb-4">Check your email for the verification code</p>
          
          {error && <div className="bg-red-100 text-red-700 p-3 rounded mb-4">{error}</div>}
          
          <form onSubmit={handleOtpSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-1">OTP Code</label>
              <input
                type="text"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="000000"
                className="w-full px-3 py-2 border rounded-lg text-center text-2xl"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length !== 6}
              className="w-full bg-blue-600 text-white py-2 rounded-lg disabled:opacity-50"
            >
              {loading ? 'Verifying...' : 'Verify & Login'}
            </button>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full mt-2 text-blue-600 py-2"
            >
              Change Email
            </button>
          </form>
        </>
      )}
    </div>
  );
};
```

---

## Routes Setup

Update your `frontend/src/App.jsx` with authentication routes:

```javascript
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LoginPage from './pages/auth/LoginPage';
import SignupPage from './pages/auth/SignupPage';
import Dashboard from './pages/Dashboard';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Dashboard />
        </ProtectedRoute>
      } />
      <Route path="/" element={<Navigate to="/dashboard" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </Router>
  );
}
```

---

## Testing the Integration

1. **Start Backend:**
   ```bash
   cd server
   npm run dev
   ```

2. **Start Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```

3. **Test Password Registration:**
   - Go to `/signup`
   - Fill in all fields
   - Submit
   - Should redirect to dashboard

4. **Test OTP Registration:**
   - Go to `/signup-otp`
   - Enter email and name
   - Click "Send OTP"
   - Check email for code (or Supabase dashboard)
   - Enter code and verify
   - Should redirect to dashboard

5. **Test Logout/Login:**
   - Click logout on dashboard
   - Try password or OTP login
   - Should authenticate successfully

---

## Environment Configuration

Make sure your frontend `.env` file has:

```env
VITE_API_URL=http://localhost:5000/api
```

And update your API service to use it:

```javascript
const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
```

---

## Next Steps

1. ✅ Backend authentication implemented
2. ✅ Frontend context ready
3. Next: Update signup/login pages with components above
4. Then: Add password reset flow
5. Finally: Add email verification resend logic
