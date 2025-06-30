"use client"
import React from 'react';
import { BarChart3, Calendar } from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const navigation = [
    { id: 'dashboard', name: 'Dashboard', icon: BarChart3 },
    { id: 'bookings', name: 'Bookings', icon: Calendar },
  ];

  return (
    <div className="lg:w-64">
      <nav className="space-y-2">
        {navigation.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left rounded-lg transition-colors ${
                activeTab === item.id
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              <Icon className="w-5 h-5" />
              {item.name}
            </button>
          );
        })}
      </nav>
    </div>
  );
};

export default Sidebar;