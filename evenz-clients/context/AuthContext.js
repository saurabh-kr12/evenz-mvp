// client/src/context/AuthContext.js
"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import api from '../services/api';

export const AuthContext = createContext({
  currentUser: null,
  loading: true,

  // Auth functions
  register: () => { },
  login: () => { },
  logout: () => { },
  updateProfile: () => { },

  // OTP functions
  sendOTP: () => { },
  verifyOTP: () => { },
  resendOTP: () => { },

  // OTP state
  otpSent: false,
  otpVerified: false,
  attemptsLeft: 3,
  canResendOtp: true,

  // Utility functions
  resetOTPState: () => { },
});

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // OTP related state
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [attemptsLeft, setAttemptsLeft] = useState(3);
  const [canResendOtp, setCanResendOtp] = useState(true);
  const [currentMobile, setCurrentMobile] = useState('');

  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem('clientToken');
        if (token) {
          api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          const res = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/me`, {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          const data = await res.json(); // Parse JSON response
          setCurrentUser(data.user);
        }
      } catch (error) {
        console.error('Failed to load user:', error);
        localStorage.removeItem('clientToken');
        delete api.defaults.headers.common['Authorization'];
      } finally {
        setLoading(false);
      }
    };

    loadUser();
  }, []);

  // OTP Functions
  const sendOTP = async (mobile) => {
    if (!mobile) {
      toast.error('Please enter a valid mobile number');
      return { success: false, message: 'Mobile number is required' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/send-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile })
      });

      const data = await response.json();

      if (data.success) {
        setOtpSent(true);
        setCanResendOtp(false);
        setAttemptsLeft(data.attemptsLeft || 3);
        setCurrentMobile(mobile);
        toast.success('OTP sent to your WhatsApp number successfully!');

        // Enable resend after 30 seconds
        setTimeout(() => setCanResendOtp(true), 30000);

        return { success: true, data };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = 'Failed to send OTP. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const verifyOTP = async (mobile, otp) => {
    if (!otp || otp.length !== 6) {
      toast.error('Please enter a valid 6-digit OTP');
      return { success: false, message: 'Invalid OTP format' };
    }

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mobile: mobile || currentMobile, otp })
      });

      const data = await response.json();

      if (data.success) {
        setOtpVerified(true);
        toast.success('Mobile number verified successfully!');
        return { success: true, data };
      } else {
        toast.error(data.message);
        setAttemptsLeft(data.attemptsLeft || attemptsLeft - 1);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = 'Failed to verify OTP. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const resendOTP = async () => {
    if (!canResendOtp) {
      toast.error('Please wait before requesting another OTP');
      return { success: false, message: 'Too many requests' };
    }

    if (!currentMobile) {
      toast.error('No mobile number found. Please start over.');
      return { success: false, message: 'Mobile number not found' };
    }

    return await sendOTP(currentMobile);
  };

  // Registration function
  const register = async (userData) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('clientToken', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setCurrentUser(data.user);
        toast.success('Registration successful! Welcome to our platform.');

        // Reset OTP state
        resetOTPState();

        return { success: true, data };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = 'Registration failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Login function
  const login = async (credentials) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials)
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('clientToken', data.token);
        api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
        setCurrentUser(data.user);
        toast.success('Login successful! Redirecting...');
        return { success: true, data };
      } else {
        toast.error(data.message);
        return { success: false, message: data.message };
      }
    } catch (error) {
      const errorMessage = 'Login failed. Please try again.';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint to clear remember token
      await api.post('/api/user/auth/logout');

      // Clear local storage and reset client state
      localStorage.removeItem('clientToken');
      delete api.defaults.headers.common['Authorization'];
      setCurrentUser(null);

      // Reset all state
      resetOTPState();

      toast.success('Logged out successfully');
    } catch (error) {
      console.error('Logout error:', error);

      // Even if the API call fails, still clear local data
      localStorage.removeItem('clientToken');
      delete api.defaults.headers.common['Authorization'];
      setCurrentUser(null);
      resetOTPState();

      // Show appropriate message based on error
      if (error.response?.status === 401) {
        toast.success('Logged out successfully');
      } else {
        toast.error('Logout completed locally, but server cleanup may have failed');
      }
    }
  };

  // Update profile function
  const updateProfile = async (userData) => {
    try {
      const response = await api.put('/api/user/auth/me', userData);
      const updatedUser = { ...currentUser, ...response.data.user };
      setCurrentUser(updatedUser);
      toast.success('Profile updated successfully');
      return { success: true, data: response.data };
    } catch (error) {
      const errorMessage = 'Failed to update profile';
      toast.error(errorMessage);
      return { success: false, message: errorMessage };
    }
  };

  // Reset OTP state (useful for switching between login/register)
  const resetOTPState = () => {
    setOtpSent(false);
    setOtpVerified(false);
    setCurrentMobile('');
    setAttemptsLeft(3);
    setCanResendOtp(true);
  };

  const contextValue = {
    // User state
    currentUser,
    loading,

    // OTP state
    otpSent,
    otpVerified,
    attemptsLeft,
    canResendOtp,
    currentMobile,

    // Auth functions
    register,
    login,
    logout,
    updateProfile,

    // OTP functions
    sendOTP,
    verifyOTP,
    resendOTP,
    resetOTPState,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook for using auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};