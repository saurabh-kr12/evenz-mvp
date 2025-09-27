"use client";
import React, { useEffect } from 'react';
import Link from 'next/link';
import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa';
import { Instagram, Twitter, Linkedin, Facebook } from 'lucide-react';
import useAnalytics from '@/hooks/useAnalytics';

const Footer = () => {
  const analytics = useAnalytics();

  // Track footer render
  useEffect(() => {
    analytics.trackPageView('footer_loaded', 'navigation');
  }, []);

  const handleSocialClick = (platform) => {
    analytics.trackLinkClick(`social_${platform}`, platform, 'social_media');
  };

  const handleFooterLinkClick = (linkName, destination) => {
    analytics.trackLinkClick(`footer_${linkName}`, destination, 'footer_navigation');
  };

  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      {/* Top gradient border */}
      <div className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 mb-8"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Section */}
          <div className="mb-6 text-center md:text-left">
            <h3 className="text-2xl font-bold mb-4">Evenz.in</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Connecting you with the best caterers in Patna for your special occasions.
            </p>

          </div>

          {/* Quick Links */}
          <div className="mb-6 text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/"
                  className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start"
                  onClick={() => handleFooterLinkClick('home', 'home')}
                >
                  <span className="h-1 w-1 bg-pink-500 rounded-full mr-2 hidden md:block"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link
                  href="/search"
                  className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start"
                  onClick={() => handleFooterLinkClick('search', 'search')}
                >
                  <span className="h-1 w-1 bg-pink-500 rounded-full mr-2 hidden md:block"></span>
                  Find Caterers
                </Link>
              </li>
              <li>
                <Link
                  href="/how-it-works"
                  className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start"
                  onClick={() => handleFooterLinkClick('how_it_works', 'how_it_works')}
                >
                  <span className="h-1 w-1 bg-pink-500 rounded-full mr-2 hidden md:block"></span>
                  How It Works
                </Link>
              </li>
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start"
                  onClick={() => handleFooterLinkClick('about', 'about')}
                >
                  <span className="h-1 w-1 bg-pink-500 rounded-full mr-2 hidden md:block"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start"
                  onClick={() => handleFooterLinkClick('faq', 'faq')}
                >
                  <span className="h-1 w-1 bg-pink-500 rounded-full mr-2 hidden md:block"></span>
                  FAQ
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start"
                  onClick={() => handleFooterLinkClick('contact', 'contact')}
                >
                  <span className="h-1 w-1 bg-pink-500 rounded-full mr-2 hidden md:block"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Vendors */}
          <div className="mb-6 text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">For Caterers</h4>
            <ul className="space-y-2">
              <li>
                <a
                  href="https://vendors.evenz.in/register"
                  target='_blank'
                  className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start"
                  onClick={() => handleFooterLinkClick('vendor_register', 'vendor_registration')}
                >
                  <span className="h-1 w-1 bg-pink-500 rounded-full mr-2 hidden md:block"></span>
                  Join as Caterer
                </a>
              </li>
              <li>
                <Link
                  href="/caterer-faq"
                  className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start"
                  onClick={() => handleFooterLinkClick('caterer_faq', 'caterer_faq')}
                >
                  <span className="h-1 w-1 bg-pink-500 rounded-full mr-2 hidden md:block"></span>
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Section */}
          <div className="mb-6 text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Contact Us</h4>
            <div className="space-y-3">
              <p className="text-gray-300 flex items-start justify-center md:justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z" />
                  <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z" />
                </svg>
                <a
                  href="mailto:info@evenz.in"
                  onClick={() => analytics.trackCustomEvent('contact_email_click', 'contact', 'email')}
                >
                  info@evenz.in
                </a>
              </p>
              <div className="mt-6 gap-4 flex items-start justify-center md:justify-start">
                {[
                  { href: "https://instagram.com/evenz_in", Icon: Instagram },
                  { href: "https://x.com/Evenz_in", Icon: Twitter },
                  { href: "https://linkedin.com/company/evenz-india", Icon: Linkedin },
                  { href: "https://www.facebook.com/Evenz.inOfficial", Icon: Facebook }
                ].map(({ href, Icon }) => (
                  <a
                    key={href}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-100 hover:text-pink-500 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-gray-200 hover:text-gray-400" />
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer Bottom */}
        <div className="mt-12 pt-6 border-t border-gray-800">
          <div className="flex flex-col md:flex-row md:justify-between items-center">
            <p className="text-gray-400 text-sm mb-4 md:mb-0">
              &copy; {new Date().getFullYear()} Evenz.in. All rights reserved.
            </p>
            <div className="flex space-x-6">
              <Link
                href="/terms"
                className="text-gray-400 hover:text-pink-500 text-sm transition duration-300 ease-in-out"
                onClick={() => handleFooterLinkClick('terms', 'terms')}
              >
                Terms of Service
              </Link>
              <Link
                href="/privacy"
                className="text-gray-400 hover:text-pink-500 text-sm transition duration-300 ease-in-out"
                onClick={() => handleFooterLinkClick('privacy', 'privacy')}
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;