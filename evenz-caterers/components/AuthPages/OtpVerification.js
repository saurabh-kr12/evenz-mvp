import React from 'react';
import Button from '../UI/Button';

const OtpVerification = ({ value, onChange, onVerify, loading, verified, label }) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-700">
        {label || 'Enter OTP'}
      </label>
      
      <div className="flex space-x-2">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading || verified}
          className="block w-full px-3 py-2 text-gray-700 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Enter OTP"
          maxLength={6}
        />
        
        <Button
          type="button"
          onClick={onVerify}
          text={verified ? "Verified" : "Verify"}
          loading={loading}
          disabled={loading || verified || !value}
          variant={verified ? "success" : "primary"}
          size="sm"
        />
      </div>
      
      {verified && (
        <p className="text-green-600 text-sm">Verification successful!</p>  
      )}
    </div>
  );
};

export default OtpVerification;