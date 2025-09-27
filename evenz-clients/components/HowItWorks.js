// src/components/HowItWorksClients.js
import React from 'react';
import { Search, UserRoundCheck, CalendarCheck2, MailCheck, Phone, Handshake } from 'lucide-react'; // Added CalendarCheck2 for availability

const HowItWorksClients = () => {
  const steps = [
    {
      icon: <Search className="w-8 h-8 text-indigo-600" />,
      title: "Step 1: Browse Caterers",
      description: "Explore our curated list of professional caterers. Use filters for cuisine, location, and caterer name to find the perfect match for your event needs."
    },
    {
      icon: <UserRoundCheck className="w-8 h-8 text-indigo-600" />,
      title: "Step 2: Visit Caterer Profiles",
      description: "Dive deep into comprehensive caterer profiles. View their menus, packages, photos, and detailed service offerings to make an informed decision."
    },
    {
      icon: <CalendarCheck2 className="w-8 h-8 text-indigo-600" />, // Icon for availability check
      title: "Step 3: Check Real-time Availability",
      description: "Before sending a request, use the 'Check Availability' button on the caterer's profile to see if they are available for your specific event date. This saves you time!"
    },
    {
      icon: <MailCheck className="w-8 h-8 text-indigo-600" />,
      title: "Step 4: Send a Booking Request",
      description: "If available, proceed to the booking request form. The event date will be pre-filled based on your availability check. Fill out your event details, guest count, and any specific requirements. This is free for you!"
    },
    {
      icon: <Phone className="w-8 h-8 text-indigo-600" />,
      title: "Step 5: Caterer Contacts YOU",
      description: "The caterer will review your request. If interested, they will gain access to your contact details and reach out to you directly (via call or WhatsApp) to discuss your event. You do not need to make the first call!"
    },
    {
      icon: <Handshake className="w-8 h-8 text-indigo-600" />,
      title: "Step 6: Discuss & Secure Your Booking",
      description: "Communicate directly with the caterer to finalize menus, pricing, and logistics. All further communication and the final booking agreement happen directly between you and the caterer, with no fees to Evenz.in."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-purple-600 text-center mb-8">
          How Evenz.in Works for Clients
        </h1>
        <p className="text-lg text-gray-600 text-center mb-10 max-w-2xl mx-auto leading-relaxed">
          Finding the perfect caterer for your event is easy with Evenz.in. Follow these simple steps to connect with top-rated professionals in your area, all at no cost to you.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div
              key={index}
              className="flex flex-col items-center text-center p-6 bg-indigo-50 rounded-lg shadow-sm
                         transition-transform duration-300 hover:scale-105 hover:shadow-md"
            >
              <div className="mb-4 p-3 bg-white rounded-full shadow-md">
                {step.icon}
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-3">{step.title}</h2>
              <p className="text-gray-700 leading-relaxed">{step.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <p className="text-lg font-semibold text-gray-800 mb-4">
            Ready to find your perfect caterer?
          </p>
          <a
            href="/catering-services" 
            className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-purple-600 to-pink-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Start Browse Caterers
            <svg className="ml-3 -mr-1 h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fillRule="evenodd" d="M10.293 15.707a1 1 0 010-1.414L14.586 10l-4.293-4.293a1 1 0 111.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M4.293 15.707a1 1 0 010-1.414L8.586 10 4.293 5.707a1 1 0 011.414-1.414l5 5a1 1 0 010 1.414l-5 5a1 1 0 01-1.414 0z" clipRule="evenodd" />
            </svg>
          </a>
        </div>
      </div>
    </div>
  );
};

export default HowItWorksClients;