// src/components/ClientFAQs.js
"use client"
import React, { useState } from 'react';

const ClientFAQs = () => {
   const [openIndex, setOpenIndex] = useState(null);

   const faqs = [
      {
         question: "How do I find a caterer on Evenz.in for my event?",
         answer: "You can use our search bar to look for caterers by location (e.g., Patna), cuisine type, event size, and specific services. Our filters help you narrow down your options to find the perfect match.",
         category: "Getting Started"
      },
      {
         question: "How does the real-time availability check work?",
         answer: "Once on a caterer's profile, you'll see a 'Check Availability' button. Click this to select your desrired event date. Our system will instantly show you if the caterer is available on that specific date, saving you time and ensuring you only send booking requests to available caterers.",
         category: "Unique Feature"
      },
      {
         question: "Is there a fee for clients to use Evenz.in?",
         answer: "No, Evenz.in is completely free for clients to browse caterers, check availability, send booking requests, and receive quotes. You only pay the caterer for their services.",
         category: "Pricing"
      },
      {
         question: "How do I send an inquiry to a caterer?",
         answer: "Once you find a caterer you like, click on their profile and use the 'Check Availability' button to check availability and if caterer is available on the event date use 'Send Booking Request' button. Fill in your event details, guest count, catering preferences, and any specific requirements. The caterer will then review your request and reach out to you.",
         category: "Communication"
      },
      {
         question: "What happens after I send a booking request?",
         answer: "After you send a booking request, the caterer will receive your details and will contact you directly (via phone or Whatsapp) to discuss your requirements further, negotiate prices, finalize menu items, and secure the booking. Evenz.in's role in the connection process is complete once your contact details are shared with caterer.",
         category: "Communication"
      },
      {
         question: "What is Evenz.in's role in the booking and service delivery process?",
         answer: "Evenz.in is solely a platform to connect clients with caterers. We facilitate your ability to find caterers send intial booking requests. However, we are not involved in the actual booking, payment processing, service delivery, or any direct agreements made between you and the caterer. All responsibilities related to the catering service, including its quality, terms, and execution, lie solely with the client and the chosen caterer.",
         category: "Platform Role",
         isImportant: true
      },
      {
         question: "What if a caterer doesn't respond to my inquiry?",
         answer: "While caterers are encouraged to respond promptly, if you don't hear back within 24-48 hours, we recommend trying another caterer or contacting our support team at support@evenz.in for assistance.",
         category: "Support"
      },
      {
         question: "Can I customize catering packages?",
         answer: "Many caterers on Evenz.in offer customizable packages. You can discuss your specific dietary needs, menu preferences, and event details directly with the caterer once they contact you.",
         category: "Services"
      },
      {
         question: "How do payments and cancellations work?",
         answer: "Payment terms, advance requirements, and cancellation policies are determined by each individual caterer. These details are usually outlined on their Evenz.in profile under the 'Policies' or 'Legal' tab, and will be part of your direct agreement with them. Always confirm these details with your chosen caterer, as Evenz.in does not handle these transactions or policies directly.",
         category: "Policies"
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
            <div className="text-center mb-6 sm:mb-12">
               <h1 className="text-4xl font-bold text-gray-900 mb-2 sm:mb-4">
                  Frequently Asked Questions
               </h1>
               <div className="w-24 h-1 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto rounded-full"></div>
            </div>

            {/* Category Pills */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
               {categories.map((category, index) => (
                  <span
                     key={index}
                     className="px-3 py-1 bg-blue-100 text-blue-800 text-sm font-medium rounded-full"
                  >
                     {category}
                  </span>
               ))}
            </div>

            {/* FAQ Cards */}
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
               <div className="divide-y divide-gray-200">
                  {faqs.map((faq, index) => (
                     <div key={index} className={`transition-all duration-200 ${faq.isImportant ? 'bg-amber-50 border-l-4 border-amber-400' : 'hover:bg-gray-50'}`}>
                        <button
                           onClick={() => toggleOpen(index)}
                           className="w-full px-6 py-6 text-left focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-inset"
                        >
                           <div className="flex items-center justify-between">
                              <div className="flex-1">
                                 <div className="flex items-center space-x-3">
                                    {faq.isImportant && (
                                       <svg className="w-5 h-5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                       </svg>
                                    )}
                                    <h3 className="text-lg font-semibold text-gray-900 pr-4">
                                       {faq.question}
                                    </h3>
                                 </div>
                                 <span className="inline-block mt-2 px-2 py-1 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                                    {faq.category}
                                 </span>
                              </div>
                              <div className="flex-shrink-0 ml-4">
                                 <svg
                                    className={`w-5 h-5 text-gray-500 transform transition-transform duration-200 ${openIndex === index ? 'rotate-180' : ''
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
                              <div className={`p-4 rounded-lg ${faq.isImportant ? 'bg-white border border-amber-200' : 'bg-gray-50'}`}>
                                 <p className="text-gray-700 leading-relaxed">
                                    {faq.isImportant ? (
                                       <span>
                                          <strong className="text-amber-800">Evenz.in is solely a platform to connect clients with caterers.</strong> We facilitate your ability to find and communicate with caterers. However, <strong className="text-amber-800">we are not involved in the actual booking, payment processing, service delivery, or any direct agreements made between you and the caterer.</strong> All responsibilities related to the catering service, including its quality, terms, and execution, lie solely with the client and the chosen caterer.
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

            {/* Contact Support Section */}
            <div className="mt-12 bg-white rounded-lg shadow-lg p-8 text-center">
               <div className="inline-flex items-center justify-center w-12 h-12 bg-green-100 rounded-full mb-4">
                  <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192L5.636 18.364M12 2.25a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V3a.75.75 0 01.75-.75zM12 18a.75.75 0 01.75.75v2.25a.75.75 0 01-1.5 0V18.75A.75.75 0 0112 18zM6.75 12a.75.75 0 01-.75-.75H3.75a.75.75 0 010-1.5H6a.75.75 0 01.75.75zM20.25 12a.75.75 0 01-.75.75h-2.25a.75.75 0 010-1.5H19.5a.75.75 0 01.75.75z" />
                  </svg>
               </div>
               <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Still have questions?
               </h3>
               <p className="text-gray-600 mb-6">
                  Our support team is here to help you get the most out of Evenz.in
               </p>
               <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                     href="mailto:support@evenz.in"
                     className="inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md
                      text-white bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-300 ease-in-out"
                  >
                     <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                     </svg>
                     Contact Support
                  </a>
               </div>
            </div>
         </div>
      </div>
   );
};

export default ClientFAQs;