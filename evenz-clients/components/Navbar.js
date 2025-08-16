'use client';
import React, { useState, useContext, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FaUser, FaBars, FaTimes, FaChevronDown, FaCalendarCheck, FaHeart, FaBell, FaSignOutAlt } from 'react-icons/fa';
import { User } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import useAnalytics from '@/hooks/useAnalytics';

const Navbar = ({ User, setUser }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const router = useRouter();
  const { logout, currentUser } = useAuth();
  const analytics = useAnalytics();

  // Track navbar render
  useEffect(() => {
    analytics.trackPageView('navbar_loaded', 'navigation');
  }, []);

  const handleLogout = () => {
    analytics.trackAuth('logout', true);
    logout();
    router.push('/');
  };

  const handleTabChange = (path) => {
    analytics.trackCustomEvent('navbar_navigation', 'navigation', path);
    router.push(path);
    setDropdownOpen(false);
  };

  const handleMenuToggle = () => {
    const newMenuState = !menuOpen;
    setMenuOpen(newMenuState);
    analytics.trackButtonClick(`mobile_menu_${newMenuState ? 'open' : 'close'}`, 'navigation');
  };

  const handleDropdownToggle = () => {
    const newDropdownState = !dropdownOpen;
    setDropdownOpen(newDropdownState);
    analytics.trackCustomEvent('user_dropdown', 'navigation', newDropdownState ? 'opened' : 'closed');
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link 
              href={currentUser ? "/dashboard" : "/"} 
              className="flex-shrink-0 flex items-center"
              onClick={() => analytics.trackLinkClick('logo', currentUser ? 'dashboard' : 'home', 'branding')}
            >
              <span className="text-2xl font-bold text-pink-600">Evenz.in</span>
            </Link>
          </div>

          {/* Desktop menu */}
          {currentUser ? (
            // Logged in state - show only profile dropdown
            <div className="hidden md:flex items-center">
              <div className="relative">
                <div
                  className="flex items-center cursor-pointer px-2 py-1 rounded-md hover:bg-gray-100 transition-colors"
                  onClick={handleDropdownToggle}
                  onMouseEnter={() => setDropdownOpen(true)}
                >
                 
                    <FaUser className="mr-3 fill-blue-700"/>
                  
                  <span className="text-gray-700 font-semibold">{currentUser.name}</span>
                  <FaChevronDown className="ml-2 text-gray-500" />
                </div>

                <div
                  className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-50"
                  style={{ display: dropdownOpen ? 'block' : 'none' }}
                  onMouseEnter={() => setDropdownOpen(true)}
                  onMouseLeave={() => setDropdownOpen(false)}
                >
                  <div
                    className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      analytics.trackLinkClick('dropdown_profile', 'profile', 'user_menu');
                      handleTabChange('/dashboard/profile');
                    }}
                  >
                    <FaUser className="mr-3 fill-blue-700 " />
                    <span className="text-gray-800">My Profile</span>
                  </div>
                  <div
                    className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      analytics.trackLinkClick('dropdown_bookings', 'bookings', 'user_menu');
                      handleTabChange('/dashboard/bookings');
                    }}
                  >
                    <FaCalendarCheck className="mr-3 fill-blue-700" />
                    <span className="text-gray-800">My Bookings</span>
                  </div>
                  <div
                    className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      analytics.trackLinkClick('dropdown_shortlists', 'shortlists', 'user_menu');
                      handleTabChange('/dashboard/shortlists');
                    }}
                  >
                    <FaHeart className="mr-3 fill-blue-700" />
                    <span className="text-gray-800">Shortlists</span>
                  </div>
                  <div className="border-t border-gray-200 my-1"></div>
                  <div
                    className="flex items-center px-4 py-3 hover:bg-gray-100 cursor-pointer"
                    onClick={() => {
                      analytics.trackButtonClick('dropdown_logout', 'authentication');
                      handleLogout();
                    }}
                  >
                    <FaSignOutAlt className="mr-3 fill-blue-700" />
                    <span className="text-gray-800">Logout</span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            // Not logged in state - show regular menu
            <div className="hidden md:flex items-center space-x-4">
              <Link 
                href="/" 
                className="px-3 py-2 text-gray-700 hover:text-pink-600 transition duration-300 ease-in-out"
                onClick={() => analytics.trackLinkClick('nav_home', 'home', 'main_nav')}
              >
                Home
              </Link>
              <Link 
                href="/search" 
                className="px-3 py-2 text-gray-700 hover:text-pink-600 transition duration-300 ease-in-out"
                onClick={() => analytics.trackLinkClick('nav_search', 'search', 'main_nav')}
              >
                Find Caterers
              </Link>
              <Link 
                href="/about" 
                className="px-3 py-2 text-gray-700 hover:text-pink-600 transition duration-300 ease-in-out"
                onClick={() => analytics.trackLinkClick('nav_about', 'about', 'main_nav')}
              >
                About
              </Link>
              <Link 
                href="/contact" 
                className="px-3 py-2 text-gray-700 hover:text-pink-600 transition duration-300 ease-in-out"
                onClick={() => analytics.trackLinkClick('nav_contact', 'contact', 'main_nav')}
              >
                Contact
              </Link>
              <Link 
                href="/login" 
                className="px-4 py-2 text-gray-700 hover:text-pink-600 font-medium transition duration-300 ease-in-out"
                onClick={() => analytics.trackLinkClick('nav_login', 'login', 'authentication')}
              >
                Login
              </Link>
              <a
                href='http://localhost:3001/register'
                target="_blank"
                rel="noopener noreferrer"
                className="ml-2 px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600  transition duration-300 ease-in-out"
                onClick={() => analytics.trackLinkClick('vendor_signup', 'vendor_portal', 'conversion')}
              >
                Are you a Vendor?
              </a>
            </div>
          )}

          {/* Mobile menu button */}
          <div className="flex md:hidden items-center">
            <button
              onClick={handleMenuToggle}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-700 hover:text-pink-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-pink-500"
            >
              {menuOpen ? <FaTimes className="block h-6 w-6" /> : <FaBars className="block h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className={`${menuOpen ? 'block' : 'hidden'} md:hidden bg-white shadow-lg`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {currentUser ? (
            // Logged in currentUser mobile menu - show currentUser menu options
            <>
              <div
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-300 ease-in-out cursor-pointer"
                onClick={() => {
                  analytics.trackLinkClick('mobile_profile', 'profile', 'mobile_nav');
                  handleTabChange('/dashboard/profile');
                  setMenuOpen(false);
                }}
              >
                <FaUser className="mr-3 fill-blue-700" />
                <span>My Profile</span>
              </div>
              <div
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-300 ease-in-out cursor-pointer"
                onClick={() => {
                  analytics.trackLinkClick('mobile_bookings', 'bookings', 'mobile_nav');
                  handleTabChange('/dashboard/bookings');
                  setMenuOpen(false);
                }}
              >
                <FaCalendarCheck className="mr-3 fill-blue-700" />
                <span>My Bookings</span>
              </div>
              <div
                className="flex items-center px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-300 ease-in-out cursor-pointer"
                onClick={() => {
                  analytics.trackLinkClick('mobile_shortlists', 'shortlists', 'mobile_nav');
                  handleTabChange('/dashboard/shortlists');
                  setMenuOpen(false);
                }}
              >
                <FaHeart className="mr-3 fill-blue-700" />
                <span>Shortlists</span>
              </div>
              <div className="border-t border-gray-200 my-2"></div>
              <button
                onClick={() => {
                  analytics.trackButtonClick('mobile_logout', 'authentication');
                  handleLogout();
                  setMenuOpen(false);
                }}
                className="w-full flex items-center px-3 py-2 rounded-md text-base font-medium text-white bg-pink-600 hover:bg-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-300 ease-in-out"
              >
                <FaSignOutAlt className="mr-3" />
                <span>Logout</span>
              </button>
            </>
          ) : (
            // Not logged in mobile menu - show regular menu
            <>
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-300 ease-in-out"
                onClick={() => {
                  analytics.trackLinkClick('mobile_home', 'home', 'mobile_nav');
                  setMenuOpen(false);
                }}
              >
                Home
              </Link>
              <Link
                href="/search"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-300 ease-in-out"
                onClick={() => {
                  analytics.trackLinkClick('mobile_search', 'search', 'mobile_nav');
                  setMenuOpen(false);
                }}
              >
                Find Caterers
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-300 ease-in-out"
                onClick={() => {
                  analytics.trackLinkClick('mobile_about', 'about', 'mobile_nav');
                  setMenuOpen(false);
                }}
              >
                About
              </Link>
              <Link
                href="/contact"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-300 ease-in-out"
                onClick={() => {
                  analytics.trackLinkClick('mobile_contact', 'contact', 'mobile_nav');
                  setMenuOpen(false);
                }}
              >
                Contact
              </Link>
              <Link
                href="/login"
                className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-pink-600 hover:bg-gray-50 transition duration-300 ease-in-out"
                onClick={() => {
                  analytics.trackLinkClick('mobile_login', 'login', 'mobile_nav');
                  setMenuOpen(false);
                }}
              >
                Login
              </Link>
              <a
                href='http://localhost:3001/#/login'
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 rounded-md text-base font-medium text-white bg-gradient-to-r from-purple-600 to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-pink-500 transition duration-300 ease-in-out mt-2"
                onClick={() => {
                  analytics.trackLinkClick('mobile_vendor_signup', 'vendor_portal', 'conversion');
                  setMenuOpen(false);
                }}
              >
                Are you a Vendor?
              </a>
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