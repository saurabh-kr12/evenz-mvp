import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, Clock, AlertCircle, CheckCircle, ChevronsRight, Search, X } from 'lucide-react';
import useAnalytics from '@/hooks/useAnalytics';

const BookingModal = ({ vendor, showModal, onClose }) => {
  const [selectedDate, setSelectedDate] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [availabilityResult, setAvailabilityResult] = useState(null);
  const [error, setError] = useState('');
  
  const analytics = useAnalytics();

  // Track modal open/close
  useEffect(() => {
    if (showModal) {
      analytics.trackCustomEvent(
        'modal_opened',
        'booking_flow',
        `availability_check_${vendor.businessName}`,
        0
      );
    }
  }, [showModal, vendor.businessName, analytics]);

  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const checkAvailability = async () => {
    if (!selectedDate) {
      setError('Please select an event date');
      return;
    }

    // Track availability check attempt
    analytics.trackCustomEvent(
      'availability_check_started',
      'booking_flow',
      `${vendor.businessName}_${selectedDate}`,
      0
    );

    setIsChecking(true);
    setError('');
    setAvailabilityResult(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/public/availability/${vendor.id}/${selectedDate}`);
      const data = await response.json();

      if (data.success) {
        setAvailabilityResult(data.data);
        
        // Track successful availability check with result
        analytics.trackCustomEvent(
          'availability_check_completed',
          'booking_flow',
          `${vendor.businessName}_${data.data.isAvailable ? 'available' : 'unavailable'}`,
          0
        );
      } else {
        setError(data.message || 'Failed to check availability');
        
        // Track availability check failure
        analytics.trackError(
          'availability_check_failed',
          data.message || 'Unknown error',
          'booking_modal'
        );
      }
    } catch (err) {
      setError('Network error. Please try again.');
      console.error('Availability check error:', err);
      
      // Track network error
      analytics.trackError(
        'network_error',
        'availability_check_network_failure',
        'booking_modal'
      );
    } finally {
      setIsChecking(false);
    }
  };

  const handleClose = () => {
    // Track modal close
    analytics.trackCustomEvent(
      'modal_closed',
      'booking_flow',
      `availability_check_${vendor.businessName}`,
      0
    );
    
    setSelectedDate('');
    setAvailabilityResult(null);
    setError('');
    onClose();
  };

  const handleDateChange = (e) => {
    const newDate = e.target.value;
    setSelectedDate(newDate);
    setAvailabilityResult(null);
    setError('');
    
    // Track date selection
    if (newDate) {
      analytics.trackCustomEvent(
        'date_selected',
        'booking_flow',
        `${vendor.businessName}_${newDate}`,
        0
      );
    }
  };

  const handleBookingRequest = () => {
    // Track booking request initiation
    analytics.trackBooking(
      'booking_request_initiated',
      vendor.businessName,
      0
    );
  };

  const handleTryAnotherDate = () => {
    // Track retry attempt
    analytics.trackCustomEvent(
      'try_another_date_clicked',
      'booking_flow',
      vendor.businessName,
      0
    );
    
    setSelectedDate('');
    setAvailabilityResult(null);
    setError('');
  };

  const handleExploreOtherCaterers = () => {
    // Track when users look for alternatives
    analytics.trackCustomEvent(
      'explore_alternatives_clicked',
      'booking_flow',
      `from_${vendor.businessName}`,
      0
    );
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-0 text-gray-700 bg-black bg-opacity-50 flex items-center sm:items-center justify-center p-0 sm:p-4 z-50">
      <div className="bg-white rounded-t-2xl sm:rounded-lg w-full sm:w-full sm:max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <div className="bg-orange-100 p-2 rounded-lg">
              <Calendar className="w-5 h-5 text-orange-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Check Availability</h3>
              <p className="text-sm text-gray-600">{vendor.businessName}</p>
            </div>
          </div>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Date Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Event Date *
            </label>
            <div className="relative">
              <input
                type="date"
                value={selectedDate}
                onChange={handleDateChange}
                onClick={(e) => {
                  e.target.showPicker && e.target.showPicker();
                }}
                className="w-full p-3 cursor-pointer border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent text-base"
                placeholder="Select your event date"
                min={getTodayDate()}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm text-red-800 font-medium">Unable to check availability</p>
                <p className="text-sm text-red-600 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Availability Result */}
          {availabilityResult && (
            <div className={`border rounded-lg p-4 ${
              availabilityResult.isAvailable 
                ? 'bg-green-50 border-green-200' 
                : 'bg-red-50 border-red-200'
            }`}>
              <div className="flex items-start gap-3">
                {availabilityResult.isAvailable ? (
                  <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <h4 className={`font-medium ${
                    availabilityResult.isAvailable ? 'text-green-800' : 'text-red-800'
                  }`}>
                    {availabilityResult.isAvailable ? 'Available!' : 'Not Available'}
                  </h4>
                  <p className={`text-sm mt-1 ${
                    availabilityResult.isAvailable ? 'text-green-700' : 'text-red-700'
                  }`}>
                    {availabilityResult.isAvailable 
                      ? `${vendor.businessName} is available on ${new Date(selectedDate).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}`
                      : `${vendor.businessName} is not available on this date`
                    }
                  </p>
                  {availabilityResult.notes && (
                    <p className="text-sm mt-2 italic text-gray-600">
                      Note: {availabilityResult.notes}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3">
            {!availabilityResult ? (
              <button
                onClick={checkAvailability}
                disabled={!selectedDate || isChecking}
                className="w-full cursor-pointer bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
              >
                {isChecking ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    Checking...
                  </>
                ) : (
                  <>
                    <Calendar className="w-4 h-4" />
                    Check Availability
                  </>
                )}
              </button>
            ) : (
              <div className="space-y-3">
                {availabilityResult.isAvailable ? (
                  <Link
                    href={`/booking/${vendor.id}?date=${selectedDate}`}
                    onClick={handleBookingRequest}
                    className="w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    Proceed to Book
                    <ChevronsRight className="w-5 h-5" />
                  </Link>
                ) : (
                  <div className="space-y-3">
                    <button
                      onClick={handleTryAnotherDate}
                      className="w-full cursor-pointer border border-orange-500 text-orange-600 hover:bg-orange-50 py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Calendar className="w-4 h-4" />
                      Try Another Date
                    </button>
                    <Link
                      href="/search"
                      onClick={handleExploreOtherCaterers}
                      className="w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                    >
                      <Search className="w-4 h-4" />
                      Explore Other Caterers
                    </Link>
                  </div>
                )}
              </div>
            )}

            {/* Cancel Button */}
            <button
              onClick={handleClose}
              className="w-full cursor-pointer border border-gray-300 text-gray-700 hover:bg-gray-50 py-3 px-4 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;