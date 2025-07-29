"use client"

import { useContext } from 'react';
import React, { useState, useEffect } from 'react';
import { AuthContext } from '@/context/AuthContext';
import useAnalytics from '@/hooks/useAnalytics';

const BookingsDashboard = () => {
  const [metrics, setMetrics] = useState({
    totalPending: 0,
    totalUnlocked: 0,
    totalConfirmed: 0,
    totalNotConfirmed: 0,
    freeUnlockUsed: false,
    totalUnlocksPurchased: 0,
    totalRevenueGenerated: 0
  });

  const { currentUser } = useContext(AuthContext);
  const { dashboard, bookings, ui } = useAnalytics();
  const [pendingBookings, setPendingBookings] = useState([]);
  const [unlockedBookings, setUnlockedBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unlockingBookingId, setUnlockingBookingId] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Auto-hide toast messages after 5 seconds
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        setSuccessMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage('');
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');

      const [metricsRes, pendingRes, unlockedRes] = await Promise.all([
        fetch('http://localhost:5000/api/booking/vendor/metrics', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/booking/vendor/ongoing', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('http://localhost:5000/api/booking/vendor/unlocked', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      const metricsData = await metricsRes.json();
      const pendingData = await pendingRes.json();
      const unlockedData = await unlockedRes.json();

      if (metricsData.success) setMetrics(metricsData.data);
      if (pendingData.success) setPendingBookings(pendingData.data);
      if (unlockedData.success) setUnlockedBookings(unlockedData.data);

    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setErrorMessage('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockBooking = async (bookingId, ownerName, ownerEmail, ownerMobile) => {
    try {
      // Track unlock attempt
      bookings.unlockAttempt(bookingId);

      setUnlockingBookingId(bookingId);
      setErrorMessage('');
      setSuccessMessage('');

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/booking/${bookingId}/initiate-unlock`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.status === 'FREE_UNLOCK_SUCCESS') {
        bookings.unlockSuccess('free', bookingId);
        // Free unlock successful
        setSuccessMessage('🎉 Congratulations! Your first unlock is FREE! The client\'s contact details are now visible for this request. Future unlocks will cost ₹200 per request.');

        // Refresh data to show updated booking
        await fetchDashboardData();

      } else if (data.status === 'PAYMENT_REQUIRED') {
        // Paid unlock - initiate Razorpay
        const { order_id, amount, currency, key_id, booking_id } = data.data;

        bookings.paymentInitiated(booking_id, amount);

        const options = {
          key: key_id,
          amount: amount,
          currency: currency,
          name: 'Evenz.in',
          description: 'Unlock booking request',
          order_id: order_id,
          handler: async function (response) {
            bookings.paymentSuccess(booking_id, response.razorpay_payment_id);
            // Payment successful
            try {
              const verifyResponse = await fetch('http://localhost:5000/api/booking/payments/verify-razorpay', {
                method: 'POST',
                headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  razorpay_order_id: response.razorpay_order_id,
                  razorpay_payment_id: response.razorpay_payment_id,
                  razorpay_signature: response.razorpay_signature
                })
              });

              const verifyData = await verifyResponse.json();

              if (verifyData.success) {
                bookings.unlockSuccess('paid', booking_id);
                setSuccessMessage('Payment successful! Booking unlocked successfully.');
                await fetchDashboardData();
              } else {
                bookings.paymentFailed(booking_id, 'verification_failed');
                setErrorMessage('Payment verification failed. Please contact support.');
              }
            } catch (error) {
              console.error('Payment verification error:', error);
              bookings.paymentFailed(booking_id, 'verification_error');
              setErrorMessage('Payment verification failed. Please contact support.');
            }
          },
          prefill: {
            name: ownerName, // You can get this from auth context
            email: ownerEmail, // You can get this from auth context
            contact: ownerMobile
          },
          theme: {
            color: '#F37254'
          },
          modal: {
            ondismiss: function () {
              bookings.paymentCancelled(booking_id);
              setErrorMessage('Payment cancelled. Please try again to unlock the booking.');
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      }
    } catch (error) {
      console.error('Error unlocking booking:', error);
      bookings.unlockFailed(bookingId, 'api_error');
      setErrorMessage(error.response?.data?.message || 'Failed to unlock booking');
    } finally {
      setUnlockingBookingId(null);
    }
  };

  const handleUpdateFinalStatus = async (bookingId, finalStatus) => {
    try {
      setErrorMessage('');
      setSuccessMessage('');

      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5000/api/booking/${bookingId}/update-final-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          finalStatus
        })
      });

      const data = await response.json();

      if (data.success) {
        bookings.statusUpdated(bookingId, finalStatus);
        setSuccessMessage(`Booking ${finalStatus.toLowerCase()} successfully!`);
        await fetchDashboardData();
      }
    } catch (error) {
      console.error('Error updating final status:', error);
      bookings.statusUpdateFailed(bookingId, finalStatus, 'api_error');
      setErrorMessage(error.response?.data?.message || 'Failed to update booking status');
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric'
    });
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const handlePhoneCall = (phoneNumber , bookingId) => {
    // You'll need to pass bookingId to this function or get it from context
    bookings.clientContactClicked('phone', bookingId);
    window.open(`tel:${phoneNumber}`, '_self');
  };

  const PendingBookingCard = ({ booking }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
            <svg className="w-4 h-4 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
              <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{booking.eventType}</h3>
            <p className="text-xs text-gray-500">{formatDate(booking.eventDate)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-green-600 text-sm">{formatCurrency(booking.estimatedCost)}</p>
          <p className="text-xs text-gray-500">{booking.numGuests} guests</p>
        </div>
      </div>

      {/* Main Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>{booking.eventLocation} • {booking.venueType}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
          </svg>
          <span>{booking.selectedCuisine} • {booking.mealPreference.join(', ')}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 0a1 1 0 100 2h.01a1 1 0 100-2H9zm8-5a1 1 0 00-.707-.293l-2 2a1 1 0 001.414 1.414l2-2A1 1 0 0017 6z" clipRule="evenodd" />
          </svg>
          <span>{booking.selectedPackage.name} • {formatCurrency(booking.selectedPackage.pricePerPlate)}/plate</span>
        </div>

        {booking.selectedLiveCounters.length > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            <span>Live: {booking.selectedLiveCounters.map(counter => counter.name).join(', ')}</span>
          </div>
        )}
      </div>

      {/* Client Info (Hidden) */}
      <div className="flex items-center justify-between mb-3 p-2 bg-gray-50 rounded-lg">
        <div className="flex items-center space-x-2">
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
            <span className="text-sm text-gray-500">•••••••••••</span>
          </div>
          <div className="flex items-center space-x-1">
            <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
            </svg>
            <span className="text-sm text-gray-500">••••••••••</span>
          </div>
        </div>
        <div className="relative group">
          <svg className="w-4 h-4 text-gray-400 cursor-pointer" fill="currentColor" viewBox="0 0 20 20">
            <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
            <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
          </svg>
          <div className="absolute bottom-6 right-0 bg-black text-white text-xs rounded px-2 py-1 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            Unlock to see client details
          </div>
        </div>
      </div>

      {/* Special Requests */}
      {booking.specialRequests && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 italic">"{booking.specialRequests}"</p>
        </div>
      )}

      {/* Unlock Button */}
      <button
        onClick={() => handleUnlockBooking(booking._id, 'currentUser.ownerName', 'currentUser.email', 'currentUser.mobile')}
        disabled={unlockingBookingId === booking._id}
        className={`w-full py-2.5 px-4 rounded-lg font-medium text-sm transition-colors ${unlockingBookingId === booking._id
          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
          : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
          }`}
      >
        {unlockingBookingId === booking._id ? (
          <div className="flex items-center justify-center space-x-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Unlocking...</span>
          </div>
        ) : (
          <div className="flex items-center justify-center space-x-2">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
            <span>Unlock {!metrics.freeUnlockUsed ? '(FREE)' : '(₹200)'}</span>
          </div>
        )}
      </button>
    </div>
  );

  const UnlockedBookingCard = ({ booking }) => (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${booking.status === 'UNLOCKED' ? 'bg-blue-100' :
            booking.status === 'CONFIRMED' ? 'bg-green-100' : 'bg-red-100'
            }`}>
            <svg className={`w-4 h-4 ${booking.status === 'UNLOCKED' ? 'text-blue-600' :
              booking.status === 'CONFIRMED' ? 'text-green-600' : 'text-red-600'
              }`} fill="currentColor" viewBox="0 0 20 20">
              {booking.status === 'UNLOCKED' ? (
                <path fillRule="evenodd" d="M18 8a6 6 0 01-7.743 5.743L10 14l-4-4 4-4 .257.257A6 6 0 0118 8z" clipRule="evenodd" />
              ) : booking.status === 'CONFIRMED' ? (
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              ) : (
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              )}
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 text-sm">{booking.eventType}</h3>
            <p className="text-xs text-gray-500">{formatDate(booking.eventDate)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-bold text-green-600 text-sm">{formatCurrency(booking.estimatedCost)}</p>
          <p className="text-xs text-gray-500">{booking.numGuests} guests</p>
        </div>
      </div>

      {/* Main Details */}
      <div className="space-y-2 mb-3">
        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
          </svg>
          <span>{booking.eventLocation} • {booking.venueType}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.804.804A1 1 0 0113 18H7a1 1 0 01-.707-1.707l.804-.804L7.22 15H5a2 2 0 01-2-2V5zm5.771 7H5V5h10v7H8.771z" clipRule="evenodd" />
          </svg>
          <span>{booking.selectedCuisine} • {booking.mealPreference.join(', ')}</span>
        </div>

        <div className="flex items-center text-sm text-gray-600">
          <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V4a2 2 0 00-2-2H6zm1 2a1 1 0 000 2h6a1 1 0 100-2H7zm6 7a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-3 3a1 1 0 100 2h.01a1 1 0 100-2H10zm-4 1a1 1 0 011-1h.01a1 1 0 110 2H7a1 1 0 01-1-1zm1-4a1 1 0 100 2h.01a1 1 0 100-2H7zm2 0a1 1 0 100 2h.01a1 1 0 100-2H9zm8-5a1 1 0 00-.707-.293l-2 2a1 1 0 001.414 1.414l2-2A1 1 0 0017 6z" clipRule="evenodd" />
          </svg>
          <span>{booking.selectedPackage.name} • {formatCurrency(booking.selectedPackage.pricePerPlate)}/plate</span>
        </div>

        {booking.selectedLiveCounters.length > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <svg className="w-4 h-4 mr-2 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd" />
            </svg>
            <span>Live: {booking.selectedLiveCounters.map(counter => counter.name).join(', ')}</span>
          </div>
        )}
      </div>

      {/* Client Contact Details */}
      <div className="bg-blue-50 rounded-lg p-3 mb-3">
        <h4 className="font-medium text-gray-900 text-sm mb-2">Client Details</h4>
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Name:</span>
            <span className="text-sm font-medium text-gray-900">{booking.clientName}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600">Phone:</span>
            <button
              onClick={() => handlePhoneCall(booking.clientPhone,booking._id)}
              className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center space-x-1"
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
              </svg>
              <span>{booking.clientPhone}</span>
            </button>
          </div>
        </div>
      </div>

      {/* Special Requests */}
      {booking.specialRequests && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 italic">"{booking.specialRequests}"</p>
        </div>
      )}

      {/* Status Badge */}
      <div className="flex items-center justify-between mb-3">
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${booking.status === 'UNLOCKED' ? 'bg-blue-100 text-blue-800' :
          booking.status === 'CONFIRMED' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
          {booking.status === 'UNLOCKED' ? 'Unlocked' :
            booking.status === 'CONFIRMED' ? 'Confirmed' : 'Not Confirmed'}
        </span>
        <span className="text-xs text-gray-500">
          Unlocked {formatDate(booking.unlocked_at)}
        </span>
      </div>

      {/* Action Buttons */}
      {booking.status === 'UNLOCKED' && (
        <div className="flex space-x-2">
          <button
            onClick={() => handleUpdateFinalStatus(booking._id, 'CONFIRMED')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
          >
            <div className="flex items-center justify-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
              <span>Confirmed</span>
            </div>
          </button>
          <button
            onClick={() => handleUpdateFinalStatus(booking._id, 'NOT_CONFIRMED')}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
          >
            <div className="flex items-center justify-center space-x-1">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
              <span>Not Confirmed</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-700 ">
      <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {/* Header Title and Subtitle */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Booking Dashboard</h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              Manage your booking requests and track performance
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-4">
            {/* Free Unlock Card */}
            <div className="bg-white shadow rounded-lg px-4 py-3 flex w-40 items-center gap-3">
              <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                  <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <dt className="text-xs text-gray-500 font-medium">Free Unlock</dt>
                <dd className="text-sm font-semibold text-gray-900">
                  {metrics.freeUnlockUsed ? 'Used' : 'Available'}
                </dd>
              </div>
            </div>

            {/* Unlocks Card */}
            <div className="bg-white w-40 shadow rounded-lg px-4 py-3 flex items-center gap-3">
              <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
                </svg>
              </div>
              <div>
                <dt className="text-xs text-gray-500 font-medium">Unlocks</dt>
                <dd className="text-sm font-semibold text-gray-900">{metrics.totalUnlocksPurchased}</dd>
              </div>
            </div>
          </div>
        </div>

        {/* Toast Notifications */}
        {successMessage && (
          <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-green-800">{successMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setSuccessMessage('')}
                  className="text-green-400 hover:text-green-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {errorMessage && (
          <div className="fixed top-4 right-4 z-50 max-w-sm w-full bg-red-50 border border-red-200 rounded-lg shadow-lg p-4 transform transition-all duration-300 ease-in-out">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-red-800">{errorMessage}</p>
              </div>
              <div className="ml-auto pl-3">
                <button
                  onClick={() => setErrorMessage('')}
                  className="text-red-400 hover:text-red-600"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <nav className="flex" aria-label="Tabs">
            <button
              onClick={() => {
                const oldTab = activeTab;
                bookings.tabSwitched(oldTab, 'pending');
                setActiveTab('pending');
              }}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'pending'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center justify-center space-x-2">

                <span className='text-sm'>Pending </span>
                <span className="bg-amber-100 text-amber-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {pendingBookings.length}
                </span>
              </div>
            </button>
            <button
              onClick={() => {
                const oldTab = activeTab;
                bookings.tabSwitched(oldTab, 'unlocked');
                setActiveTab('unlocked');
              }}
              className={`flex-1 py-4 px-6 text-center border-b-2 font-medium text-sm transition-colors ${activeTab === 'unlocked'
                ? 'border-blue-500 text-blue-600 bg-blue-50'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              <div className="flex items-center justify-center space-x-2">

                <span className='text-sm'>Unlocked </span>
                <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-0.5 rounded-full">
                  {unlockedBookings.length}
                </span>
              </div>
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-50 mt-4 md:mt-8 sm:mt-6">
          {activeTab === 'pending' && (
            <div>
              {pendingBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2M4 13h2m13-8v.01M6 8v.01" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No pending requests</h3>
                  <p className="text-gray-500">All your booking requests have been processed.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6">
                  {pendingBookings.map((booking) => (
                    <PendingBookingCard key={booking._id} booking={booking} />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'unlocked' && (
            <div>
              {unlockedBookings.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No unlocked requests</h3>
                  <p className="text-gray-500">Unlock pending requests to view client details and take action.</p>
                </div>
              ) : (
                <div className="grid gap-4 sm:gap-6">
                  {unlockedBookings.map((booking) => (
                    <UnlockedBookingCard key={booking._id} booking={booking} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default BookingsDashboard;
