'use client';
import React, { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { FaUser, FaCalendarCheck, FaHeart, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '@/context/AuthContext';
import { User } from 'lucide-react';
import useAnalytics from '@/hooks/useAnalytics';

const UserDashboard = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const currentPath = pathname.split('/').pop();
  const { logout, currentUser } = useAuth();
  const analytics = useAnalytics();

  // Track dashboard page views
  useEffect(() => {
    analytics.trackPageView('user_dashboard', 'dashboard');
  }, []);

  // Track current tab changes
  useEffect(() => {
    if (currentPath && currentPath !== 'dashboard') {
      analytics.trackCustomEvent('dashboard_tab_view', 'navigation', `dashboard_${currentPath}`);
    }
  }, [currentPath]);

  const handleLogout = () => {
    analytics.trackAuth('logout', true);
    logout();
    router.push('/');
  };

  const handleNavigation = (path) => {
    analytics.trackCustomEvent('dashboard_navigation', 'navigation', `dashboard_${path}`);
    router.push(`/dashboard/${path}`);
  };

  const menuItems = [
    { key: 'profile', label: 'Profile', icon: <FaUser /> },
    { key: 'bookings', label: 'Bookings', icon: <FaCalendarCheck /> },
    { key: 'shortlists', label: 'Shortlists', icon: <FaHeart /> }
  ];

  return (
    <div className="bg-gray-50">
      <div className="flex px-4 sm:px-6 lg:px-8 py-4 md:py-6 max-w-7xl mx-auto flex-col lg:flex-row gap-6">
        <div className="lg:w-1/4 space-y-6">
          <div className="bg-white rounded-lg shadow-md p-4 sm:p-6">
            <div className="flex items-center">
              {/* <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full overflow-hidden mr-4 border-2 border-pink-200">
                <img
                  src="/cat_profile_pic.jpg"
                  alt={currentUser?.name || "User"}
                  className="w-full h-full object-cover"
                />
              </div> */}
              <User className="w-8 h-8 sm:w-12 sm:h-12 text-blue-700 mr-4" />
              <div>
                <p className="text-sm sm:text-base text-gray-600">Hello,</p>
                <h2 className="text-lg sm:text-xl font-semibold text-gray-800">
                  {currentUser?.name || "User"}
                </h2>
              </div>
            </div>
          </div>

          {/* Dropdown Menu for mobile and tablet */}
          <div className="lg:hidden bg-white rounded-lg shadow-sm p-4">
            <select
              value={currentPath}
              onChange={(e) => {
                if (e.target.value === 'logout') {
                  analytics.trackButtonClick('mobile_logout', 'authentication');
                  handleLogout();
                } else {
                  analytics.trackCustomEvent('mobile_menu_select', 'navigation', `mobile_${e.target.value}`);
                  handleNavigation(e.target.value);
                }
              }}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
            >
              {menuItems.map((item) => (
                <option className='max-w-full' key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
              <option value="logout">Logout</option>
            </select>
          </div>

          {/* Sidebar for large screens */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm p-4">
            <nav>
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.key}>
                    <button
                      onClick={() => {
                        analytics.trackButtonClick(`sidebar_${item.key}`, 'navigation');
                        handleNavigation(item.key);
                      }}
                      className={`w-full flex items-center px-4 py-3 rounded-md cursor-pointer ${currentPath === item.key ? 'bg-blue-50 text-blue-700' : 'text-gray-800 hover:bg-gray-100'}`}
                    >
                      <span className={`mr-3 ${currentPath === item.key ? 'text-blue-700' : 'text-gray-500'}`}>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
                <li className="border-t border-gray-200 pt-2 mt-2">
                  <button
                    onClick={() => {
                      analytics.trackButtonClick('sidebar_logout', 'authentication');
                      handleLogout();
                    }}
                    className="w-full flex items-center px-4 py-3 text-gray-800 hover:bg-gray-100 rounded-md cursor-pointer"
                  >
                    <FaSignOutAlt className="mr-3 text-gray-500" />
                    <span>Logout</span>
                  </button>
                </li>
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:w-3/4 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;