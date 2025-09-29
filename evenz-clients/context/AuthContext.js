"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

// Create a dedicated axios instance for API calls
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true
});

export const AuthContext = createContext({
    currentUser: null,
    accessToken: null,
    loading: true,
    otpSent: false,
    otpVerified: false,
    canResendOtp: true,
    attemptsLeft: 3,
    currentMobile: '',
    login: () => Promise.resolve(),
    register: () => Promise.resolve(),
    logout: () => Promise.resolve(),
    sendOTP: () => Promise.resolve(),
    verifyOTP: () => Promise.resolve(),
    resendOTP: () => Promise.resolve(),
    resetOTPState: () => {},
    setAccessToken: () => {},
    setCurrentUser: () => {}
});

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    // --- OTP State for Registration ---
    const [otpSent, setOtpSent] = useState(false);
    const [otpVerified, setOtpVerified] = useState(false);
    const [canResendOtp, setCanResendOtp] = useState(true);
    const [attemptsLeft, setAttemptsLeft] = useState(3);
    const [currentMobile, setCurrentMobile] = useState('');

    useEffect(() => {
        // Axios interceptor for automatic token refresh and error handling
        const responseInterceptor = api.interceptors.response.use(
            (response) => response,
            async (error) => {
                const originalRequest = error.config;
                const status = error.response?.status;
                const url = originalRequest.url;

                // --- THE FINAL FIX: A More Robust Interceptor ---

                // 1. If a login/register attempt fails with a 401, it's an invalid credentials error.
                //    Immediately reject it so the component's catch block can handle it.
                if (status === 401 && (url.endsWith('/login') || url.endsWith('/register'))) {
                    return Promise.reject(error);
                }

                // 2. If the refresh token request itself fails, the session is invalid. Reject it to stop loops.
                if (status === 401 && url.endsWith('/refresh')) {
                    // This is the key change to prevent infinite loops on startup
                    setCurrentUser(null);
                    setAccessToken(null);
                    delete api.defaults.headers.common['Authorization'];
                    return Promise.reject(error);
                }
                
                // 3. For any OTHER 401 error, it's likely an expired token. Try to refresh it once.
                if (status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const { data } = await api.get('/user/auth/refresh');
                        setAccessToken(data.accessToken);
                        api.defaults.headers.common['Authorization'] = `Bearer ${data.accessToken}`;
                        return api(originalRequest); // Retry the original request with the new token
                    } catch (refreshError) {
                        // If refresh fails, log the user out completely.
                        setCurrentUser(null);
                        setAccessToken(null);
                        delete api.defaults.headers.common['Authorization'];
                        return Promise.reject(refreshError);
                    }
                }
                
                // For all other errors (like 400, 500, etc.), just pass them along.
                return Promise.reject(error);
            }
        );

        return () => {
            api.interceptors.response.eject(responseInterceptor);
        };
    }, []);

    useEffect(() => {
        const verifyUser = async () => {
            try {
                const response = await api.get('/user/auth/refresh');
                const newAccessToken = response.data.accessToken;
                setAccessToken(newAccessToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                const userResponse = await api.get('/user/auth/me');
                setCurrentUser(userResponse.data.user);
            } catch (error) {
                console.log("No active session on refresh.");
            } finally {
                setLoading(false);
            }
        };
        verifyUser();
    }, []);

    const login = async (credentials) => {
        try {
            const res = await api.post('/user/auth/login', credentials);
            const { accessToken, user } = res.data;
            setAccessToken(accessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            setCurrentUser(user);
            toast.success('Login successful!');
            return res.data;
        } catch (error) {
            // This will now receive the ORIGINAL error from the /login endpoint.
            const message = error.response?.data?.message || 'Login failed. Please try again.';
            toast.error(message);
            throw error; // Re-throw to let the component know the login failed
        }
    };

    const register = async (userData) => {
        try {
            const res = await api.post('/user/auth/register', userData);
            const { accessToken, user } = res.data;
            setAccessToken(accessToken);
            api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
            setCurrentUser(user);
            toast.success('Registration successful! Welcome.');
            resetOTPState();
            return res.data;
        } catch(error) {
            const message = error.response?.data?.message || 'Registration failed. Please try again.';
            toast.error(message);
            throw error;
        }
    };
    
    const logout = async () => {
        try {
            await api.post('/user/auth/logout');
        } catch (error) {
            console.error("Logout failed on server, but logging out locally.", error);
        } finally {
            delete api.defaults.headers.common['Authorization'];
            setCurrentUser(null);
            setAccessToken(null);
            resetOTPState();
            toast.success('Logged out successfully');
        }
    };

    // --- OTP Functions for Registration ---
    const sendOTP = async (mobile) => {
        try {
            const response = await api.post('/user/auth/send-otp', { mobile });
            if (response.data.success) {
                setOtpSent(true);
                setCurrentMobile(mobile);
                setAttemptsLeft(response.data.attemptsLeft || 3);
                setCanResendOtp(false);
                setTimeout(() => setCanResendOtp(true), 30000);
                toast.success('OTP sent to your WhatsApp!');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Failed to send OTP.';
            toast.error(message);
            throw error;
        }
    };

    const verifyOTP = async (mobile, otp) => {
        try {
            const response = await api.post('/user/auth/verify-otp', { mobile, otp });
            if (response.data.success) {
                setOtpVerified(true);
                toast.success('Mobile verified successfully!');
            }
        } catch (error) {
            const message = error.response?.data?.message || 'Invalid OTP.';
            toast.error(message);
            throw error;
        }
    };

    const resendOTP = async () => {
        return await sendOTP(currentMobile);
    };

    const resetOTPState = () => {
        setOtpSent(false);
        setOtpVerified(false);
        setCurrentMobile('');
        setAttemptsLeft(3);
        setCanResendOtp(true);
    };

    const contextValue = {
        currentUser,
        accessToken,
        loading,
        otpSent,
        otpVerified,
        attemptsLeft,
        canResendOtp,
        currentMobile,
        login,
        register,
        logout,
        sendOTP,
        verifyOTP,
        resendOTP,
        resetOTPState,
        setAccessToken,
        setCurrentUser
    };

    return (
        <AuthContext.Provider value={contextValue}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};