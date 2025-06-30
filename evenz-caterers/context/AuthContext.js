// // client/src/context/AuthContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';
import axios from 'axios';

// export const AuthContext = createContext();
export const AuthContext = createContext({
  currentUser: null,
  loading: true,
  register: () => { },
  login: () => { },
  logout: () => { },
  updateProfile: () => { }
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Keep most of the existing code, but make these adjustments:
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('token'); // Changed from 'authToken' to match your existing token storage
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await axios.get('http://localhost:5000/api/vendor/vendor-profile/profile', {
            headers: {
              Authorization: `Bearer ${token}`
            }
          });
          setCurrentUser(res.data); // Changed from res.data.user to res.data based on your API response
          
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('token');
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  const register = async (userData) => {
    const res = await axios.post('http://localhost:5000/api/vendor/auth/register', userData);
    localStorage.setItem('token', res.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setCurrentUser(res.data.user || res.data); // Handle both response structures
    return res.data;
  };

  const login = async (credentials) => {
    const res = await axios.post('http://localhost:5000/api/vendor/auth/login', credentials);
    localStorage.setItem('token', res.data.token);
    api.defaults.headers.common['Authorization'] = `Bearer ${res.data.token}`;
    setCurrentUser(res.data.user || res.data); // Handle both response structures
    return res.data;
  };

  const logout = () => {
    localStorage.removeItem('token');
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