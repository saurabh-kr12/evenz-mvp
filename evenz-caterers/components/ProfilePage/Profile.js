"use client";

import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Building, MapPin, Lock, Eye, EyeOff, Edit2, Save, X, RefreshCw } from 'lucide-react';
import useAnalytics from '@/hooks/useAnalytics';

const VendorProfile = () => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const { dashboard, ui } = useAnalytics(); // Add this line

  // Form states
  const [editingField, setEditingField] = useState(null);
  const [formData, setFormData] = useState({
    ownerName: '',
    businessName: '',
    mobile: '',
    email: '',
    pinCode: '',
    locality: '',
    city: '',
    state: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // OTP states
  const [otpData, setOtpData] = useState({
    mobile: { otp: '', sent: false, loading: false },
    email: { otp: '', sent: false, loading: false }
  });

  const [showPassword, setShowPassword] = useState({
    current: false,
    new: false,
    confirm: false
  });

  // API Base URL (update this to your backend URL)
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

  // Get auth token from localStorage
  const getAuthToken = () => {
    return localStorage.getItem('token');
  };

  // API call helper
  const apiCall = async (endpoint, options = {}) => {
    const token = getAuthToken();
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers
      },
      ...options
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  };

  // Fetch vendor profile
  const fetchVendorProfile = async () => {
    try {
      setLoading(true);
      const data = await apiCall('/vendor-profile');
      setVendor(data.data);
      setFormData({
        ownerName: data.data.ownerName,
        businessName: data.data.businessName,
        mobile: data.data.mobile,
        email: data.data.email,
        pinCode: data.data.pinCode,
        locality: data.data.locality,
        city: data.data.city,
        state: data.data.state,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  // Fetch states
  const fetchStates = async () => {
    try {
      const data = await apiCall('/vendor-profile/states');
      setStates(data.data);
    } catch (error) {
      console.error('Error fetching states:', error);
    }
  };

  // Fetch cities by state
  const fetchCities = async (state) => {
    try {
      const data = await apiCall(`/vendor-profile/cities/${state}`);
      setCities(data.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
    }
  };

  useEffect(() => {
    fetchVendorProfile();
    fetchStates();
    dashboard.pageViewed('vendor_profile');
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleEdit = (field) => {
    setEditingField(field);
    setError('');
    setSuccess('');

    ui.buttonClicked(`edit_${field}`, 'vendor_profile');
  };

  const handleCancel = () => {
    setEditingField(null);
    setFormData({
      ownerName: vendor.ownerName,
      businessName: vendor.businessName,
      mobile: vendor.mobile,
      email: vendor.email,
      pinCode: vendor.pinCode,
      locality: vendor.locality,
      city: vendor.city,
      state: vendor.state,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    setOtpData({
      mobile: { otp: '', sent: false, loading: false },
      email: { otp: '', sent: false, loading: false }
    });

    ui.buttonClicked('cancel_edit', 'vendor_profile');
  };

  const updateField = async (field, data) => {
    try {
      const response = await apiCall(`/vendor-profile/${field}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });

      setVendor(response.data);
      setEditingField(null);
      setSuccess(response.message);
      setTimeout(() => setSuccess(''), 3000);

      dashboard.profileFieldUpdated(field);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleOwnerNameUpdate = () => {
    if (!formData.ownerName.trim()) {
      setError('Owner name is required');
      return;
    }
    updateField('owner-name', { ownerName: formData.ownerName });
  };

  const handleBusinessNameUpdate = () => {
    if (!formData.businessName.trim()) {
      setError('Business name is required');
      return;
    }
    updateField('business-name', { businessName: formData.businessName });
  };

  const handleLocationUpdate = () => {
    const { pinCode, locality, city, state } = formData;

    if (!pinCode || !locality || !city || !state) {
      setError('All location fields are required');
      return;
    }

    if (!/^[0-9]{6}$/.test(pinCode)) {
      setError('Please provide a valid 6-digit pin code');
      return;
    }

    updateField('location', { pinCode, locality, city, state });
  };

  const sendMobileOTP = async () => {
    try {
      if (!/^[0-9]{10}$/.test(formData.mobile)) {
        setError('Please provide a valid 10-digit mobile number');
        return;
      }

      setOtpData(prev => ({
        ...prev,
        mobile: { ...prev.mobile, loading: true }
      }));

      const response = await apiCall('/vendor-profile/mobile/send-otp', {
        method: 'POST',
        body: JSON.stringify({ mobile: formData.mobile })
      });

      setOtpData(prev => ({
        ...prev,
        mobile: { ...prev.mobile, sent: true, loading: false }
      }));

      setSuccess(response.message);
      setTimeout(() => setSuccess(''), 3000);

      ui.buttonClicked('mobile_otp_sent', 'vendor_profile');
    } catch (error) {
      setError(error.message);
      setOtpData(prev => ({
        ...prev,
        mobile: { ...prev.mobile, loading: false }
      }));
    }
  };

  const verifyMobileOTP = async () => {
    try {
      if (!otpData.mobile.otp.trim()) {
        setError('Please enter the OTP');
        return;
      }

      const response = await apiCall('/vendor-profile/mobile/verify-otp', {
        method: 'PUT',
        body: JSON.stringify({
          mobile: formData.mobile,
          otp: otpData.mobile.otp
        })
      });

      setVendor(response.data);
      setEditingField(null);
      setOtpData(prev => ({
        ...prev,
        mobile: { otp: '', sent: false, loading: false }
      }));
      setSuccess(response.message);
      setTimeout(() => setSuccess(''), 3000);

      dashboard.profileFieldUpdated('mobile_verified');
    } catch (error) {
      setError(error.message);
    }
  };

  const sendEmailOTP = async () => {
    try {
      if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(formData.email)) {
        setError('Please provide a valid email address');
        return;
      }

      setOtpData(prev => ({
        ...prev,
        email: { ...prev.email, loading: true }
      }));

      const response = await apiCall('/vendor-profile/email/send-otp', {
        method: 'POST',
        body: JSON.stringify({ email: formData.email })
      });

      setOtpData(prev => ({
        ...prev,
        email: { ...prev.email, sent: true, loading: false }
      }));

      setSuccess(response.message);
      setTimeout(() => setSuccess(''), 3000);

      ui.buttonClicked('email_otp_sent', 'vendor_profile');
    } catch (error) {
      setError(error.message);
      setOtpData(prev => ({
        ...prev,
        email: { ...prev.email, loading: false }
      }));
    }
  };

  const verifyEmailOTP = async () => {
    try {
      if (!otpData.email.otp.trim()) {
        setError('Please enter the OTP');
        return;
      }

      const response = await apiCall('/vendor-profile/email/verify-otp', {
        method: 'PUT',
        body: JSON.stringify({
          email: formData.email,
          otp: otpData.email.otp
        })
      });

      setVendor(response.data);
      setEditingField(null);
      setOtpData(prev => ({
        ...prev,
        email: { otp: '', sent: false, loading: false }
      }));
      setSuccess(response.message);
      setTimeout(() => setSuccess(''), 3000);

      dashboard.profileFieldUpdated('email_verified');
    } catch (error) {
      setError(error.message);
    }
  };

  const handlePasswordUpdate = async () => {
    const { currentPassword, newPassword, confirmPassword } = formData;

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError('All password fields are required');
      return;
    }

    if (newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    try {
      const response = await apiCall('/vendor-profile/password', {
        method: 'PUT',
        body: JSON.stringify({ currentPassword, newPassword })
      });

      setEditingField(null);
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setSuccess(response.message);
      setTimeout(() => setSuccess(''), 3000);

      dashboard.profileFieldUpdated('password');
    } catch (error) {
      setError(error.message);
    }
  };

  const handleStateChange = (state) => {
    handleInputChange('state', state);
    handleInputChange('city', '');
    if (state) {
      fetchCities(state);
      ui.buttonClicked('state_selected', 'vendor_profile');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Vendor Not Found</h2>
          <p className="text-gray-600">Please try logging in again.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 text-gray-700 py-4 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Profile Settings</h1>
          <p className="text-gray-600">Update your vendor profile information</p>
        </div>

        {/* Success/Error Messages */}
        {success && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
            <p className="text-green-800">{success}</p>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* Profile Form */}
        <div className="space-y-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Owner Name */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Owner Name</h3>
              </div>
              {editingField !== 'ownerName' && (
                <button
                  onClick={() => handleEdit('ownerName')}
                  className=" text-blue-600 cursor-pointer hover:text-blue-800 flex items-center"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
            </div>

            {editingField === 'ownerName' ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => handleInputChange('ownerName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter owner name"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleOwnerNameUpdate}
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="cursor-pointer bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-900 font-medium">{vendor.ownerName}</p>
            )}
          </div>

          {/* Business Name */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Building className="h-5 w-5 text-gray-400 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Business Name</h3>
              </div>
              {editingField !== 'businessName' && (
                <button
                  onClick={() => handleEdit('businessName')}
                  className=" text-blue-600 cursor-pointer hover:text-blue-800 flex items-center"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
            </div>

            {editingField === 'businessName' ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => handleInputChange('businessName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter business name"
                />
                <div className="flex space-x-2">
                  <button
                    onClick={handleBusinessNameUpdate}
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="cursor-pointer bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-900 font-medium">{vendor.businessName}</p>
            )}
          </div>

          {/* Mobile Number */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Mobile Number</h3>
                {vendor.mobileVerified && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                )}
              </div>
              {editingField !== 'mobile' && (
                <button
                  onClick={() => handleEdit('mobile')}
                  className=" text-blue-600 cursor-pointer hover:text-blue-800 flex items-center"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
            </div>

            {editingField === 'mobile' ? (
              <div className="space-y-4">
                <input
                  type="text"
                  value={formData.mobile}
                  onChange={(e) => handleInputChange('mobile', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter mobile number"
                  maxLength="10"
                />

                {!otpData.mobile.sent ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={sendMobileOTP}
                      disabled={otpData.mobile.loading}
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
                    >
                      {otpData.mobile.loading ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Phone className="h-4 w-4 mr-1" />
                      )}
                      Send OTP
                    </button>
                    <button
                      onClick={handleCancel}
                      className="cursor-pointer bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={otpData.mobile.otp}
                      onChange={(e) => setOtpData(prev => ({
                        ...prev,
                        mobile: { ...prev.mobile, otp: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter OTP"
                      maxLength="6"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={verifyMobileOTP}
                        className=" bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Verify OTP
                      </button>
                      <button
                        onClick={() => {
                          sendMobileOTP();
                          ui.buttonClicked('mobile_otp_resent', 'vendor_profile'); // Add this line
                        }}
                        className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Resend OTP
                      </button>
                      <button
                        onClick={handleCancel}
                        className="cursor-pointer bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-900 font-medium">{vendor.mobile}</p>
            )}
          </div>

          {/* Email Address */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Email Address</h3>
                {vendor.emailVerified && (
                  <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Verified
                  </span>
                )}
              </div>
              {editingField !== 'email' && (
                <button
                  onClick={() => handleEdit('email')}
                  className=" text-blue-600 cursor-pointer hover:text-blue-800 flex items-center"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
            </div>

            {editingField === 'email' ? (
              <div className="space-y-4">
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter email address"
                />

                {!otpData.email.sent ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={sendEmailOTP}
                      disabled={otpData.email.loading}
                      className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center disabled:opacity-50"
                    >
                      {otpData.email.loading ? (
                        <RefreshCw className="h-4 w-4 mr-1 animate-spin" />
                      ) : (
                        <Mail className="h-4 w-4 mr-1" />
                      )}
                      Send OTP
                    </button>
                    <button
                      onClick={handleCancel}
                      className="cursor-pointer bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center"
                    >
                      <X className="h-4 w-4 mr-1" />
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={otpData.email.otp}
                      onChange={(e) => setOtpData(prev => ({
                        ...prev,
                        email: { ...prev.email, otp: e.target.value }
                      }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="Enter OTP"
                      maxLength="6"
                    />
                    <div className="flex space-x-2">
                      <button
                        onClick={verifyEmailOTP}
                        className=" bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center"
                      >
                        <Save className="h-4 w-4 mr-1" />
                        Verify OTP
                      </button>
                      <button
                        onClick={() => {
                          sendEmailOTP();
                          ui.buttonClicked('email_otp_resent', 'vendor_profile'); // Add this line
                        }}
                        className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                      >
                        <RefreshCw className="h-4 w-4 mr-1" />
                        Resend OTP
                      </button>
                      <button
                        onClick={handleCancel}
                        className="cursor-pointer bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center"
                      >
                        <X className="h-4 w-4 mr-1" />
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <p className="text-gray-900 font-medium">{vendor.email}</p>
            )}
          </div>

          {/* Location */}
          {/* Location */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Location</h3>
              </div>
              {editingField !== 'location' && (
                <button
                  onClick={() => handleEdit('location')}
                  className=" text-blue-600 cursor-pointer hover:text-blue-800 flex items-center"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
            </div>

            {editingField === 'location' ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => handleInputChange('pinCode', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Pin Code"
                    maxLength="6"
                  />
                  <input
                    type="text"
                    value={formData.locality}
                    onChange={(e) => handleInputChange('locality', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Locality"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <select
                    value={formData.state}
                    onChange={(e) => {
                      handleInputChange('city', e.target.value);
                      if (e.target.value) {
                        ui.buttonClicked('city_selected', 'vendor_profile'); // Add this line
                      }
                    }}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="">Select State</option>
                    {states.map((state, index) => (
                      <option key={typeof state === 'string' ? state : `state-${index}`} value={typeof state === 'string' ? state : state.name || state.state}>
                        {typeof state === 'string' ? state : state.name || state.state}
                      </option>
                    ))}
                  </select>

                  <select
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    disabled={!formData.state}
                  >
                    <option value="">Select City</option>
                    {cities.map((city, index) => (
                      <option key={typeof city === 'string' ? city : `city-${index}`} value={typeof city === 'string' ? city : city.name || city.city}>
                        {typeof city === 'string' ? city : city.name || city.city}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handleLocationUpdate}
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Save
                  </button>
                  <button
                    onClick={handleCancel}
                    className="cursor-pointer bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-gray-900 font-medium">
                <p>{vendor.locality}</p>
                <p>{vendor.city}, {vendor.state}</p>
                <p>{vendor.pinCode}</p>
              </div>
            )}
          </div>

          {/* Password */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <Lock className="h-5 w-5 text-gray-400 mr-3" />
                <h3 className="text-lg font-medium text-gray-900">Password</h3>
              </div>
              {editingField !== 'password' && (
                <button
                  onClick={() => handleEdit('password')}
                  className=" text-blue-600 cursor-pointer hover:text-blue-800 flex items-center"
                >
                  <Edit2 className="h-4 w-4 mr-1" />
                  Change
                </button>
              )}
            </div>

            {editingField === 'password' ? (
              <div className="space-y-4">
                <div className="relative">
                  <input
                    type={showPassword.current ? 'text' : 'password'}
                    value={formData.currentPassword}
                    onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Current Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, current: !prev.current }))}
                    className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword.current ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword.new ? 'text' : 'password'}
                    value={formData.newPassword}
                    onChange={(e) => handleInputChange('newPassword', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="New Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, new: !prev.new }))}
                    className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword.new ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="relative">
                  <input
                    type={showPassword.confirm ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="Confirm New Password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(prev => ({ ...prev, confirm: !prev.confirm }))}
                    className="absolute cursor-pointer inset-y-0 right-0 pr-3 flex items-center"
                  >
                    {showPassword.confirm ? (
                      <EyeOff className="h-5 w-5 text-gray-400" />
                    ) : (
                      <Eye className="h-5 w-5 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={handlePasswordUpdate}
                    className="cursor-pointer bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center"
                  >
                    <Save className="h-4 w-4 mr-1" />
                    Update Password
                  </button>
                  <button
                    onClick={handleCancel}
                    className="cursor-pointer bg-gray-300 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-400 flex items-center"
                  >
                    <X className="h-4 w-4 mr-1" />
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-900 font-medium">••••••••</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VendorProfile;