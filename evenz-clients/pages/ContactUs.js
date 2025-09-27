"use client";
import React from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin } from 'lucide-react';
import Link from 'next/link';

const ContactPage = () => {

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Have questions, feedback, or need assistance? Reach out to our team. We're here to help you connect with the perfect caterer for your event.
          </p>
        </div>

        {/* Contact Information Card */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 lg:p-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-10">
            Let's Connect
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {/* Email */}
            <div className="flex items-start space-x-5">
              <div className="bg-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Email Support</h3>
                <p className="text-gray-500 mb-3">For general inquiries and support</p>
                <a
                  href="mailto:support@evenz.in"
                  className="text-lg font-medium text-indigo-600 hover:text-indigo-800 hover:underline transition-colors"
                >
                  support@evenz.in
                </a>
              </div>
            </div>

            {/* Phone */}
            <div className="flex items-start space-x-5">
               <div className="bg-gray-300 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                <Phone className="w-7 h-7 text-gray-500" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Phone Support</h3>
                <p className="text-gray-500">Currently unavailable, please use email for support.</p>
              </div>
            </div>

            {/* Office */}
            <div className="flex items-start space-x-5">
              <div className="bg-indigo-600 w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Our Service Area</h3>
                <p className="text-gray-500 leading-relaxed">
                  Proudly serving the greater<br />
                  Patna Metropolitan Area, Bihar<br />
                  India
                </p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Follow Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/evenz_in"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 hover:scale-105 transition-all duration-300"
              >
                <Instagram className="w-7 h-7" />
              </a>
              <a
                href="https://www.facebook.com/Evenz.inOfficial"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 hover:scale-105 transition-all duration-300"
              >
                <Facebook className="w-7 h-7" />
              </a>
              <a
                href="https://www.linkedin.com/company/evenz-india"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-xl bg-indigo-600 flex items-center justify-center text-white hover:bg-indigo-700 hover:scale-105 transition-all duration-300"
              >
                <Linkedin className="w-7 h-7" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center bg-indigo-600 rounded-2xl p-12 text-white">
          <h3 className="text-4xl font-bold mb-6">Ready to Plan Your Perfect Event?</h3>
          <p className="text-indigo-200 text-lg max-w-2xl mx-auto mb-8">Browse our network of trusted, professional caterers in Patna and send a booking request today.</p>
          <Link
            href={'/catering-services'}
            className="bg-white text-indigo-600 font-bold py-4 px-8 rounded-lg hover:shadow-lg hover:scale-105 transition-all duration-300 text-lg">
            Browse Caterers
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
