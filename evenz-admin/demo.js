"use client"
import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Users, 
  Calendar, 
  BarChart3, 
  Bell, 
  LogOut, 
  Eye, 
  EyeOff, 
  Lock, 
  Unlock,
  CheckCircle,
  XCircle,
  Clock,
  Search,
  Filter,
  Download
} from 'lucide-react';

// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// API Service
const apiService = {
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

// Auth Context
const AuthContext = React.createContext();

const AuthProvider = ({ children }) => {
  const [admin, setAdmin] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('adminToken'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      apiService.getProfile(token)
        .then(response => {
          if (response.success) {
            setAdmin(response.admin);
          } else {
            logout();
          }
        })
        .catch(() => logout())
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [token]);

  const login = async (credentials) => {
    try {
      const response = await apiService.login(credentials);
      if (response.success) {
        setToken(response.token);
        setAdmin(response.admin);
        localStorage.setItem('adminToken', response.token);
        return { success: true };
      }
      return { success: false, message: response.message };
    } catch (error) {
      return { success: false, message: 'Network error' };
    }
  };

  const logout = () => {
    setToken(null);
    setAdmin(null);
    localStorage.removeItem('adminToken');
  };

  return (
    <AuthContext.Provider value={{ admin, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

// Login Component
const LoginPage = () => {
  const [formData, setFormData] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showRegister, setShowRegister] = useState(false);
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(formData);
    if (!result.success) {
      setError(result.message);
    }
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await apiService.register({
        name: formData.name,
        email: formData.email,
        password: formData.password
      });
      
      if (response.success) {
        const loginResult = await login({ email: formData.email, password: formData.password });
        if (!loginResult.success) {
          setError('Registration successful but login failed');
        }
      } else {
        setError(response.message);
      }
    } catch (error) {
      setError('Registration failed');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen text-gray-700 bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Evenz.in Admin</h1>
          <p className="text-gray-600 mt-2">
            {showRegister ? 'Create admin account' : 'Secure portal access'}
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}

        <form onSubmit={showRegister ? handleRegister : handleSubmit} className="space-y-4">
          {showRegister && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.name || ''}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter your full name"
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <input
              type="email"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              placeholder="Enter your email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                className="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={formData.password}
                onChange={(e) => setFormData({...formData, password: e.target.value})}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
          >
            {loading ? 'Processing...' : (showRegister ? 'Create Account' : 'Sign In')}
          </button>
        </form>

        <div className="mt-6 text-center">
          <button
            type="button"
            onClick={() => {
              setShowRegister(!showRegister);
              setError('');
              setFormData({ email: '', password: '', name: '' });
            }}
            className="text-blue-600 hover:text-blue-800 text-sm font-medium"
          >
            {showRegister ? 'Already have an account? Sign In' : 'Need to create an account? Register'}
          </button>
        </div>
      </div>
    </div>
  );
};

// Dashboard Stats Component
const StatsCard = ({ title, value, icon: Icon, color = 'blue' }) => {
  const colorClasses = {
    blue: 'bg-blue-50 text-blue-600',
    green: 'bg-green-50 text-green-600',
    yellow: 'bg-yellow-50 text-yellow-600',
    red: 'bg-red-50 text-red-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white text-gray-700 rounded-xl shadow-sm p-6 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  );
};

// Booking Management Component
const BookingManagement = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const { token } = useAuth();

  const fetchBookings = async () => {
    try {
      const response = await apiService.getAllBookings(token);
      if (response.success) {
        setBookings(response.data);
      }
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [token]);

  const handleUnlockBooking = async (bookingId) => {
    try {
      const response = await apiService.unlockBooking(bookingId, token);
      if (response.success) {
        fetchBookings(); // Refresh the list
        alert('Booking unlocked successfully!');
      } else {
        alert(response.message || 'Failed to unlock booking');
      }
    } catch (error) {
      alert('Error unlocking booking');
    }
  };

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.clientName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.catererName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking._id?.includes(searchTerm);
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'unlocked': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />;
      case 'unlocked': return <Unlock className="w-4 h-4" />;
      case 'confirmed': return <CheckCircle className="w-4 h-4" />;
      case 'rejected': return <XCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  // Helper function to safely render package information
  const renderPackage = (selectedPackage) => {
    if (!selectedPackage) return 'N/A';
    if (typeof selectedPackage === 'string') return selectedPackage;
    if (typeof selectedPackage === 'object') {
      return `${selectedPackage.name || 'Unknown Package'} - ₹${selectedPackage.pricePerPlate || 0}/plate`;
    }
    return 'N/A';
  };

  // Helper function to safely render cuisine information
  const renderCuisine = (selectedCuisine) => {
    if (!selectedCuisine) return 'N/A';
    if (typeof selectedCuisine === 'string') return selectedCuisine;
    if (Array.isArray(selectedCuisine)) return selectedCuisine.join(', ');
    if (typeof selectedCuisine === 'object') {
      return selectedCuisine.name || 'Unknown Cuisine';
    }
    return 'N/A';
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-gray-700">
      {/* Search and Filter */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by client, caterer, or booking ID..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="unlocked">Unlocked</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">
            Booking Requests ({filteredBookings.length})
          </h3>
        </div>
        
        <div className="divide-y divide-gray-100">
          {filteredBookings.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              No bookings found matching your criteria.
            </div>
          ) : (
            filteredBookings.map((booking) => (
              <div key={booking._id} className="p-6 hover:bg-gray-50">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
                        {getStatusIcon(booking.status)}
                        {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
                      </span>
                      <span className="text-xs text-gray-500">ID: {booking._id}</span>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-900">Client:</span>
                        <p className="text-gray-600">{booking.clientName || 'N/A'}</p>
                        <p className="text-gray-500">{booking.clientPhone || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Caterer:</span>
                        <p className="text-gray-600">{booking.catererName || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Event:</span>
                        <p className="text-gray-600">{booking.eventType || 'N/A'}</p>
                        <p className="text-gray-500">
                          {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Guests:</span>
                        <p className="text-gray-600">{booking.numGuests || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Location:</span>
                        <p className="text-gray-600">{booking.eventLocation || 'N/A'}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-900">Cost:</span>
                        <p className="text-gray-600">
                          {booking.estimatedCost ? `₹${booking.estimatedCost.toLocaleString()}` : 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <button
                      onClick={() => setSelectedBooking(booking)}
                      className="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50 transition-colors"
                    >
                      View Details
                    </button>
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleUnlockBooking(booking._id)}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                      >
                        <Unlock className="w-4 h-4" />
                        Unlock
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XCircle className="w-6 h-6" />
                </button>
              </div>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700">Booking ID</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking._id || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Status</label>
                  <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(selectedBooking.status)}`}>
                    {getStatusIcon(selectedBooking.status)}
                    {selectedBooking.status?.charAt(0).toUpperCase() + selectedBooking.status?.slice(1)}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client Name</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.clientName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Client Phone</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.clientPhone || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Caterer</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.catererName || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event Type</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.eventType || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Event Date</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedBooking.eventDate ? new Date(selectedBooking.eventDate).toLocaleDateString() : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.numGuests || 'N/A'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Event Location</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.eventLocation || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Venue Type</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.venueType || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Meal Preference</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.mealPreference || 'N/A'}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Cuisine</label>
                  <p className="mt-1 text-sm text-gray-900">{renderCuisine(selectedBooking.selectedCuisine)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Package</label>
                  <p className="mt-1 text-sm text-gray-900">{renderPackage(selectedBooking.selectedPackage)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Estimated Cost</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedBooking.estimatedCost ? `₹${selectedBooking.estimatedCost.toLocaleString()}` : 'N/A'}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700">Created At</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {selectedBooking.createdAt ? new Date(selectedBooking.createdAt).toLocaleString() : 'N/A'}
                  </p>
                </div>
              </div>
              
              {selectedBooking.specialRequests && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Special Requests</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.specialRequests}</p>
                </div>
              )}
              
              {selectedBooking.selectedLiveCounters && selectedBooking.selectedLiveCounters.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Live Counters</label>
                  <div className="mt-1 flex flex-wrap gap-2">
                    {selectedBooking.selectedLiveCounters.map((counter, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                        {typeof counter === 'object' ? counter.name || 'Unknown Counter' : counter}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {selectedBooking.vendorNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Vendor Notes</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedBooking.vendorNotes}</p>
                </div>
              )}
            </div>
            
            <div className="p-6 bg-gray-50 border-t border-gray-100">
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                >
                  Close
                </button>
                {selectedBooking.status === 'pending' && (
                  <button
                    onClick={() => {
                      handleUnlockBooking(selectedBooking._id);
                      setSelectedBooking(null);
                    }}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
                  >
                    <Unlock className="w-4 h-4" />
                    Unlock Booking
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Dashboard Component
const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await apiService.getStats(token);
        if (response.success) {
          setStats(response.data);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [token]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">Dashboard Overview</h2>
        <p className="text-gray-600 mt-1">Monitor your booking management system</p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatsCard
            title="Total Bookings"
            value={stats.total}
            icon={Calendar}
            color="blue"
          />
          <StatsCard
            title="Pending"
            value={stats.pending}
            icon={Clock}
            color="yellow"
          />
          <StatsCard
            title="Unlocked"
            value={stats.unlocked}
            icon={Unlock}
            color="purple"
          />
          <StatsCard
            title="Confirmed"
            value={stats.confirmed}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Rejected"
            value={stats.rejected}
            icon={XCircle}
            color="red"
          />
        </div>
      )}
    </div>
  );
};

// Main Admin Portal Component
const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const { admin, logout } = useAuth();

  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'bookings', name: 'Bookings', icon: Calendar },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="bg-blue-600 w-8 h-8 rounded-lg flex items-center justify-center mr-3">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Evenz.in Admin</h1>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{admin.name}</p>
                <p className="text-xs text-gray-500">{admin.role}</p>
              </div>
              <button
                onClick={logout}
                className="flex items-center gap-2 px-3 py-2 text-gray-600 hover:text-gray-900 transition-colors"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:w-64">
            <nav className="space-y-2">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                      activeTab === item.id
                        ? 'bg-blue-600 text-white'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {item.name}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'bookings' && <BookingManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const { admin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return admin ? <AdminPortal /> : <LoginPage />;
};

// Root Component with Auth Provider
export default function AdminApp() {
  return (
    <AuthProvider >
      <App />
    </AuthProvider>
  );
}