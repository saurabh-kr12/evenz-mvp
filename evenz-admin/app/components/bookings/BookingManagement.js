import React, { useState, useEffect } from 'react';
import { 
  Calendar, MapPin, Users, Phone, Mail, Clock, CheckCircle, XCircle, 
  AlertCircle, Gift, CreditCard, TrendingUp, DollarSign, Filter, Search,
  Eye, Unlock, Copy, ExternalLink, RefreshCw
} from 'lucide-react';

const AdminBookingsDashboard = () => {
  const [allBookings, setAllBookings] = useState([]);
  const [pendingVerification, setPendingVerification] = useState([]);
  const [stats, setStats] = useState({});
  const [activeTab, setActiveTab] = useState('pending-verification');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [allBookingsRes, pendingRes, statsRes] = await Promise.all([
        fetch('http://localhost:5000/api/booking/admin/all', {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        fetch('http://localhost:5000/api/booking/admin/pending-verification', {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        }),
        fetch('http://localhost:5000/api/booking/admin/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('adminToken')}` }
        })
      ]);

      const allBookingsData = await allBookingsRes.json();
      const pendingData = await pendingRes.json();
      const statsData = await statsRes.json();

      if (allBookingsData.success) setAllBookings(allBookingsData.data);
      if (pendingData.success) setPendingVerification(pendingData.data);
      if (statsData.success) setStats(statsData.data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showNotification('Error fetching dashboard data', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlockBooking = async (bookingId) => {
    try {
      const response = await fetch(`http://localhost:5000/api/booking/admin/unlock/${bookingId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('adminToken')}`
        }
      });

      const data = await response.json();

      if (data.success) {
        showNotification('Booking unlocked successfully', 'success');
        fetchDashboardData();
      } else {
        showNotification(data.message, 'error');
      }
    } catch (error) {
      console.error('Error unlocking booking:', error);
      showNotification('Error unlocking booking', 'error');
    }
  };

  const showNotification = (message, type) => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 5000);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    showNotification('Copied to clipboard!', 'success');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'unlock_initiated': return 'bg-blue-100 text-blue-800';
      case 'utr_submitted': return 'bg-purple-100 text-purple-800';
      case 'unlocked': return 'bg-green-100 text-green-800';
      case 'confirmed': return 'bg-emerald-100 text-emerald-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case 'pending': return 'Pending';
      case 'unlock_initiated': return 'Unlock Initiated';
      case 'utr_submitted': return 'UTR Submitted';
      case 'unlocked': return 'Unlocked';
      case 'confirmed': return 'Confirmed';
      case 'rejected': return 'Rejected';
      default: return status;
    }
  };

  const getUrgencyColor = (eventDate) => {
    const today = new Date();
    const event = new Date(eventDate);
    const daysUntilEvent = Math.ceil((event - today) / (1000 * 60 * 60 * 24));
    
    if (daysUntilEvent <= 7) return 'text-red-600 font-semibold';
    if (daysUntilEvent <= 14) return 'text-orange-600 font-medium';
    return 'text-gray-600';
  };

  const filteredBookings = allBookings.filter(booking => {
    const matchesSearch = booking.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.catererName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.eventType.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const StatsCard = ({ title, value, icon: Icon, color }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 md:p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl md:text-2xl font-semibold text-gray-900">{value}</p>
        </div>
        <Icon className={`h-6 w-6 md:h-8 md:w-8 ${color}`} />
      </div>
    </div>
  );

  const BookingCard = ({ booking, showUtrActions = false }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">{booking.eventType}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(booking.status)}`}>
              {getStatusText(booking.status)}
            </span>
            {booking.isFreeLock && (
              <div className="flex items-center gap-1 text-green-600">
                <Gift className="h-4 w-4" />
                <span className="text-xs">Free</span>
              </div>
            )}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-500">Event in</p>
          <p className={`text-sm ${getUrgencyColor(booking.eventDate)}`}>
            {Math.ceil((new Date(booking.eventDate) - new Date()) / (1000 * 60 * 60 * 24))} days
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="break-all">{new Date(booking.eventDate).toLocaleDateString()}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Users className="h-4 w-4 mr-2 flex-shrink-0" />
            <span>{booking.numGuests} guests</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="break-all">{booking.eventLocation}</span>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="flex items-center text-sm text-gray-600">
            <Phone className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="break-all">{booking.clientId?.contact || 'N/A'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Mail className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="break-all">{booking.clientId?.email || 'N/A'}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <ExternalLink className="h-4 w-4 mr-2 flex-shrink-0" />
            <span className="break-all">{booking.catererId?.businessName || booking.catererName}</span>
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-3 rounded-lg mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          <p className="text-sm text-gray-600"><strong>Package:</strong> {booking.selectedPackage.name}</p>
          <p className="text-sm text-gray-600"><strong>Price:</strong> ₹{booking.selectedPackage.pricePerPlate}/plate</p>
          <p className="text-sm text-gray-600"><strong>Cuisine:</strong> {booking.selectedCuisine}</p>
          <p className="text-sm text-gray-600"><strong>Cost:</strong> ₹{booking.estimatedCost}</p>
        </div>
      </div>

      {showUtrActions && booking.status === 'utr_submitted' && (
        <div className="bg-purple-50 p-4 rounded-lg mb-4">
          <h4 className="font-medium text-purple-900 mb-2 flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            Payment Verification Required
          </h4>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-800">UTR ID:</span>
              <div className="flex items-center gap-2">
                <code className="bg-white px-2 py-1 rounded text-sm font-mono break-all">
                  {booking.upiTransactionId}
                </code>
                <button
                  onClick={() => copyToClipboard(booking.upiTransactionId)}
                  className="text-purple-600 hover:text-purple-800 flex-shrink-0"
                >
                  <Copy className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-800">Amount:</span>
              <span className="text-sm font-medium">₹{booking.paymentAmount}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-purple-800">Submitted:</span>
              <span className="text-sm">{new Date(booking.paymentSubmittedAt).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}

      {(activeTab === 'pending-verification' || showUtrActions) && (
        <div className="flex justify-end">
          <button
            onClick={() => handleUnlockBooking(booking._id)}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          >
            <Unlock className="h-4 w-4" />
            {loading ? 'Unlocking...' : 'Unlock Request'}
          </button>
        </div>
      )}
    </div>
  );

  const Notification = ({ message, type }) => {
    if (!message) return null;
    
    return (
      <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
      }`}>
        <div className="flex items-center gap-2">
          {type === 'success' ? <CheckCircle className="h-5 w-5" /> : <XCircle className="h-5 w-5" />}
          <span>{message}</span>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-6 w-6 animate-spin" />
          <span>Loading dashboard...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-700">
      <Notification message={notification?.message} type={notification?.type} />
      
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <p className="text-sm text-gray-600">Manage booking requests and payments</p>
            </div>
            <button
              onClick={fetchDashboardData}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <RefreshCw className="h-4 w-4" />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-6">
          <StatsCard
            title="Total Bookings"
            value={stats.total || 0}
            icon={Calendar}
            color="text-blue-600"
          />
          <StatsCard
            title="Pending"
            value={stats.pending || 0}
            icon={Clock}
            color="text-yellow-600"
          />
          <StatsCard
            title="UTR Submitted"
            value={stats.utrSubmitted || 0}
            icon={AlertCircle}
            color="text-purple-600"
          />
          <StatsCard
            title="Unlocked"
            value={stats.unlocked || 0}
            icon={Unlock}
            color="text-green-600"
          />
          <StatsCard
            title="Free Unlocks"
            value={stats.freeUnlocks || 0}
            icon={Gift}
            color="text-pink-600"
          />
          <StatsCard
            title="Revenue"
            value={`₹${stats.totalRevenue || 0}`}
            icon={DollarSign}
            color="text-emerald-600"
          />
        </div>

        {/* Tabs */}
        <div className="flex flex-wrap gap-2 mb-6">
          <button
            onClick={() => setActiveTab('pending-verification')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              activeTab === 'pending-verification'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Pending Verification ({pendingVerification.length})
          </button>
          <button
            onClick={() => setActiveTab('all-bookings')}
            className={`px-4 py-2 rounded-lg font-medium text-sm ${
              activeTab === 'all-bookings'
                ? 'bg-purple-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            All Bookings ({allBookings.length})
          </button>
        </div>

        {/* Filters for All Bookings */}
        {activeTab === 'all-bookings' && (
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search bookings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="unlock_initiated">Unlock Initiated</option>
                  <option value="utr_submitted">UTR Submitted</option>
                  <option value="unlocked">Unlocked</option>
                  <option value="confirmed">Confirmed</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>
              <div className="text-sm text-gray-600 flex items-center">
                Showing {filteredBookings.length} of {allBookings.length} bookings
              </div>
            </div>
          </div>
        )}

        {/* Content */}
        <div className="space-y-4">
          {activeTab === 'pending-verification' && (
            <>
              {pendingVerification.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Pending Verifications</h3>
                  <p className="text-gray-600">All payment verifications are up to date!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertCircle className="h-5 w-5 text-purple-600" />
                      <h3 className="font-medium text-purple-900">Priority Verification Queue</h3>
                    </div>
                    <p className="text-sm text-purple-800">
                      {pendingVerification.length} booking{pendingVerification.length !== 1 ? 's' : ''} waiting for payment verification. 
                      Verify payments in your UPI app using the UTR IDs below.
                    </p>
                  </div>
                  
                  {pendingVerification.map((booking) => (
                    <BookingCard key={booking._id} booking={booking} showUtrActions={true} />
                  ))}
                </div>
              )}
            </>
          )}

          {activeTab === 'all-bookings' && (
            <>
              {filteredBookings.length === 0 ? (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Bookings Found</h3>
                  <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                </div>
              ) : (
                filteredBookings.map((booking) => (
                  <BookingCard key={booking._id} booking={booking} />
                ))
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminBookingsDashboard;