// // client/src/pages/Login.js
"use client";
import React, { useState, useContext } from 'react';
// import { Link, useNavigate } from 'react-router-dom'
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const Login = () => {
   const router = useRouter();
   const { login}  = useContext(AuthContext);

   // Form state
   const [formData, setFormData] = useState({
      identifier: '',
      password: ''
   });
   const [errors, setErrors] = useState({});
   const [isLoading, setIsLoading] = useState(false);

   // Handle input change
   const handleChange = (e) => {
      const { name, value } = e.target;
      setFormData({ ...formData, [name]: value });

      // Clear error when user types
      if (errors[name]) {
         setErrors({ ...errors, [name]: '' });
      }
   };

   // Validate form
   const validateForm = () => {
      const newErrors = {};

      if (!formData.identifier.trim()) {
         newErrors.identifier = 'Email or phone number is required';
      }

      if (!formData.password) {
         newErrors.password = 'Password is required';
      }

      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
   };

   // Handle form submission
   const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) {
         return;
      }

      try {
         setIsLoading(true);

         await login({
            identifier: formData.identifier,
            password: formData.password
         });

         toast.success('Login successful!');
         router.push('/dashboard');
      } catch (error) {
         console.error('Login error:', error);
         toast.error(error.response?.data?.message || 'Invalid credentials');
         setErrors({ general: 'Invalid email/phone or password' });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <div className="flex items-center justify-center bg-white px-4 py-8 ">

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
                  <Card title="Sign In">
                     <form onSubmit={handleSubmit}>
                        {errors.general && (
                           <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-sm text-red-600">{errors.general}</p>
                           </div>
                        )}

                        <Input
                           label="Email or Phone Number"
                           name="identifier"
                           value={formData.identifier}
                           onChange={handleChange}
                           placeholder="email@example.com or +1234567890"
                           required
                           error={errors.identifier}
                        />

                        <Input
                           label="Password"
                           name="password"
                           type="password"
                           value={formData.password}
                           onChange={handleChange}
                           placeholder="••••••••"
                           required
                           error={errors.password}
                        />

                        <Button
                           type="submit"
                           isLoading={isLoading}
                           className="w-full mt-6 cursor-pointer"
                        >
                           Sign In
                        </Button>
                     </form>
                     <div className="mt-6 w-full mx-auto md:mt-8 pb-3 text-center">
                           <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
                                   <p className="text-gray-800 text-sm md:text-md">Are you a Vendor?</p>
                                   <a 
                                     href='http://localhost:3001/#/login'
                                     target="_blank"
                                     rel="noopener noreferrer"
                                     className="inline-block cursor-pointer px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs md:text-sm rounded-full shadow-md hover:shadow-lg transition duration-300 ease-in-out"
                                   >
                                     Login as Vendor
                                   </a>
                           </div>
                     </div>

                     <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                           Don't have an account?{' '}
                           <Link href="/register" className="text-blue-600 hover:text-blue-800 font-medium">
                              Register
                           </Link>
                        </p>
                     </div>
                  </Card>
               </div>
            </div>
         </div>
      </div>
   );
};

export default Login;

