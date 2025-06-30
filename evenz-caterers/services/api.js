// client/src/services/api.js
import axios from 'axios';

const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000'
});

// Add auth token to requests if it exists
// const token = localStorage.getItem('authToken');
// if (token) {
//   api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
// }

export default api;