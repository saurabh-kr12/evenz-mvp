"use client";
import React from 'react';
import Link from 'next/link';
const ComingSoonPage = ({ category }) => {
  const categoryDetails = {
    'photographers': {
      title: 'Photographers',
      description: 'We are currently working on bringing the best photographers for your special day.'
    },
    'decorators': {
      title: 'Decorators',
      description: 'Our team is preparing to connect you with top-notch wedding decorators.'
    },
    'djs': {
      title: 'DJs',
      description: 'Get ready for an exciting lineup of wedding DJs coming soon!'
    }
  };

  const details = categoryDetails[category] || {
    title: 'Service',
    description: 'We are working on bringing this service to you soon.'
  };

  return (
    <div className="bg-gray-50 min-h-screen flex items-center justify-center p-6">
      <div className="text-center max-w-md bg-white p-10 rounded-lg shadow-xl">
        <h1 className="text-3xl font-bold mb-4 text-gray-800">{details.title} Coming Soon</h1>
        <p className="text-gray-600 mb-6">
          Thank you for your patience. We are currently focusing on catering services. 
          {details.description}
        </p>
        <div className="flex flex-col space-y-4">
          <Link 
            href="/catering-services" 
            className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg transition duration-300"
          >
            Find Caterers
          </Link>
          <Link 
            href="/" 
            className="text-purple-600 hover:text-purple-800 transition duration-300"
          >
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ComingSoonPage;