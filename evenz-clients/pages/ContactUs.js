"use client";
import React, { useState } from 'react';
import { Mail, Phone, MapPin, Instagram, Facebook, Linkedin, Send } from 'lucide-react';
import Link from 'next/link';

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 bg-clip-text text-transparent mb-6">
            Contact Us
          </h1>
          <p className="text-xl text-gray-700 max-w-3xl mx-auto leading-relaxed">
            Have questions, feedback, or need assistance? Reach out to our team. We're here to help you connect with the perfect caterer for your event.
          </p>
        </div>

        {/* Contact Information - Full Width */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20 p-8 lg:p-10">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-8">
            Let's Connect
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div className="flex items-start space-x-6">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Mail className="w-7 h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Email Support</h3>
                <p className="text-gray-600 mb-3 text-base">For general inquiries and support</p>
                <a
                  href="mailto:support@evenz.in"
                  className="text-lg font-medium text-purple-700 bg-clip-text  hover:opacity-80 transition-opacity"
                >
                  support@evenz.in
                </a>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <Phone className="w-7 h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Phone Support</h3>
                <p className="text-gray-600 text-base">Currently unavailable, please use email for support</p>
              </div>
            </div>

            <div className="flex items-start space-x-6">
              <div className="bg-gradient-to-r from-indigo-500 via-purple-500 to-teal-500 w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <MapPin className="w-7 h-7 text-white" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">Our Office</h3>
                <p className="text-gray-600 leading-relaxed text-base">
                  Evenz.in Headquarters<br />
                  123, Main Street<br />
                  Patna, Bihar - 800001<br />
                  India
                </p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="mt-10 pt-8 border-t border-gray-200">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">Connect With Us</h3>
            <div className="flex space-x-4">
              <a
                href="https://www.instagram.com/evenz_in"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Instagram className="w-7 h-7" />
              </a>
              <a
                href="https://www.facebook.com/Evenz.inOfficial"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Facebook className="w-7 h-7" />
              </a>
              <a
                href="https://www.linkedin.com/company/evenz-india"
                target="_blank"
                rel="noopener noreferrer"
                className="w-14 h-14 rounded-2xl bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 flex items-center justify-center text-white hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-xl"
              >
                <Linkedin className="w-7 h-7" />
              </a>
            </div>
          </div>
        </div>

        {/* Bottom CTA Section */}
        <div className="mt-20 text-center bg-gradient-to-r from-indigo-600 via-purple-600 to-teal-500 rounded-3xl p-12 text-white">
          <h3 className="text-3xl lg:text-4xl font-bold mb-6">Ready to Plan Your Perfect Event?</h3>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href={'catering-services'}
              className="bg-white text-indigo-600 font-semibold py-4 px-8 rounded-xl hover:shadow-lg hover:scale-105 transition-all duration-300">
              Browse Caterers
            </Link>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;