"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { Mail } from 'lucide-react';
import useFormValidation from '@/hooks/useFormValidation';
import validationRules from '@/utils/validationRules';
import InputField from '@/components/InputField';
import Button from '@/components/Button';
import AuthLayout from '@/components/AuthLayout';

const ForgotPasswordPage = () => {
   const [loading, setLoading] = useState(false);
   const [message, setMessage] = useState('');
   const [messageType, setMessageType] = useState('');

   const { values, errors, touched, setValue, setTouched, validateAll } = useFormValidation({
      email: ''
   }, {
      email: validationRules.email
   });

   const showMessage = (msg, type = 'info') => {
      setMessage(msg);
      setMessageType(type);
      setTimeout(() => setMessage(''), 5000);
   };

   const handleForgotPassword = async () => {
      if (!values.email || errors.email) {
         showMessage('Please enter a valid email address', 'error');
         return;
      }

      setLoading(true);
      try {
         const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/user/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: values.email })
         });
         const data = await response.json();

         if (data.success) {
            showMessage('Password reset link sent to your email!', 'success');
         } else {
            showMessage(data.message, 'error');
         }
      } catch (error) {
         showMessage('Failed to send reset link. Please try again.', 'error');
      } finally {
         setLoading(false);
      }
   };


   return (
      <AuthLayout
         title="Forgot Password"
         subtitle="Enter your email to receive a password reset link"
         message={message}
         messageType={messageType}
      >
         <div className="space-y-6">
            <InputField
               label="Email Address"
               type="email"
               name="email"
               value={values.email}
               onChange={setValue}
               onBlur={setTouched}
               error={touched.email && errors.email}
               placeholder="Enter your email address"
               icon={Mail}
            />

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
               <p className="text-sm text-blue-800">
                  If you don&apos;t receive the email or used a different email during registration,
                  you can enter the correct email address above and we&apos;ll send the reset link there.
               </p>
            </div>

            <Button
               onClick={handleForgotPassword}
               loading={loading}
               disabled={!values.email || errors.email}
            >
               Send Reset Link
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

export default ForgotPasswordPage;