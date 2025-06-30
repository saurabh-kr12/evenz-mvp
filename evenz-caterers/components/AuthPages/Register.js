import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Building, MapPin, Lock, Eye, EyeOff, CheckCircle, AlertCircle, Loader2, ArrowLeft, ArrowRight } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import axios from 'axios';
import { Link } from 'react-router-dom';

// OTP Verification Component
const OtpVerification = ({ value, onChange, onVerify, loading, verified, label }) => {
  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-700">
        {label || 'Enter OTP'}
      </label>

      <div className="flex space-x-3">
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={loading || verified}
          className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 disabled:bg-gray-50"
          placeholder="Enter 6-digit OTP"
          maxLength={6}
        />

        <button
          type="button"
          onClick={onVerify}
          disabled={loading || verified || !value}
          className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 flex items-center space-x-2 ${verified
              ? 'bg-green-100 text-green-700 border border-green-200'
              : 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed'
            }`}
        >
          {loading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : verified ? (
            <>
              <CheckCircle className="w-4 h-4" />
              <span>Verified</span>
            </>
          ) : (
            <span>Verify</span>
          )}
        </button>
      </div>

      {verified && (
        <div className="flex items-center space-x-2 text-green-600 text-sm">
          <CheckCircle className="w-4 h-4" />
          <span>Verification successful!</span>
        </div>
      )}
    </div>
  );
};

const Register = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState(1);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const { register } = useContext(AuthContext);


  // Form data states
  const [formData, setFormData] = useState({
    ownerName: '',
    email: '',
    mobile: '',
    businessName: '',
    pinCode: '',
    locality: '',
    city: '',
    fullAddress: '',
    password: '',
    confirmPassword: '',
  });

  // OTP states
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [showEmailOtpInput, setShowEmailOtpInput] = useState(false);
  const [showMobileOtpInput, setShowMobileOtpInput] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [mobileVerified, setMobileVerified] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Send OTP to email
  const sendEmailOtp = async () => {
    if (!formData.email) {
      setError('Please enter your email address');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/vendor/auth/send-email-otp', { email: formData.email });
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
    if (!formData.mobile) {
      setError('Please enter your mobile number');
      return;
    }

    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/vendor/auth/send-mobile-otp', { mobile: formData.mobile });
      setShowMobileOtpInput(true);
      setSuccess('OTP sent to your mobile successfully!');
      setLoading(false);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send OTP. Please try again.');
      setLoading(false);
    }
  };

  // Verify email OTP
  const verifyEmailOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/vendor/auth/verify-email-otp', {
        email: formData.email,
        otp: emailOtp
      });
      setEmailVerified(true);
      setSuccess('Email verified successfully!');
      setLoading(false);

      // If mobile is also verified, proceed to next step
      if (mobileVerified) {
        setStep(2);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  // Verify mobile OTP
  const verifyMobileOtp = async () => {
    try {
      setLoading(true);
      const response = await axios.post('http://localhost:5000/api/vendor/auth/verify-mobile-otp', {
        mobile: formData.mobile,
        otp: mobileOtp
      });
      setMobileVerified(true);
      setSuccess('Mobile verified successfully!');
      setLoading(false);

      // If email is also verified, proceed to next step
      if (emailVerified) {
        setStep(2);
      }
    } catch (error) {
      setError(error.response?.data?.message || 'Invalid OTP. Please try again.');
      setLoading(false);
    }
  };

  // Handle registration form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Validate passwords match
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      setLoading(true);
      // const response = await axios.post('http://localhost:5000/vendor/auth/register', formData);
      // setSuccess('Registration successful!');
      // setLoading(false);

      // // Store token in localStorage
      // localStorage.setItem('token', response.data.token);.
      await register(formData);
      setSuccess('Registration successful!');
      setLoading(false);

      // Navigate to profile page
      navigate('/dashboard');
    } catch (error) {
      setError(error.response?.data?.message || 'Registration failed. Please try again.');
      setLoading(false);
    }
  };
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 flex xl:flex-row">
      {/* Left side - Image (only on extra large screens) */}
      <div className="hidden xl:flex xl:w-1/2 relative overflow-hidden">
        <img
          src="/catering_services_img.jpeg"
          alt="Catering Business"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-purple-900/60"></div>
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center text-white max-w-md">
            <div className="mb-8">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
                  <span className="text-indigo-600 font-bold text-xl">S</span>
                </div>
              </div>
              <h2 className="text-3xl font-bold mb-4">Join Evenz.in Today</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                Start growing your catering business with our powerful platform
              </p>
            </div>
            <div className="space-y-4 text-sm text-white/80">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <span>Easy business management</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <span>Secure & reliable platform</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <span>24/7 customer support</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Registration Form */}
      <div className="flex-1 flex flex-col  p-4 sm:p-6 xl:p-8">
        <div className="w-full max-w-xl mx-auto">
          {/* Mobile/Tablet logo/branding */}
          <div className="xl:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Join Evenz.in</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            {/* Progress indicator */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  1
                </div>
                <div className={`flex-1 h-1 mx-4 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                  2
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {step === 1 ? 'Personal Details' : 'Business Details'}
                </h2>
                <p className="text-gray-600">
                  {step === 1 ? 'Verify your email and mobile number' : 'Tell us about your business'}
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            {success && (
              <div className="mb-6 p-4 bg-green-50 border-l-4 border-green-400 rounded-lg">
                <div className="flex items-center">
                  <CheckCircle className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                  <p className="text-green-700 text-sm">{success}</p>
                </div>
              </div>
            )}

            <div className="space-y-6">
              {step === 1 && (
                <>
                  {/* Owner Name */}
                  <div>
                    <label htmlFor="ownerName" className="block text-sm font-medium text-gray-700 mb-2">
                      Owner's Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <User className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="ownerName"
                        name="ownerName"
                        type="text"
                        required
                        value={formData.ownerName}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Email with OTP */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Mail className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="email"
                        name="email"
                        type="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        disabled={emailVerified}
                        placeholder="Enter your email address"
                        className="block w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 disabled:bg-gray-50"
                      />
                      {!emailVerified && (
                        <button
                          type="button"
                          onClick={sendEmailOtp}
                          disabled={loading || !formData.email}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Send OTP
                        </button>
                      )}
                      {emailVerified && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {showEmailOtpInput && !emailVerified && (
                    <OtpVerification
                      value={emailOtp}
                      onChange={setEmailOtp}
                      onVerify={verifyEmailOtp}
                      loading={loading}
                      verified={emailVerified}
                      label="Email OTP"
                    />
                  )}

                  {/* Mobile with OTP */}
                  <div>
                    <label htmlFor="mobile" className="block text-sm font-medium text-gray-700 mb-2">
                      Mobile Number
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="mobile"
                        name="mobile"
                        type="tel"
                        required
                        value={formData.mobile}
                        onChange={handleChange}
                        disabled={mobileVerified}
                        placeholder="Enter your mobile number"
                        className="block w-full pl-10 pr-24 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 disabled:bg-gray-50"
                      />
                      {!mobileVerified && (
                        <button
                          type="button"
                          onClick={sendMobileOtp}
                          disabled={loading || !formData.mobile}
                          className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-indigo-600 text-white px-3 py-1.5 rounded text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                          Send OTP
                        </button>
                      )}
                      {mobileVerified && (
                        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-green-600">
                          <CheckCircle className="w-5 h-5" />
                        </div>
                      )}
                    </div>
                  </div>

                  {showMobileOtpInput && !mobileVerified && (
                    <OtpVerification
                      value={mobileOtp}
                      onChange={setMobileOtp}
                      onVerify={verifyMobileOtp}
                      loading={loading}
                      verified={mobileVerified}
                      label="Mobile OTP"
                    />
                  )}

                  {emailVerified && mobileVerified && (
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      Next: Business Details
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </button>
                  )}
                </>
              )}

              {step === 2 && (
                <>
                  {/* Business Name */}
                  <div>
                    <label htmlFor="businessName" className="block text-sm font-medium text-gray-700 mb-2">
                      Business Name
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Building className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="businessName"
                        name="businessName"
                        type="text"
                        required
                        value={formData.businessName}
                        onChange={handleChange}
                        placeholder="Enter your business name"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* PIN Code and Locality */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="pinCode" className="block text-sm font-medium text-gray-700 mb-2">
                        PIN Code
                      </label>
                      <input
                        id="pinCode"
                        name="pinCode"
                        type="text"
                        required
                        value={formData.pinCode}
                        onChange={handleChange}
                        placeholder="Enter PIN code"
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      />
                    </div>

                    <div>
                      <label htmlFor="locality" className="block text-sm font-medium text-gray-700 mb-2">
                        Locality
                      </label>
                      <input
                        id="locality"
                        name="locality"
                        type="text"
                        required
                        value={formData.locality}
                        onChange={handleChange}
                        placeholder="Enter locality"
                        className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* City */}
                  <div>
                    <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                      City
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <MapPin className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="city"
                        name="city"
                        type="text"
                        required
                        value={formData.city}
                        onChange={handleChange}
                        placeholder="Enter city"
                        className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      />
                    </div>
                  </div>

                  {/* Full Address */}
                  <div>
                    <label htmlFor="fullAddress" className="block text-sm font-medium text-gray-700 mb-2">
                      Full Address (Optional)
                    </label>
                    <textarea
                      id="fullAddress"
                      name="fullAddress"
                      rows={3}
                      value={formData.fullAddress}
                      onChange={handleChange}
                      placeholder="Enter complete address"
                      className="block w-full px-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500 resize-none"
                    />
                  </div>

                  {/* Password */}
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="password"
                        name="password"
                        type={showPassword ? "text" : "password"}
                        required
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Create a strong password"
                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Lock className="h-5 w-5 text-gray-400" />
                      </div>
                      <input
                        id="confirmPassword"
                        name="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm your password"
                        className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        ) : (
                          <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600 transition-colors" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center justify-between space-x-4 pt-4">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 flex justify-center items-center py-3 px-4 border border-gray-300 rounded-lg shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all duration-200"
                    >
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Back
                    </button>

                    <button
                      type="button"
                      onClick={handleSubmit}
                      disabled={loading}
                      className="flex-1 flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      {loading ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Registering...
                        </>
                      ) : (
                        'Complete Registration'
                      )}
                    </button>
                  </div>
                </>
              )}

              {/* Login link */}
              <div className="text-center pt-6 border-t border-gray-100">
                <p className="text-gray-600 text-sm">
                  Already have an account?{' '}
                  <Link
                    to={'/login'}
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors underline-offset-4 hover:underline"
                  >
                    Sign in here
                  </Link>
                </p>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-500">
              By registering, you agree to our{' '}
              <button type="button" className="text-indigo-600 hover:underline">Terms of Service</button>
              {' '}and{' '}
              <button type="button" className="text-indigo-600 hover:underline">Privacy Policy</button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;