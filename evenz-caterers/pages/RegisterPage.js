"use client";
import React from 'react';
import RegistrationForm from '@/components/AuthPages/Register';
import Image from 'next/image';

const RegisterPage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br text-gray-700 from-indigo-50 via-white to-cyan-50 flex xl:flex-row">
      {/* Left side - Image (only on extra large screens) */}
      <div className="hidden xl:flex xl:w-1/2 relative overflow-hidden">
        <div className='relative w-full h-full'>
          <Image
            src="/catering_services_img.jpeg"
            alt="Catering Business"
            fill
            className="object-cover"
          />
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-indigo-900/80 to-purple-900/60"></div>
        <div className="absolute inset-0 flex items-center justify-center p-8">
          <div className="text-center text-white max-w-md">
            <div className="mb-8">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-6 backdrop-blur-sm">
                <Image
                  src="/Evenz_app_logo.png"
                  alt="logo"
                  fill
                />
              </div>
              <h2 className="text-3xl font-bold mb-4">Welcome to Evenz.in</h2>
              <p className="text-white/90 text-lg leading-relaxed">
                Streamline your catering business with our comprehensive management platform
              </p>
            </div>
            <div className="space-y-4 text-sm text-white/80">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <span>No Subscription fee </span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <span>Pay-per-request model</span>
              </div>
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-white/60 rounded-full"></div>
                <span>Manage Your Availability Calendar</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side - RegisterPage Form */}
      <div className="flex-1 flex flex-col ">
        <div className="w-full mx-auto">
          <RegistrationForm />
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;