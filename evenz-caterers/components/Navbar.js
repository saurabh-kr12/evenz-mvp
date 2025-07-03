'use client'

import React, { useState, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaBars, FaTimes } from 'react-icons/fa';
import { AuthContext } from '@/context/AuthContext';

const Navbar = ({ User, setUser }) => {
   const [menuOpen, setMenuOpen] = useState(false);
   const [dropdownOpen, setDropdownOpen] = useState(false);
   const router = useRouter();
   const { currentUser, logout } = useContext(AuthContext);

   const handleLogout = () => {
      logout();
      router.push('/login');
   };

   const handleTabChange = (path) => {
      router.push(path);
      setDropdownOpen(false);
   };

   const setIsMenuOpen = (value) => {
      setMenuOpen(value);
   };

   return (
      <nav className="bg-white shadow-md sticky top-0 z-50">
         <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8">
            <div className="flex justify-between h-14 sm:h-16">
               <div className="flex items-center">
                  <Link href={currentUser ? "/dashboard" : "/"} className="flex-shrink-0 flex items-center">
                     <span className="text-xl sm:text-2xl font-bold text-pink-600">Evenz.in</span>
                     <span className="ml-1 text-xs bg-pink-100 text-pink-600 px-1.5 sm:px-2 py-1 rounded-full">
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
                           className="px-2 xl:px-3 py-2 text-sm xl:text-base text-gray-700 hover:text-pink-600 transition duration-300 ease-in-out whitespace-nowrap"
                        >
                           Dashboard
                        </Link>
                        <Link 
                           href="/bookings" 
                           className="px-2 xl:px-3 py-2 text-sm xl:text-base text-gray-700 hover:text-pink-600 transition duration-300 ease-in-out whitespace-nowrap"
                        >
                           Bookings
                        </Link>
                        <Link 
                           href="/services" 
                           className="px-2 xl:px-3 py-2 text-sm xl:text-base text-gray-700 hover:text-pink-600 transition duration-300 ease-in-out whitespace-nowrap"
                        >
                           Services
                        </Link>
                        <Link 
                           href="/calendar" 
                           className="px-2 xl:px-3 py-2 text-sm xl:text-base text-gray-700 hover:text-pink-600 transition duration-300 ease-in-out whitespace-nowrap"
                        >
                           Calendar
                        </Link>
                        <Link 
                           href="/your-profile" 
                           className="px-2 xl:px-3 py-2 text-sm xl:text-base text-gray-700 hover:text-pink-600 transition duration-300 ease-in-out whitespace-nowrap"
                        >
                           Profile
                        </Link>
                        <button
                           onClick={handleLogout}
                           className="ml-2 px-3 xl:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-300 ease-in-out whitespace-nowrap"
                        >
                           Logout
                        </button>
                     </>
                  ) : (
                     <>
                        <Link 
                           href="/login" 
                           className="px-2 xl:px-3 py-2 text-sm xl:text-base text-gray-700 hover:text-pink-600 transition duration-300 ease-in-out whitespace-nowrap"
                        >
                           Login
                        </Link>
                        <Link
                           href="/register"
                           className="ml-2 px-3 xl:px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-300 ease-in-out whitespace-nowrap"
                        >
                           Register
                        </Link>
                     </>
                  )}
               </div>

               {/* Mobile menu button - visible on screens smaller than lg */}
               <div className="flex lg:hidden items-center">
                  <button
                     onClick={() => setMenuOpen(!menuOpen)}
                     className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-pink-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500 transition duration-200"
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
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-200"
                        onClick={() => setIsMenuOpen(false)}
                     >
                        Dashboard
                     </Link>
                     <Link
                        href="/bookings"
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-200"
                        onClick={() => setIsMenuOpen(false)}
                     >
                        Bookings
                     </Link>
                     <Link
                        href="/services"
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-200"
                        onClick={() => setIsMenuOpen(false)}
                     >
                        Services
                     </Link>
                     <Link
                        href="/calendar"
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-200"
                        onClick={() => setIsMenuOpen(false)}
                     >
                        Calendar
                     </Link>
                     <Link
                        href="/your-profile"
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-200"
                        onClick={() => setIsMenuOpen(false)}
                     >
                        Profile
                     </Link>
                     <button
                        onClick={() => {
                           handleLogout();
                           setIsMenuOpen(false);
                        }}
                        className="block w-full text-left px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-200"
                     >
                        Logout
                     </button>
                  </>
               ) : (
                  <>
                     <Link
                        href="/login"
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-200"
                        onClick={() => setIsMenuOpen(false)}
                     >
                        Login
                     </Link>
                     <Link
                        href="/register"
                        className="block px-3 py-2.5 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-200"
                        onClick={() => setIsMenuOpen(false)}
                     >
                        Register
                     </Link>
                  </>
               )}
            </div>
         </div>

         {/* Beautiful gradient border at bottom */}
         <div className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500"></div>
      </nav>
   );
};

export default Navbar;