// // client/src/pages/Register.js
// import React, { useState, useContext } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import Card from '../components/Card';
// import Input from '../components/Input';
// import Button from '../components/Button';
// import OTPInput from '../components/OTPInput';
// import toast from 'react-hot-toast';

// const Register = () => {
//    const navigate = useNavigate();
//    const { register } = useContext(AuthContext);

//    // Form state
//    const [step, setStep] = useState(1);
//    const [isLoading, setIsLoading] = useState(false);
//    const [formData, setFormData] = useState({
//       name: '',
//       identifier: '', // email or phone
//       password: '',
//       confirmPassword: '',
//       otp: ''
//    });
//    const [errors, setErrors] = useState({});

//    // Handle input change
//    const handleChange = (e) => {
//       const { name, value } = e.target;
//       setFormData({ ...formData, [name]: value });

//       // Clear error when user types
//       if (errors[name]) {
//          setErrors({ ...errors, [name]: '' });
//       }
//    };

//    // Validate first step
//    const validateStep1 = () => {
//       const newErrors = {};

//       if (!formData.name.trim()) {
//          newErrors.name = 'Name is required';
//       }

//       if (!formData.identifier.trim()) {
//          newErrors.identifier = 'Email or phone number is required';
//       } else {
//          // Simple email validation
//          const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
//          // Simple phone validation (basic international format)
//          const phoneRegex = /^\+?[1-9]\d{9,14}$/;

//          if (!emailRegex.test(formData.identifier) && !phoneRegex.test(formData.identifier)) {
//             newErrors.identifier = 'Please enter a valid email or phone number';
//          }
//       }

//       setErrors(newErrors);
//       return Object.keys(newErrors).length === 0;
//    };

//    // Validate final step
//    const validateStep3 = () => {
//       const newErrors = {};

//       if (!formData.password) {
//          newErrors.password = 'Password is required';
//       } else if (formData.password.length < 6) {
//          newErrors.password = 'Password must be at least 6 characters';
//       }

//       if (formData.password !== formData.confirmPassword) {
//          newErrors.confirmPassword = 'Passwords do not match';
//       }

//       setErrors(newErrors);
//       return Object.keys(newErrors).length === 0;
//    };

//    // Handle OTP verification success
//    const handleOTPVerified = (otp) => {
//       setFormData({ ...formData, otp });
//       setStep(3); // Move to password step after OTP verification
//    };

//    // Handle form submission
//    const handleSubmit = async (e) => {
//       e.preventDefault();

//       if (!validateStep3()) {
//          return;
//       }

//       try {
//          setIsLoading(true);

//          // Register user
//          await register({
//             name: formData.name,
//             identifier: formData.identifier,
//             password: formData.password,
//             otp: formData.otp
//          });

//          toast.success('Registration successful!');
//          navigate('/dashboard');
//       } catch (error) {
//          console.error('Registration error:', error);
//          toast.error(error.response?.data?.message || 'Registration failed');
//       } finally {
//          setIsLoading(false);
//       }
//    };

//    // Handle step navigation
//    const handleNextStep = () => {
//       if (step === 1 && validateStep1()) {
//          setStep(2);
//       }
//    };

//    return (
//       <div className=" flex items-center justify-center bg-white px-4 py-8">

//          <div className="flex w-full items-center justify-center bg-white px-4 py-8">
//             <div className="flex md:min-h-[70vh] w-full max-w-5xl shadow-[0_0_10px_rgba(0,0,0,0.1)]">
//                {/* Left Section - Hidden on mobile */}
//                <div className="hidden lg:block w-2/5 relative">
//                   <img
//                      src="/traditional indian wedding couple.png"
//                      alt="Traditional Indian Wedding"
//                      className="absolute inset-0 w-full h-full object-cover"
//                   />
//                </div>

