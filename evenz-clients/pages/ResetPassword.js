"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Mail, Lock } from 'lucide-react';
import useFormValidation from '@/hooks/useFormValidation';
import validationRules from '@/utils/validationRules';
import InputField from '@/components/InputField';
import Button from '@/components/Button';
import AuthLayout from '@/components/AuthLayout';

const ResetPassword = () => {
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState('');
   const [messageType, setMessageType] = useState('');
   const [token, setToken] = useState('');
   const [tokenValidated, setTokenValidated] = useState(false);
   
   const searchParams = useSearchParams();
   const router = useRouter();

   const { values, errors, touched, setValue, setTouched, validateAll } = useFormValidation({
      password: '',
      confirmPassword: ''
   }, {
      password: validationRules.password,
      confirmPassword: validationRules.confirmPassword
   });

   useEffect(() => {
      // Extract token from URL parameters
      const urlToken = searchParams.get('token');
      console.log('Token from URL:', urlToken);
      
      if (urlToken) {
         setToken(urlToken);
         setTokenValidated(true);
      } else {
         showMessage('Invalid reset link. Please check your email for the correct link.', 'error');
      }
   }, [searchParams]);

   const showMessage = (msg, type = 'info') => {
      setMessage(msg);
      setMessageType(type);
      setTimeout(() => setMessage(''), 5000);
   };

   const handleResetPassword = async () => {
      console.log('Reset password clicked');
      console.log('Token:', token);
      console.log('Values:', values);
      
      if (!token) {
         showMessage('Invalid reset token. Please check your email for the correct link.', 'error');
         return;
      }

      if (!validateAll()) {
         showMessage('Please fix the validation errors', 'error');
         return;
      }

      if (values.password !== values.confirmPassword) {
         showMessage('Passwords do not match', 'error');
         return;
      }

      setLoading(true);
      try {
         console.log('Sending request with:', {
            token,
            password: values.password
         });

         const response = await fetch('http://localhost:5000/api/user/auth/reset-password', {
            method: 'POST',
            headers: { 
               'Content-Type': 'application/json',
               'Accept': 'application/json'
            },
            body: JSON.stringify({
               token,
               password: values.password
            })
         });

         console.log('Response status:', response.status);
         
         if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
         }

         const data = await response.json();
         console.log('Response data:', data);

         if (data.success) {
            showMessage('Password reset successful! Redirecting to login...', 'success');
            setTimeout(() => {
               router.push('/login');
            }, 2000);
         } else {
            showMessage(data.message || 'Failed to reset password', 'error');
         }
      } catch (error) {
         console.error('Reset password error:', error);
         showMessage('Failed to reset password. Please try again.', 'error');
      } finally {
         setLoading(false);
      }
   };

   // Show loading state while token is being validated
   if (!tokenValidated) {
      return (
         <AuthLayout
            title="Reset Password"
            subtitle="Validating reset link..."
            message="Please wait while we validate your reset link..."
            messageType="info"
         >
            <div className="text-center">
               <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            </div>
         </AuthLayout>
      );
   }

   return (
      <AuthLayout
         title="Reset Password"
         subtitle="Create a new password for your account"
         message={message}
         messageType={messageType}
      >
         <div className="space-y-6">
            <InputField
               label="New Password"
               type="password"
               name="password"
               value={values.password}
               onChange={setValue}
               onBlur={setTouched}
               error={touched.password && errors.password}
               placeholder="Enter new password"
               icon={Lock}
            />

            <InputField
               label="Confirm New Password"
               type="password"
               name="confirmPassword"
               value={values.confirmPassword}
               onChange={setValue}
               onBlur={setTouched}
               error={touched.confirmPassword && errors.confirmPassword}
               placeholder="Confirm new password"
               icon={Lock}
            />

            <Button
               onClick={handleResetPassword}
               loading={loading}
               disabled={!values.password || !values.confirmPassword || errors.password || errors.confirmPassword}
            >
               Reset Password
            </Button>
         </div>

         <div className="text-center">
            <p className="text-sm text-gray-600">
               Remember your password?{' '}
               <Link
                  href="/login"
                  className="text-blue-600 hover:text-blue-800 font-medium">
                  Sign in here
               </Link>
            </p>
         </div>
      </AuthLayout>
   );
};

export default ResetPassword;