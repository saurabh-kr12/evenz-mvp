import React, { useState } from 'react';
import { RxCross2 } from "react-icons/rx";

const ForgotPassword = ({ onClose }) => {
  const [step, setStep] = useState(1); // 1: Enter email/phone, 2: Enter OTP
  const [contactInfo, setContactInfo] = useState('');
  const [otp, setOtp] = useState('');

  const handleSendOTP = async (e) => {
    e.preventDefault();
    try {
      // Add API call to send OTP
      console.log('Sending OTP to:', contactInfo);
      setStep(2);
    } catch (error) {
      console.error('Error sending OTP:', error);
    }
  };

  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    try {
      // Add API call to verify OTP
      console.log('Verifying OTP:', otp);
      // On successful verification, close modal and proceed with login
      onClose();
    } catch (error) {
      console.error('Error verifying OTP:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-lg p-4 md:p-8 max-w-md w-full">
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h3 className="text-lg md:text-xl text-gray-800 font-bold">
            {step === 1 ? 'Forgot Password' : 'Enter OTP'}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-600 cursor-pointer hover:text-gray-800"
          >
            <RxCross2 className="md:size-10 hover:scale-110 transition-transform" />
          </button>
        </div>

        {step === 1 ? (
          <form onSubmit={handleSendOTP} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-2">
                Enter Email/Phone Number
              </label>
              <input
                type="text"
                value={contactInfo}
                onChange={(e) => setContactInfo(e.target.value)}
                className="w-full px-3 md:px-4 py-2 text-sm md:text-base text-gray-700 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter your email or phone number"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Send OTP
            </button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOTP} className="space-y-4">
            <div>
              <label className="block text-gray-700 text-sm md:text-base mb-2">Enter OTP</label>
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="w-full text-gray-700 px-3 md:px-4 py-2 border rounded-lg focus:outline-none focus:border-blue-500"
                placeholder="Enter the OTP sent to you"
                required
              />
            </div>
            <button
              type="submit"
              className="w-full cursor-pointer bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Verify OTP
            </button>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full cursor-pointer text-blue-600 hover:text-blue-800 text-sm"
            >
              Resend OTP
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword; 