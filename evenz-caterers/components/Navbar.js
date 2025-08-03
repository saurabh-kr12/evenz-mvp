'use client'

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';
import { AuthContext } from '@/context/AuthContext';
import useAnalytics from '@/hooks/useAnalytics';

const Navbar = ({ User, setUser }) => {
   const [menuOpen, setMenuOpen] = useState(false);
   const [dropdownOpen, setDropdownOpen] = useState(false);
   const router = useRouter();
   const { currentUser, logout } = useContext(AuthContext);
   const { dashboard, login, ui } = useAnalytics();

   const handleLogout = () => {
      // Track logout action
      ui.buttonClicked('logout_button', 'navbar');
      
      logout();
      router.push('/login');
   };

   const handleTabChange = (path) => {
      // Track navigation
      const pageName = path.replace('/', '') || 'home';
      dashboard.pageViewed(pageName);
      
      router.push(path);
      setDropdownOpen(false);
   };

   const setIsMenuOpen = (value) => {
      // Track mobile menu interactions
      if (value) {
         ui.buttonClicked('mobile_menu_open', 'navbar');
      } else {
         ui.buttonClicked('mobile_menu_close', 'navbar');
      }
      
      setMenuOpen(value);
   };

   // Helper function to handle navigation clicks
   const handleNavClick = (path, pageName) => {
      dashboard.pageViewed(pageName);
      router.push(path);
   };

   return (
      <nav className="bg-white shadow-md sticky top-0 z-50">
         <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex justify-between h-14 sm:h-16">
               <div className="flex items-center">
                  <Link href={currentUser ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center">
                     <span>
                        <svg
                           viewBox="0 0 48 48"
                           fill="none"
                           xmlns="http://www.w3.org/2000/svg"
                           width="32"
                           height="32"
                        >
                           <defs>
                              <linearGradient id="iconGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                                 <stop offset="0%" style={{ stopColor: '#667eea' }} />
                                 <stop offset="100%" style={{ stopColor: '#764ba2' }} />
                              </linearGradient>
                           </defs>

                           <circle cx="12" cy="12" r="4" fill="url(#iconGradient)" />
                           <circle cx="36" cy="12" r="4" fill="url(#iconGradient)" />
                           <circle cx="24" cy="36" r="4" fill="url(#iconGradient)" />

                           <path d="M16 12 L32 12" stroke="url(#iconGradient)" strokeWidth="2" strokeLinecap="round" />
                           <path d="M15 15 L21 33" stroke="url(#iconGradient)" strokeWidth="2" strokeLinecap="round" />
                           <path d="M33 15 L27 33" stroke="url(#iconGradient)" strokeWidth="2" strokeLinecap="round" />

                           <circle cx="24" cy="6" r="1.5" fill="#ff6b6b" />
                           <circle cx="6" cy="24" r="1.5" fill="#ffd700" />
                           <circle cx="42" cy="24" r="1.5" fill="#ff6b6b" />
                           <circle cx="24" cy="24" r="1.5" fill="#ffd700" />
                        </svg>
                     </span>

                     <span className="text-xl sm:text-2xl font-bold text-[#667eea] ml-2">Evenz.in</span>

                     <span className="ml-1 text-xs bg-[#eef2ff] text-[#667eea] px-1.5 sm:px-2 py-1 rounded-full">
                        Vendor
                     </span>
                  </Link>

               </div>

               {/* Desktop menu - hidden on smaller screens, visible on large screens */}
               <div className="hidden lg:ml-6 lg:flex lg:items-center lg:space-x-6 xl:space-x-8">
                  {currentUser ? (
                     <>
                        <Link
                           href="/dashboard"
                           className="px-2 xl:px-3 py-2 text-sm xl:text-base text-gray-700 hover:text-[#667eea] transition duration-300 ease-in-out whitespace-nowrap"
                           onClick={() => handleNavClick('/dashboard', 'dashboard')}
                        >
                           Dashboard
                        </Link>
                        <Link
                           href="/bookings"
                           className="px-2 xl:px-3 py-2 text-sm xl:text-base text-gray-700 hover:text-[#667eea] transition duration-300 ease-in-out whitespace-nowrap"
                           onClick={() => handleNavClick('/bookings', 'bookings')}
                        >
                           Bookings
                        </Link>
                        <Link
                           href="/services"
                           className="px-2 xl:px-3 py-2 text-sm xl:text-base text-gray-700 hover:text-[#667eea] transition duration-300 ease-in-out whitespace-nowrap"
                           onClick={() => handleNavClick('/services', 'services')}
                        >
                           Services
                        </Link>
                        <Link
                           href="/calendar"
                           className="px-2 xl:px-3 py-2 text-sm xl:text-base text-gray-700 hover:text-[#667eea] transition duration-300 ease-in-out whitespace-nowrap"
                           onClick={() => handleNavClick('/calendar', 'calendar')}
                        >
                           Calendar
                        </Link>
                        <Link
                           href="/your-profile"
                           className="px-2 xl:px-3 py-2 text-sm xl:text-base text-gray-700 hover:text-[#667eea] transition duration-300 ease-in-out whitespace-nowrap"
                           onClick={() => handleNavClick('/your-profile', 'profile')}
                        >
                           Profile
                        </Link>
                        <button
                           onClick={handleLogout}
                           className="ml-2 px-3 xl:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#5a6fd8] hover:to-[#6a4190] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#667eea] transition duration-300 ease-in-out whitespace-nowrap"
                        >
                           Logout
                        </button>
                     </>
                  ) : (
                     <>
                        <Link
                           href="/how-it-works"
                           className="px-2 xl:px-3 py-2 text-sm xl:text-base text-gray-700 hover:text-[#667eea] transition duration-300 ease-in-out whitespace-nowrap"
                           onClick={() => handleNavClick('/how-it-works', 'how-it-works')}
                        >
                           How It Works
                        </Link>
                        <Link
                           href="/faq"
                           className="px-2 xl:px-3 py-2 text-sm xl:text-base text-gray-700 hover:text-[#667eea] transition duration-300 ease-in-out whitespace-nowrap"
                           onClick={() => handleNavClick('/faq', 'faq')}
                        >
                           FAQs
                        </Link>
                        <Link
                           href="/login"
                           className="px-2 xl:px-3 py-2 text-sm xl:text-base text-gray-700 hover:text-[#667eea] transition duration-300 ease-in-out whitespace-nowrap"
                           onClick={() => {
                              ui.buttonClicked('login_link', 'navbar');
                              handleNavClick('/login', 'login');
                           }}
                        >
                           Login
                        </Link>
                        <Link
                           href="/register"
                           className="ml-2 px-3 xl:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-[#667eea] to-[#764ba2] hover:from-[#5a6fd8] hover:to-[#6a4190] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#667eea] transition duration-300 ease-in-out whitespace-nowrap"
                           onClick={() => {
                              ui.buttonClicked('register_button', 'navbar');
                              handleNavClick('/register', 'register');
                           }}
                        >
                           Register
                        </Link>
                     </>
                  )}
               </div>

               {/* Mobile menu button - visible on screens smaller than lg */}
               <div className="flex lg:hidden items-center">
                  <button
                     onClick={() => {
                        ui.buttonClicked('mobile_menu_toggle', 'navbar');
                        setMenuOpen(!menuOpen);
                     }}
                     className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-[#667eea] hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#667eea] transition duration-200"
                  >
                     {menuOpen ? <FaTimes className="block h-5 w-5 sm:h-6 sm:w-6" /> : <FaBars className="block h-5 w-5 sm:h-6 sm:w-6" />}
                  </button>
               </div>
            </div>
         </div>

         {/* Mobile menu - visible on screens smaller than lg */}
         <div className={`${menuOpen ? 'block' : 'hidden'} lg:hidden bg-white shadow-lg border-t border-gray-200`}>
            <div className="px-3 sm:px-4 pt-2 pb-3 space-y-1">
               {currentUser ? (
                  <>
                     <Link
                        href="/dashboard"
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-[#667eea] hover:bg-gray-50 transition duration-200"
                        onClick={() => {
                           handleNavClick('/dashboard', 'dashboard');
                           setIsMenuOpen(false);
                        }}
                     >
                        Dashboard
                     </Link>
                     <Link
                        href="/bookings"
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-[#667eea] hover:bg-gray-50 transition duration-200"
                        onClick={() => {
                           handleNavClick('/bookings', 'bookings');
                           setIsMenuOpen(false);
                        }}
                     >
                        Bookings
                     </Link>
                     <Link
                        href="/services"
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-[#667eea] hover:bg-gray-50 transition duration-200"
                        onClick={() => {
                           handleNavClick('/services', 'services');
                           setIsMenuOpen(false);
                        }}
                     >
                        Services
                     </Link>
                     <Link
                        href="/calendar"
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-[#667eea] hover:bg-gray-50 transition duration-200"
                        onClick={() => {
                           handleNavClick('/calendar', 'calendar');
                           setIsMenuOpen(false);
                        }}
                     >
                        Calendar
                     </Link>
                     <Link
                        href="/your-profile"
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-[#667eea] hover:bg-gray-50 transition duration-200"
                        onClick={() => {
                           handleNavClick('/your-profile', 'profile');
                           setIsMenuOpen(false);
                        }}
                     >
                        Profile
                     </Link>
                     <button
                        onClick={() => {
                           handleLogout();
                           setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-[#667eea] hover:bg-gray-50 transition duration-200"
                     >
                        Logout
                     </button>
                  </>
               ) : (
                  <>
                     <Link
                        href="/how-it-works"
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-[#667eea] hover:bg-gray-50 transition duration-200"
                        onClick={() => {
                           handleNavClick('/how-it-works', 'how-it-works');
                           setIsMenuOpen(false);
                        }}
                     >
                        How It Works
                     </Link>
                     <Link
                        href="/faq"
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-[#667eea] hover:bg-gray-50 transition duration-200"
                        onClick={() => {
                           handleNavClick('/faq', 'faq');
                           setIsMenuOpen(false);
                        }}
                     >
                        FAQs
                     </Link>
                     <Link
                        href="/login"
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-[#667eea] hover:bg-gray-50 transition duration-200"
                        onClick={() => {
                           ui.buttonClicked('login_link', 'mobile_navbar');
                           handleNavClick('/login', 'login');
                           setIsMenuOpen(false);
                        }}
                     >
                        Login
                     </Link>
                     <Link
                        href="/register"
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-[#667eea] hover:bg-gray-50 transition duration-200"
                        onClick={() => {
                           ui.buttonClicked('register_button', 'mobile_navbar');
                           handleNavClick('/register', 'register');
                           setIsMenuOpen(false);
                        }}
                     >
                        Register
                     </Link>
                  </>
               )}
            </div>
         </div>

         {/* Beautiful gradient border at bottom */}
         <div className="h-1 bg-gradient-to-r from-[#667eea] via-[#764ba2] to-[#667eea]"></div>
      </nav>
   );
};

export default Navbar;