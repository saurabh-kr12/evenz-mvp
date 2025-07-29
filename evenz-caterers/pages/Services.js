"use client";
import React from 'react';
import { useState, useEffect } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FaUtensils, FaTruck, FaConciergeBell, FaShieldAlt, FaFileContract, FaImages } from 'react-icons/fa';
import MenuCuisinesModule from '@/components/ServicePages/MenuCuisines';
import CounterNServices from '@/components/ServicePages/Counter&Services';
import GuestnDietFilters from '@/components/ServicePages/GuestnDietFilters';
import ComplianceSection from '@/components/ServicePages/Compliance';
import LegalPaymentSection from '@/components/ServicePages/Legal';
import ExperienceMedia from '@/components/ServicePages/Media';
import useAnalytics from '@/hooks/useAnalytics';

const ServiceDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { services, ui } = useAnalytics();

  // Time tracking state
  const [tabStartTime, setTabStartTime] = useState(Date.now());
  // Get current tab from URL search params, default to 'menu'
  const [currentTab, setCurrentTab] = useState(searchParams.get('tab') || 'menu');

  useEffect(() => {
    // Track initial tab view
    services.tabViewed(currentTab);
    setTabStartTime(Date.now());

    // Cleanup function to track time when user leaves page
    return () => {
      const timeSpent = Math.round((Date.now() - tabStartTime) / 1000);
      services.tabTimeSpent(currentTab, timeSpent);
    };
  }, []);

  // Track tab changes from URL
  useEffect(() => {
    const urlTab = searchParams.get('tab') || 'menu';
    if (urlTab !== currentTab) {
      const timeSpent = Math.round((Date.now() - tabStartTime) / 1000);
      services.tabTimeSpent(currentTab, timeSpent);

      setCurrentTab(urlTab);
      setTabStartTime(Date.now());
      services.tabViewed(urlTab);
    }
  }, [searchParams]);

  const handleNavigation = (tab) => {
    // Track time spent on previous tab
    const timeSpent = Math.round((Date.now() - tabStartTime) / 1000); // in seconds
    services.tabTimeSpent(currentTab, timeSpent);

    // Track tab navigation
    services.tabSwitched(currentTab, tab);

    // Update state and URL
    setCurrentTab(tab);
    setTabStartTime(Date.now());
    router.push(`/services?tab=${tab}`);
  };

  const menuItems = [
    { key: 'menu', label: 'Menu & Cuisines', icon: <FaUtensils /> },
    { key: 'services', label: 'Counters & Services', icon: <FaTruck /> },
    { key: 'customization', label: 'Guests & Diet Filters', icon: <FaConciergeBell /> },
    { key: 'media', label: 'Experience & Media', icon: <FaImages /> },
    { key: 'legal', label: 'Legal & Payment', icon: <FaFileContract /> },
    { key: 'compliance', label: 'Compliance & Safety', icon: <FaShieldAlt /> },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'menu':
        return <MenuCuisinesModule />;
      case 'services':
        return <CounterNServices />;
      case 'customization':
        return <GuestnDietFilters />;
      case 'compliance':
        return <ComplianceSection />;
      case 'legal':
        return <LegalPaymentSection />;
      case 'media':
        return <ExperienceMedia />;
      default:
        return <MenuCuisinesModule />;
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="flex px-4 sm:px-6 lg:px-8 py-4 md:py-6 max-w-7xl mx-auto flex-col lg:flex-row sm:gap-6">
        <div className="lg:w-1/5 space-y-6">
          {/* Dropdown Menu for mobile and tablet */}
          <div className="lg:hidden bg-white rounded-lg shadow-sm p-4">
            <select
              value={currentTab}
              onChange={(e) => handleNavigation(e.target.value)}
              className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
            >
              {menuItems.map((item) => (
                <option className='max-w-full' key={item.key} value={item.key}>
                  {item.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sidebar for large screens */}
          <div className="hidden w-60 lg:block bg-white rounded-lg shadow-sm p-4">
            <nav>
              <ul className="space-y-1">
                {menuItems.map((item) => (
                  <li key={item.key}>
                    <button
                      onClick={() => handleNavigation(item.key)}
                      className={`w-full text-sm flex gap-y-1 items-center px-4 py-3 rounded-md cursor-pointer ${currentTab === item.key
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-800 hover:bg-gray-100'
                        }`}
                    >
                      <span className={`mr-3 ${currentTab === item.key ? 'text-blue-700' : 'text-gray-500'
                        }`}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:w-4/5 min-h-screen">
          {renderContent()}
        </div>
      </div>
    </div>
  );
};

export default ServiceDashboard;