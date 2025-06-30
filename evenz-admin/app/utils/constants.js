// API Configuration
export const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Navigation items
export const NAVIGATION_ITEMS = [
  { id: 'dashboard', name: 'Dashboard', icon: 'BarChart3' },
  { id: 'bookings', name: 'Bookings', icon: 'Calendar' },
];

// Status configurations
export const STATUS_CONFIG = {
  pending: {
    color: 'bg-yellow-100 text-yellow-800',
    icon: 'Clock'
  },
  unlocked: {
    color: 'bg-blue-100 text-blue-800',
    icon: 'Unlock'
  },
  confirmed: {
    color: 'bg-green-100 text-green-800',
    icon: 'CheckCircle'
  },
  rejected: {
    color: 'bg-red-100 text-red-800',
    icon: 'XCircle'
  }
};

// Color classes for stats cards
export const STATS_COLOR_CLASSES = {
  blue: 'bg-blue-50 text-blue-600',
  green: 'bg-green-50 text-green-600',
  yellow: 'bg-yellow-50 text-yellow-600',
  red: 'bg-red-50 text-red-600',
  purple: 'bg-purple-50 text-purple-600'
};