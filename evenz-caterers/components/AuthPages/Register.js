"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, Eye, EyeOff, MapPin, User, Mail, Phone, Building, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import useAnalytics from '@/hooks/useAnalytics';

// API Service
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL;

const api = {
  post: async (endpoint, data) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },
  get: async (endpoint) => {
    const response = await fetch(`${API_BASE_URL}${endpoint}`);
    return response.json();
  },
};


// Loading Spinner Component
const LoadingSpinner = () => (
  <div className="flex justify-center items-center">
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
  </div>
);

// Form Input Component
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
  children
}) => (
  <div className="space-y-2">
    <label className="block text-sm font-medium text-gray-700">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <div className="relative">
      {Icon && (
        <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
      )}
      {children || (
        <input
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          disabled={disabled}
          className={`w-full ${Icon ? 'pl-10' : 'pl-3'} pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${error ? 'border-red-500 bg-red-50' : 'border-gray-300'
            } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        />
      )}
    </div>
    {error && (
      <p className="text-sm text-red-600 flex items-center gap-1">
        <AlertCircle className="h-4 w-4" />
        {error}
      </p>
    )}
  </div>
);

// Step 1: Personal Contact & Location
const Step1Personal = ({ data, setData, errors, setErrors, onNext, loading }) => {
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [loadingStates, setLoadingStates] = useState(false);
  const [loadingCities, setLoadingCities] = useState(false);
  const [showPatnaMessage, setShowPatnaMessage] = useState(false);
  const { registration } = useAnalytics();

  useEffect(() => {
    // Track when user starts registration
    registration.stepStarted(1, 'Personal & Location Details');
    fetchStates();
  }, []);

  useEffect(() => {
    if (data.state) {
      fetchCities(data.state);
    }
  }, [data.state]);

  useEffect(() => {
    if (data.city && data.city.toLowerCase() !== 'patna') {
      setShowPatnaMessage(true);
      registration.patnaMessageShown();
    } else {
      setShowPatnaMessage(false);
    }
  }, [data.city]);

  const fetchStates = async () => {
    setLoadingStates(true);
    try {
      const response = await api.get('/register/states');
      if (response.success) {
        setStates(response.data);
      }
    } catch (error) {
      console.error('Error fetching states:', error);
    } finally {
      setLoadingStates(false);
    }
  };

  const fetchCities = async (state) => {
    setLoadingCities(true);
    try {
      const response = await api.get(`/register/cities/${state}`);
      if (response.success) {
        setCities(response.data);
      }
    } catch (error) {
      console.error('Error fetching cities:', error);
    } finally {
      setLoadingCities(false);
    }
  };

  const handleStateChange = (e) => {
    const selectedState = e.target.value;
    setData({ ...data, state: selectedState, city: '' });
    setErrors({ ...errors, state: '', city: '' });
  };

  const handleCityChange = (e) => {
    const selectedCity = e.target.value;
    setData({ ...data, city: selectedCity });
    setErrors({ ...errors, city: '' });

    // Track location selection
    if (selectedCity && data.state) {
      registration.locationSelected(data.state, selectedCity);
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!data.ownerName.trim()) newErrors.ownerName = 'Owner name is required';
    if (!data.mobileNumber.trim()) {
      newErrors.mobileNumber = 'Mobile number is required';
    } else if (!/^[0-9]{10}$/.test(data.mobileNumber)) {
      newErrors.mobileNumber = 'Please enter a valid 10-digit mobile number';
    }
    if (!data.emailAddress.trim()) {
      newErrors.emailAddress = 'Email address is required';
    } else if (!/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/.test(data.emailAddress)) {
      newErrors.emailAddress = 'Please enter a valid email address';
    }
    if (!data.state) newErrors.state = 'State is required';
    if (!data.city.trim()) newErrors.city = 'City is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      registration.stepCompleted(1, 'Personal & Location Details');
      onNext();
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="sm:text-2xl text-lg font-bold text-gray-900 mb-2">Personal & Location Details</h2>
        <p className="text-gray-600 text-base sm:text-lg">Step 1 of 3</p>
      </div>

      <FormInput
        label="Owner's Name"
        value={data.ownerName}
        onChange={(e) => setData({ ...data, ownerName: e.target.value })}
        error={errors.ownerName}
        required
        icon={User}
        placeholder="Enter your full name"
      />

      <FormInput
        label="Mobile Number"
        value={data.mobileNumber}
        onChange={(e) => setData({ ...data, mobileNumber: e.target.value })}
        error={errors.mobileNumber}
        required
        icon={Phone}
        placeholder="Enter 10-digit mobile number"
      />
      <p className="text-xs text-gray-500 mt-1 ml-1">
        We&apos;ll send a verification OTP to this number on{' '}
        <span className="font-semibold text-gray-600">WhatsApp.</span>
      </p>

      <FormInput
        label="Email Address"
        type="email"
        value={data.emailAddress}
        onChange={(e) => setData({ ...data, emailAddress: e.target.value })}
        error={errors.emailAddress}
        required
        icon={Mail}
        placeholder="Enter your email address"
      />

      <FormInput
        label="State"
        error={errors.state}
        required
        icon={MapPin}
      >
        <select
          value={data.state}
          onChange={handleStateChange}
          disabled={loadingStates}
          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.state ? 'border-red-500 bg-red-50' : 'border-gray-300'
            } ${loadingStates ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value="">
            {loadingStates ? 'Loading states...' : 'Select a state'}
          </option>
          {states.map((state) => (
            <option key={state.code} value={state.code}>
              {state.name}
            </option>
          ))}
        </select>
      </FormInput>

      <FormInput
        label="City"
        error={errors.city}
        required
        icon={Building}
      >
        <select
          value={data.city}
          onChange={handleCityChange}
          disabled={loadingCities || !data.state}
          className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.city ? 'border-red-500 bg-red-50' : 'border-gray-300'
            } ${(loadingCities || !data.state) ? 'bg-gray-100 cursor-not-allowed' : ''}`}
        >
          <option value="">
            {loadingCities ? 'Loading cities...' : 'Select a city'}
          </option>
          {cities.map((city) => (
            <option key={city.code} value={city.name}>
              {city.name}
            </option>
          ))}
        </select>
      </FormInput>

      {showPatnaMessage && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-800">
              <strong>Welcome!</strong> Evenz.in is currently focused on Patna, Bihar. Register now to be ready for expansion; leads are primarily for Patna events.
            </p>
          </div>
        </div>
      )}

      <button
        onClick={handleSubmit}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <LoadingSpinner />
            Sending OTPs...
          </>
        ) : (
          <>
            Continue
            <ChevronRight className="h-5 w-5" />
          </>
        )}
      </button>

      <div className='flex justify-center'>
        Already have an account ?
        <Link
          href={'/login'}
          className=' text-purple-700 px-2 hover:underline '
        >
          Login
        </Link>
      </div>
    </div>
  );
};

