"use client"
import React from 'react';
import { 
  Clock,
  CheckCircle,
  XCircle,
  Unlock
} from 'lucide-react';

const BookingDetailsModal = ({ booking, onClose, onUnlock }) => {
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Booking Details</h3>
            <button
              onClick={onClose}
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
              <p className="mt-1 text-sm text-gray-900">{booking._id || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Status</label>
              <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium mt-1 ${getStatusColor(booking.status)}`}>
                {getStatusIcon(booking.status)}
                {booking.status?.charAt(0).toUpperCase() + booking.status?.slice(1)}
              </span>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Name</label>
              <p className="mt-1 text-sm text-gray-900">{booking.clientName || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Client Phone</label>
              <p className="mt-1 text-sm text-gray-900">{booking.clientPhone || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Caterer</label>
              <p className="mt-1 text-sm text-gray-900">{booking.catererName || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Type</label>
              <p className="mt-1 text-sm text-gray-900">{booking.eventType || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Event Date</label>
              <p className="mt-1 text-sm text-gray-900">
                {booking.eventDate ? new Date(booking.eventDate).toLocaleDateString() : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Number of Guests</label>
              <p className="mt-1 text-sm text-gray-900">{booking.numGuests || 'N/A'}</p>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700">Event Location</label>
              <p className="mt-1 text-sm text-gray-900">{booking.eventLocation || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Venue Type</label>
              <p className="mt-1 text-sm text-gray-900">{booking.venueType || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Meal Preference</label>
              <p className="mt-1 text-sm text-gray-900">{booking.mealPreference || 'N/A'}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Cuisine</label>
              <p className="mt-1 text-sm text-gray-900">{renderCuisine(booking.selectedCuisine)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Package</label>
              <p className="mt-1 text-sm text-gray-900">{renderPackage(booking.selectedPackage)}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Estimated Cost</label>
              <p className="mt-1 text-sm text-gray-900">
                {booking.estimatedCost ? `₹${booking.estimatedCost.toLocaleString()}` : 'N/A'}
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Created At</label>
              <p className="mt-1 text-sm text-gray-900">
                {booking.createdAt ? new Date(booking.createdAt).toLocaleString() : 'N/A'}
              </p>
            </div>
          </div>
          
          {booking.specialRequests && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Special Requests</label>
              <p className="mt-1 text-sm text-gray-900">{booking.specialRequests}</p>
            </div>
          )}
          
          {booking.selectedLiveCounters && booking.selectedLiveCounters.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Live Counters</label>
              <div className="mt-1 flex flex-wrap gap-2">
                {booking.selectedLiveCounters.map((counter, index) => (
                  <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                    {typeof counter === 'object' ? counter.name || 'Unknown Counter' : counter}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {booking.vendorNotes && (
            <div>
              <label className="block text-sm font-medium text-gray-700">Vendor Notes</label>
              <p className="mt-1 text-sm text-gray-900">{booking.vendorNotes}</p>
            </div>
          )}
        </div>
        
        <div className="p-6 bg-gray-50 border-t border-gray-100">
          <div className="flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
            {booking.status === 'pending' && (
              <button
                onClick={() => {
                  onUnlock(booking._id);
                  onClose();
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
  );
};

export default BookingDetailsModal;