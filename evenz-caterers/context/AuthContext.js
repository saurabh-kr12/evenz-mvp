'use client'

import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext({
  currentUser: null,
  loading: true,
  register: () => { },
  login: () => { },
  logout: () => { },
  updateProfile: () => { }
});

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        // Check if we're on the client side
        if (typeof window === 'undefined') {
          setLoading(false);
          return;
        }

        const token = localStorage.getItem('token');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get('http://localhost:5000/api/vendor/vendor-profile/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setCurrentUser(res.data);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        if (typeof window !== 'undefined') {
          localStorage.removeItem('token');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (userData) => {
    const res = await axios.post('http://localhost:5000/api/vendor/auth/register', userData);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', res.data.token);
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setCurrentUser(res.data.user || res.data);
    return res.data;
  };

  const login = async (credentials) => {
    const res = await axios.post('http://localhost:5000/api/vendor/auth/login', credentials);
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', res.data.token);
    }
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setCurrentUser(res.data.user || res.data);
    return res.data;
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
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

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};