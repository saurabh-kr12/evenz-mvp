// // client/src/pages/Login.js
import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import Card from '../components/Card';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';

const Login = () => {
   const navigate = useNavigate();
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
         navigate('/dashboard');
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
                           <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
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

// client/src/pages/Login.js
// import React, { useState, useContext } from 'react';
// import { Link, useNavigate } from 'react-router-dom';
// import { AuthContext } from '../context/AuthContext';
// import toast from 'react-hot-toast';

// const Login = () => {
//    const navigate = useNavigate();
//    const { login } = useContext(AuthContext);

//    // Form state
//    const [formData, setFormData] = useState({
//       phone: '',
//       password: ''
//    });
//    const [errors, setErrors] = useState({});
//    const [isLoading, setIsLoading] = useState(false);

//    // Handle input change
//    const handleChange = (e) => {
//       const { name, value } = e.target;
//       setFormData({ ...formData, [name]: value });

//       // Clear error when user types
//       if (errors[name]) {
//          setErrors({ ...errors, [name]: '' });
//       }
//    };

//    // Validate form
//    const validateForm = () => {
//       const newErrors = {};

//       if (!formData.phone.trim()) {
//          newErrors.phone = 'Phone number is required';
//       } else {
//          // Phone validation
//          const phoneRegex = /^\+?[1-9]\d{9,14}$/;
//          if (!phoneRegex.test(formData.phone)) {
//             newErrors.phone = 'Please enter a valid phone number';
//          }
//       }

//       if (!formData.password) {
//          newErrors.password = 'Password is required';
//       }

//       setErrors(newErrors);
//       return Object.keys(newErrors).length === 0;
//    };

//    // Handle form submission
//    const handleSubmit = async (e) => {
//       e.preventDefault();

//       if (!validateForm()) {
//          return;
//       }

//       try {
//          setIsLoading(true);

//          await login({
//             phone: formData.phone,
//             password: formData.password
//          });

//          toast.success('Login successful!');
//          navigate('/dashboard');
//       } catch (error) {
//          console.error('Login error:', error);
//          const errorMessage = error.response?.data?.message || 'Invalid phone number or password';
//          toast.error(errorMessage);
         
//          if (error.response?.data?.requiresVerification) {
//             // Redirect to registration if phone needs verification
//             navigate('/register');
//          } else {
//             setErrors({ general: errorMessage });
//          }
//       } finally {
//          setIsLoading(false);
//       }
//    };

//    return (
//       <div className="flex text-gray-700 items-center justify-center bg-white px-4 py-8">
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
//                   <div className="w-full max-w-md bg-white rounded-lg p-6">
//                      <h2 className="text-2xl font-bold text-center text-gray-800 mb-6">
//                         Sign In
//                      </h2>

//                      <form onSubmit={handleSubmit}>
//                         {errors.general && (
//                            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md">
//                               <p className="text-sm text-red-600">{errors.general}</p>
//                            </div>
//                         )}

//                         <div className="mb-4">
//                            <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Phone Number *
//                            </label>
//                            <input
//                               type="tel"
//                               name="phone"
//                               value={formData.phone}
//                               onChange={handleChange}
//                               placeholder="+1234567890"
//                               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                            />
//                            {errors.phone && (
//                               <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
//                            )}
//                         </div>

//                         <div className="mb-6">
//                            <label className="block text-sm font-medium text-gray-700 mb-2">
//                               Password *
//                            </label>
//                            <input
//                               type="password"
//                               name="password"
//                               value={formData.password}
//                               onChange={handleChange}
//                               placeholder="Enter your password"
//                               className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                            />
//                            {errors.password && (
//                               <p className="mt-1 text-sm text-red-600">{errors.password}</p>
//                            )}
//                         </div>

//                         <button
//                            type="submit"
//                            disabled={isLoading}
//                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-md transition duration-200 disabled:bg-gray-400"
//                         >
//                            {isLoading ? 'Signing In...' : 'Sign In'}
//                         </button>
//                      </form>

//                      {/* Vendor Login Section */}
//                      <div className="mt-6 w-full mx-auto md:mt-8 pb-3 text-center">
//                         <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8">
//                            <p className="text-gray-800 text-sm md:text-md">Are you a Vendor?</p>
//                            <Link 
//                               to="/vendor-login" 
//                               className="inline-block px-4 md:px-6 py-2 md:py-2.5 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs md:text-sm rounded-full shadow-md hover:shadow-lg transition duration-300 ease-in-out"
//                            >
//                               Login as Vendor
//                            </Link>
//                         </div>
//                      </div>

//                      <div className="mt-6 text-center">
//                         <p className="text-sm text-gray-600">
//                            Don't have an account?{' '}
//                            <Link to="/register" className="text-blue-600 hover:text-blue-800 font-medium">
//                               Register
//                            </Link>
//                         </p>
//                      </div>
//                   </div>
//                </div>
//             </div>
//          </div>
//       </div>
//    );
// };

// export default Login;