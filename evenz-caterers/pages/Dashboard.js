"use client";
import React, { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Calendar, 
  Clock, 
  CheckCircle, 
  DollarSign, 
  CalendarX,
  Eye,
  Settings,
  Phone,
  HelpCircle,
  ArrowRight,
  TrendingUp,
  Users
} from 'lucide-react';

const CatererDashboard = () => {
  const navigate = useRouter().push;
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Mock auth context - replace with your actual auth implementation
  const authToken = localStorage.getItem('token');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/vendor/dashboard/dashboard-summary', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
      }

      const result = await response.json();
      setDashboardData(result.data);
    } catch (err) {
      setError(err.message);
      console.error('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount || 0);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'unlocked': return 'bg-blue-100 text-blue-800';
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleCardClick = (filterType) => {
    // Navigate to bookings page with filter
    navigate(`/bookings`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded mb-6"></div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-32 bg-gray-200 rounded-lg"></div>
              ))}
            </div>
            <div className="h-64 bg-gray-200 rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-md p-6 max-w-md w-full text-center">
          <div className="text-red-500 mb-4">
            <svg className="w-12 h-12 mx-auto" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Dashboard</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {dashboardData?.catererName}!
          </h1>
          <p className="text-gray-600">Ready to review your new leads and manage your catering business?</p>
        </div>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8">
          {/* New/Pending Leads */}
          <div 
            onClick={() => handleCardClick('pending')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-yellow-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-yellow-100 p-2 rounded-lg">
                  <Clock className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">New Leads</h3>
                  <p className="text-sm text-gray-600">Pending requests</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-yellow-600 mb-2">
              {dashboardData?.pendingLeadsCount || 0}
            </div>
            <p className="text-sm text-gray-500">Click to view all pending</p>
          </div>

          {/* Leads in Progress */}
          <div 
            onClick={() => handleCardClick('unlocked')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-blue-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-blue-100 p-2 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">In Progress</h3>
                  <p className="text-sm text-gray-600">Unlocked leads</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-blue-600 mb-2">
              {dashboardData?.inProgressLeadsCount || 0}
            </div>
            <p className="text-sm text-gray-500">Click to review & confirm</p>
          </div>

          {/* Confirmed Bookings */}
          <div 
            onClick={() => handleCardClick('confirmed')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-green-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-green-100 p-2 rounded-lg">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Confirmed</h3>
                  <p className="text-sm text-gray-600">Last 30 days</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-green-600 mb-2">
              {dashboardData?.confirmedBookingsCount || 0}
            </div>
            <p className="text-sm text-gray-500">Bookings confirmed</p>
          </div>

          {/* Estimated Revenue */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-purple-100 p-2 rounded-lg">
                <DollarSign className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Revenue</h3>
                <p className="text-sm text-gray-600">Last 30 days</p>
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-bold text-purple-600 mb-2">
              {formatCurrency(dashboardData?.estimatedRevenueLast30Days)}
            </div>
            <p className="text-sm text-gray-500">From confirmed bookings</p>
          </div>

          {/* Days Unavailable */}
          <div 
            onClick={() => navigate('/calendar')}
            className="bg-white rounded-lg shadow-md p-6 cursor-pointer hover:shadow-lg transition-shadow border-l-4 border-red-500"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="bg-red-100 p-2 rounded-lg">
                  <CalendarX className="w-6 h-6 text-red-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">Unavailable</h3>
                  <p className="text-sm text-gray-600">Days marked off</p>
                </div>
              </div>
              <ArrowRight className="w-5 h-5 text-gray-400" />
            </div>
            <div className="text-3xl font-bold text-red-600 mb-2">
              {dashboardData?.unavailableDaysCount || 0}
            </div>
            <p className="text-sm text-gray-500">Click to manage calendar</p>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
            <div className="flex items-center space-x-3 mb-4">
              <div className="bg-indigo-100 p-2 rounded-lg">
                <Settings className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Quick Actions</h3>
                <p className="text-sm text-gray-600">Manage your business</p>
              </div>
            </div>
            <div className="space-y-2">
              <button 
                onClick={() => navigate('/your-profile')}
                className="w-full text-left text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-between p-2 hover:bg-indigo-50 rounded"
              >
                <span>Update Profile</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              <button 
                onClick={() => navigate('/calendar')}
                className="w-full text-left text-sm text-indigo-600 hover:text-indigo-800 flex items-center justify-between p-2 hover:bg-indigo-50 rounded"
              >
                <span>Manage Availability</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        <div className="bg-white rounded-lg shadow-md mb-8">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900 flex items-center">
              <Users className="w-5 h-5 mr-2" />
              Recent Booking Requests
            </h2>
            <p className="text-gray-600 text-sm mt-1">Latest requests from clients</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {dashboardData?.recentBookings?.length > 0 ? (
              dashboardData.recentBookings.map((booking) => (
                <div key={booking._id} className="p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3 mb-2">
                        <h3 className="font-medium text-gray-900">{booking.eventType}</h3>
                        <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(booking.status)}`}>
                          {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                        </span>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-1" />
                          {formatDate(booking.eventDate)}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          {booking.numGuests} guests
                        </div>
                        <div className="flex items-center">
                          <User className="w-4 h-4 mr-1" />
                          {booking.clientName}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {formatCurrency(booking.estimatedCost)}
                        </div>
                        <div className="text-xs text-gray-500">
                          {formatDate(booking.createdAt)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-6 text-center text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No recent booking requests</p>
              </div>
            )}
          </div>
          
          <div className="p-6 border-t border-gray-200">
            <button
              onClick={() => navigate('/bookings')}
              className="w-full sm:w-auto bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Eye className="w-4 h-4" />
              <span>View All Bookings</span>
            </button>
          </div>
        </div>

        {/* Quick Links Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => navigate('/bookings')}
            className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Eye className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-semibold text-gray-900">View All Bookings</h3>
            </div>
            <p className="text-sm text-gray-600">Manage all your booking requests</p>
          </button>

          <button
            onClick={() => navigate('/your-profile')}
            className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-green-100 p-2 rounded-lg">
                <Settings className="w-5 h-5 text-green-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Manage Profile</h3>
            </div>
            <p className="text-sm text-gray-600">Update your business information</p>
          </button>

          <button
            onClick={() => navigate('/calendar')}
            className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Calendar className="w-5 h-5 text-purple-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Update Availability</h3>
            </div>
            <p className="text-sm text-gray-600">Manage your calendar and availability</p>
          </button>

          <button
            onClick={() => navigate('/support')}
            className="bg-white rounded-lg shadow-md p-6 text-left hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center space-x-3 mb-3">
              <div className="bg-orange-100 p-2 rounded-lg">
                <HelpCircle className="w-5 h-5 text-orange-600" />
              </div>
              <h3 className="font-semibold text-gray-900">Help & Support</h3>
            </div>
            <p className="text-sm text-gray-600">Get help and contact support</p>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CatererDashboard;