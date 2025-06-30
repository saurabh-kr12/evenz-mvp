// client/src/components/OTPInput.js
import React, { useState } from 'react';
import Input from './Input';
import Button from './Button';
import api from '../services/api';
import toast from 'react-hot-toast';

const OTPInput = ({ identifier, purpose, onVerified, className = '' }) => {
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [error, setError] = useState('');

  const handleRequestOTP = async () => {
    try {
      setIsLoading(true);
      setError('');
      
      await api.post('/api/auth/request-otp', { identifier, purpose });
      
      setOtpSent(true);
      toast.success(`OTP sent to ${identifier}`);
    } catch (error) {
      console.error('Error requesting OTP:', error);
      setError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
      toast.error(error.response?.data?.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    try {
      setVerifying(true);
      setError('');
      
      const response = await api.post('/api/auth/verify-otp', { identifier, otp, purpose });
      
      toast.success('OTP verified successfully');
      onVerified(otp); // Passing OTP back to parent component
    } catch (error) {
      console.error('Error verifying OTP:', error);
      setError(error.response?.data?.message || 'Invalid OTP. Please try again.');
      toast.error(error.response?.data?.message || 'Invalid OTP');
    } finally {
      setVerifying(false);
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {!otpSent ? (
        <Button 
          onClick={handleRequestOTP} 
          isLoading={isLoading}
          className="w-full"
        >
          Request OTP
        </Button>
      ) : (
        <div className="space-y-4">
          <Input
            label="Enter OTP"
            name="otp"
            placeholder="Enter the 6-digit OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            error={error}
            required
          />
          <div className="flex space-x-2">
            <Button
              onClick={handleVerifyOTP}
              isLoading={verifying}
              className="flex-1"
            >
              Verify OTP
            </Button>
            <Button
              onClick={() => {
                setOtpSent(false);
                setOtp('');
                setError('');
              }}
              className="bg-gray-200 text-gray-800 hover:bg-gray-300"
            >
              Resend
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default OTPInput;