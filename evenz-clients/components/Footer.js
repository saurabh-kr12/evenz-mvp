import React from 'react';
import { Link } from 'react-router-dom';
import { FaFacebook, FaInstagram, FaTwitter, FaWhatsapp } from 'react-icons/fa';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white pt-12 pb-6">
      {/* Top gradient border */}
      <div className="h-1 bg-gradient-to-r from-pink-500 via-purple-500 to-pink-500 mb-8"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Section */}
          <div className="mb-6 text-center md:text-left">
            <h3 className="text-2xl font-bold text-pink-500 mb-4">Evenz.in</h3>
            <p className="text-gray-300 mb-6 leading-relaxed">
              Connecting you with the best vednors in Patna for your special occasions.
            </p>
            <div className="flex justify-center md:justify-start space-x-4">
              <a href="#" className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out">
                <FaFacebook className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out">
                <FaInstagram className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out">
                <FaTwitter className="h-6 w-6" />
              </a>
              <a href="#" className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out">
                <FaWhatsapp className="h-6 w-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div className="mb-6 text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">Quick Links</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start">
                  <span className="h-1 w-1 bg-pink-500 rounded-full mr-2 hidden md:block"></span>
                  Home
                </Link>
              </li>
              <li>
                <Link to="/search" className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start">
                  <span className="h-1 w-1 bg-pink-500 rounded-full mr-2 hidden md:block"></span>
                  Find Caterers
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start">
                  <span className="h-1 w-1 bg-pink-500 rounded-full mr-2 hidden md:block"></span>
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start">
                  <span className="h-1 w-1 bg-pink-500 rounded-full mr-2 hidden md:block"></span>
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* For Vendors */}
          <div className="mb-6 text-center md:text-left">
            <h4 className="text-lg font-semibold text-white mb-4 border-b border-gray-700 pb-2">For Vendors</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/register?type=vendor" className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start">
                  <span className="h-1 w-1 bg-pink-500 rounded-full mr-2 hidden md:block"></span>
                  Join as Caterer
                </Link>
              </li>
              <li>
                <Link to="/how-it-works" className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start">
                  <span className="h-1 w-1 bg-pink-500 rounded-full mr-2 hidden md:block"></span>
                  How It Works
                </Link>
              </li>
              <li>
                <Link to="/pricing" className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start">
                  <span className="h-1 w-1 bg-pink-500 rounded-full mr-2 hidden md:block"></span>
                  Pricing
                </Link>
              </li>
              <li>
                <Link to="/faq" className="text-gray-300 hover:text-pink-500 transition duration-300 ease-in-out flex items-center justify-center md:justify-start">
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
                <span>info@evenz.in</span>
              </p>
              <p className="text-gray-300 flex items-start justify-center md:justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                </svg>
                <span>+91 9876543210</span>
              </p>
              <p className="text-gray-300 flex items-start justify-center md:justify-start">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-pink-500 flex-shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                </svg>
                <span>Boring Road, Patna, Bihar</span>
              </p>
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
              <Link to="/terms" className="text-gray-400 hover:text-pink-500 text-sm transition duration-300 ease-in-out">
                Terms of Service
              </Link>
              <Link to="/privacy" className="text-gray-400 hover:text-pink-500 text-sm transition duration-300 ease-in-out">
                Privacy Policy
              </Link>
              <Link to="/refund" className="text-gray-400 hover:text-pink-500 text-sm transition duration-300 ease-in-out">
                Refund Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;