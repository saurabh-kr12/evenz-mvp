// client/src/pages/YourProfile.js
import React, { useState, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import OTPInput from '../components/OTPInput';
import api from '../services/api';
import toast from 'react-hot-toast';

const YourProfile = () => {
  const router = useRouter();
  const { currentUser, logout, updateProfile } = useContext(AuthContext);
  
  // UI state
  const [activeSection, setActiveSection] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Form state
  const [formData, setFormData] = useState({
    email: '',
    contact: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    otp: ''
  });
  const [errors, setErrors] = useState({});

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    
    // Clear error when user types
    if (errors[name]) {
      setErrors({ ...errors, [name]: '' });
    }
  };

  // OTP verification handler
  const handleOTPVerified = (otp) => {
    setFormData({ ...formData, otp });
  };

  // Update email
  const handleUpdateEmail = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Validate form
      if (!formData.email) {
        setErrors({ email: 'Email is required' });
        return;
      }
      
      // Make API request to update email
      const response = await api.put('/api/auth/update-email', {
        email: formData.email,
        otp: formData.otp
      });
      
      // Update local user data
      updateProfile({ email: formData.email });
      
      toast.success('Email updated successfully');
      setActiveSection(null);
    } catch (error) {
      console.error('Update email error:', error);
      toast.error(error.response?.data?.message || 'Failed to update email');
    } finally {
      setIsLoading(false);
    }
  };

  // Update contact
  const handleUpdateContact = async (e) => {
    e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Validate form
      if (!formData.contact) {
        setErrors({ contact: 'Phone number is required' });
        return;
      }
      
      // Make API request to update contact
      const response = await api.put('/api/auth/update-contact', {
        contact: formData.contact,
        otp: formData.otp
      });
      
      // Update local user data
      updateProfile({ contact: formData.contact });
      
      toast.success('Phone number updated successfully');
      setActiveSection(null);
    } catch (error) {
      console.error('Update contact error:', error);
      toast.error(error.response?.data?.message || 'Failed to update phone number');
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
      } else if (formData.newPassword.length < 6) {
        newErrors.newPassword = 'Password must be at least 6 characters';
      }
      
      if (formData.newPassword !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setIsLoading(false);
        return;
      }
      
      // Make API request to update password
      await api.put('/api/auth/update-password', {
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      
      toast.success('Password updated successfully');
      setActiveSection(null);
      
      // Reset form
      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      console.error('Update password error:', error);
      
      if (error.response?.status === 401) {
        setErrors({ currentPassword: 'Current password is incorrect' });
      } else {
        toast.error(error.response?.data?.message || 'Failed to update password');
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Handle logout
  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <div className="">
      <div className="w-full mx-auto">
        {/* <Card title="Your Profile" className="w-full"> */}
          {/* User info section */}
          <div className="space-y-4 mb-8">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <h3 className="text-lg font-medium text-gray-900">Account Information</h3>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Name</p>
                <p className="text-base font-medium text-gray-900">{currentUser?.name}</p>
              </div>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Email</p>
                <p className="text-base font-medium text-gray-900">
                  {currentUser?.email || 'Not added'}
                </p>
              </div>
              <Button
                onClick={() => {
                  setActiveSection(currentUser?.email ? 'update-email' : 'add-email');
                  setFormData({ ...formData, email: currentUser?.email || '' });
                }}
                className="text-sm py-1"
              >
                {currentUser?.email ? 'Update' : 'Add'}
              </Button>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Phone Number</p>
                <p className="text-base font-medium text-gray-900">
                  {currentUser?.contact || 'Not added'}
                </p>
              </div>
              <Button
                onClick={() => {
                  setActiveSection(currentUser?.contact ? 'update-contact' : 'add-contact');
                  setFormData({ ...formData, contact: currentUser?.contact || '' });
                }}
                className="text-sm py-1"
              >
                {currentUser?.contact ? 'Update' : 'Add'}
              </Button>
            </div>
            
            <div className="flex justify-between items-center py-2">
              <div>
                <p className="text-sm font-medium text-gray-500">Password</p>
                <p className="text-base font-medium text-gray-900">••••••••</p>
              </div>
              <Button
                onClick={() => setActiveSection('update-password')}
                className="text-sm py-1"
              >
                Update
              </Button>
            </div>
          </div>

          {/* Update email section */}
          {(activeSection === 'update-email' || activeSection === 'add-email') && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {activeSection === 'add-email' ? 'Add Email' : 'Update Email'}
              </h3>
              
              <form onSubmit={handleUpdateEmail} className="space-y-4">
                <Input
                  label="Email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="email@example.com"
                  required
                  error={errors.email}
                />
                
                {formData.email && (
                  <OTPInput
                    identifier={formData.email}
                    purpose="email-update"
                    onVerified={handleOTPVerified}
                  />
                )}
                
                <div className="flex space-x-3 pt-2">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={!formData.otp}
                    className="flex-1"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveSection(null)}
                    className="flex-1 bg-gray-700 text-gray-800 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Update contact section */}
                    {/* Update contact section - fixed closing tags */}
          {(activeSection === 'update-contact' || activeSection === 'add-contact') && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">
                {activeSection === 'add-contact' ? 'Add Phone Number' : 'Update Phone Number'}
              </h3>
              
              <form onSubmit={handleUpdateContact} className="space-y-4">
                <Input
                  label="Phone Number"
                  name="contact"
                  value={formData.contact}
                  onChange={handleChange}
                  placeholder="+1234567890"
                  required
                  error={errors.contact}
                />
                
                {formData.contact && (
                  <OTPInput
                    identifier={formData.contact}
                    purpose="contact-update"
                    onVerified={handleOTPVerified}
                  />
                )}
                
                <div className="flex space-x-3 pt-2">
                  <Button
                    type="submit"
                    isLoading={isLoading}
                    disabled={!formData.otp}
                    className="flex-1"
                  >
                    Save
                  </Button>
                  <Button
                    type="button"
                    onClick={() => setActiveSection(null)}
                    className="flex-1 bg-gray-700 text-gray-800 hover:bg-gray-800"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

          {/* Update password section */}
          {activeSection === 'update-password' && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <h3 className="text-lg font-medium text-gray-900 mb-4">Change Password</h3>
              
              <form onSubmit={handleUpdatePassword} className="space-y-4">
                <Input
                  label="Current Password"
                  name="currentPassword"
                  type="password"
                  value={formData.currentPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  error={errors.currentPassword}
                />
                
                <Input
                  label="New Password"
                  name="newPassword"
                  type="password"
                  value={formData.newPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  error={errors.newPassword}
                />
                
                <Input
                  label="Confirm New Password"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  required
                  error={errors.confirmPassword}
                />
                
                <div className="flex space-x-3 pt-2">
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
                    className="flex-1 bg-purple-500 text-gray-800 hover:bg-purple-700"
                  >
                    Cancel
                  </Button>
                </div>
              </form>
            </div>
          )}

      </div>
    </div>
  );
};

export default YourProfile;