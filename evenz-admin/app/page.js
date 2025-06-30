"use client"
import React, { useState } from 'react';
import { AuthProvider } from './context/AuthContext';
import { useAuth } from './hooks/useAuth';
import { LoginPage } from './components/auth/LoginPage';
import {Dashboard} from './components/dashboard/Dashboard';
import BookingManagement from './components/bookings/BookingManagement';
import Header from './components/layout/Header';
import Sidebar from './components/layout/Sidebar';
import { LoadingSpinner } from './components/common/LoadingSpinner';

// Admin Portal Component
const AdminPortal = () => {
  const [activeTab, setActiveTab] = useState('dashboard');

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
          
          {/* Main Content */}
          <div className="flex-1">
            {activeTab === 'dashboard' && <Dashboard />}
            {activeTab === 'bookings' && <BookingManagement />}
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component
const App = () => {
  const { admin, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  return admin ? <AdminPortal /> : <LoginPage />;
};

// Root Component with Auth Provider
export default function AdminApp() {
  return (
    <AuthProvider>
      <App />
    </AuthProvider>
  );
}