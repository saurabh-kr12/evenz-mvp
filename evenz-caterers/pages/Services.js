"use client";
import React from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { FaUtensils, FaTruck, FaConciergeBell, FaShieldAlt, FaFileContract, FaImages } from 'react-icons/fa';
import MenuCuisinesModule from '@/components/ServicePages/MenuCuisines';
import ServicesLogistics from '@/components/ServicePages/ServiceLogistics';
import CustomizationTasting from '@/components/ServicePages/Customization&Tasting';
import ComplianceSection from '@/components/ServicePages/Compliance';
import LegalPaymentSection from '@/components/ServicePages/Legal';
import ExperienceMedia from '@/components/ServicePages/Media';

const ServiceDashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Get current tab from URL search params, default to 'menu'
  const currentTab = searchParams.get('tab') || 'menu';

  const handleNavigation = (tab) => {
    router.push(`/services?tab=${tab}`);
  };

  const menuItems = [
    { key: 'menu', label: 'Menu & Cuisines', icon: <FaUtensils /> },
    { key: 'services', label: 'Services & Logistics', icon: <FaTruck /> },
    { key: 'customization', label: 'Customization & Tasting', icon: <FaConciergeBell /> },
    { key: 'compliance', label: 'Compliance & Safety', icon: <FaShieldAlt /> },
    { key: 'legal', label: 'Legal & Payment', icon: <FaFileContract /> },
    { key: 'media', label: 'Media', icon: <FaImages /> },
  ];

  const renderContent = () => {
    switch (currentTab) {
      case 'menu':
        return <MenuCuisinesModule />;
      case 'services':
        return <ServicesLogistics />;
      case 'customization':
        return <CustomizationTasting />;
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
                      className={`w-full text-sm flex gap-y-1 items-center px-4 py-3 rounded-md cursor-pointer ${
                        currentTab === item.key 
                          ? 'bg-blue-50 text-blue-700' 
                          : 'text-gray-800 hover:bg-gray-100'
                      }`}
                    >
                      <span className={`mr-3 ${
                        currentTab === item.key ? 'text-blue-700' : 'text-gray-500'
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