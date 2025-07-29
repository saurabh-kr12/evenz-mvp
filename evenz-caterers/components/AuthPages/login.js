"use client";
import React, { useState, useContext } from 'react';
import { Eye, EyeOff, User, Lock, AlertCircle, Loader2 } from 'lucide-react';
import { AuthContext } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import RegistrationForm from './Register';
import useAnalytics from '@/hooks/useAnalytics';

const Login = () => {
  const router = useRouter();
  const { login } = useContext(AuthContext);
  const { login: loginAnalytics, ui } = useAnalytics();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const [formData, setFormData] = useState({
    identifier: '', // Can be either email or mobile
    password: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleShowPasswordToggle = () => {
    setShowPassword(!showPassword);
    ui.buttonClicked('password_visibility_toggle', 'login_form');
  };

  const handleRememberMeChange = (e) => {
    setRememberMe(e.target.checked);
    ui.buttonClicked('remember_me_checkbox', 'login_form');
  };

  const handleForgotPasswordClick = () => {
    loginAnalytics.forgotPassword();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    // Track login attempt
    loginAnalytics.loginAttempt();

    if (!formData.identifier || !formData.password) {
      setError('Please fill in all fields');
      loginAnalytics.loginFailed('missing_credentials');
      return;
    }

    try {
      setLoading(true);
      await login({ ...formData, rememberMe });
      setLoading(false);
      
      // Track successful login
      loginAnalytics.loginSuccess();
      
      // Navigate to profile page
      router.push('/dashboard');
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Login failed. Please check your credentials.';
      setError(errorMessage);
      setLoading(false);
      
      // Track failed login with reason
      const failureReason = error.response?.status === 401 ? 'invalid_credentials' : 
                           error.response?.status === 400 ? 'bad_request' : 
                           'server_error';
      loginAnalytics.loginFailed(failureReason);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br text-gray-700 from-indigo-50 via-white to-cyan-50 flex xl:flex-row">
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
                <img
                  src="/Evenz_app_logo.png"
                  alt="logo" 
                  
                />
              </div>
              <h2 className="text-3xl font-bold mb-4">Welcome to Evenz.in</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                Streamline your catering business with our comprehensive management platform
              </p>
            </div>
            <div className="space-y-4 text-sm text-white/80">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <span>No Subscription fee </span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <span>Pay-per-request model</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <span>Manage Your Availability Calendar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - Login Form */}
      <div className="flex-1 flex flex-col p-4 sm:p-6 xl:p-8">
        <div className="w-full max-w-xl mx-auto">
          {/* Mobile/Tablet logo/branding */}
          <div className="xl:hidden text-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Evenz.in</h1>
          </div>

          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 sm:p-8">
            <div className="mb-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                Welcome back
              </h2>
              <p className="text-gray-600">
                Sign in to manage your catering business
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
                <div className="flex items-center">
                  <AlertCircle className="w-5 h-5 text-red-400 mr-3 flex-shrink-0" />
                  <p className="text-red-700 text-sm">{error}</p>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email/Mobile Input */}
              <div>
                <label htmlFor="identifier" className="block text-sm font-medium text-gray-700 mb-2">
                  Email or Mobile Number
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <User className="h-5 w-5 text-gray-400" />
                  </div>
                  <input
                    id="identifier"
                    name="identifier"
                    type="text"
                    required
                    value={formData.identifier}
                    onChange={handleChange}
                    placeholder="Enter your email or mobile number"
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                </div>
              </div>

              {/* Password Input */}
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
                    placeholder="Enter your password"
                    className="block w-full pl-10 pr-12 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200 text-gray-900 placeholder-gray-500"
                  />
                  <button
                    type="button"
                    onClick={handleShowPasswordToggle}
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

              {/* Remember me and Forgot password */}
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={handleRememberMeChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded transition-colors"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                    Remember me for 60 days
                  </label>
                </div>

                <div className="text-sm">
                  <Link
                    href="/forget-password"
                    type="button"
                    onClick={handleForgotPasswordClick}
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors underline-offset-4 hover:underline"
                  >
                    Forgot password?
                  </Link>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full cursor-pointer flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              {/* Register link */}
              <div className="text-center pt-4 border-t border-gray-100">
                <p className="text-gray-600 text-sm">
                  Don't have an account?{' '}
                  <Link
                    href={'/register'}
                    onClick={() => ui.buttonClicked('create_account_link', 'login_page')}
                    className="font-medium text-indigo-600 hover:text-indigo-500 transition-colors underline-offset-4 hover:underline"
                  >
                    Create one now
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>      
      </div>
    </div>
  );
};

export default Login;