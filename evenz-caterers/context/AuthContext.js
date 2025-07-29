"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

export const AuthContext = createContext({
  currentUser: null,
  loading: true,
  login: () => { },
  logout: () => { },
});

// Create axios instance
const api = axios.create({
  baseURL: 'http://localhost:5000/api'
});

// Helper function to get token expiration
const getTokenExpiration = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000; // Convert to milliseconds
  } catch (error) {
    return null;
  }
};

// Helper function to check if token is expired
const isTokenExpired = (token) => {
  const expiration = getTokenExpiration(token);
  if (!expiration) return true;
  return Date.now() > expiration;
};

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
          // Check if token is expired
          if (isTokenExpired(token)) {
            localStorage.removeItem('token');
            localStorage.removeItem('tokenExpiry');
            setLoading(false);
            return;
          }

          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get('http://localhost:5000/api/vendor-profile', {
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
          localStorage.removeItem('tokenExpiry');
        }
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // Set up token expiration check
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const token = localStorage.getItem('token');
    if (token) {
      const expiration = getTokenExpiration(token);
      if (expiration) {
        const timeUntilExpiry = expiration - Date.now();
        if (timeUntilExpiry > 0) {
          // Auto-logout when token expires
          const timeout = setTimeout(() => {
            logout();
          }, timeUntilExpiry);
          
          return () => clearTimeout(timeout);
        }
      }
    }
  }, [currentUser]);

  const login = async (credentials) => {
    const res = await axios.post('http://localhost:5000/api/vendor/auth/login', credentials);
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', res.data.token);
      
      // Store token expiry for reference
      const expiration = getTokenExpiration(res.data.token);
      if (expiration) {
        localStorage.setItem('tokenExpiry', expiration.toString());
      }
    }
    
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setCurrentUser(res.data);
    return res.data;
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiry');
    }
    delete api.defaults.headers.common['Authorization'];
    setCurrentUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        loading,
        login,
        logout,
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