"use client"
import React from 'react';
import { UserPlus, Settings, Mail, Wallet, PhoneCall, Award, ArrowRight, ArrowDown, Trophy, Star } from 'lucide-react';

const HowItWorksCaterers = () => {
  const steps = [
    {
      icon: <UserPlus className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />,
      title: "Register Your Business",
      description: "Create your caterer account with essential personal and business details. Quick setup ensures compliance and builds trust with clients.",
      color: "from-blue-500 to-blue-600",
      level: 1
    },
    {
      icon: <Settings className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />,
      title: "Build Your Profile",
      description: "Complete your dedicated dashboard with catering packages, cuisines, services(e.g., live counters, service types), media, and pricing. Keep your real-time availability updated. A comprehensive profile attracts more qualified leads.",
      color: "from-purple-500 to-purple-600",
      level: 2
    },
    {
      icon: <Mail className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />,
      title: "Receive Requests",
      description: "Clients discover your services through our advanced search and send targeted booking requests directly to your dashboard.",
      color: "from-emerald-500 to-emerald-600",
      level: 3
    },
    {
      icon: <Wallet className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />,
      title: "Unlock Client Contact",
      description: "Review requests and pay ₹200 per lead to access client's direct contact information. No subscriptions, just pay per qualified lead.",
      color: "from-orange-500 to-orange-600",
      level: 4
    },
    {
      icon: <PhoneCall className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />,
      title: "Connect & Convert",
      description: "Reach out directly via phone or WhatsApp to discuss requirements, negotiate terms, and secure bookings off-platform.",
      color: "from-teal-500 to-teal-600",
      level: 5
    },
    {
      icon: <Award className="w-5 h-5 sm:w-6 sm:h-6 lg:w-7 lg:h-7 text-white" />,
      title: "Grow Your Business",
      description: "Deliver exceptional service, collect reviews, and expand your clientele through our platform's extensive reach and lead management tools.",
      color: "from-indigo-500 to-indigo-600",
      level: 6
    }
  ];

  const ConnectingArrow = ({ direction = "right", className = "" }) => (
    <div className={`hidden md:flex items-center justify-center ${className}`}>
      <div className="flex items-center">
        <div className="w-8 h-8 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center animate-pulse">
          {direction === "right" ? (
            <ArrowRight className="w-4 h-4 text-white" />
          ) : (
            <ArrowDown className="w-4 h-4 text-white" />
          )}
        </div>
      </div>
    </div>
  );

  const MobileConnectingArrow = () => (
    <div className="md:hidden flex justify-center my-4">
      <div className="flex items-center">
        <div className="w-6 h-6 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full flex items-center justify-center animate-bounce">
          <ArrowDown className="w-3 h-3 text-white" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8 sm:pt-12 lg:pt-16 pb-4 sm:pb-8 lg:pb-12">
          <div className="text-center">       
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6">
              How Evenz.in Works
              <span className="block text-2xl sm:text-3xl md:text-4xl lg:text-5xl bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mt-1 sm:mt-2">
                for Caterers
              </span>
            </h1>
            <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl lg:max-w-3xl mx-auto leading-relaxed px-4">
              Transform your catering business with our platform designed to connect you with quality clients and streamline your operations.
            </p>
          </div>
        </div>
      </div>

      {/* Steps Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 lg:pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 relative">
          {steps.map((step, index) => (
            <React.Fragment key={index}>
              <div className="group relative bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-xl transition-all duration-500 hover:-translate-y-1">
                {/* Level Badge */}
                <div className="absolute top-3 sm:top-4 right-3 sm:right-4 z-10">
                  <div className={`inline-flex items-center px-2 py-1 sm:px-3 sm:py-1 bg-gradient-to-r ${step.color} rounded-full text-white text-xs sm:text-sm font-bold shadow-lg`}>
                    Level {step.level}
                  </div>
                </div>

                {/* Gradient Background */}
                <div className={`absolute inset-0 bg-gradient-to-br ${step.color} opacity-0 group-hover:opacity-5 transition-opacity duration-500`}></div>
                
                {/* Content */}
                <div className="relative p-4 sm:p-6 lg:p-8">
                  {/* Step Number and Icon */}
                  <div className="flex items-center justify-between mb-4 sm:mb-6 mt-6 sm:mt-8">
                    <div className={`inline-flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14 rounded-xl bg-gradient-to-r ${step.color} shadow-lg transform group-hover:scale-110 transition-transform duration-300`}>
                      {step.icon}
                    </div>
                    <div className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-300 group-hover:text-gray-400 transition-colors">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg sm:text-xl lg:text-2xl font-bold text-gray-900 mb-3 sm:mb-4 group-hover:text-gray-800 transition-colors">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm sm:text-base lg:text-lg text-gray-600 leading-relaxed">
                    {step.description}
                  </p>

                  {/* Progress Indicator */}
                  <div className="mt-4 sm:mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-1.5 sm:h-2">
                      <div className={`bg-gradient-to-r ${step.color} h-1.5 sm:h-2 rounded-full w-0 group-hover:w-full transition-all duration-1000 ease-out`}></div>
                    </div>
                  </div>
                </div>
              </div>
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* Achievement Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        {/* Floating Achievement Icons */}
        <div className="absolute top-8 left-8 opacity-20">
          <Trophy className="w-8 h-8 text-yellow-300 animate-bounce" />
        </div>
        <div className="absolute bottom-8 right-8 opacity-20">
          <Star className="w-6 h-6 text-yellow-400 animate-pulse" />
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20 text-center">
          <div className="inline-flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-white/20 rounded-full text-xs sm:text-sm font-medium text-white mb-4 sm:mb-6">
            <Award className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
            Unlock Your Potential
          </div>
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4">
            Ready to Level Up?
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-blue-100 mb-6 sm:mb-8 max-w-xl lg:max-w-2xl mx-auto px-4">
            Join the list of successful caterers who have grown their business with Evenz.in
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
            <a
              href="/register"
              className="w-full sm:w-auto inline-flex items-center justify-center px-6 sm:px-8 py-3 sm:py-4 bg-white text-blue-600 font-semibold rounded-xl shadow-lg hover:bg-gray-50 hover:shadow-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              Start Your Journey
              <ArrowRight className="ml-2 h-4 w-4 sm:h-5 sm:w-5" />
            </a>
          </div>
        </div>
      </div>

      {/* Bottom Stats */}
      <div className="bg-white border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 text-center">
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-blue-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-blue-600 font-bold text-sm sm:text-base lg:text-lg">₹0</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">No Setup Fees</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Start for free with no upfront costs</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-emerald-600 font-bold text-sm sm:text-base lg:text-lg">∞</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Unlimited Leads</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Access to endless opportunities</p>
            </div>

            <div className="flex flex-col items-center">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-purple-100 rounded-full flex items-center justify-center mb-3 sm:mb-4">
                <span className="text-purple-600 font-bold text-sm sm:text-base lg:text-lg">20+</span>
              </div>
              <h3 className="font-semibold text-gray-900 mb-1 sm:mb-2 text-sm sm:text-base">Active Caterers</h3>
              <p className="text-gray-600 text-xs sm:text-sm">Join our growing community</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksCaterers;