import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FormInput from '../UI/FormInput';
import Button from '../UI/Button';
import Alert from '../UI/Alert';
import OtpVerification from '../AuthPages/OtpVerification';

const Profile = () => {
  const [vendor, setVendor] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editMode, setEditMode] = useState({
    email: false,
    mobile: false,
    businessDetails: false,
    address: false,
    password: false,
  });
  
  // OTP states
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [showMobileOtpInput, setShowMobileOtpInput] = useState(false);
  
  // Form data for updates
  const [updateData, setUpdateData] = useState({
    email: '',
    mobile: '',
    businessName: '',
    ownerName: '',
    pinCode: '',
    locality: '',
    city: '',
    fullAddress: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  // Fetch vendor profile data
  useEffect(() => {
    const fetchVendorProfile = async () => {
      try {
        setLoading(true);
        
        const token = localStorage.getItem('token');
        if (!token) {
          // Redirect to login if no token
          window.location.href = '/login';
          return;
        }
        
        const response = await axios.get('http://localhost:5000/api/vendor/vendor-profile/profile', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        setVendor(response.data);
        
        // Initialize update data with current values
        setUpdateData({
          ...updateData,
          email: response.data.email,
          mobile: response.data.mobile,
          businessName: response.data.businessName,
          ownerName: response.data.ownerName,
          pinCode: response.data.pinCode,
          locality: response.data.locality,
          city: response.data.city,
          fullAddress: response.data.fullAddress || '',
        });
        
        setLoading(false);
      } catch (error) {
        setError('Failed to load profile data. Please try again.');
        setLoading(false);
        
        // Handle unauthorized access
        if (error.response && error.response.status === 401) {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }
      }
    };
    
    fetchVendorProfile();
  }, []);

  // Handle input change for update forms
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUpdateData({ ...updateData, [name]: value });
  };

  // Toggle edit mode for different sections
  const toggleEditMode = (section) => {
    setEditMode({ ...editMode, [section]: !editMode[section] });
    setError('');
    setSuccess('');
  };

  // Send OTP to email
  const sendEmailOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/vendor/auth/send-email-otp', { 
        email: updateData.email 
      });
      setShowEmailOtpInput(true);
      setSuccess('OTP sent to your email successfully!');
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
      setLoading(false);
    }
  };

  // Send OTP to mobile
  const sendMobileOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/vendor/auth/send-mobile-otp', { 
        mobile: updateData.mobile 
      });
      setShowMobileOtpInput(true);
      setSuccess('OTP sent to your mobile successfully!');
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
      setLoading(false);
    }
  };

  // Verify and update email
  const verifyAndUpdateEmail = async () => {
    try {
      setLoading(true);
      
      // First verify OTP
      const verifyResponse = await axios.post('http://localhost:5000/api/vendor/auth/verify-email-otp', {
        email: updateData.email,
        otp: emailOtp
      });
      
      // Then update email
      const token = localStorage.getItem('token');
      const updateResponse = await axios.patch(
        'http://localhost:5000/api/vendor/vendor-profile/update-email',
        { email: updateData.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local vendor state
      setVendor({ ...vendor, email: updateData.email });
      
      setSuccess('Email updated successfully!');
      setShowEmailOtpInput(false);
      setEditMode({ ...editMode, email: false });
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update email. Please try again.');
      setLoading(false);
    }
  };

  // Verify and update mobile
  const verifyAndUpdateMobile = async () => {
    try {
      setLoading(true);
      
      // First verify OTP
      const verifyResponse = await axios.post('http://localhost:5000/api/vendor/auth/verify-mobile-otp', {
        mobile: updateData.mobile,
        otp: mobileOtp
      });
      
      // Then update mobile
      const token = localStorage.getItem('token');
      const updateResponse = await axios.patch(
        'http://localhost:5000/api/vendor/vendor-profile/update-mobile',
        { mobile: updateData.mobile },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local vendor state
      setVendor({ ...vendor, mobile: updateData.mobile });
      
      setSuccess('Mobile number updated successfully!');
      setShowMobileOtpInput(false);
      setEditMode({ ...editMode, mobile: false });
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update mobile number. Please try again.');
      setLoading(false);
    }
  };

  // Update business details
  const updateBusinessDetails = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        'http://localhost:5000/api/vendor/vendor-profile/update-business',
        { 
          businessName: updateData.businessName,
          ownerName: updateData.ownerName 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local vendor state
      setVendor({ 
        ...vendor, 
        businessName: updateData.businessName,
        ownerName: updateData.ownerName
      });
      
      setSuccess('Business details updated successfully!');
      setEditMode({ ...editMode, businessDetails: false });
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update business details. Please try again.');
      setLoading(false);
    }
  };

  // Update address
  const updateAddress = async () => {
    try {
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        'http://localhost:5000/api/vendor/vendor-profile/update-address',
        { 
          pinCode: updateData.pinCode,
          locality: updateData.locality,
          city: updateData.city,
          fullAddress: updateData.fullAddress
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Update local vendor state
      setVendor({ 
        ...vendor, 
        pinCode: updateData.pinCode,
        locality: updateData.locality,
        city: updateData.city,
        fullAddress: updateData.fullAddress
      });
      
      setSuccess('Address updated successfully!');
      setEditMode({ ...editMode, address: false });
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update address. Please try again.');
      setLoading(false);
    }
  };

  // Update password
  const updatePassword = async () => {
    try {
      // Validate new password and confirmation
      if (updateData.newPassword !== updateData.confirmPassword) {
        setError('New passwords do not match.');
        return;
      }
      
      setLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await axios.patch(
        'http://localhost:5000/api/vendor/vendor-profile/update-password',
        { 
          currentPassword: updateData.currentPassword,
          newPassword: updateData.newPassword 
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      setSuccess('Password updated successfully!');
      setEditMode({ ...editMode, password: false });
      
      // Clear password fields
      setUpdateData({
        ...updateData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to update password. Please try again.');
      setLoading(false);
    }
  };

  if (loading && !vendor) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen">
      <div className="sm:max-w-7xl  px-3 mx-auto py-6 sm:px-6 lg:px-8">
        {/* Profile header */}
        <div className="bg-white shadow overflow-hidden rounded-lg mb-6">
          <div className="px-4 py-5 sm:px-6 bg-indigo-600 text-white">
            <h2 className="text-2xl font-bold">
              Welcome, {vendor?.ownerName}!
            </h2>
            <p className="mt-1 max-w-2xl text-sm">
              Manage your catering business profile
            </p>
          </div>
        </div>
        
        {/* Flash messages */}
        {error && <Alert type="error" message={error} />}
        {success && <Alert type="success" message={success} />}
        
        {/* Profile sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Email section */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Email Address</h3>
              <Button
                text={editMode.email ? "Cancel" : "Update"}
                variant={editMode.email ? "outline" : "primary"}
                size="sm"
                onClick={() => toggleEditMode('email')}
              />
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {editMode.email ? (
                <div className="space-y-4">
                  <FormInput
                    label="New Email Address"
                    type="email"
                    name="email"
                    value={updateData.email}
                    onChange={handleInputChange}
                    placeholder="Enter new email address"
                  />
                  
                  {!showEmailOtpInput ? (
                    <Button
                      text="Send OTP"
                      onClick={sendEmailOtp}
                      loading={loading}
                    />
                  ) : (
                    <OtpVerification
                      value={emailOtp}
                      onChange={(otp) => setEmailOtp(otp)}
                      onVerify={verifyAndUpdateEmail}
                      loading={loading}
                      verified={false}
                      label="Email OTP"
                    />
                  )}
                </div>
              ) : (
                <p className="text-gray-700">{vendor?.email}</p>
              )}
            </div>
          </div>
          
          {/* Mobile section */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Mobile Number</h3>
              <Button
                text={editMode.mobile ? "Cancel" : "Update"}
                variant={editMode.mobile ? "outline" : "primary"}
                size="sm"
                onClick={() => toggleEditMode('mobile')}
              />
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {editMode.mobile ? (
                <div className="space-y-4">
                  <FormInput
                    label="New Mobile Number"
                    type="tel"
                    name="mobile"
                    value={updateData.mobile}
                    onChange={handleInputChange}
                    placeholder="Enter new mobile number"
                  />
                  
                  {!showMobileOtpInput ? (
                    <Button
                      text="Send OTP"
                      onClick={sendMobileOtp}
                      loading={loading}
                    />
                  ) : (
                    <OtpVerification
                      value={mobileOtp}
                      onChange={(otp) => setMobileOtp(otp)}
                      onVerify={verifyAndUpdateMobile}
                      loading={loading}
                      verified={false}
                      label="Mobile OTP"
                    />
                  )}
                </div>
              ) : (
                <p className="text-gray-700">{vendor?.mobile}</p>
              )}
            </div>
          </div>
          
          {/* Business details section */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Business Details</h3>
              <Button
                text={editMode.businessDetails ? "Cancel" : "Update"}
                variant={editMode.businessDetails ? "outline" : "primary"}
                size="sm"
                onClick={() => toggleEditMode('businessDetails')}
              />
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {editMode.businessDetails ? (
                <div className="space-y-4">
                  <FormInput
                    label="Business Name"
                    type="text"
                    name="businessName"
                    value={updateData.businessName}
                    onChange={handleInputChange}
                    placeholder="Enter business name"
                  />
                  
                  <FormInput
                    label="Owner's Name"
                    type="text"
                    name="ownerName"
                    value={updateData.ownerName}
                    onChange={handleInputChange}
                    placeholder="Enter owner's name"
                  />
                  
                  <Button
                    text="Save Changes"
                    onClick={updateBusinessDetails}
                    loading={loading}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-500">Business Name:</span>
                    <p className="text-gray-700">{vendor?.businessName}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-500">Owner's Name:</span>
                    <p className="text-gray-700">{vendor?.ownerName}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
          
          {/* Address section */}
          <div className="bg-white shadow overflow-hidden rounded-lg">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Address</h3>
              <Button
                text={editMode.address ? "Cancel" : "Update"}
                variant={editMode.address ? "outline" : "primary"}
                size="sm"
                onClick={() => toggleEditMode('address')}
              />
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {editMode.address ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <FormInput
                      label="PIN Code"
                      type="text"
                      name="pinCode"
                      value={updateData.pinCode}
                      onChange={handleInputChange}
                      placeholder="Enter PIN code"
                    />
                    
                    <FormInput
                      label="Locality"
                      type="text"
                      name="locality"
                      value={updateData.locality}
                      onChange={handleInputChange}
                      placeholder="Enter locality name"
                    />
                  </div>
                  
                  <FormInput
                    label="City"
                    type="text"
                    name="city"
                    value={updateData.city}
                    onChange={handleInputChange}
                    placeholder="Enter city name"
                  />
                  
                  <FormInput
                    label="Full Address (Optional)"
                    type="textarea"
                    name="fullAddress"
                    value={updateData.fullAddress}
                    onChange={handleInputChange}
                    placeholder="Enter complete address"
                    rows={3}
                  />
                  
                  <Button
                    text="Save Changes"
                    onClick={updateAddress}
                    loading={loading}
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-gray-700">
                    {vendor?.fullAddress && (
                      <>
                        {vendor.fullAddress}<br />
                      </>
                    )}
                    {vendor?.locality}, {vendor?.city}<br />
                    PIN: {vendor?.pinCode}
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Password section */}
          <div className="bg-white shadow overflow-hidden rounded-lg md:col-span-2">
            <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
              <h3 className="text-lg font-medium leading-6 text-gray-900">Password</h3>
              <Button
                text={editMode.password ? "Cancel" : "Update Password"}
                variant={editMode.password ? "outline" : "primary"}
                size="sm"
                onClick={() => toggleEditMode('password')}
              />
            </div>
            <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
              {editMode.password ? (
                <div className="max-w-lg space-y-4">
                  <FormInput
                    label="Current Password"
                    type="password"
                    name="currentPassword"
                    value={updateData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="Enter current password"
                  />
                  
                  <FormInput
                    label="New Password"
                    type="password"
                    name="newPassword"
                    value={updateData.newPassword}
                    onChange={handleInputChange}
                    placeholder="Enter new password"
                  />
                  
                  <FormInput
                    label="Confirm New Password"
                    type="password"
                    name="confirmPassword"
                    value={updateData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="Confirm new password"
                  />
                  
                  <Button
                    text="Update Password"
                    onClick={updatePassword}
                    loading={loading}
                  />
                </div>
              ) : (
                <p className="text-gray-700">••••••••</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;