"use client";
import React, { useState } from 'react';

const CatererFAQs = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "How do I register my catering business on Evenz.in?",
      answer: "You can register by clicking 'Register as Caterer' on our homepage. Follow the steps to create your account and then set up your comprehensive caterer profile in your dashboard.",
      category: "Getting Started"
    },
    {
      question: "What information is essential for my profile to be visible to clients?",
      answer: "To be visible and receive leads, you MUST complete your 'Menu & Cuisines' section (adding at least one package with pricing). Additionally, ensuring your 'Cover Image', 'Min/Max Guests', and 'Available for Events' details are filled is crucial for client search visibility.",
      category: "Profile Setup",
      isImportant: true
    },
    {
      question: "How do I manage my availability on Evenz.in, and why is it important?",
      answer: "You can update your real-time availability in your Caterer Dashboard. Clients can check your availability directly on your profile before sending a booking request. Keeping this updated is crucial for two reasons: 1) It ensures clients only send requests for dates you're actually available, leading to higher quality leads. 2) It prevents you from receiving requests for dates you're booked, saving your unlocking fees." ,
      category: "Availability Management"     
    },
    {
      question: "How do I receive booking requests from Evenz.in?",
      answer: "Once your profile is complete and visible, clients will send booking requests directly to you through your Evenz.in profile for their specific event needs. You will receive booking requests on your dashboard.",
      category: "Booking Process"
    },
    {
      question: "What is the 'Unlocking Fee' and why do I pay it?",
      answer: "The 'Unlocking Fee' is a nominal charge of ₹200 (Rupees Two Hundred Only) per booking request. This fee gives you immediate access to the client's direct contact details (mobile number) so you can communicate with them personally to discuss their event, negotiate prices, finalize menus, and ultimately secure the booking. This fee covers our costs in providing you with qualified leads and maintaining the platform.",
      category: "Pricing",
      isHighlighted: true
    },
    {
      question: "Is the unlocking fee refundable?",
      answer: "No, the unlocking fee of ₹200 is a non-refundable fee for providing you with a client's contact details for a specific booking request. It is a charge for the lead generated and access to the contact information, irrespective of whether the booking is finalized or not.",
      category: "Refund"
    },
    {
      question: "How does Evenz.in's payment model compare to other platforms' subscription fees?",
      answer: "Evenz.in operates on a transparent pay-per-request model, meaning there are NO monthly or yearly subscription fees whatsoever. Unlike platforms that charge recurring subscriptions regardless of lead volume, you only pay a nominal ₹200 unlocking fee for each specific client request for which you choose to access contact details and pursue the booking. This ensures you only pay for actionable leads that interest you, making our pricing fair and risk-free.",
      category: "Pricing",
      isHighlighted: true
    },
    {
      question: "What is Evenz.in's role in client bookings and service delivery after I pay the fee?",
      answer: "Evenz.in is solely a platform to connect you with potential clients. Once you have paid the unlocking fee and gained access to the client's contact details, our role in that specific connection is complete. We are not involved in the actual booking process, contract negotiation, payment collection from the client, or the delivery of catering services. All aspects of the booking, service quality, terms, and execution are your direct responsibility to manage with the client.",
      category: "Platform Role",
      isImportant: true
    },
    {
      question: "How do I update my catering packages and services?",
      answer: "Log in to your caterer dashboard and navigate to the 'Services' page. Here you can add, edit, or remove your packages, cuisines, service types, and other offerings.",
      category: "Profile Management"
    },
    {
      question: "What is the importance of filling out all sections of my profile?",
      answer: "While some sections are mandatory for visibility, completing all tabs (e.g., Compliance, detailed Logistics) significantly enhances your credibility, builds client trust, and can lead to more qualified leads as clients get a full picture of your professional services.",
      category: "Profile Optimization"
    }
  ];

  const toggleOpen = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  const categories = [...new Set(faqs.map(faq => faq.category))];

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-900 mb-4">
            Caterer FAQs
          </h1>
          <p className="text-lg text-slate-600 max-w-2xl mx-auto">
            Everything you need to know about partnering with Evenz.in and growing your catering business
          </p>
          <div className="w-24 h-1 bg-slate-600 mx-auto mt-6 rounded-full"></div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-8">
          {categories.map((category, index) => (
            <span
              key={index}
              className="px-3 py-1 bg-slate-100 text-slate-700 text-sm font-medium rounded-full"
            >
              {category}
            </span>
          ))}
        </div>

        {/* FAQ Cards */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <div 
                key={index} 
                className={`transition-all duration-200 ${
                  faq.isImportant 
                    ? 'bg-amber-50 border-l-4 border-amber-400' 
                    : faq.isHighlighted 
                      ? 'bg-blue-50 border-l-4 border-blue-400' 
                      : 'hover:bg-gray-50'
                }`}
              >
                <button
                  onClick={() => toggleOpen(index)}
                  className="w-full px-6 py-6 text-left focus:outline-none focus:ring-2 focus:ring-slate-500 focus:ring-inset"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        {faq.isImportant && (
                          <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                        )}
                        {faq.isHighlighted && (
                          <svg className="w-5 h-5 text-blue-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        <h3 className="text-lg font-semibold text-slate-900 pr-4">
                          {faq.question}
                        </h3>
                      </div>
                      <span className={`inline-block mt-2 px-2 py-1 text-xs font-medium rounded-full ${
                        faq.category === 'Pricing' 
                          ? 'text-blue-700 bg-blue-100' 
                          : faq.category === 'Platform Role'
                            ? 'text-amber-700 bg-amber-100'
                            : 'text-slate-600 bg-slate-100'
                      }`}>
                        {faq.category}
                      </span>
                    </div>
                    <div className="flex-shrink-0 ml-4">
                      <svg
                        className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${
                          openIndex === index ? 'rotate-180' : ''
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}>
                  <div className="px-6 pb-6">
                    <div className={`p-4 rounded-lg ${
                      faq.isImportant 
                        ? 'bg-white border border-amber-200' 
                        : faq.isHighlighted 
                          ? 'bg-white border border-blue-200' 
                          : 'bg-gray-50'
                    }`}>
                      <p className="text-slate-700 leading-relaxed">
                        {faq.category === 'Pricing' && faq.answer.includes('₹200') ? (
                          <span>
                            {faq.answer.includes('NO monthly or yearly subscription fees') ? (
                              <>
                                <strong className="text-blue-800">Evenz.in operates on a transparent pay-per-request model, meaning there are NO monthly or yearly subscription fees whatsoever.</strong> Unlike platforms that charge recurring subscriptions regardless of lead volume, you only pay a nominal <strong className="text-blue-800">₹200 unlocking fee</strong> for each specific client request for which you choose to access contact details and pursue the booking. This ensures you only pay for actionable leads that interest you, making our pricing fair and risk-free.
                              </>
                            ) : (
                              <>
                                The 'Unlocking Fee' is a nominal charge of <strong className="text-blue-800">₹200 (Rupees Two Hundred Only)</strong> per booking request. This fee gives you immediate access to the client's direct contact details (mobile number) so you can communicate with them personally to discuss their event, negotiate prices, finalize menus, and ultimately secure the booking. This fee covers our costs in providing you with qualified leads and maintaining the platform.
                              </>
                            )}
                          </span>
                        ) : faq.isImportant ? (
                          <span>
                            {faq.category === 'Platform Role' ? (
                              <>
                                <strong className="text-amber-800">Evenz.in is solely a platform to connect you with potential clients.</strong> Once you have paid the unlocking fee and gained access to the client's contact details, our role in that specific connection is complete. <strong className="text-amber-800">We are not involved in the actual booking process, contract negotiation, payment collection from the client, or the delivery of catering services.</strong> All aspects of the booking, service quality, terms, and execution are your direct responsibility to manage with the client.
                              </>
                            ) : (
                              <>
                                To be visible and receive leads, you <strong className="text-amber-800">MUST complete your 'Menu & Cuisines' section</strong> (adding at least one package with pricing). Additionally, ensuring your 'Cover Image', 'Min/Max Guests', and 'Available for Events' details are filled is crucial for client search visibility.
                              </>
                            )}
                          </span>
                        ) : (
                          faq.answer
                        )}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Tips Section - Updated with professional colors */}
        <div className="mt-12 bg-gradient-to-r from-slate-800 to-slate-900 rounded-lg shadow-lg p-8 text-white">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-white bg-opacity-10 rounded-full mb-4 backdrop-blur-sm">
              <svg className="w-6 h-6 text-slate-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold mb-2 text-slate-100">
              Quick Tips for Success
            </h3>
            <p className="text-slate-300">
              Maximize your success on Evenz.in with these key strategies
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-sm font-bold text-white">1</span>
              </div>
              <h4 className="font-medium mb-2 text-slate-100">Complete Your Profile</h4>
              <p className="text-sm text-slate-300">Add all menu items, photos, and compliance details</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-sm font-bold text-white">2</span>
              </div>
              <h4 className="font-medium mb-2 text-slate-100">Respond Quickly</h4>
              <p className="text-sm text-slate-300">Fast responses to inquiries increase booking chances</p>
            </div>
            <div className="text-center">
              <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-3 shadow-lg">
                <span className="text-sm font-bold text-white">3</span>
              </div>
              <h4 className="font-medium mb-2 text-slate-100">Quality Photos</h4>
              <p className="text-sm text-slate-300">High-quality food and setup photos attract more clients</p>
            </div>
          </div>
        </div>

        {/* Support Section */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 bg-slate-100 rounded-full mb-4">
            <svg className="w-6 h-6 text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM12 18a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V18.75A.75.75 0 0112 18zM6.75 12a.75.75 0 01-.75-.75H3.75a.75.75 0 010-1.5H6a.75.75 0 01.75.75zM20.25 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H19.5a.75.75 0 01.75.75z" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">
            Need Help Getting Started?
          </h3>
          <p className="text-slate-600 mb-6">
            Our partner success team is here to help you maximize your opportunities on Evenz.in
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a 
              href="mailto:partners@evenz.in"
              className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-slate-700 hover:bg-slate-800 transition-colors duration-200"
            >
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              Partner Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CatererFAQs;