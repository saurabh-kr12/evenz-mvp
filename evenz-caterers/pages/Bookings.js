"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Lock, Unlock, Check, X, Eye, EyeOff, AlertCircle, Package, Phone, MessageCircle } from 'lucide-react';

const CatererBookings = () => {
  const [activeTab, setActiveTab] = useState('ongoing');
  const [ongoingBookings, setOngoingBookings] = useState([]);
  const [unlockedBookings, setUnlockedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [confirmationNotes, setConfirmationNotes] = useState('');
  const [confirmAction, setConfirmAction] = useState('');

  useEffect(() => {
    fetchBookings();
  }, []);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      const [ongoingRes, unlockedRes] = await Promise.all([
        fetch('http://localhost:5000/api/booking/vendor/ongoing', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/booking/vendor/unlocked', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const ongoingData = await ongoingRes.json();
      const unlockedData = await unlockedRes.json();

      if (ongoingData.success) setOngoingBookings(ongoingData.data);
      if (unlockedData.success) setUnlockedBookings(unlockedData.data);

    } catch (err) {
      setError('Failed to fetch bookings');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockRequest = async (bookingId) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/booking/vendor/request-unlock', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ bookingId })
      });

      const data = await response.json();
      if (data.success) {
        alert('Unlock request sent to admin. You will be contacted for payment details.');
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to request unlock');
    }
  };

  const handleConfirmBooking = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/booking/vendor/confirm/${selectedBooking._id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          status: confirmAction, 
          notes: confirmationNotes 
        })
      });

      const data = await response.json();
      if (data.success) {
        setShowConfirmModal(false);
        setSelectedBooking(null);
        setConfirmationNotes('');
        await fetchBookings();
        alert(`Booking ${confirmAction} successfully!`);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to update booking');
    }
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

  const getStatusBadge = (status) => {
    const statusConfig = {
      pending: { color: 'bg-yellow-100 text-yellow-800', text: 'Locked' },
      unlocked: { color: 'bg-blue-100 text-blue-800', text: 'Unlocked' },
      confirmed: { color: 'bg-green-100 text-green-800', text: 'Confirmed' },
      rejected: { color: 'bg-red-100 text-red-800', text: 'Not Confirmed' }
    };

    const config = statusConfig[status] || statusConfig.pending;
    
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const BookingCard = ({ booking, isLocked = false }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="px-4 py-4 sm:px-6 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center">
              <h3 className="text-lg font-medium text-gray-900">
                {isLocked ? (
                  <div className="flex items-center">
                    <EyeOff className="w-4 h-4 mr-2 text-gray-400" />
                    {booking.clientName}
                  </div>
                ) : (
                  <div className="flex items-center">
                    <Eye className="w-4 h-4 mr-2 text-green-500" />
                    {booking.clientName}
                  </div>
                )}
              </h3>
            </div>
            <p className="text-sm text-gray-500 mt-1">
              {isLocked ? (
                <>Phone: {booking.clientPhone}</>
              ) : (
                <a href={`tel:${booking.clientPhone}`} className="text-blue-600 hover:underline">
                  {booking.clientPhone}
                </a>
              )}
            </p>
          </div>
          <div className="text-right">
            {getStatusBadge(booking.status)}
            <p className="text-sm text-gray-500 mt-1">
              {formatDate(booking.createdAt)}
            </p>
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
                <Calendar className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-900">{booking.eventType}</p>
                  <p className="text-sm text-gray-500">{formatDate(booking.eventDate)}</p>
                </div>
              </div>

              <div className="flex items-start">
                <Users className="h-4 w-4 text-gray-400 mt-0.5" />
                <div className="ml-3">
                  <p className="text-sm text-gray-900">{booking.numGuests} guests</p>
                </div>
              </div>

              <div className="flex items-start">
                <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
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
            <h4 className="font-medium text-gray-900 text-sm uppercase tracking-wide">Package Details</h4>
            
            <div className="space-y-3">
              <div className="bg-gray-50 rounded-lg p-3">
                <p className="text-sm font-medium text-gray-900">{booking.selectedPackage.name}</p>
                <p className="text-sm text-gray-600">
                  {formatCurrency(booking.selectedPackage.pricePerPlate)} per plate
                </p>
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
              <h5 className="text-sm font-medium text-gray-900 mb-2">Preferences</h5>
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
        </div>

        {/* Actions */}
        <div className="mt-6 pt-6 border-t border-gray-200">
          {isLocked ? (
            <div className="flex items-center justify-between">
              <div className="flex items-center text-sm text-gray-500">
                <Lock className="w-4 h-4 mr-2" />
                Contact details are locked
              </div>
              <button
                onClick={() => handleUnlockRequest(booking._id)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700"
              >
                <Unlock className="w-4 h-4 mr-2" />
                Request Unlock
              </button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              {booking.status === 'unlocked' && (
                <>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setConfirmAction('confirmed');
                      setShowConfirmModal(true);
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Confirm Booking
                  </button>
                  <button
                    onClick={() => {
                      setSelectedBooking(booking);
                      setConfirmAction('rejected');
                      setShowConfirmModal(true);
                    }}
                    className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Cannot Confirm
                  </button>
                </>
              )}
              <a
                href={`tel:${booking.clientPhone}`}
                className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Client
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-gray-700 bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <h1 className="text-2xl font-bold text-gray-900">Booking Requests</h1>
            <p className="text-gray-600 text-sm mt-1">Manage your catering requests</p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
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

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('ongoing')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'ongoing'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Ongoing Requests ({ongoingBookings.length})
              </button>
              <button
                onClick={() => setActiveTab('unlocked')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'unlocked'
                    ? 'border-orange-500 text-orange-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Unlocked Requests ({unlockedBookings.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Content */}
        {activeTab === 'ongoing' && (
          <div className="space-y-6">
            {ongoingBookings.length === 0 ? (
              <div className="text-center py-12">
                <Package className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No ongoing requests</h3>
                <p className="mt-1 text-sm text-gray-500">New booking requests will appear here.</p>
              </div>
            ) : (
              ongoingBookings.map((booking) => (
                <BookingCard key={booking._id} booking={booking} isLocked={true} />
              ))
            )}
          </div>
        )}

        {activeTab === 'unlocked' && (
          <div className="space-y-6">
            {unlockedBookings.length === 0 ? (
              <div className="text-center py-12">
                <Unlock className="mx-auto h-12 w-12 text-gray-400" />
                <h3 className="mt-2 text-sm font-medium text-gray-900">No unlocked requests</h3>
                <p className="mt-1 text-sm text-gray-500">Unlocked requests will appear here after admin approval.</p>
              </div>
            ) : (
              unlockedBookings.map((booking) => (
                <BookingCard key={booking._id} booking={booking} isLocked={false} />
              ))
            )}
          </div>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-full max-w-md shadow-lg rounded-md bg-white">
            <div className="mt-3">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {confirmAction === 'confirmed' ? 'Confirm Booking' : 'Cannot Confirm Booking'}
              </h3>
              
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Add a note for the client (optional)
                </label>
                <textarea
                  value={confirmationNotes}
                  onChange={(e) => setConfirmationNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                  rows="3"
                  placeholder={
                    confirmAction === 'confirmed' 
                      ? "e.g., Thank you for choosing us! We'll contact you soon to finalize details."
                      : "e.g., Sorry, we're unavailable on this date. Please consider alternate dates."
                  }
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={handleConfirmBooking}
                  className={`flex-1 px-4 py-2 text-sm font-medium rounded-md text-white ${
                    confirmAction === 'confirmed' 
                      ? 'bg-green-600 hover:bg-green-700' 
                      : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {confirmAction === 'confirmed' ? 'Confirm Booking' : 'Cannot Confirm'}
                </button>
                <button
                  onClick={() => {
                    setShowConfirmModal(false);
                    setSelectedBooking(null);
                    setConfirmationNotes('');
                  }}
                  className="flex-1 px-4 py-2 text-sm font-medium rounded-md text-gray-700 bg-gray-100 hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CatererBookings;