// App.js - Main application component
"use client"
import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '../context/AuthContext';
import { Toaster } from 'react-hot-toast';

// Pages
import Register from '../pages/Register';
import Login from '../pages/Login';
import PrivateRoute from '@/components/PrivateRoute';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import HomePage from '../pages/HomePage';
import SearchPage from '../pages/SearchPage';
import UserDashboard from '../pages/UserPages/UserDashboard';
import AboutPage from '../pages/AboutPage';
import ContactPage from '../pages/ContactPage';
import ComingSoonPage from '@/pages/ComingSoon';
import CatererProfileView from '@/pages/VendorProfile';
import BookingRequestForm from '../pages/BookingPage';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<HomePage />} />
              <Route path="/search" element={<SearchPage />} />
              <Route path="/catering-services" element={<SearchPage />} />
              <Route path="/vendors/:id" element={<CatererProfileView />} />
              
              {/* Protected Routes */}
              <Route 
                path="/booking/:vendorId" 
                element={
                  <PrivateRoute>
                    <BookingRequestForm />
                  </PrivateRoute>
                } 
              />
              <Route 
                path="/dashboard/*" 
                element={
                  <PrivateRoute>
                    <UserDashboard />
                  </PrivateRoute>
                } 
              />
              
              {/* Authentication Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Other Routes */}
              <Route path="/about" element={<AboutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/:category" element={<ComingSoonPage />} />
            </Routes>
          </main>
          <Footer />
          <Toaster position="top-center" />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;