import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      const authToken = localStorage.getItem('authToken');
      if (authToken) {
        try {
          const response = await api.get('/auth/me');
          if (response.data && response.data.user) {
            setUser(response.data.user);
          } else {
            console.warn('Invalid response from /auth/me:', response.data);
            localStorage.removeItem('authToken');
          }
        } catch (error) {
          console.error('Auth check error:', error.message);
          // Only clear on 401/403, keep token for other errors (network, etc.)
          if (error.response?.status === 401 || error.response?.status === 403) {
            localStorage.removeItem('authToken');
          }
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async () => {
    try {
      const response = await api.get('/auth/github');
      window.location.href = response.data.authUrl;
      console.log('Redirecting to GitHub for authentication...');
      console.log('GitHub Auth URL:', response.data.authUrl);
    } catch (error) {
      throw error;
    }
  };

  const logout = async () => {
    const authToken = localStorage.getItem('authToken');
    if (authToken) {
      try {
        await api.post('/auth/logout');
      } catch (error) {
        console.error('Logout error:', error);
      }
    }
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    isAuthenticated: !!user
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
