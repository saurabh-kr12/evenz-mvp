import { API_BASE_URL } from '../utils/constants';

// API Service
export const apiService = {
  // Auth endpoints
  login: async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    return response.json();
  },

  register: async (adminData) => {
    const response = await fetch(`${API_BASE_URL}/admin/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(adminData)
    });
    return response.json();
  },

  // Booking endpoints
  getAllBookings: async (token) => {
    const response = await fetch(`${API_BASE_URL}/booking/admin/all`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  unlockBooking: async (bookingId, token) => {
    const response = await fetch(`${API_BASE_URL}/booking/admin/unlock/${bookingId}`, {
      method: 'PUT',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getStats: async (token) => {
    const response = await fetch(`${API_BASE_URL}/booking/admin/stats`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  },

  getProfile: async (token) => {
    const response = await fetch(`${API_BASE_URL}/admin/profile`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    return response.json();
  }
};