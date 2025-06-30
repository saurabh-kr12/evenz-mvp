import React from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { FaUtensils, FaTruck, FaConciergeBell, FaShieldAlt, FaFileContract, FaImages, FaComments } from 'react-icons/fa'; // ✅ updated icons
import MenuCuisinesModule from '@/components/ServicePages/MenuCuisines';
import ServicesLogistics from '@/components/ServicePages/ServiceLogistics';
import CustomizationTasting from '@/components/ServicePages/Customization&Tasting';
import ComplianceSection from '@/components/ServicePages/Compliance';
import LegalPaymentSection from '@/components/ServicePages/Legal';
import ExperienceMedia from '@/components/ServicePages/Media';

const ServiceDashboard = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split('/').pop() || 'menu';

  const handleNavigation = (path) => {
    navigate(`/services/${path}`);
  };

  const menuItems = [
    { key: 'menu', label: 'Menu & Cuisines', icon: <FaUtensils /> }, // 🍽️ food-related
    { key: 'services', label: 'Services & Logistics', icon: <FaTruck /> }, // 🚚 delivery/logistics
    { key: 'customization', label: 'Customization & Tasting', icon: <FaConciergeBell /> }, // 🛎️ service/personalization
    { key: 'compliance', label: 'Compliance & Safety', icon: <FaShieldAlt /> }, // 🛡️ protection/safety
    { key: 'legal', label: 'Legal & Payment', icon: <FaFileContract /> }, // 📄 contracts/legal
    { key: 'media', label: 'Media', icon: <FaImages /> }, // 🖼️ photos/videos
  ];


  return (
    <div className="bg-gray-50">
      <div className="flex px-4 sm:px-6 lg:px-8 py-4 md:py-6 max-w-7xl mx-auto flex-col lg:flex-row sm:gap-6">
        <div className="lg:w-1/5 space-y-6">

          {/* Dropdown Menu for mobile and tablet */}
          <div className="lg:hidden bg-white rounded-lg shadow-sm p-4">
            <select
              value={currentPath}
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
                      className={`w-full text-sm flex gap-y-1 items-center px-4 py-3 rounded-md cursor-pointer ${currentPath === item.key ? 'bg-blue-50 text-blue-700' : 'text-gray-800 hover:bg-gray-100'}`}
                    >
                      <span className={`mr-3 ${currentPath === item.key ? 'text-blue-700' : 'text-gray-500'}`}>{item.icon}</span>
                      <span>{item.label}</span>
                    </button>
                  </li>
                ))}

              </ul>
            </nav>
          </div>
        </div>

        <div className="lg:w-4/5 min-h-screen">
          <Routes>
            <Route index element={<MenuCuisinesModule />} />
            <Route path="menu" element={<MenuCuisinesModule />} />
            <Route path="services" element={<ServicesLogistics />} />
            <Route path="customization" element={<CustomizationTasting />} />
            <Route path="compliance" element={<ComplianceSection />} />
            <Route path="legal" element={<LegalPaymentSection />} />
            <Route path="media" element={<ExperienceMedia />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default ServiceDashboard;
