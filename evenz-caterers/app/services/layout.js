"use client";
import React from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { FaUtensils, FaTruck, FaConciergeBell, FaShieldAlt, FaFileContract, FaImages } from 'react-icons/fa';
import useAnalytics from '@/hooks/useAnalytics';
import ProtectedRoute from '@/components/ProtectedRoute';

// This is our new layout component. It wraps every page inside the /services/ folder.
export default function ServicesLayout({ children }) {
    const router = useRouter();
    const pathname = usePathname(); // This hook gets the current URL path
    const { services } = useAnalytics();

    // Determine the current tab from the URL path
    const currentTab = pathname.split('/').pop() || 'menu';

    const handleNavigation = (tab) => {
        services.tabSwitched(currentTab, tab);
        router.push(`/services/${tab}`);
    };

    const menuItems = [
        { key: 'menu', label: 'Menu & Cuisines', icon: <FaUtensils /> },
        { key: 'services', label: 'Counters & Services', icon: <FaTruck /> },
        { key: 'customization', label: 'Guests & Diet Filters', icon: <FaConciergeBell /> },
        { key: 'media', label: 'Experience & Media', icon: <FaImages /> },
        { key: 'legal', label: 'Legal & Payment', icon: <FaFileContract /> },
        { key: 'compliance', label: 'Compliance & Safety', icon: <FaShieldAlt /> },
    ];

    return (
        <ProtectedRoute>
            <div className="bg-gray-50">
                <div className="flex px-4 sm:px-6 lg:px-8 py-4 md:py-6 max-w-7xl mx-auto flex-col lg:flex-row gap-4 sm:gap-6">
                    {/* Sidebar Navigation */}
                    <div className="lg:w-64 lg:flex-shrink-0 mt-0">
                        {/* Dropdown for mobile */}
                        <div className="lg:hidden bg-white rounded-lg shadow-sm p-4">
                            <select
                                value={currentTab}
                                onChange={(e) => handleNavigation(e.target.value)}
                                className="w-full border border-gray-300 rounded-md p-2 text-gray-700"
                            >
                                {menuItems.map((item) => (
                                    <option key={item.key} value={item.key}>
                                        {item.label}
                                    </option>
                                ))}
                            </select>
                        </div>
                        {/* Sidebar for desktop */}
                        <div className="hidden lg:block bg-white rounded-lg shadow-sm p-4">
                            <nav>
                                <ul className="space-y-1">
                                    {menuItems.map((item) => (
                                        <li key={item.key}>
                                            <button
                                                onClick={() => handleNavigation(item.key)}
                                                className={`w-full text-left text-sm flex items-center px-4 py-3 rounded-md ${
                                                    currentTab === item.key
                                                        ? 'bg-blue-50 text-blue-700 font-semibold'
                                                        : 'text-gray-800 hover:bg-gray-100'
                                                }`}
                                            >
                                                <span className={`mr-3 ${currentTab === item.key ? 'text-blue-700' : 'text-gray-500'}`}>
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

                    {/* Page Content */}
                    <div className="flex-1 lg:flex-shrink min-h-screen">
                        {children} {/* This is where the specific page content will be rendered */}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}