"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Phone, Clock, CheckCircle, AlertCircle, Eye, Package, X, Trash2 } from 'lucide-react';

const ClientBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [cancellingBookings, setCancellingBookings] = useState(new Set());

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/booking/client', {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        setBookings(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    // Add confirmation dialog
    if (!window.confirm('Are you sure you want to cancel this booking request? This action cannot be undone.')) {
      return;
    }

    try {
      setCancellingBookings(prev => new Set(prev).add(bookingId));
      
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/booking/cancel/${bookingId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      
      if (data.success) {
        // Remove the cancelled booking from the state
        setBookings(prev => prev.filter(booking => booking._id !== bookingId));
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to cancel booking request');
    } finally {
      setCancellingBookings(prev => {
        const newSet = new Set(prev);
        newSet.delete(bookingId);
        return newSet;
      });
    }
  };

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { 
        color: 'bg-yellow-100 text-yellow-800 border-yellow-200', 
        icon: Clock, 
        text: 'Pending' 
      },
      unlocked: { 
        color: 'bg-blue-100 text-blue-800 border-blue-200', 
        icon: Eye, 
        text: 'Seen' 
      },
      confirmed: { 
        color: 'bg-green-100 text-green-800 border-green-200', 
        icon: CheckCircle, 
        text: 'Confirmed' 
      },
      rejected: { 
        color: 'bg-red-100 text-red-800 border-red-200', 
        icon: AlertCircle, 
        text: 'Not Confirmed' 
      }
    };

    const config = statusConfig[status] || statusConfig.pending;
    const IconComponent = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config.color}`}>
        <IconComponent className="w-3 h-3 mr-1" />
        {config.text}
      </span>
    );
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR'
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-600 text-sm mt-1">Track your catering requests</p>
          </div>
        </div>
      </div>

      <div className="">
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <div className="ml-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
            </div>
          </div>
        )}

        {bookings.length === 0 ? (
          <div className="text-center py-12">
            <Package className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No bookings yet</h3>
            <p className="mt-1 text-sm text-gray-500">Start by exploring caterers and making your first booking.</p>
            <div className="mt-6">
              <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700">
                Browse Caterers
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 max-w-7xl mx-auto py-6">
            {bookings.map((booking) => (
              <div key={booking._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                {/* Header */}
                <div className="px-4 py-4 sm:px-6 bg-gray-50 border-b border-gray-200">
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <h3 className="text-lg font-medium text-gray-900 truncate">
                        {booking.catererName}
                      </h3>
                      <p className="text-sm text-gray-500 mt-1">
                        Booking ID: {booking._id.slice(-8).toUpperCase()}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 ml-4">
                      <div className="text-right">
                        {getStatusBadge(booking.status)}
                        <p className="text-sm text-gray-500 mt-1">
                          {formatDate(booking.createdAt)}
                        </p>
                      </div>
                      {/* Cancel Button - Only show for pending status */}
                      {booking.status === 'pending' && (
                        <button
                          onClick={() => handleCancelBooking(booking._id)}
                          disabled={cancellingBookings.has(booking._id)}
                          className="inline-flex items-center px-2 py-1 border border-red-300 shadow-sm text-xs font-medium rounded-md text-red-700 bg-white hover:bg-red-50 disabled:opacity-50 disabled:cursor-not-allowed ml-2"
                          title="Cancel booking request"
                        >
                          {cancellingBookings.has(booking._id) ? (
                            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-red-500"></div>
                          ) : (
                            <Trash2 className="w-3 h-3" />
                          )}
                          <span className="ml-1 hidden sm:inline">Cancel</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Content */}
                <div className="p-4 sm:p-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Event Details */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 text-sm uppercase tracking-wide">Event Details</h4>
                      
                      <div className="space-y-3">
                        <div className="flex items-start">
                          <Calendar className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="ml-3">
                            <p className="text-sm font-medium text-gray-900">{booking.eventType}</p>
                            <p className="text-sm text-gray-500">{formatDate(booking.eventDate)}</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <Users className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="ml-3">
                            <p className="text-sm text-gray-900">{booking.numGuests} guests</p>
                          </div>
                        </div>

                        <div className="flex items-start">
                          <MapPin className="h-4 w-4 text-gray-400 mt-0.5 flex-shrink-0" />
                          <div className="ml-3">
                            <p className="text-sm text-gray-900">{booking.eventLocation}</p>
                            {booking.venueType && (
                              <p className="text-sm text-gray-500">{booking.venueType}</p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Package & Pricing */}
                    <div className="space-y-4">
                      <h4 className="font-medium text-gray-900 text-sm uppercase tracking-wide">Package & Pricing</h4>
                      
                      <div className="space-y-3">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-sm font-medium text-gray-900">{booking.selectedPackage.name}</p>
                          <p className="text-sm text-gray-600">
                            {formatCurrency(booking.selectedPackage.pricePerPlate)} per plate
                          </p>
                          {booking.selectedPackage.inclusions && (
                            <div className="mt-2 text-xs text-gray-500">
                              <p>Includes: {booking.selectedPackage.inclusions.numStarters} starters, {booking.selectedPackage.inclusions.numMains} mains, {booking.selectedPackage.inclusions.numBeverages} beverages</p>
                            </div>
                          )}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t">
                          <span className="text-sm font-medium text-gray-900">Estimated Total</span>
                          <span className="text-lg font-bold text-orange-600">
                            {formatCurrency(booking.estimatedCost)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Additional Details */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Cuisine & Preferences</h5>
                        <div className="space-y-1">
                          <p className="text-sm text-gray-600">Cuisine: {booking.selectedCuisine}</p>
                          <p className="text-sm text-gray-600">
                            Meal: {Array.isArray(booking.mealPreference) ? booking.mealPreference.join(', ') : booking.mealPreference}
                          </p>
                        </div>
                      </div>

                      {booking.selectedLiveCounters && booking.selectedLiveCounters.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-gray-900 mb-2">Live Counters</h5>
                          <div className="space-y-1">
                            {booking.selectedLiveCounters.map((counter, index) => (
                              <p key={index} className="text-sm text-gray-600">
                                {counter.name} 
                              </p>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {booking.specialRequests && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Special Requests</h5>
                        <p className="text-sm text-gray-600 bg-gray-50 rounded-lg p-3">
                          {booking.specialRequests}
                        </p>
                      </div>
                    )}

                    {booking.vendorNotes && (
                      <div className="mt-4">
                        <h5 className="text-sm font-medium text-gray-900 mb-2">Caterer Notes</h5>
                        <p className="text-sm text-gray-600 bg-blue-50 rounded-lg p-3">
                          {booking.vendorNotes}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Status Information */}
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-3 sm:space-y-0">
                      <div className="flex items-center">
                        <div className="text-sm text-gray-500">
                          {booking.status === 'pending' && (
                            <p>Your request is pending review by the caterer.</p>
                          )}
                          {booking.status === 'unlocked' && (
                            <p>The caterer has seen your request and will contact you soon after reviewing.</p>
                          )}
                          {booking.status === 'confirmed' && (
                            <p className="text-green-600">Your booking has been confirmed! </p>
                          )}
                          {booking.status === 'rejected' && (
                            <p className="text-red-600">This request was not confirmed by the caterer.</p>
                          )}
                        </div>
                      </div>
                      {(booking.status === 'confirmed' || booking.status === 'unlocked') && (
                        <button className="inline-flex items-center px-3 py-1.5 border border-gray-300 shadow-sm text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                          <Phone className="w-3 h-3 mr-1" />
                          Contact Caterer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientBookings;