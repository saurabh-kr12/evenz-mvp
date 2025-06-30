"use client"
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/components/AuthPages/login';
import Register from '@/components/AuthPages/Register';
import Dashboard from '@/pages/Dashboard';
import Services from '@/pages/Services';
import Bookings from '@/pages/Bookings';
import Profile from '@/components/ProfilePage/Profile';
import FAQ from '@/pages/FAQ';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { AuthProvider } from '@/context/AuthContext';
import PrivateRoute from '@/components/PrivateRoute';
import AvailabilityCalendar from '@/pages/Calendar';

function App() {

  return (

    <Router>
      <AuthProvider>
        <div>
          <Navbar />
          <main className='bg-gray-50'>
            <Routes>
              {/* Auth Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />



              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/your-profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
              <Route
                path="/calendar"
                element={
                  <PrivateRoute>
                    <AvailabilityCalendar />
                  </PrivateRoute>
                }
              />
              <Route
                path="/bookings"
                element={
                  <PrivateRoute>
                    <Bookings />
                  </PrivateRoute>
                }
              />
              <Route
                path="/services/*"
                element={
                  <PrivateRoute>
                    <Services />
                  </PrivateRoute>
                }
              />
              
              <Route
                path="/faq"
                element={
                  <PrivateRoute>
                    <FAQ />
                  </PrivateRoute>
                }
              />

              {/* Default Route */}
              <Route path="/" element={<Navigate to="/register" />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </AuthProvider>
    </Router>

  );
}

export default App;
