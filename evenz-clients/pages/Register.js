"use client";
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle, Phone, Mail, User, Lock } from 'lucide-react';
import useFormValidation from '@/hooks/useFormValidation';
import validationRules from '@/utils/validationRules';
import InputField from '@/components/InputField';
import Button from '@/components/Button';
import Timer from '@/components/Timer';
import AuthLayout from '@/components/AuthLayout';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';
import * as gtag from '@/lib/gtag';

const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  const router = useRouter();
  const { 
    register, 
    sendOTP, 
    verifyOTP, 
    resendOTP, 
    resetOTPState,
    otpSent, 
    otpVerified, 
    attemptsLeft, 
    canResendOtp,
    currentUser
  } = useAuth();

  const { values, errors, touched, setValue, setTouched, validateAll } = useFormValidation({
    name: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    otp: '',
    agreeToTerms: false
  }, validationRules);

  // Redirect if user is already logged in
  useEffect(() => {
    if (currentUser) {
      router.push('/dashboard');
    }
  }, [currentUser, router]);

  // Reset OTP state when component mounts
  useEffect(() => {
    resetOTPState();
    
    // Track page view
    gtag.event({
      action: 'page_view',
      category: 'registration',
      label: 'register_page_loaded'
    });
  }, []);

  // Move to step 2 when OTP is verified
  useEffect(() => {
    if (otpVerified) {
      setCurrentStep(2);
      
      // Track OTP verification success
      gtag.event({
        action: 'otp_verified',
        category: 'registration',
        label: 'mobile_verification_success'
      });
    }
  }, [otpVerified]);

  const handleSendOTP = async () => {
    if (!values.mobile || errors.mobile) {
      return;
    }

    setOtpLoading(true);
    
    // Track OTP send attempt
    gtag.event({
      action: 'otp_send_attempt',
      category: 'registration',
      label: 'whatsapp_otp_requested'
    });

    try {
      await sendOTP(values.mobile);
      
      // Track successful OTP send
      gtag.event({
        action: 'otp_sent',
        category: 'registration',
        label: 'whatsapp_otp_sent_success'
      });
    } catch (error) {
      // Track OTP send failure
      gtag.event({
        action: 'otp_send_failed',
        category: 'registration',
        label: 'whatsapp_otp_send_error'
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (!values.otp || errors.otp) {
      return;
    }

    setLoading(true);
    
    // Track OTP verification attempt
    gtag.event({
      action: 'otp_verify_attempt',
      category: 'registration',
      label: 'mobile_verification_attempt'
    });

    try {
      await verifyOTP(values.mobile, values.otp);
      // Success tracking is handled in the useEffect above
    } catch (error) {
      // Track OTP verification failure
      gtag.event({
        action: 'otp_verify_failed',
        category: 'registration',
        label: 'mobile_verification_failed'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtpLoading(true);
    
    // Track OTP resend attempt
    gtag.event({
      action: 'otp_resend',
      category: 'registration',
      label: 'whatsapp_otp_resend_attempt'
    });

    try {
      await resendOTP();
      
      // Track successful OTP resend
      gtag.event({
        action: 'otp_resent',
        category: 'registration',
        label: 'whatsapp_otp_resend_success'
      });
    } catch (error) {
      // Track OTP resend failure
      gtag.event({
        action: 'otp_resend_failed',
        category: 'registration',
        label: 'whatsapp_otp_resend_error'
      });
    } finally {
      setOtpLoading(false);
    }
  };

  const handleRegistration = async () => {
    if (!validateAll()) return;

    if (values.password !== values.confirmPassword) {
      toast.error('Passwords do not match');
      
      // Track password mismatch error
      gtag.event({
        action: 'form_validation_error',
        category: 'registration',
        label: 'password_mismatch'
      });
      return;
    }

    if (!values.agreeToTerms) {
      toast.error('You must agree to the Terms and Conditions and Privacy Policy');
      
      // Track terms agreement error
      gtag.event({
        action: 'form_validation_error',
        category: 'registration',
        label: 'terms_not_agreed'
      });
      return;
    }

    setLoading(true);
    
    // Track registration attempt
    gtag.event({
      action: 'registration_attempt',
      category: 'registration',
      label: 'account_creation_started'
    });

    try {
      const result = await register({
        name: values.name,
        email: values.email,
        mobile: values.mobile,
        password: values.password,
        otp: values.otp,
        agreeToTerms: values.agreeToTerms
      });

      if (result.success) {
        // Track successful registration
        gtag.event({
          action: 'registration_success',
          category: 'registration',
          label: 'account_created_successfully'
        });
        
        // Track conversion event
        gtag.event({
          action: 'sign_up',
          category: 'engagement',
          label: 'user_registered'
        });
        
        router.push('/dashboard');
      }
      // Error messages are handled by AuthContext
    } catch (error) {
      console.error('Registration error:', error);
      
      // Track registration failure
      gtag.event({
        action: 'registration_failed',
        category: 'registration',
        label: 'account_creation_error'
      });
    } finally {
      setLoading(false);
    }
  };

  // Track form field interactions
  const handleFieldFocus = (fieldName) => {
    gtag.event({
      action: 'form_field_focus',
      category: 'registration',
      label: `${fieldName}_field_focused`
    });
  };

  // Track step progression
  const trackStepView = (step) => {
    gtag.event({
      action: 'registration_step_view',
      category: 'registration',
      label: `step_${step}_viewed`,
      value: step
    });
  };

  // Track step when it changes
  useEffect(() => {
    trackStepView(currentStep);
  }, [currentStep]);

  const renderStep1 = () => (
    <div className="space-y-6">
      <InputField
        label="Full Name"
        name="name"
        value={values.name}
        onChange={setValue}
        onBlur={setTouched}
        onFocus={() => handleFieldFocus('name')}
        error={touched.name && errors.name}
        placeholder="Enter your full name"
        icon={User}
      />

      <InputField
        label="Email Address"
        type="email"
        name="email"
        value={values.email}
        onChange={setValue}
        onBlur={setTouched}
        onFocus={() => handleFieldFocus('email')}
        error={touched.email && errors.email}
        placeholder="Enter your email"
        icon={Mail}
      />

      <InputField
        label="Mobile Number (WhatsApp)"
        type="tel"
        name="mobile"
        value={values.mobile}
        onChange={setValue}
        onBlur={setTouched}
        onFocus={() => handleFieldFocus('mobile')}
        error={touched.mobile && errors.mobile}
        placeholder="Enter 10-digit mobile number"
        icon={Phone}
        maxLength="10"
      />

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-yellow-800">
          <strong>Important:</strong> Please enter a mobile number that is also your active WhatsApp number. 
          You will receive the OTP on WhatsApp for verification.
        </p>
      </div>

      {!otpSent ? (
        <Button
          onClick={handleSendOTP}
          loading={otpLoading}
          disabled={!values.mobile || errors.mobile}
        >
          Send OTP via WhatsApp
        </Button>
      ) : (
        <div className="space-y-4">
          <InputField
            label="Enter OTP"
            name="otp"
            value={values.otp}
            onChange={setValue}
            onBlur={setTouched}
            onFocus={() => handleFieldFocus('otp')}
            error={touched.otp && errors.otp}
            placeholder="Enter 6-digit OTP"
            maxLength="6"
          />

          <Button
            onClick={handleVerifyOTP}
            loading={loading}
            disabled={!values.otp || errors.otp}
          >
            Verify OTP
          </Button>

          {!canResendOtp && (
            <Timer 
              initialTime={30} 
              onComplete={() => {}} 
            />
          )}

          {canResendOtp && (
            <Button
              onClick={handleResendOTP}
              variant="secondary"
              loading={otpLoading}
              disabled={attemptsLeft <= 0}
            >
              Resend OTP ({attemptsLeft} attempts left)
            </Button>
          )}
        </div>
      )}
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-6">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-2" />
        <h3 className="text-lg font-medium text-gray-900">Mobile Verified!</h3>
        <p className="text-sm text-gray-600">Now create a strong password for your account</p>
      </div>

      <InputField
        label="Password"
        type="password"
        name="password"
        value={values.password}
        onChange={setValue}
        onBlur={setTouched}
        onFocus={() => handleFieldFocus('password')}
        error={touched.password && errors.password}
        placeholder="Create a strong password"
        icon={Lock}
      />

      <InputField
        label="Confirm Password"
        type="password"
        name="confirmPassword"
        value={values.confirmPassword}
        onChange={setValue}
        onBlur={setTouched}
        onFocus={() => handleFieldFocus('confirmPassword')}
        error={touched.confirmPassword && errors.confirmPassword}
        placeholder="Confirm your password"
        icon={Lock}
      />

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          <strong>Password Requirements:</strong>
          <br />• At least 8 characters long
          <br />• Contains uppercase and lowercase letters
          <br />• Contains at least one number
        </p>
      </div>

      {/* Terms and Conditions Consent Checkbox */}
      <div className="space-y-3">
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="agreeToTerms"
            name="agreeToTerms"
            checked={values.agreeToTerms}
            onChange={(e) => {
              setValue('agreeToTerms', e.target.checked);
              // Track terms agreement interaction
              gtag.event({
                action: 'terms_agreement_toggle',
                category: 'registration',
                label: e.target.checked ? 'terms_agreed' : 'terms_disagreed'
              });
            }}
            onFocus={() => handleFieldFocus('agreeToTerms')}
            className="mt-1 h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
          />
          <label htmlFor="agreeToTerms" className="text-sm text-gray-700 leading-5">
            I agree to the{' '}
            <Link 
              href="/terms" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
              onClick={() => {
                gtag.event({
                  action: 'terms_link_click',
                  category: 'registration',
                  label: 'terms_conditions_opened'
                });
              }}
            >
              Terms and Conditions
            </Link>
            {' '}and{' '}
            <Link 
              href="/privacy" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 underline font-medium"
              onClick={() => {
                gtag.event({
                  action: 'privacy_link_click',
                  category: 'registration',
                  label: 'privacy_policy_opened'
                });
              }}
            >
              Privacy Policy
            </Link>
          </label>
        </div>
        {!values.agreeToTerms && touched.agreeToTerms && (
          <p className="text-red-500 text-xs">You must agree to the Terms and Conditions and Privacy Policy</p>
        )}
      </div>

      <Button
        onClick={handleRegistration}
        loading={loading}
        disabled={!values.password || !values.confirmPassword || errors.password || errors.confirmPassword || !values.agreeToTerms}
      >
        Create Account
      </Button>
    </div>
  );

  return (
    <AuthLayout
      title="Create Account"
      subtitle="Join our catering platform as a client"
      showProgressBar={true}
      currentStep={currentStep}
    >
      {currentStep === 1 ? renderStep1() : renderStep2()}
      
      <div className="text-center mt-6">
        <p className="text-sm text-gray-600">
          Already have an account?{' '}
          <Link 
            href="/login" 
            className="text-blue-600 hover:text-blue-800 font-medium"
            onClick={() => {
              gtag.event({
                action: 'login_link_click',
                category: 'registration',
                label: 'switch_to_login'
              });
            }}
          >
            Sign in here
          </Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default RegisterPage;