//                {/* Right Section */}
//                <div className="w-full lg:w-3/5 p-4 sm:p-6 md:p-8 bg-white flex flex-col justify-center items-center">
//                   <Card title="Create an Account">
//                      {step === 1 && (
//                         <>
//                            <Input
//                               label="Full Name"
//                               name="name"
//                               value={formData.name}
//                               onChange={handleChange}
//                               placeholder="John Doe"
//                               required
//                               error={errors.name}
//                            />
//                            <Input
//                               label="Phone Number"
//                               name="identifier"
//                               value={formData.identifier}
//                               onChange={handleChange}
//                               placeholder="+1234567890"
//                               required
//                               error={errors.identifier}
//                            />
//                            <Button
//                               onClick={handleNextStep}
//                               className="w-full cursor-pointer mt-6"
//                            >
//                               Continue
//                            </Button>
//                         </>
//                      )}

//                      {step === 2 && (
//                         <>
//                            <div className="mb-6">
//                               <h3 className="text-md font-medium text-gray-700">Verify your {formData.identifier.includes('@') ? 'Email' : 'Phone Number'}</h3>
//                               <p className="text-sm text-gray-500 mt-1">
//                                  We'll send a one-time password to {formData.identifier}
//                               </p>
//                            </div>

//                            <OTPInput
//                               identifier={formData.identifier}
//                               purpose="registration"
//                               onVerified={handleOTPVerified}
//                            />

//                            <Button
//                               onClick={() => setStep(1)}
//                               className="w-full cursor-pointer mt-4 bg-gray-200 text-gray-800 hover:bg-gray-300"
//                            >
//                               Back
//                            </Button>
//                         </>
//                      )}

//                      {step === 3 && (
//                         <form onSubmit={handleSubmit}>
//                            <Input
//                               label="Password"
//                               name="password"
//                               type="password"
//                               value={formData.password}
//                               onChange={handleChange}
//                               placeholder="••••••••"
//                               required
//                               error={errors.password}
//                            />
//                            <Input
//                               label="Confirm Password"
//                               name="confirmPassword"
//                               type="password"
//                               value={formData.confirmPassword}
//                               onChange={handleChange}
//                               placeholder="••••••••"
//                               required
//                               error={errors.confirmPassword}
//                            />
//                            <Button
//                               type="submit"
//                               isLoading={isLoading}
//                               className="w-full mt-6 cursor-pointer"
//                            >
//                               Register
//                            </Button>
//                         </form>
//                      )}

//                      <div className="mt-6 text-center">
//                         <p className="text-sm text-gray-600">
//                            Already have an account?{' '}
//                            <Link to="/login" className="text-blue-600 cursor-pointer hover:text-blue-800 font-medium">
//                               Sign in
//                            </Link>
//                         </p>
//                      </div>
//                   </Card>
//                </div>
//             </div>
//          </div>
//       </div>
//    );
// };

// export default Register;

// client/src/pages/Register.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import toast from 'react-hot-toast';
import api from '../services/api';

