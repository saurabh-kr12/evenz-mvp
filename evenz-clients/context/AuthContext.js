// // client/src/context/AuthContext.js
"use client";
import React, { createContext,useContext, useState, useEffect } from 'react';
import api from '../services/api';

// export const AuthContext = createContext();
export const AuthContext = createContext({
  currentUser: null,
  loading: true,
  register: () => {},
  login: () => {},
  logout: () => {},
  updateProfile: () => {}
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('authToken');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await api.get('/api/user/auth/me');
          setCurrentUser(res.data.user);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('authToken');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (userData) => {
    const res = await api.post('/api/user/auth/register', userData);
    localStorage.setItem('authToken', res.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setCurrentUser(res.data.user);
    return res.data;
  };

  const login = async (credentials) => {
    const res = await api.post('/api/user/auth/login', credentials);
    localStorage.setItem('authToken', res.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setCurrentUser(res.data.user);
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  const updateProfile = (userData) => {
    setCurrentUser({ ...currentUser, ...userData });
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        register,
        login,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// // Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

