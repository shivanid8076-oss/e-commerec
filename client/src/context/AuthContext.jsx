// ============================================
// Auth Context
// Global authentication state management
// ============================================

import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check session on mount — validates the HTTP-only cookie
  const checkAuth = useCallback(async () => {
    try {
      const { data } = await api.get('/auth/me');
      if (data.success) {
        setUser(data.user);
      }
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Register
  const register = async (formData) => {
    const { data } = await api.post('/auth/register', formData);
    if (data.success) {
      setUser(data.user);
    }
    return data;
  };

  // Login
  const login = async (formData) => {
    const { data } = await api.post('/auth/login', formData);
    if (data.success) {
      setUser(data.user);
    }
    return data;
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Logout even if the API call fails
    }
    setUser(null);
  };

  const value = {
    user,
    loading,
    register,
    login,
    logout,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