const Register = () => {
   const navigate = useNavigate();
   const { register } = useContext(AuthContext);

   // Form state
   const [step, setStep] = useState(1);
   const [isLoading, setIsLoading] = useState(false);
   const [otpLoading, setOtpLoading] = useState(false);
   const [formData, setFormData] = useState({
      name: '',
      phone: '',
      password: '',
      confirmPassword: '',
      otp: ''
   });
   const [errors, setErrors] = useState({});
   const [otpSent, setOtpSent] = useState(false);
   const [resendTimer, setResendTimer] = useState(0);

   // Handle input change
   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });

      // Clear error when user types
      if (errors[name]) {
         setErrors({ ...errors, [name]: '' });
      }
   };

   // Validate first step
   const validateStep1 = () => {
      const newErrors = {};

      if (!formData.name.trim()) {
         newErrors.name = 'Name is required';
      }

      if (!formData.phone.trim()) {
         newErrors.phone = 'Phone number is required';
      } else {
         // Phone validation (international format)
         const phoneRegex = /^\+?[1-9]\d{9,14}$/;
         if (!phoneRegex.test(formData.phone)) {
            newErrors.phone = 'Please enter a valid phone number (e.g., +1234567890)';
         }
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   // Validate final step
   const validateStep3 = () => {
      const newErrors = {};

      if (!formData.password) {
         newErrors.password = 'Password is required';
      } else if (formData.password.length < 6) {
         newErrors.password = 'Password must be at least 6 characters';
      }

      if (formData.password !== formData.confirmPassword) {
         newErrors.confirmPassword = 'Passwords do not match';
      }

      if (!formData.otp) {
         newErrors.otp = 'OTP is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   // Send OTP
   const sendOTP = async () => {
      try {
         setOtpLoading(true);
         
         await api.post('/api/otp/send', {
            phone: formData.phone,
            purpose: 'registration'
         });

         setOtpSent(true);
         toast.success('OTP sent to your phone number');
         startResendTimer();
         
      } catch (error) {
         console.error('Send OTP error:', error);
         toast.error(error.response?.data?.message || 'Failed to send OTP');
      } finally {
         setOtpLoading(false);
      }
   };

   // Resend OTP
   const resendOTP = async () => {
      try {
         setOtpLoading(true);
         
         await api.post('/api/otp/resend', {
            phone: formData.phone,
            purpose: 'registration'
         });

         toast.success('OTP resent successfully');
         startResendTimer();
         
      } catch (error) {
         console.error('Resend OTP error:', error);
         toast.error(error.response?.data?.message || 'Failed to resend OTP');
      } finally {
         setOtpLoading(false);
      }
   };

   // Start resend timer
   const startResendTimer = () => {
      setResendTimer(30);
      const timer = setInterval(() => {
         setResendTimer((prev) => {
            if (prev <= 1) {
               clearInterval(timer);
               return 0;
            }
            return prev - 1;
         });
      }, 1000);
   };

   // Verify OTP
   const verifyOTP = async () => {
      if (!formData.otp) {
         setErrors({ otp: 'Please enter the OTP' });
         return false;
      }

      try {
         await api.post('/api/otp/verify', {
            phone: formData.phone,
            otp: formData.otp,
            purpose: 'registration'
         });

         return true;
      } catch (error) {
         console.error('Verify OTP error:', error);
         setErrors({ otp: error.response?.data?.message || 'Invalid OTP' });
         return false;
      }
   };

   // Handle form submission
   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateStep3()) {
         return;
      }

      // Verify OTP first
      const isOtpValid = await verifyOTP();
      if (!isOtpValid) {
         return;
      }

      try {
         setIsLoading(true);

         // Register user
         await register({
            name: formData.name,
            phone: formData.phone,
            password: formData.password,
            otp: formData.otp
         });

         toast.success('Registration successful!');
         navigate('/dashboard');
      } catch (error) {
         console.error('Registration error:', error);
         toast.error(error.response?.data?.message || 'Registration failed');
      } finally {
         setIsLoading(false);
      }
   };

   // Handle step navigation
   const handleNextStep = async () => {
      if (step === 1 && validateStep1()) {
         setStep(2);
         // Automatically send OTP when moving to step 2
         await sendOTP();
      } else if (step === 2 && formData.otp) {
         const isOtpValid = await verifyOTP();
         if (isOtpValid) {
            setStep(3);
         }
      }
   };

   return (
      <div className="flex items-center text-gray-700 justify-center bg-white px-4 py-8">
         <div className="flex w-full items-center justify-center bg-white px-4 py-8">
            <div className="flex md:min-h-[70vh] w-full max-w-5xl shadow-[0_0_10px_rgba(0,0,0,0.1)]">
               {/* Left Section - Hidden on mobile */}
               <div className="hidden lg:block w-2/5 relative">
                  <img
                     src="/traditional indian wedding couple.png"
                     alt="Traditional Indian Wedding"
                     className="absolute inset-0 w-full h-full object-cover"
                  />
               </div>

               {/* Right Section */}
               <div className="w-full lg:w-3/5 p-4 sm:p-6 md:p-8 bg-white flex flex-col justify-center items-center">
                  <div className="w-full max-w-md bg-white rounded-lg p-6">
                     <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
                        Create an Account
                     </h2>

                     {/* Step 1: Basic Info */}
                     {step === 1 && (
                        <>
                           <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                 Full Name *
                              </label>
                              <input
                                 type="text"
                                 name="name"
                                 value={formData.name}
                                 onChange={handleChange}
                                 placeholder="Enter your full name"
                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              {errors.name && (
                                 <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                              )}
                           </div>

                           <div className="mb-6">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                 Phone Number *
                              </label>
                              <input
                                 type="tel"
                                 name="phone"
                                 value={formData.phone}
                                 onChange={handleChange}
                                 placeholder="+1234567890"
                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              {errors.phone && (
                                 <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
                              )}
                           </div>

                           <button
                              onClick={handleNextStep}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200"
                           >
                              Continue
                           </button>
                        </>
                     )}

                     {/* Step 2: OTP Verification */}
                     {step === 2 && (
                        <>
                           <div className="mb-6 text-center">
                              <h3 className="text-lg font-medium text-gray-700 mb-2">
                                 Verify Your Phone Number
                              </h3>
                              <p className="text-sm text-gray-500">
                                 We've sent a 6-digit code to {formData.phone}
                              </p>
                           </div>

                           <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                 Enter OTP *
                              </label>
                              <input
                                 type="text"
                                 name="otp"
                                 value={formData.otp}
                                 onChange={handleChange}
                                 placeholder="Enter 6-digit OTP"
                                 maxLength="6"
                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-center text-lg tracking-widest"
                              />
                              {errors.otp && (
                                 <p className="mt-1 text-sm text-red-600">{errors.otp}</p>
                              )}
                           </div>

                           <div className="mb-6 text-center">
                              {resendTimer > 0 ? (
                                 <p className="text-sm text-gray-500">
                                    Resend OTP in {resendTimer} seconds
                                 </p>
                              ) : (
                                 <button
                                    onClick={resendOTP}
                                    disabled={otpLoading}
                                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                 >
                                    {otpLoading ? 'Sending...' : 'Resend OTP'}
                                 </button>
                              )}
                           </div>

                           <div className="flex gap-3">
                              <button
                                 onClick={() => setStep(1)}
                                 className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-md transition duration-200"
                              >
                                 Back
                              </button>
                              <button
                                 onClick={handleNextStep}
                                 disabled={!formData.otp || formData.otp.length !== 6}
                                 className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-400"
                              >
                                 Verify
                              </button>
                           </div>
                        </>
                     )}

                     {/* Step 3: Password */}
                     {step === 3 && (
                        <form onSubmit={handleSubmit}>
                           <div className="mb-4">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                 Password *
                              </label>
                              <input
                                 type="password"
                                 name="password"
                                 value={formData.password}
                                 onChange={handleChange}
                                 placeholder="Create a password"
                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              {errors.password && (
                                 <p className="mt-1 text-sm text-red-600">{errors.password}</p>
                              )}
                           </div>

                           <div className="mb-6">
                              <label className="block text-sm font-medium text-gray-700 mb-2">
                                 Confirm Password *
                              </label>
                              <input
                                 type="password"
                                 name="confirmPassword"
                                 value={formData.confirmPassword}
                                 onChange={handleChange}
                                 placeholder="Confirm your password"
                                 className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              />
                              {errors.confirmPassword && (
                                 <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                              )}
                           </div>

                           <button
                              type="submit"
                              disabled={isLoading}
                              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-400"
                           >
                              {isLoading ? 'Creating Account...' : 'Create Account'}
                           </button>
                        </form>
                     )}

                     <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                           Already have an account?{' '}
                           <Link to="/login" className="text-blue-600 hover:text-blue-800 font-medium">
                              Sign in
                           </Link>
                        </p>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Register;