// Step 2: Verification & Password Setup
const Step2Verification = ({ data, setData, errors, setErrors, onNext, onBack, loading, tempId }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [otpCooldown, setOtpCooldown] = useState({ mobile: 0, email: 0 });
  const [resendLoading, setResendLoading] = useState({ mobile: false, email: false });
  const { registration } = useAnalytics();

  useEffect(() => {
    // Track when user reaches step 2
    registration.stepStarted(2, 'Verification & Password Setup');

    // Start cooldown timers
    const timer = setInterval(() => {
      setOtpCooldown(prev => ({
        mobile: prev.mobile > 0 ? prev.mobile - 1 : 0,
        email: prev.email > 0 ? prev.email - 1 : 0
      }));
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!data.mobileOTP.trim()) newErrors.mobileOTP = 'Mobile OTP is required';
    if (!data.emailOTP.trim()) newErrors.emailOTP = 'Email OTP is required';
    if (!data.password) {
      newErrors.password = 'Password is required';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(data.password)) {
      newErrors.password = 'Password must be at least 8 characters with uppercase, lowercase, number, and special character';
    }
    if (!data.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
    } else if (data.password !== data.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validate()) {
      // Track OTP verification success before proceeding
      registration.otpVerified('mobile');
      registration.otpVerified('email');
      registration.stepCompleted(2, 'Verification & Password Setup');
      onNext();
    }
  };

  const handleResendOTP = async (type) => {
    registration.otpResent(type);
    setResendLoading({ ...resendLoading, [type]: true });
    try {
      const endpoint = type === 'mobile' ? '/register/resend/mobile-otp' : '/register/resend/email-otp';
      const response = await api.post(endpoint, { tempId });

      if (response.success) {
        setOtpCooldown({ ...otpCooldown, [type]: 60 });
        registration.otpSent(type);
      }
    } catch (error) {
      console.error(`Error resending ${type} OTP:`, error);
    } finally {
      setResendLoading({ ...resendLoading, [type]: false });
    }
  };

  const handleBack = () => {
    registration.registrationAbandoned(2, 'Verification & Password Setup');
    onBack();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="sm:text-2xl text-lg font-bold text-gray-900 mb-2">Verification & Password Setup</h2>
        <p className="text-gray-600 text-base sm:text-lg">Step 2 of 3</p>
        <p className="text-sm text-gray-500 mt-2">
          OTPs have been sent to your mobile and email
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FormInput
            label="Mobile OTP"
            value={data.mobileOTP}
            onChange={(e) => setData({ ...data, mobileOTP: e.target.value })}
            error={errors.mobileOTP}
            required
            icon={Phone}
            placeholder="Enter mobile OTP"
          />
          <button
            onClick={() => handleResendOTP('mobile')}
            disabled={otpCooldown.mobile > 0 || resendLoading.mobile}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {resendLoading.mobile ? (
              <LoadingSpinner />
            ) : otpCooldown.mobile > 0 ? (
              <>
                <Clock className="h-4 w-4" />
                Resend in {otpCooldown.mobile}s
              </>
            ) : (
              'Resend Mobile OTP'
            )}
          </button>
        </div>

        <div>
          <FormInput
            label="Email OTP"
            value={data.emailOTP}
            onChange={(e) => setData({ ...data, emailOTP: e.target.value })}
            error={errors.emailOTP}
            required
            icon={Mail}
            placeholder="Enter email OTP"
          />
          <button
            onClick={() => handleResendOTP('email')}
            disabled={otpCooldown.email > 0 || resendLoading.email}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed flex items-center gap-1"
          >
            {resendLoading.email ? (
              <LoadingSpinner />
            ) : otpCooldown.email > 0 ? (
              <>
                <Clock className="h-4 w-4" />
                Resend in {otpCooldown.email}s
              </>
            ) : (
              'Resend Email OTP'
            )}
          </button>
        </div>
      </div>

      <FormInput
        label="Password"
        type={showPassword ? 'text' : 'password'}
        value={data.password}
        onChange={(e) => setData({ ...data, password: e.target.value })}
        error={errors.password}
        required
        placeholder="Create a strong password"
      >
        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            value={data.password}
            onChange={(e) => setData({ ...data, password: e.target.value })}
            placeholder="Create a strong password"
            className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.password ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </FormInput>

      <FormInput
        label="Confirm Password"
        type={showConfirmPassword ? 'text' : 'password'}
        value={data.confirmPassword}
        onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
        error={errors.confirmPassword}
        required
        placeholder="Confirm your password"
      >
        <div className="relative">
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={data.confirmPassword}
            onChange={(e) => setData({ ...data, confirmPassword: e.target.value })}
            placeholder="Confirm your password"
            className={`w-full pl-3 pr-10 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${errors.confirmPassword ? 'border-red-500 bg-red-50' : 'border-gray-300'
              }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
          </button>
        </div>
      </FormInput>

      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-sm text-gray-600 mb-2">Password requirements:</p>
        <ul className="text-xs text-gray-500 space-y-1">
          <li>At least 8 characters long, one uppercase letter, one lowercase letter, one number and one special character (@$!%*?&)</li>
        </ul>
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleBack}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Verifying...
            </>
          ) : (
            <>
              Verify & Continue
              <ChevronRight className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Step 3: Business Details
const Step3Business = ({ data, setData, errors, setErrors, onNext, onBack, loading }) => {
  const { registration } = useAnalytics();

  useEffect(() => {
    registration.stepStarted(3, 'Business Details');
  }, []);

  const validate = () => {
    const newErrors = {};

    if (!data.businessName.trim()) newErrors.businessName = 'Business name is required';
    if (!data.pincode.trim()) {
      newErrors.pincode = 'Pincode is required';
    } else if (!/^[0-9]{6}$/.test(data.pincode)) {
      newErrors.pincode = 'Please enter a valid 6-digit pincode';
    }
    if (!data.locality.trim()) newErrors.locality = 'Locality is required';

    if (!data.agreeToTerms) {
      newErrors.agreeToTerms = 'You must agree to the Terms & Conditions and Privacy Policy to continue';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTermsChange = (e) => {
    const isChecked = e.target.checked;
    setData({ ...data, agreeToTerms: isChecked });
    if (isChecked) {
      registration.termsAccepted();
    }
  };

  const handleSubmit = () => {
    if (validate()) {
      registration.stepCompleted(3, 'Business Details');
      onNext();
    }
  };

  const handleBack = () => {
    registration.registrationAbandoned(3, 'Business Details');
    onBack();
  };

  return (
    <div className="space-y-6">
      <div className="text-center mb-4">
        <h2 className="sm:text-2xl text-lg font-bold text-gray-900 mb-2">Business Details</h2>
        <p className="text-gray-600 text-base sm:text-lg">Step 3 of 3</p>
        <p className="text-sm text-gray-500 mt-2">
          Final step to complete your registration
        </p>
      </div>

      <FormInput
        label="Business Name"
        value={data.businessName}
        onChange={(e) => setData({ ...data, businessName: e.target.value })}
        error={errors.businessName}
        required
        icon={Building}
        placeholder="Enter your business name"
      />

      <FormInput
        label="Pincode"
        value={data.pincode}
        onChange={(e) => setData({ ...data, pincode: e.target.value })}
        error={errors.pincode}
        required
        icon={MapPin}
        placeholder="Enter 6-digit pincode"
      />

      <FormInput
        label="Locality"
        value={data.locality}
        onChange={(e) => setData({ ...data, locality: e.target.value })}
        error={errors.locality}
        required
        icon={MapPin}
        placeholder="Enter your locality/area"
      />

      <div className="space-y-2">
        <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg border">
          <input
            type="checkbox"
            id="agreeToTerms"
            checked={data.agreeToTerms}
            onChange={handleTermsChange}
            className={`mt-1 h-4 w-4 rounded ${errors.agreeToTerms ? 'border-red-500' : 'border-gray-300'
              }`}
          />
          <label htmlFor="agreeToTerms" className="text-sm text-gray-700 leading-relaxed">
            <span className="text-red-500">*</span> I agree to the{' '}
            <a
              href="/terms"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Terms & Conditions
            </a>
            {' '}and{' '}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
            >
              Privacy Policy
            </a>
          </label>
        </div>
        {errors.agreeToTerms && (
          <p className="text-sm text-red-600 flex items-center gap-1">
            <AlertCircle className="h-4 w-4" />
            {errors.agreeToTerms}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          onClick={handleBack}
          className="flex-1 bg-gray-100 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors flex items-center justify-center gap-2"
        >
          <ChevronLeft className="h-5 w-5" />
          Back
        </button>
        <button
          onClick={handleSubmit}
          disabled={loading}
          className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
        >
          {loading ? (
            <>
              <LoadingSpinner />
              Completing...
            </>
          ) : (
            <>
              Complete Registration
              <CheckCircle className="h-5 w-5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};

// Success Page
const SuccessPage = ({ vendor, token }) => {
  const [dashboardLoading, setDashboardLoading] = useState(false);
  const router = useRouter();
  const { registration, ui } = useAnalytics();

  useEffect(() => {
    // Track successful registration completion
    registration.registrationCompleted(vendor?.city || 'unknown', vendor?.state || 'unknown');

    // Store token in memory (you can implement localStorage when deploying)
    if (token) {
      console.log('Token received:', token);
    }
  }, [token, vendor]);

  const handleGoToDashboard = () => {
    setDashboardLoading(true);
    ui.buttonClicked('go_to_login', 'registration_success');
    router.push('/login');
  };

  return (
    <div className="text-center space-y-6">
      <div className="bg-green-100 rounded-full w-20 h-20 flex items-center justify-center mx-auto">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>

      <div>
        <h2 className="sm:text-2xl text-lg font-bold text-gray-900 mb-2">Registration Successful!</h2>
        <p className="text-gray-600">
          Welcome to Evenz.in, {vendor?.ownerName || 'there'}!
        </p>
      </div>

      <div className="bg-gray-50 rounded-lg p-6 text-left">
        <h3 className="font-semibold text-gray-900 mb-3">What&apos;s Next?</h3>
        <ul className="space-y-2 text-sm text-gray-600">
          <li>• Complete your profile and add business details</li>
          <li>• Upload photos of your food and services</li>
          <li>• Set your pricing and availability</li>
          <li>• Start receiving event bookings</li>
        </ul>
      </div>

      <button
        onClick={handleGoToDashboard}
        disabled={dashboardLoading}
        className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
      >
        {dashboardLoading ? (
          <>
            <LoadingSpinner />
            Loading...
          </>
        ) : (
          'Login to your account'
        )}
      </button>
    </div>
  );
};

// Main Registration Form Component
const RegistrationForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [tempId, setTempId] = useState('');
  const [vendor, setVendor] = useState(null);
  const [token, setToken] = useState('');
  const [errors, setErrors] = useState({});
  const { registration } = useAnalytics();
  const [data, setData] = useState({
    ownerName: '',
    mobileNumber: '',
    emailAddress: '',
    state: '',
    city: '',
    mobileOTP: '',
    emailOTP: '',
    password: '',
    confirmPassword: '',
    businessName: '',
    pincode: '',
    locality: '',
    agreeToTerms: false
  });

  // Track page abandonment on unmount
  useEffect(() => {
    return () => {
      if (currentStep < 4) {
        const stepNames = {
          1: 'Personal & Location Details',
          2: 'Verification & Password Setup',
          3: 'Business Details'
        };
        registration.registrationAbandoned(currentStep, stepNames[currentStep]);
      }
    };
  }, [currentStep]);

  const handleStep1Next = async () => {
    setLoading(true);
    try {
      const response = await api.post('/register/step1', {
        ownerName: data.ownerName,
        mobileNumber: data.mobileNumber,
        emailAddress: data.emailAddress,
        state: data.state,
        city: data.city
      });

      if (response.success) {
        setTempId(response.tempId);
        setCurrentStep(2);
        // Track OTP sent events
        registration.otpSent('mobile');
        registration.otpSent('email');
      } else {
        setErrors({ general: response.error });
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStep2Next = async () => {
    setLoading(true);
    try {
      const response = await api.post('/register/step2/verify', {
        tempId,
        mobileOTP: data.mobileOTP,
        emailOTP: data.emailOTP,
        password: data.password,
        confirmPassword: data.confirmPassword
      });

      if (response.success) {
        setCurrentStep(3);
      } else {
        setErrors({ general: response.error });
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleStep3Next = async () => {
    setLoading(true);
    try {
      const response = await api.post('/register/step3/complete', {
        tempId,
        businessName: data.businessName,
        pincode: data.pincode,
        locality: data.locality,
        agreeToTerms: data.agreeToTerms
      });

      if (response.success) {
        setVendor(response.vendor);
        setToken(response.token);
        setCurrentStep(4);
      } else {
        setErrors({ general: response.error });
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setCurrentStep(currentStep - 1);
    setErrors({});
  };

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <Step1Personal
            data={data}
            setData={setData}
            errors={errors}
            setErrors={setErrors}
            onNext={handleStep1Next}
            loading={loading}
          />
        );
      case 2:
        return (
          <Step2Verification
            data={data}
            setData={setData}
            errors={errors}
            setErrors={setErrors}
            onNext={handleStep2Next}
            onBack={handleBack}
            loading={loading}
            tempId={tempId}
          />
        );
      case 3:
        return (
          <Step3Business
            data={data}
            setData={setData}
            errors={errors}
            setErrors={setErrors}
            onNext={handleStep3Next}
            onBack={handleBack}
            loading={loading}
          />
        );
      case 4:
        return (
          <SuccessPage
            vendor={vendor}
            token={token}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-700 py-6">
      <div className="max-w-2xl mx-auto px-4">
        <div className="bg-white rounded-xl shadow-lg p-8">
          {errors.general && (
            <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-red-600" />
                <p className="text-sm text-red-800">{errors.general}</p>
              </div>
            </div>
          )}

          {renderCurrentStep()}
        </div>
      </div>
    </div>
  );
};

export default RegistrationForm;