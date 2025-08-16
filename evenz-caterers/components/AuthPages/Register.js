"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Eye, EyeOff, MapPin, User, Mail, Phone, Building, Clock, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import useAnalytics from '@/hooks/useAnalytics';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// --- Helper Components ---

const LoadingSpinner = () => <Loader2 className="animate-spin h-5 w-5" />;

const FormInput = ({
  label,
  type = 'text',
  value,
  onChange,
  error,
  required = false,
  icon: Icon,
  placeholder,
  disabled = false,
  children,
  showToggle = false,
  onToggle,
  showPassword = false,
  maxLength,
  pattern,
  onKeyPress
}) => (
  <div className="space-y-2">
    <label className="block text-sm sm:text-base font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4 sm:h-5 sm:w-5" />}
      {children || (
        <>
          <input
            type={type}
            value={value}
            onChange={onChange}
            onKeyPress={onKeyPress}
            placeholder={placeholder}
            disabled={disabled}
            maxLength={maxLength}
            pattern={pattern}
            className={`w-full ${Icon ? 'pl-8 sm:pl-10' : 'pl-3'} ${showToggle ? 'pr-10' : 'pr-3'} py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          />
          {showToggle && (
            <button
              type="button"
              onClick={onToggle}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              {showPassword ? <EyeOff className="h-4 w-4 sm:h-5 sm:w-5" /> : <Eye className="h-4 w-4 sm:h-5 sm:w-5" />}
            </button>
          )}
        </>
      )}
    </div>
    {error && (
      <p className="text-xs sm:text-sm text-red-600 flex items-center gap-1 mt-1">
        <AlertCircle className="h-3 w-3 sm:h-4 sm:w-4" />
        {error}
      </p>
    )}
  </div>
);

// --- Step Components ---

const Step1Business = ({ data, setData, errors, setErrors, onNext, loading }) => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(true);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showPatnaMessage, setShowPatnaMessage] = useState(false);

  // Google Analytics
  const { registration: analytics , ui } = useAnalytics();

  useEffect(() => {
    const fetchStates = async () => {
      try {
        const response = await api.get('/register/states');
        if (response.data.success) setStates(response.data.data);
      } catch (error) {
        console.error('Error fetching states:', error);
        toast.error('Failed to load states. Please refresh and try again.');
      } finally {
        setLoadingStates(false);
      }
    };
    fetchStates();
  }, []);

  const fetchCities = useCallback(async (stateCode) => {
    if (!stateCode) return;
    setLoadingCities(true);
    setCities([]);
    try {
      const response = await api.get(`/register/cities/${stateCode}`);
      if (response.data.success) setCities(response.data.data);
    } catch (error) {
      console.error('Error fetching cities:', error);
      toast.error('Failed to load cities. Please try again.');
    } finally {
      setLoadingCities(false);
    }
  }, []);

  useEffect(() => {
    if (data.state && states.length > 0) {
      const stateObj = states.find(s => s.name === data.state);
      if (stateObj) fetchCities(stateObj.code);
    }
  }, [data.state, states, fetchCities]);

  useEffect(() => {
    setShowPatnaMessage(data.city && data.city.toLowerCase() !== 'patna');

    // Track location selection when city is selected
    if (data.city && data.state) {
      analytics.locationSelected(data.state, data.city);
    }

    // Track Patna message shown
    if (data.city && data.city.toLowerCase() !== 'patna') {
      analytics.patnaMessageShown();
    }
  }, [data.city, data.state, analytics]);

  const handleStateChange = (e) => {
    const selectedStateName = e.target.value;
    setData(prev => ({ ...prev, state: selectedStateName, city: '' }));
    setErrors(prev => ({ ...prev, state: '', city: '' }));

    // Track location selection if both state and city are selected later
    if (selectedStateName) {
      analytics.locationSelected(selectedStateName, '');
    }
  };

  // Input validation handlers
  const handlePincodeChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 6) {
      setData(prev => ({ ...prev, pincode: value }));
      setErrors(prev => ({ ...prev, pincode: '' }));
    }
  };

  const handleOwnerNameChange = (e) => {
    const value = e.target.value.replace(/[^a-zA-Z\s]/g, ''); // Only letters and spaces
    setData(prev => ({ ...prev, ownerName: value }));
    setErrors(prev => ({ ...prev, ownerName: '' }));
  };

  const validate = () => {
    const newErrors = {};
    if (!data.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!data.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!data.state) newErrors.state = 'State is required';
    if (!data.city) newErrors.city = 'City is required';
    if (!data.pincode.trim()) newErrors.pincode = 'Pincode is required';
    else if (!/^[0-9]{6}$/.test(data.pincode)) newErrors.pincode = 'Please enter a valid 6-digit pincode';
    if (!data.locality.trim()) newErrors.locality = 'Locality is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      analytics.stepCompleted(1, 'Business Information');
      onNext();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center px-2">
        <p className="text-sm sm:text-base text-gray-600 mt-2">Step 1 of 2: Tell us about your business.</p>
      </div>

      <FormInput
        label="Owner's Name"
        value={data.ownerName}
        onChange={handleOwnerNameChange}
        error={errors.ownerName}
        required
        icon={User}
        placeholder="Enter your full name"
      />

      <FormInput
        label="Business Name"
        value={data.businessName}
        onChange={(e) => {
          setData(prev => ({ ...prev, businessName: e.target.value }));
          setErrors(prev => ({ ...prev, businessName: '' }));
        }}
        error={errors.businessName}
        required
        icon={Building}
        placeholder="Enter your business name"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput label="State" error={errors.state} required icon={MapPin}>
          <select
            value={data.state}
            onChange={handleStateChange}
            disabled={loadingStates}
            className={`w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${loadingStates ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">{loadingStates ? 'Loading...' : 'Select State'}</option>
            {states.map((state) => (
              <option key={state.code} value={state.name}>{state.name}</option>
            ))}
          </select>
        </FormInput>

        <FormInput label="City" error={errors.city} required icon={MapPin}>
          <select
            value={data.city}
            onChange={(e) => {
              setData(prev => ({ ...prev, city: e.target.value }));
              setErrors(prev => ({ ...prev, city: '' }));
            }}
            disabled={loadingCities || !data.state}
            className={`w-full pl-8 sm:pl-10 pr-3 py-2 sm:py-3 text-sm sm:text-base border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'} ${(loadingCities || !data.state) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
          >
            <option value="">{loadingCities ? 'Loading...' : 'Select City'}</option>
            {cities.map((city) => (
              <option key={city.code} value={city.name}>{city.name}</option>
            ))}
          </select>
        </FormInput>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormInput
          label="Pincode"
          value={data.pincode}
          onChange={handlePincodeChange}
          error={errors.pincode}
          required
          icon={MapPin}
          placeholder="e.g., 800001"
          maxLength="6"
        />

        <FormInput
          label="Locality"
          value={data.locality}
          onChange={(e) => {
            setData(prev => ({ ...prev, locality: e.target.value }));
            setErrors(prev => ({ ...prev, locality: '' }));
          }}
          error={errors.locality}
          required
          icon={MapPin}
          placeholder="e.g., Kankarbagh"
        />
      </div>

      {showPatnaMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 sm:p-4 text-xs sm:text-sm text-blue-800 mx-2 sm:mx-0">
          <strong>Welcome!</strong> Evenz.in is currently focused on Patna. Register now to be ready for expansion; leads are primarily for Patna events.
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 sm:py-4 px-4 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2 mx-2 sm:mx-0 transition-colors"
      >
        {loading ? <LoadingSpinner /> : 'Continue'}
        <ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
      </button>

      {/* Register link */}
      <div className="text-center border-gray-100">
        <p className="text-gray-600 text-sm">
          Already have an account?{' '}
          <Link
            href={'/login'}
            onClick={() => ui.buttonClicked('login_account_link', 'register_page')}
            className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors underline-offset-4 hover:underline"
          >
            Login now
          </Link>
        </p>
      </div>
    </div>
  );
};

const Step2Verification = ({ data, setData, errors, setErrors, onNext, onBack, tempId }) => {
  const [verificationStatus, setVerificationStatus] = useState({ mobile: false, email: false });
  const [otpSent, setOtpSent] = useState({ mobile: false, email: false });
  const [loading, setLoading] = useState({});
  const [otpCooldown, setOtpCooldown] = useState({ mobile: 0, email: 0 });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Google Analytics
  const { registration: analytics } = useAnalytics();

  useEffect(() => {
    const timer = setInterval(() => {
      setOtpCooldown(prev => ({
        mobile: prev.mobile > 0 ? prev.mobile - 1 : 0,
        email: prev.email > 0 ? prev.email - 1 : 0,
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Input validation handlers
  const handleMobileChange = (e) => {
    const value = e.target.value.replace(/\D/g, ''); // Only digits
    if (value.length <= 10) {
      setData(prev => ({ ...prev, mobileNumber: value }));
    }
  };

  const handleEmailChange = (e) => {
    const value = e.target.value;
    // Basic email validation pattern
    setData(prev => ({ ...prev, emailAddress: value }));
  };

  const handleOTPChange = (type, value) => {
    const numericValue = value.replace(/\D/g, ''); // Only digits
    if (numericValue.length <= 6) {
      setData(prev => ({ ...prev, [`${type}OTP`]: numericValue }));
    }
  };

  const validateEmail = (email) => {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailPattern.test(email);
  };

  const validateMobile = (mobile) => {
    return /^[6-9]\d{9}$/.test(mobile); // Indian mobile number pattern
  };

  const handleSendOTP = async (type) => {
    const value = type === 'mobile' ? data.mobileNumber : data.emailAddress;

    // Validation before sending OTP
    if (!value) {
      toast.error(`${type.charAt(0).toUpperCase() + type.slice(1)} is required.`);
      return;
    }

    if (type === 'mobile' && !validateMobile(value)) {
      toast.error('Please enter a valid 10-digit mobile number starting with 6-9');
      return;
    }

    if (type === 'email' && !validateEmail(value)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setLoading(prev => ({ ...prev, [`send_${type}`]: true }));
    try {
      const response = await api.post('/register/otp/send', { tempId, type, value });
      if (response.data.success) {
        setOtpSent(prev => ({ ...prev, [type]: true }));
        toast.success(response.data.message || `OTP sent to your ${type}`);
        setOtpCooldown(prev => ({ ...prev, [type]: 120 }));
        analytics.otpSent(type);
      }
    } catch (error) {
      toast.error(error.message || `Failed to send OTP to ${type}`);
      const waitTime = error.response?.data?.waitTime;
      if (waitTime) setOtpCooldown(prev => ({ ...prev, [type]: waitTime }));
    } finally {
      setLoading(prev => ({ ...prev, [`send_${type}`]: false }));
    }
  };

  const handleVerifyOTP = async (type) => {
    const otp = data[`${type}OTP`];
    if (!otp) {
      toast.error(`${type.charAt(0).toUpperCase() + type.slice(1)} OTP is required.`);
      return;
    }
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP');
      return;
    }

    setLoading(prev => ({ ...prev, [`verify_${type}`]: true }));
    try {
      const response = await api.post('/register/otp/verify', { tempId, type, otp });
      if (response.data.success) {
        setVerificationStatus(prev => ({ ...prev, [type]: true }));
        toast.success(response.data.message || `${type.charAt(0).toUpperCase() + type.slice(1)} verified successfully`);
        analytics.otpVerified(type);
      }
    } catch (error) {
      toast.error(error.message || `Failed to verify ${type} OTP`);
    } finally {
      setLoading(prev => ({ ...prev, [`verify_${type}`]: false }));
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!data.password) newErrors.password = 'Password is required';
    else if (data.password.length < 8) newErrors.password = 'Password must be at least 8 characters.';
    if (data.password !== data.confirmPassword) newErrors.confirmPassword = 'Passwords do not match.';
    if (!data.agreeToTerms) newErrors.agreeToTerms = 'You must agree to the terms.';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      analytics.stepCompleted(2, 'Verification & Security');
      analytics.termsAccepted();
      onNext();
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="text-center px-2">
        <p className="text-sm sm:text-base text-gray-600 mt-2">Step 2 of 2: Secure your account.</p>
      </div>

      {/* Mobile Verification */}
      <div className="p-3 sm:p-4 border rounded-lg space-y-3">
        <FormInput
          label="Mobile Number"
          value={data.mobileNumber}
          onChange={handleMobileChange}
          disabled={verificationStatus.mobile || otpSent.mobile}
          icon={Phone}
          placeholder="Enter 10-digit WhatsApp number"
          maxLength="10"
        />
        {!verificationStatus.mobile && (
          <div className="flex flex-col sm:flex-row gap-2">
            {otpSent.mobile ? (
              <>
                <div className="flex-1">
                  <FormInput
                    type="tel"
                    value={data.mobileOTP}
                    onChange={(e) => handleOTPChange('mobile', e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                </div>
                <button
                  onClick={() => handleVerifyOTP('mobile')}
                  disabled={loading.verify_mobile || data.mobileOTP.length !== 6}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 min-w-fit"
                >
                  {loading.verify_mobile ? <LoadingSpinner /> : 'Verify'}
                </button>
              </>
            ) : (
              <button
                onClick={() => handleSendOTP('mobile')}
                disabled={loading.send_mobile || !validateMobile(data.mobileNumber)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading.send_mobile ? <LoadingSpinner /> : 'Send OTP'}
              </button>
            )}
          </div>
        )}
        {otpSent.mobile && !verificationStatus.mobile && (
          <button
            onClick={() => {
              analytics.otpResent('mobile');
              handleSendOTP('mobile');
            }}
            disabled={otpCooldown.mobile > 0 || loading.send_mobile}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 underline"
          >
            {otpCooldown.mobile > 0 ? `Resend in ${otpCooldown.mobile}s` : 'Resend OTP'}
          </button>
        )}
        {verificationStatus.mobile && (
          <p className="text-green-600 flex items-center gap-1 text-sm sm:text-base">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Mobile Verified
          </p>
        )}
      </div>

      {/* Email Verification */}
      <div className={`p-3 sm:p-4 border rounded-lg space-y-3 transition-opacity duration-300 ${!verificationStatus.mobile ? 'opacity-50' : ''}`}>
        <FormInput
          label="Email Address"
          type="email"
          value={data.emailAddress}
          onChange={handleEmailChange}
          disabled={!verificationStatus.mobile || verificationStatus.email || otpSent.email}
          icon={Mail}
          placeholder="Enter your email address"
        />
        {verificationStatus.mobile && !verificationStatus.email && (
          <div className="flex flex-col sm:flex-row gap-2">
            {otpSent.email ? (
              <>
                <div className="flex-1">
                  <FormInput
                    type="tel"
                    value={data.emailOTP}
                    onChange={(e) => handleOTPChange('email', e.target.value)}
                    placeholder="Enter 6-digit OTP"
                    maxLength="6"
                  />
                </div>
                <button
                  onClick={() => handleVerifyOTP('email')}
                  disabled={loading.verify_email || data.emailOTP.length !== 6}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-green-700 disabled:opacity-50 flex items-center justify-center gap-2 min-w-fit"
                >
                  {loading.verify_email ? <LoadingSpinner /> : 'Verify'}
                </button>
              </>
            ) : (
              <button
                onClick={() => handleSendOTP('email')}
                disabled={loading.send_email || !validateEmail(data.emailAddress)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm sm:text-base font-medium hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading.send_email ? <LoadingSpinner /> : 'Send OTP'}
              </button>
            )}
          </div>
        )}
        {otpSent.email && !verificationStatus.email && (
          <button
            onClick={() => {
              analytics.otpResent('email');
              handleSendOTP('email');
            }}
            disabled={otpCooldown.email > 0 || loading.send_email}
            className="text-xs sm:text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 underline"
          >
            {otpCooldown.email > 0 ? `Resend in ${otpCooldown.email}s` : 'Resend OTP'}
          </button>
        )}
        {verificationStatus.email && (
          <p className="text-green-600 flex items-center gap-1 text-sm sm:text-base">
            <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5" /> Email Verified
          </p>
        )}
      </div>

      {/* Password & Terms */}
      <div className={`space-y-4 transition-opacity duration-300 ${!verificationStatus.mobile || !verificationStatus.email ? 'opacity-50 pointer-events-none' : ''}`}>
        <FormInput
          label="Password"
          type={showPassword ? 'text' : 'password'}
          value={data.password}
          onChange={(e) => {
            setData(prev => ({ ...prev, password: e.target.value }));
            setErrors(prev => ({ ...prev, password: '' }));
          }}
          error={errors.password}
          required
          placeholder="Create a strong password (min. 8 characters)"
          showToggle={true}
          onToggle={() => setShowPassword(!showPassword)}
          showPassword={showPassword}
        />

        <FormInput
          label="Confirm Password"
          type={showConfirmPassword ? 'text' : 'password'}
          value={data.confirmPassword}
          onChange={(e) => {
            setData(prev => ({ ...prev, confirmPassword: e.target.value }));
            setErrors(prev => ({ ...prev, confirmPassword: '' }));
          }}
          error={errors.confirmPassword}
          required
          placeholder="Confirm your password"
          showToggle={true}
          onToggle={() => setShowConfirmPassword(!showConfirmPassword)}
          showPassword={showConfirmPassword}
        />

        <div className="flex items-start gap-3 px-2 sm:px-0">
          <input
            type="checkbox"
            id="agreeToTerms"
            checked={data.agreeToTerms}
            onChange={(e) => {
              setData(prev => ({ ...prev, agreeToTerms: e.target.checked }));
              setErrors(prev => ({ ...prev, agreeToTerms: '' }));
            }}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="agreeToTerms" className="text-xs sm:text-sm text-gray-700">
            I agree to the <Link href="/terms" className="text-blue-600 underline">Terms & Conditions</Link> and <Link href="/privacy" className="text-blue-600 underline">Privacy Policy</Link>.
          </label>
        </div>
        {errors.agreeToTerms && <p className="text-xs sm:text-sm text-red-600 px-2 sm:px-0">{errors.agreeToTerms}</p>}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 border-t mx-2 sm:mx-0">
        <button
          onClick={onBack}
          className="flex-1 bg-gray-200 text-gray-700 py-3 sm:py-4 rounded-lg text-sm sm:text-base font-medium hover:bg-gray-300 transition-colors"
        >
          <ChevronLeft className="inline h-4 w-4 sm:h-5 sm:w-5 mr-1" /> Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={!verificationStatus.mobile || !verificationStatus.email}
          className="flex-1 bg-green-600 text-white py-3 sm:py-4 rounded-lg text-sm sm:text-base font-medium hover:bg-green-700 disabled:opacity-50 transition-colors flex items-center justify-center gap-2"
        >
          Complete Registration
        </button>
      </div>
    </div>
  );
};

// --- Main Component ---
const RegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tempId, setTempId] = useState('');
  const [errors, setErrors] = useState({});
  const [data, setData] = useState({
    ownerName: '', businessName: '', state: '', city: '', pincode: '', locality: '',
    mobileNumber: '', emailAddress: '', mobileOTP: '', emailOTP: '',
    password: '', confirmPassword: '', agreeToTerms: false
  });
  const { setAccessToken, setCurrentUser } = useAuth();
  const router = useRouter();

  // Google Analytics
  const { registration: analytics } = useAnalytics();

  useEffect(() => {
    // Track registration page view and step 1 start
    analytics.stepStarted(1, 'Business Information');
  }, [analytics]);

  const handleStep1Next = async () => {
    setLoading(true);
    try {
      const payload = {
        ownerName: data.ownerName,
        businessName: data.businessName,
        state: data.state,
        city: data.city,
        pincode: data.pincode,
        locality: data.locality
      };
      const response = await api.post('/register/step1', payload);
      if (response.data.success) {
        setTempId(response.data.tempId);
        setCurrentStep(2);
        toast.success('Business information saved successfully!');
        analytics.stepStarted(2, 'Verification & Security');
      }
    } catch (error) {
      toast.error(error.message || 'Failed to save business information. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = async () => {
    setLoading(true);
    try {
      const payload = { tempId, password: data.password, agreeToTerms: data.agreeToTerms };
      const response = await api.post('/register/complete', payload);
      if (response.data.success) {
        // --- THE FIX IS HERE ---
        const { accessToken, vendor } = response.data;

        // 1. Manually set the authentication state without a new API call.
        setAccessToken(accessToken);
        setCurrentUser(vendor);
        api.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;

        // 2. Show success and redirect.
        toast.success("Welcome! Registration successful. Redirecting...");
        router.push('/dashboard');
      }
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    const currentStepName = currentStep === 2 ? 'Verification & Security' : 'Business Information';
    analytics.registrationAbandoned(currentStep, currentStepName);
    setCurrentStep(currentStep - 1);
    if (currentStep - 1 === 1) {
      analytics.stepStarted(1, 'Business Information');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-700 py-4 sm:py-6">
      <div className="max-w-2xl mx-auto px-3 sm:px-4">
        <div className="bg-white rounded-xl shadow-lg p-4 sm:p-6 lg:p-8">
          {currentStep === 1 && (
            <Step1Business
              data={data}
              setData={setData}
              errors={errors}
              setErrors={setErrors}
              onNext={handleStep1Next}
              loading={loading}
            />
          )}
          {currentStep === 2 && (
            <Step2Verification
              data={data}
              setData={setData}
              errors={errors}
              setErrors={setErrors}
              onNext={handleStep2Next}
              onBack={handleBack}
              tempId={tempId}
            />
          )}
        </div>
      </div>

      {/* Toast Container with custom positioning for better visibility */}
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
        className="!top-4 !right-4"
        toastClassName="!text-sm !rounded-lg"
        bodyClassName="!text-sm"
      />
    </div>
  );
};

export default RegistrationForm;