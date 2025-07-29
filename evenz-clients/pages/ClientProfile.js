// client/src/pages/YourProfile.js
import React, { useState, useContext, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';
import Input from '../components/Input';
import Button from '../components/Button';
import Timer from '../components/Timer';
import api from '../services/api';
import toast from 'react-hot-toast';

const YourProfile = () => {
  const { currentUser, updateProfile } = useContext(AuthContext);

  // UI state
  const [emailOTPSent, setEmailOTPSent] = useState(false);
  const [activeSection, setActiveSection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [showTimer, setShowTimer] = useState(false);
  const [timerKey, setTimerKey] = useState(0);

  // Form state
  const [formData, setFormData] = useState({
    email: '',
    mobile: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: '',
    verificationToken: ''
  });
  const [errors, setErrors] = useState({});

  // Check URL parameters for email verification
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const verified = urlParams.get('verified');

    if (verified === 'true') {
      toast.success('Email verified successfully!');
      // Clear URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
    } else if (verified === 'false') {
      toast.error('Email verification failed. Please try again.');
      window.history.replaceState({}, document.title, window.location.pathname);
    }
  }, []);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // For OTP field, only allow digits and limit to 6 characters
    if (name === 'otp') {
      const numericValue = value.replace(/\D/g, '').slice(0, 6);
      setFormData(prev => ({
        ...prev,
        [name]: numericValue
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // Update your existing handler functions
  const handleSendEmailOTP = async () => {
    try {
      setIsLoading(true);
      setErrors({});

      if (!formData.email) {
        setErrors({ email: 'Email is required' });
        return;
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setErrors({ email: 'Invalid email format' });
        return;
      }

      const response = await api.post('/api/user/auth/send-email-otp', {
        email: formData.email
      });

      setEmailOTPSent(true);
      setShowTimer(true);
      setTimerKey(prev => prev + 1);
      toast.success(response.data.message || 'OTP sent successfully!');

    } catch (error) {
      console.error('Send email OTP error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to send OTP';
      toast.error(errorMessage);
      setErrors({ email: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateEmail = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);
      setErrors({});

      if (!formData.email || !formData.otp) {
        setErrors({
          email: !formData.email ? 'Email is required' : '',
          otp: !formData.otp ? 'OTP is required' : ''
        });
        return;
      }

      // Validate OTP format (6 digits)
      if (!/^\d{6}$/.test(formData.otp)) {
        setErrors({ otp: 'OTP must be 6 digits' });
        return;
      }

      const response = await api.put('/api/user/auth/update-email', {
        email: formData.email,
        otp: formData.otp
      });

      // Reset form
      setFormData({
        ...formData,
        email: '',
        otp: ''
      });

      setEmailOTPSent(false);
      setShowTimer(false);
      setActiveSection(null);

      toast.success('Email updated successfully!');

    } catch (error) {
      console.error('Update email error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Failed to update email';
      toast.error(errorMessage);
      setErrors({ otp: errorMessage });
    } finally {
      setIsLoading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    setFormData({
      email: '',
      mobile: '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      otp: '',
      verificationToken: ''
    });
    setErrors({});
    setOtpSent(false);
    setEmailVerificationSent(false);
    setShowTimer(false);
  };

  // Handle timer completion
  const handleTimerComplete = () => {
    setShowTimer(false);
  };

  // Handle section change
  const handleSectionChange = (section) => {
    setActiveSection(section);
    resetForm();

    // Pre-populate current values
    if (section === 'update-email' || section === 'add-email') {
      setFormData(prev => ({ ...prev, email: currentUser?.email || '' }));
    } else if (section === 'update-mobile' || section === 'add-mobile') {
      setFormData(prev => ({ ...prev, mobile: currentUser?.mobile || '' }));
    }
  };

  // Update mobile
  const handleUpdateMobile = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Validate form
      const newErrors = {};
      if (!formData.mobile) {
        newErrors.mobile = 'Mobile number is required';
      }
      if (!formData.otp) {
        newErrors.otp = 'OTP is required';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Make API request to update mobile
      const response = await api.put('/api/user/auth/update-mobile', {
        mobile: formData.mobile,
        otp: formData.otp
      });


      // Reset form
      setFormData({
        ...formData,
        mobile: '',
        otp: ''
      });

      toast.success('Mobile number updated successfully');
      setActiveSection(null);
      resetForm();
    } catch (error) {
      console.error('Update mobile error:', error);
      toast.error(error.response?.data?.message || 'Failed to update mobile number');
    } finally {
      setIsLoading(false);
    }
  };

  // Send OTP for mobile update
  const handleSendOTP = async () => {
    try {
      setIsLoading(true);

      if (!formData.mobile) {
        setErrors({ mobile: 'Mobile number is required' });
        return;
      }

      await api.post('/api/user/auth/send-mobile-otp', {
        mobile: formData.mobile
        // Pass user ID for context
      });

      setOtpSent(true);
      setShowTimer(true);
      setTimerKey(prev => prev + 1);
      toast.success('OTP sent successfully');
    } catch (error) {
      console.error('Send OTP error:', error);
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  // Update password
  const handleUpdatePassword = async (e) => {
    e.preventDefault();

    try {
      setIsLoading(true);

      // Validate form
      const newErrors = {};

      if (!formData.currentPassword) {
        newErrors.currentPassword = 'Current password is required';
      }

      if (!formData.newPassword) {
        newErrors.newPassword = 'New password is required';
      } else if (formData.newPassword.length < 8) {
        newErrors.newPassword = 'Password must be at least 8 characters';
      }

      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }

      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }

      // Make API request to update password
      await api.put('/api/user/auth/update-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });

      toast.success('Password updated successfully');
      setActiveSection(null);
      resetForm();
    } catch (error) {
      console.error('Update password error:', error);

      if (error.response?.status === 400) {
        setErrors({ currentPassword: error.response?.data?.message || 'Current password is incorrect' });
      } else {
        toast.error(error.response?.data?.message || 'Failed to update password');
      }
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <div className="">
      <div className="">
        <div className="p-1 sm:p-2 md:p-4">
          {/* Header */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Your Profile</h2>
            <p className="text-gray-600">Manage your account information and settings</p>
          </div>

          {/* User info section */}
          <div className="space-y-6 mb-8">
            <div className="border-b border-gray-200 pb-4">
              <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
            </div>

            {/* Name */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-base font-medium text-gray-900">{currentUser?.name}</p>
              </div>
            </div>

            {/* Email */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base font-medium text-gray-900">
                  {currentUser?.email || 'Not added'}
                </p>
                {currentUser?.email && (
                  <p className="text-xs text-gray-500 mt-1">
                    {currentUser?.isEmailVerified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-amber-600">⚠ Not verified</span>
                    )}
                  </p>
                )}
              </div>
              <Button
                onClick={() => handleSectionChange(currentUser?.email ? 'update-email' : 'add-email')}
                className="text-sm py-2 px-4 w-full sm:w-auto"
              >
                {currentUser?.email ? 'Update' : 'Add'}
              </Button>
            </div>

            {/* Mobile */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Mobile Number</p>
                <p className="text-base font-medium text-gray-900">
                  {currentUser?.mobile || 'Not added'}
                </p>
                {currentUser?.mobile && (
                  <p className="text-xs text-gray-500 mt-1">
                    {currentUser?.isMobileVerified ? (
                      <span className="text-green-600">✓ Verified</span>
                    ) : (
                      <span className="text-amber-600">⚠ Not verified</span>
                    )}
                  </p>
                )}
              </div>
              <Button
                onClick={() => handleSectionChange(currentUser?.mobile ? 'update-mobile' : 'add-mobile')}
                className="text-sm py-2 px-4 w-full sm:w-auto"
              >
                {currentUser?.mobile ? 'Update' : 'Add'}
              </Button>
            </div>

            {/* Password */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-500">Password</p>
                <p className="text-base font-medium text-gray-900">••••••••</p>
              </div>
              <Button
                onClick={() => handleSectionChange('update-password')}
                className="text-sm py-2 px-4 w-full sm:w-auto"
              >
                Change
              </Button>
            </div>
          </div>

          {/* Update/Add email section */}
          {(activeSection === 'update-email' || activeSection === 'add-email') && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {activeSection === 'add-email' ? 'Add Email' : 'Update Email'}
              </h3>

              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <Input
                  label="Email Address"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  required
                  error={errors.email}
                />

                {!emailOTPSent ? (
                  <div className='flex flex-col sm:flex-row gap-3'>
                    <Button
                      type="button"
                      onClick={handleSendEmailOTP}
                      isLoading={isLoading}
                      disabled={!formData.email || isLoading}
                      className="w-full"
                    >
                      Send OTP to Email
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveSection(null)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                      <p className="text-sm text-blue-800">
                        OTP sent to your email! Please check your inbox and enter the 6-digit code below.
                      </p>
                    </div>

                    <Input
                      label="Enter OTP"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter 6-digit OTP"
                      maxLength="6"
                      required
                      error={errors.otp}
                    />

                    {showTimer && (
                      <Timer
                        key={timerKey}
                        initialTime={120}
                        onComplete={handleTimerComplete}
                      />
                    )}

                    {!showTimer && (
                      <Button
                        type="button"
                        onClick={handleSendEmailOTP}
                        isLoading={isLoading}
                        className="w-full bg-gray-600 hover:bg-gray-700"
                      >
                        Resend OTP
                      </Button>
                    )}
                  </div>
                )}

                {emailOTPSent && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      disabled={!formData.otp || isLoading}
                      className="flex-1"
                    >
                      Verify & Update Email
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveSection(null)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Update mobile section */}
          {(activeSection === 'update-mobile' || activeSection === 'add-mobile') && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {activeSection === 'add-mobile' ? 'Add Mobile Number' : 'Update Mobile Number'}
              </h3>

              <form onSubmit={handleUpdateMobile} className="space-y-4">
                <Input
                  label="Mobile Number"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleChange}
                  placeholder="Enter 10-digit mobile number"
                  required
                  error={errors.mobile}
                />

                {!otpSent ? (
                  <div className='flex flex-col sm:flex-row gap-3'>
                    <Button
                      type="button"
                      onClick={handleSendOTP}
                      isLoading={isLoading}
                      disabled={!formData.mobile || isLoading}
                      className="w-full"
                    >
                      Send OTP
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveSection(null)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                      <p className="text-sm text-green-800">
                        OTP sent to {formData.mobile}. Please check your WhatsApp.
                      </p>
                    </div>

                    <Input
                      label="Enter OTP"
                      name="otp"
                      value={formData.otp}
                      onChange={handleChange}
                      placeholder="Enter 6-digit OTP"
                      required
                      error={errors.otp}
                    />

                    {showTimer && (
                      <Timer
                        key={timerKey}
                        initialTime={120}
                        onComplete={handleTimerComplete}
                      />
                    )}

                    {!showTimer && (
                      <Button
                        type="button"
                        onClick={handleSendOTP}
                        isLoading={isLoading}
                        className="w-full bg-gray-600 hover:bg-gray-700"
                      >
                        Resend OTP
                      </Button>
                    )}
                  </div>
                )}

                {otpSent && (
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button
                      type="submit"
                      isLoading={isLoading}
                      disabled={!formData.otp || isLoading}
                      className="flex-1"
                    >
                      Update Mobile
                    </Button>
                    <Button
                      type="button"
                      onClick={() => setActiveSection(null)}
                      className="flex-1 bg-gray-600 hover:bg-gray-700"
                    >
                      Cancel
                    </Button>
                  </div>
                )}
              </form>
            </div>
          )}

          {/* Update password section */}
          {activeSection === 'update-password' && (
            <div className="border-t border-gray-200 pt-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>

              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="Enter current password"
                  required
                  error={errors.currentPassword}
                />

                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="Enter new password (min 8 characters)"
                  required
                  error={errors.newPassword}
                />

                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm new password"
                  required
                  error={errors.confirmPassword}
                />

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    className="flex-1"
                  >
                    Change Password
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveSection(null)}
                    className="flex-1 bg-gray-600 hover:bg-gray-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default YourProfile;