"use client"
import React, { useState, useEffect } from 'react';
import { 
  Clock,
  Search,
  CheckCircle,
  XCircle,
  Unlock
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { apiService } from '../../services/apiService';
import BookingDetailsModal from './BookingDetailsModal';

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
        <BookingDetailsModal
          booking={selectedBooking}
          onClose={() => setSelectedBooking(null)}
          onUnlock={handleUnlockBooking}
        />
      )}
    </div>
  );
};

export default BookingManagement;