// src/components/AboutUs.js
import React from 'react';

const AboutUs = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            About Evenz.in
          </h1>
          <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto rounded-full"></div>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          {/* Hero Section */}
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 px-8 py-12 text-white">
            <h2 className="text-2xl font-semibold mb-4">
              Your Premier Destination for Exceptional Catering
            </h2>
            <p className="text-lg leading-relaxed opacity-90">
              Welcome to Evenz.in, where we connect exceptional caterers with clients planning memorable events across India, starting with Patna, Bihar. We believe that every event, big or small, deserves extraordinary food and seamless service.
            </p>
          </div>

          {/* Content Sections */}
          <div className="px-8 py-12 space-y-12">
            {/* Important Notice */}
            <div className="bg-amber-50 border-l-4 border-amber-400 p-6 rounded-r-lg">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-amber-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <h3 className="text-lg font-medium text-amber-800 mb-2">
                    Important Notice
                  </h3>
                  <p className="text-amber-700 leading-relaxed">
                    Evenz.in operates solely as a technology platform to facilitate connections between clients seeking catering services and professional caterers. <strong>We do not directly provide catering services, nor do we assume responsibility for the ultimate booking, service delivery, payment, or any agreements made directly between clients and caterers.</strong> Our role is limited to providing a platform for discovery, lead generation and initial connection, allowing caterers to access client contact details to reach out directly.
                  </p>
                </div>
              </div>
            </div>

            {/* Our Vision */}
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  Our Vision
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  Our platform was founded with a simple vision: to make the process of finding and booking the perfect caterer as effortless as possible. We&apos;re passionate about bringing people together through the joy of food.
                </p>
              </div>
              <div className="bg-gray-50 p-6 rounded-lg">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <p className="text-gray-700 font-medium">Seamless Connections</p>
                </div>
              </div>
            </div>

            {/* For Clients & Caterers */}
            <div className="grid md:grid-cols-2 gap-8">
              {/* For Clients */}
              <div className="bg-blue-50 p-8 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">For Clients</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Evenz.in offers a curated selection of verified caterers, transparent pricing, and comprehensive service details, and
                   <strong> unique real-time availability data </strong>
                   allowing you to compare options and make informed decisions with confidence.
                </p>
              </div>

              {/* For Caterers */}
              <div className="bg-green-50 p-8 rounded-lg">
                <div className="flex items-center mb-4">
                  <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mr-4">
                    <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900">For Caterers</h3>
                </div>
                <p className="text-gray-700 leading-relaxed">
                  Evenz.in serves as a powerful tool to expand your reach, manage booking requests efficiently, and showcase your culinary artistry to a wider audience. 
                  <strong>Unlike many other platforms, we operate on a fair pay-per-reqeust model, meaning you only pay for the leads you choose to pursue, with no burdensome monthly or yearly subscription fees.</strong>
                  We connect you with genuine leads and provide a platform to highlight your unique offerings.
                </p>
              </div>
            </div>

            {/* Our Commitment */}
            <div className="text-center bg-gray-50 p-8 rounded-lg">
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Our Commitment
              </h3>
              <p className="text-gray-600 leading-relaxed max-w-3xl mx-auto mb-6">
                We are committed to providing a reliable, user-friendly, and transparent marketplace that benefits both our clients and our valued catering partners. Our team works tirelessly to ensure the best possible experience for everyone in the Evenz.in community.
              </p>
              <div className="flex justify-center space-x-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Reliable</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">User-Friendly</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-2">
                    <svg className="w-8 h-8 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </div>
                  <p className="text-sm font-medium text-gray-700">Transparent</p>
                </div>
              </div>
            </div>

            {/* Thank You */}
            <div className="text-center border-t border-gray-200 pt-8">
              <h3 className="text-xl font-semibold text-gray-900 mb-4">
                Thank You for Being Part of Our Community
              </h3>
              <p className="text-gray-600 leading-relaxed">
                We look forward to helping you create unforgettable culinary experiences!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutUs;