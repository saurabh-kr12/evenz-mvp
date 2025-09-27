// pages/HomePage.js
"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { FaSearch } from 'react-icons/fa';
import FoundersWord from '@/components/FoundersWord';
import useAnalytics from '@/hooks/useAnalytics';

const HomePage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [hasSearched, setHasSearched] = useState(false);
  const analytics = useAnalytics();

  // Track page view on component mount
  useEffect(() => {
    analytics.trackPageView('home_page', 'landing');
  }, [analytics]);

  // Mock data for Caterers with descriptive image placeholders
  const vendorCategories = [
    {
      id: 'caterers',
      name: 'Caterers',
      description: 'Find the perfect caterers for your special occasions',
      coverImage: 'Gemini_Generated_Image_573rit573rit573r.jpeg'
    },
    {
      id: 'photographers',
      name: 'Photographers',
      description: 'Capture your moments with professional wedding photographers',
      coverImage: 'photography.jpg'
    },
    {
      id: 'decorators',
      name: 'Decorators',
      description: 'Transform your venue with stunning wedding decorations',
      coverImage: 'decoration-coverpage.jpeg'
    },
    {
      id: 'djs',
      name: 'DJs',
      description: 'Keep the celebration alive with our professional wedding DJs',
      coverImage: 'dj-coverpage.jpg'
    }
  ];

  const steps = [
    {
      step: "1",
      title: "Browse Caterers",
      description: "Explore our curated list of verified event Caterers in your city"
    },
    {
      step: "2",
      title: "Check Availability",
      description: "View real-time availability and compare pricing from multiple Caterers"
    },
    {
      step: "3",
      title: "Send Booking Request",
      description: "Connect directly with Caterers and secure your booking with confidence"
    }
  ];

  // Track search input changes
  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    
    // Track search start on first character
    if (!hasSearched && e.target.value.length === 1) {
      analytics.trackCustomEvent('search_started', 'user_engagement', 'hero_search');
      setHasSearched(true);
    }
  };

  // Track search submission
  const handleSearchSubmit = () => {
    if (searchQuery.trim()) {
      analytics.trackSearch(searchQuery.trim(), 0, 'hero_search');
      analytics.trackLinkClick('hero_search', 'search_page', 'primary_cta');
      analytics.trackConversion('search_initiated', 1);
    } else {
      analytics.trackButtonClick('empty_search_click', 'hero_interaction');
    }
  };

  // Track service category clicks
  const handleServiceClick = (categoryId, categoryName) => {
    analytics.trackCustomEvent('service_category_selected', 'service_discovery', categoryName);
    analytics.trackLinkClick(`service_${categoryId}`, `${categoryId}_page`, 'service_navigation');
    
    // Track popular services for business insights
    if (categoryId === 'caterers') {
      analytics.trackCustomEvent('primary_service_clicked', 'business_metric', 'caterers');
    }
  };

  // Track How It Works engagement
  const handleHowItWorksClick = () => {
    analytics.trackLinkClick('how_it_works_detail', 'how_it_works_page', 'informational');
    analytics.trackCustomEvent('learn_more_clicked', 'user_education', 'how_it_works_section');
  };

  // Track vendor signup CTA
  const handleCaterersignupClick = () => {
    analytics.trackLinkClick('vendor_signup', 'vendor_registration', 'conversion_cta');
    analytics.trackCustomEvent('vendor_interest', 'business_growth', 'vendor_cta_clicked');
    analytics.trackConversion('vendor_signup_intent', 1);
  };

  // Track scroll engagement (simplified version)
  useEffect(() => {
    let hasTrackedScroll = false;
    
    const handleScroll = () => {
      if (!hasTrackedScroll && window.scrollY > 300) {
        analytics.trackCustomEvent('page_scroll_engaged', 'user_engagement', 'homepage_scroll');
        hasTrackedScroll = true;
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [analytics]);

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-500 to-purple-600 py-20 px-6 md:px-12 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Find the Perfect Caterers for Your Special events</h1>
          <p className="text-xl mb-10">Browse, compare, and book best Caterers in Patna</p>
          <div className="bg-white rounded-lg shadow-lg p-2 flex flex-col md:flex-row">
            <input
              type="text"
              placeholder="Search by area in Patna..."
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => analytics.trackCustomEvent('search_focus', 'user_engagement', 'hero_search_input')}
              className="flex-grow p-3 outline-none text-gray-700 rounded-lg md:rounded-r-none"
            />
            <Link 
              href="/search" 
              onClick={handleSearchSubmit}
              className="mt-2 md:mt-0 bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg md:rounded-l-none transition duration-300 flex items-center justify-center"
            >
              <FaSearch className="mr-2" /> Find Caterers
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-4">
              How Evenz.in Works
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Getting your perfect event organized is just three simple steps away
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 lg:gap-12">
            {steps.map((step, index) => (
              <div 
                key={index} 
                className="relative text-center group"
                onClick={() => analytics.trackCustomEvent('process_step_viewed', 'user_education', `step_${step.step}_${step.title.toLowerCase().replace(' ', '_')}`)}
              >
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full flex items-center justify-center text-white text-2xl font-bold shadow-lg group-hover:shadow-xl transition-shadow">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {step.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {step.description}
                </p>

                {/* Connector line for desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden md:block absolute top-8 left-1/2 w-full h-0.5 bg-gradient-to-r from-purple-200 to-pink-200 transform translate-x-8 -z-10"></div>
                )}
              </div>
            ))}
          </div>
          <div className='flex items-center mt-3 sm:mt-6 justify-center'>
            <Link
              href={'/how-it-works'}
              onClick={handleHowItWorksClick}
              className='bg-gradient-to-l font-semibold from-purple-600 to-pink-600 py-3 px-4 text-white rounded-md text-white"'
            >
              Learn more..
            </Link>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 px-6 md:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {vendorCategories.map(category => (
              <Link
                href={category.id === 'caterers' ? '/catering-services' : `/${category.id}`}
                key={category.id}
                onClick={() => handleServiceClick(category.id, category.name)}
                onMouseEnter={() => analytics.trackCustomEvent('service_hover', 'user_interaction', category.name)}
                className="block bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div className="relative">
                  <img
                    src={category.coverImage}
                    alt={category.name}
                    className="w-full h-64 object-cover"
                    onError={() => analytics.trackError('image_load_error', category.coverImage, 'homepage')}
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-l from-purple-500 to-pink-600 p-4 text-white">
                    <h3 className="text-2xl font-bold">{category.name}</h3>
                    <p className="text-sm">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className=" px-4 bg-white">
        <FoundersWord/>
      </section>

      {/* Join as Vendor CTA */}
      <section className="py-16 px-6 md:px-12 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Are You a Caterer?</h2>
          <p className="text-xl mb-8">Join our platform to get more bookings and grow your business</p>
          <a
            href="http://localhost:3001/register"
            target='_blank'
            onClick={handleCaterersignupClick}
            className="inline-block bg-white text-purple-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300">
            Join as a Caterer
          </a>
        </div>
      </section>
    </div>
  );
};

export default HomePage;