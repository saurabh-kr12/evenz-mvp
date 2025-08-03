"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

// Create a dedicated axios instance for API calls
export const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
    withCredentials: true
});

export const AuthContext = createContext({
    currentUser: null,
    accessToken: null,
    loading: true,
    login: () => { },
    logout: () => { },
});

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [accessToken, setAccessToken] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const responseInterceptor = api.interceptors.response.use(
            response => response,
            async (error) => {
                const originalRequest = error.config;

                // --- THE FIX IS HERE ---
                // Add a check to prevent the interceptor from retrying the refresh token route itself.
                if (error.response.status === 401 && originalRequest.url === '/vendor/auth/refresh') {
                    // If the refresh token request itself fails, we can't recover.
                    // Reject the promise to stop the process.
                    return Promise.reject(error);
                }
                // --- END OF FIX ---

                if (error.response.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;
                    try {
                        const refreshResponse = await api.get('/vendor/auth/refresh');
                        const newAccessToken = refreshResponse.data.accessToken;

                        setAccessToken(newAccessToken);
                        api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;
                        originalRequest.headers['Authorization'] = `Bearer ${newAccessToken}`;

                        return api(originalRequest);
                    } catch (refreshError) {
                        // If refresh fails, clear user data
                        setCurrentUser(null);
                        setAccessToken(null);
                        delete api.defaults.headers.common['Authorization'];
                        return Promise.reject(refreshError);
                    }
                }

                // For all other errors (including 400 validation errors), create a new, cleaner error message.
                let customError = new Error('An unexpected error occurred.');
                // For all other errors (including 400 validation errors), create a new, cleaner error message.
                if (error.response?.data?.errors && Array.isArray(error.response.data.errors)) {
                    // This is a validation error from express-validator. Use the first message.
                    error.message = error.response.data.errors[0].msg;
                } else if (error.response?.data?.message) {
                    // This is a standard server error with a single message.
                    error.message = error.response.data.message;
                } else {
                    error.message = 'An unexpected error occurred.';
                }
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
                const response = await api.get('/vendor/auth/refresh');
                const newAccessToken = response.data.accessToken;
                setAccessToken(newAccessToken);
                api.defaults.headers.common['Authorization'] = `Bearer ${newAccessToken}`;

                const userResponse = await api.get('/vendor-profile');
                setCurrentUser(userResponse.data.data); // Your profile route returns { success: true, data: vendor }
            } catch (error) {
                console.log("No active session found on refresh.");
            } finally {
                setLoading(false);
            }
        };

        verifyUser();
    }, []);

    const login = async (credentials) => {
        const res = await axios.post(`${process.env.NEXT_PUBLIC_BACKEND_URL}/vendor/auth/login`, credentials, { withCredentials: true });

        const { accessToken, vendor } = res.data;

        setAccessToken(accessToken);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        setCurrentUser(vendor);

        return res.data;
    };

    const logout = async () => {
        try {
            await api.post('/vendor/auth/logout');
        } catch (error) {
            console.error("Logout failed", error);
        } finally {
            delete api.defaults.headers.common['Authorization'];
            setCurrentUser(null);
            setAccessToken(null);
        }
    };

    return (
        <AuthContext.Provider
            value={{
                currentUser,
                accessToken,
                loading,
                login,
                logout,
                setAccessToken
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    return useContext(AuthContext);
};