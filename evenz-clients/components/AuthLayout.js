import React from 'react';
import { CheckCircle, XCircle } from 'lucide-react';

const AuthLayout = ({ 
  title, 
  subtitle, 
  children, 
  showProgressBar = false, 
  currentStep = 1,
  totalSteps = 2,
  message = '',
  messageType = ''
}) => {
  return (
    <div className="min-h-screen text-gray-700 bg-gray-50 flex sm:items-center justify-center py-4 sm:py-8 px-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900">{title}</h2>
          <p className="mt-2 text-sm text-gray-600">{subtitle}</p>
        </div>

        <div className="bg-white p-8 rounded-lg shadow-lg">
          {/* Progress indicator */}
          {showProgressBar && (
            <div className="flex items-center justify-center mb-8">
              <div className="flex items-center space-x-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  1
                </div>
                <div className={`w-16 h-1 ${currentStep >= 2 ? 'bg-blue-600' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  2
                </div>
              </div>
            </div>
          )}

          {/* Message display */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg flex items-center gap-2 ${
              messageType === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
              messageType === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
              'bg-blue-50 text-blue-800 border border-blue-200'
            }`}>
              {messageType === 'success' && <CheckCircle className="w-5 h-5" />}
              {messageType === 'error' && <XCircle className="w-5 h-5" />}
              <span className="text-sm">{message}</span>
            </div>
          )}

          {children}
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;