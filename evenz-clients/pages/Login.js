"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Phone, Lock } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import useFormValidation from '@/hooks/useFormValidation';
import validationRules from '@/utils/validationRules';
import useAnalytics from '@/hooks/useAnalytics';
import InputField from '@/components/InputField';
import Button from '@/components/Button';
import AuthLayout from '@/components/AuthLayout';

const LoginPage = () => {
   const [loading, setLoading] = useState(false);
   const [rememberMe, setRememberMe] = useState(false);
   const [formStarted, setFormStarted] = useState(false);
   const router = useRouter();
   const { login, currentUser } = useAuth();
   const analytics = useAnalytics();

   const { values, errors, touched, setValue, setTouched, validateAll } = useFormValidation({
      mobile: '',
      password: ''
   }, {
      mobile: validationRules.mobile,
      password: [(value) => !value ? 'Password is required' : '']
   });

   // Track page view on component mount
   useEffect(() => {
      analytics.trackPageView('login_page', 'authentication');
   }, [analytics]);

   // Redirect if user is already logged in
   useEffect(() => {
      if (currentUser) {
         router.push('/dashboard');
      }
   }, [currentUser, router]);

   // Track form start on first interaction
   const handleFormStart = () => {
      if (!formStarted) {
         analytics.trackFormStart('login_form');
         setFormStarted(true);
      }
   };

   // Enhanced setValue to track form interactions
   const handleSetValue = (name, value) => {
      handleFormStart();
      setValue(name, value);
   };

   // Track field focus events
   const handleFieldFocus = (fieldName) => {
      handleFormStart();
      analytics.trackFormFieldFocus('login_form', fieldName);
   };

   const handleLogin = async () => {
      if (!validateAll()) {
         // Track validation errors
         analytics.trackError('validation_error', 'form_invalid', 'login_page');
         return;
      }

      setLoading(true);
      
      // Track login attempt
      analytics.trackAuth('login_attempt', true, 'mobile');
      
      try {
         const result = await login({
            mobile: values.mobile,
            password: values.password,
            rememberMe
         });

         if (result.success) {
            // Track successful login
            analytics.trackAuth('login', true, 'mobile');
            analytics.trackFormSubmit('login_form', true);
            analytics.trackConversion('user_login', 1);
            
            router.push('/dashboard');
         } else {
            // Track failed login
            analytics.trackAuth('login', false, 'mobile');
            analytics.trackFormSubmit('login_form', false);
         }
      } catch (error) {
         console.error('Login error:', error);
         
         // Track login error
         analytics.trackAuth('login', false, 'mobile');
         analytics.trackFormSubmit('login_form', false);
         analytics.trackError('login_error', error.message || 'unknown_error', 'login_page');
      } finally {
         setLoading(false);
      }
   };

   // Track remember me checkbox
   const handleRememberMeChange = (e) => {
      setRememberMe(e.target.checked);
      analytics.trackCustomEvent(
         'remember_me_toggled', 
         'form_interaction', 
         `remember_me_${e.target.checked ? 'checked' : 'unchecked'}`
      );
   };

   // Track forgot password click
   const handleForgotPasswordClick = () => {
      analytics.trackLinkClick('forgot_password', 'forget_password_page', 'navigation');
   };

   // Track vendor login click
   const handleVendorLoginClick = () => {
      analytics.trackLinkClick('vendor_login', 'vendor_portal', 'external_navigation');
      analytics.trackCustomEvent('vendor_redirect', 'user_intent', 'vendor_login_clicked');
   };

   // Track sign up link click
   const handleSignUpClick = () => {
      analytics.trackLinkClick('sign_up', 'register_page', 'navigation');
   };

   return (
      <AuthLayout
         title="Welcome Back"
         subtitle="Sign in to your account"
      >
         <div className="space-y-6">
            <InputField
               label="Mobile Number"
               type="tel"
               name="mobile"
               value={values.mobile}
               onChange={handleSetValue}
               onBlur={setTouched}
               onFocus={() => handleFieldFocus('mobile')}
               error={touched.mobile && errors.mobile}
               placeholder="Enter your mobile number"
               icon={Phone}
               maxLength="10"
            />

            <InputField
               label="Password"
               type="password"
               name="password"
               value={values.password}
               onChange={handleSetValue}
               onBlur={setTouched}
               onFocus={() => handleFieldFocus('password')}
               error={touched.password && errors.password}
               placeholder="Enter your password"
               icon={Lock}
            />

            <div className="flex items-center justify-between">
               <div className="flex items-center">
                  <input
                     id="remember-me"
                     name="remember-me"
                     type="checkbox"
                     checked={rememberMe}
                     onChange={handleRememberMeChange}
                     className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                     Remember me for 60 days
                  </label>
               </div>

               <div className="text-sm">
                  <Link 
                     href="/forget-password" 
                     className="text-blue-600 hover:text-blue-800 font-medium"
                     onClick={handleForgotPasswordClick}
                  >
                     Forgot password?
                  </Link>
               </div>
            </div>

            <Button
               onClick={handleLogin}
               loading={loading}
               disabled={!values.mobile || !values.password || errors.mobile || errors.password}
            >
               Sign In
            </Button>
         </div>

         <div className="mt-6 w-full mx-auto md:mt-8 pb-3 text-center">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
               <p className="text-gray-800 text-sm md:text-md">Are you a Vendor?</p>
               <a
                  href='http://localhost:3001/login'
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={handleVendorLoginClick}
                  className="inline-block cursor-pointer px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs md:text-sm rounded-full shadow-md hover:shadow-lg transition duration-300 ease-in-out"
               >
                  Login as Vendor
               </a>
            </div>
         </div>

         <div className="text-center mt-6">
            <p className="text-sm text-gray-600">
               Don't have an account?{' '}
               <Link 
                  href="/register" 
                  className="text-blue-600 hover:text-blue-800 font-medium"
                  onClick={handleSignUpClick}
               >
                  Sign up here
               </Link>
            </p>
         </div>
      </AuthLayout>
   );
};

export default LoginPage;