"use client";
import React, { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Calendar, MapPin, Users, Phone, Mail, User, Clock, CheckCircle, AlertCircle } from 'lucide-react';
import useAnalytics from '@/hooks/useAnalytics';
import { useAuth } from '@/context/AuthContext'; // 1. Import useAuth
import { api } from '@/context/AuthContext';    // 2. Import the central api instance

const BookingRequestForm = () => {
   const params = useParams();
   const searchParams = useSearchParams();
   const eventDate = searchParams?.get('date');

   // Form state
   const [formData, setFormData] = useState({
      eventType: '',
      numGuests: '',
      eventLocation: '',
      venueType: '',
      mealPreference: [],
      selectedCuisine: '',
      selectedPackage: null,
      selectedLiveCounters: [],
      selectedSpecialMenus: [],
      specialRequests: '',
      // Guest details (only used if not logged in)
      clientName: '',
      clientPhone: ''
   });

   // UI state
   const [catererData, setCatererData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [submitting, setSubmitting] = useState(false);
   const [error, setError] = useState('');
   const [success, setSuccess] = useState(false);
   const [estimatedCost, setEstimatedCost] = useState(0);

   // Analytics
   const analytics = useAnalytics();
   const { currentUser } = useAuth();

   // Get vendorId safely
   const vendorId = params?.vendorId;
   // Track form initialization
   useEffect(() => {
      if (vendorId && eventDate) {
         analytics.trackFormStart('booking_request_form');
         analytics.trackCustomEvent(
            'booking_form_loaded',
            'booking_funnel',
            `vendor_${vendorId}_date_${eventDate}`,
            0
         );
      }
   }, [vendorId, eventDate, analytics]);

   // Fetch caterer data
   useEffect(() => {
      if (vendorId) {
         fetchCatererProfile(vendorId);
      }
   }, [vendorId]);

   // Calculate estimated cost whenever form data changes
   useEffect(() => {
      calculateEstimatedCost();
   }, [formData.numGuests, formData.selectedPackage, formData.selectedLiveCounters, formData.selectedSpecialMenus]);

   const fetchCatererProfile = async (catererId) => {
      try {
         setLoading(true);
         const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/caterers-details/${catererId}/view-profile`);

         if (!response.ok) {
            throw new Error('Failed to fetch caterer profile');
         }

         const data = await response.json();

         if (data.success) {
            setCatererData(data.data);

            // Track successful caterer data load
            analytics.trackCustomEvent(
               'caterer_profile_loaded',
               'booking_funnel',
               data.data.vendorInfo?.businessName || 'unknown_caterer',
               0
            );
         } else {
            throw new Error(data.message || 'Failed to load caterer profile');
         }
      } catch (err) {
         setError(err.message);

         // Track profile loading error
         analytics.trackError(
            'caterer_profile_load_failed',
            err.message,
            'booking_request_form'
         );
      } finally {
         setLoading(false);
      }
   };

   // Calculate estimated cost with debugging
   const calculateEstimatedCost = () => {
      if (!formData.numGuests || !formData.selectedPackage) {
         setEstimatedCost(0);
         return;
      }

      const numGuests = parseInt(formData.numGuests);
      if (isNaN(numGuests) || numGuests <= 0) {
         setEstimatedCost(0);
         return;
      }

      let totalCost = 0;
      let breakdown = [];

      // Base package cost
      const packageCost = numGuests * formData.selectedPackage.pricePerPlate;
      totalCost += packageCost;
      breakdown.push(`Base Package: ${numGuests} × ₹${formData.selectedPackage.pricePerPlate} = ₹${packageCost}`);

      // Add live counters cost
      formData.selectedLiveCounters.forEach(counter => {
         let counterCost = 0;
         counterCost = numGuests * counter.pricePerPlate;
         totalCost += counterCost;
         breakdown.push(`${counter.name}: ${numGuests} × ₹${counter.pricePerPlate} = ₹${counterCost}`);
      });

      // Add special menus cost
      formData.selectedSpecialMenus.forEach(menu => {
         let menuCost = 0;
         if (menu.costType === 'per_person') {
            menuCost = numGuests * menu.cost;
         } else {
            menuCost = menu.cost;
         }
         totalCost += menuCost;
         breakdown.push(`${menu.name}: ₹${menuCost}`);
      });

      setEstimatedCost(totalCost);

      // Track cost calculation milestones
      if (totalCost > 0) {
         analytics.trackCustomEvent(
            'cost_calculated',
            'booking_funnel',
            `${catererData?.vendorInfo?.businessName || 'unknown'}_${totalCost}`,
            totalCost
         );
      }
   };

   const handleInputChange = (field, value) => {
      setFormData(prev => ({
         ...prev,
         [field]: value
      }));

      // Track key field interactions
      if (['eventType', 'numGuests', 'selectedCuisine'].includes(field) && value) {
         analytics.trackFormFieldFocus('booking_request_form', field);
      }

      // Track specific important selections
      if (field === 'eventType' && value) {
         analytics.trackCustomEvent(
            'event_type_selected',
            'booking_form_interaction',
            value,
            0
         );
      }

      if (field === 'numGuests' && value) {
         const guests = parseInt(value);
         if (guests > 0) {
            analytics.trackCustomEvent(
               'guest_count_entered',
               'booking_form_interaction',
               `${guests}_guests`,
               guests
            );
         }
      }

      if (field === 'selectedCuisine' && value) {
         analytics.trackCustomEvent(
            'cuisine_selected',
            'booking_form_interaction',
            value,
            0
         );
      }
   };

   const handleMultiSelect = (field, item) => {
      setFormData(prev => ({
         ...prev,
         [field]: prev[field].includes(item)
            ? prev[field].filter(i => i !== item)
            : [...prev[field], item]
      }));

      // Track multi-select interactions
      if (field === 'mealPreference') {
         analytics.trackCustomEvent(
            'meal_preference_toggled',
            'booking_form_interaction',
            item,
            0
         );
      }

      if (field === 'selectedLiveCounters') {
         analytics.trackCustomEvent(
            'live_counter_toggled',
            'booking_form_interaction',
            item.name,
            item.pricePerPlate
         );
      }
   };

   const handlePackageSelection = (pkg) => {
      handleInputChange('selectedPackage', pkg);

      // Track package selection
      analytics.trackCustomEvent(
         'package_selected',
         'booking_form_interaction',
         `${pkg.name}_${pkg.pricePerPlate}`,
         pkg.pricePerPlate
      );
   };

   const handleSubmit = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      setError('');

      // Track form submission attempt
      analytics.trackFormSubmit('booking_request_form', false); // Will update to true on success

      try {
         const catererId = params?.vendorId;
         // 4. Use the central 'api' instance for the POST request
         // const response = await api.post('/booking/booking-requests', {
         //    ...formData,
         //    catererId,
         //    eventDate,
         //    estimatedCost
         // });

         let payload = {
            ...formData,
            catererId,
            eventDate,
            estimatedCost
         };

         // Remove guest details if user is logged in
         if (currentUser) {
            delete payload.clientName;
            delete payload.clientPhone;
         }

         const response = await api.post('/booking/booking-requests', payload);


         if (!response.data.success) {
            // const errorData = await response.json();
            throw new Error('Failed to submit booking request');
         }

         setSuccess(true);

         // Track successful booking request submission
         analytics.trackFormSubmit('booking_request_form', true);
         analytics.trackBooking(
            'booking_request_submitted',
            catererData?.vendorInfo?.businessName || 'unknown_caterer',
            estimatedCost
         );
         analytics.trackConversion('booking_request_completed', estimatedCost);

         // Track detailed conversion data
         analytics.trackCustomEvent(
            'booking_conversion_success',
            'conversion',
            `${formData.eventType}_${formData.numGuests}guests_${estimatedCost}`,
            estimatedCost
         );

      } catch (err) {
         if (err.response && err.response.status === 400 && err.response.data.errors) {
            // Validation errors from backend
            const fieldErrors = err.response.data.errors; // array of { msg, param, ... }

            // Option 1: Show first error
            setError(fieldErrors[0].msg);
         } else {
            setError(err.message || 'Failed to submit booking request. Please try again.');
         }
         console.error(err);

         // Track submission failure
         analytics.trackFormSubmit('booking_request_form', false);
         analytics.trackError(
            'booking_submission_failed',
            err.message,
            'booking_request_form'
         );
      } finally {
         setSubmitting(false);
      }
   };

   // Helper function to safely render values
   const safeRender = (value, defaultText = 'Not specified') => {
      if (value === null || value === undefined || value === '') {
         return defaultText;
      }
      if (typeof value === 'object') {
         return JSON.stringify(value);
      }
      return String(value);
   };

   // Get packages for selected cuisine
   const getPackagesForCuisine = (cuisineName) => {
      if (!catererData?.menu?.packages || !cuisineName) return [];
      return catererData.menu.packages[cuisineName] || [];
   };

   if (loading) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
               <p className="mt-4 text-gray-600">Loading booking form...</p>
            </div>
         </div>
      );
   }

   const { vendorInfo, menu, services } = catererData;

   if (success) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-100 p-4">
            <div className="max-w-lg w-full bg-white rounded-2xl shadow-xl p-8 md:p-10 text-center border border-gray-100">
               {/* Animated Checkmark (Optional but nice) */}
               <CheckCircle className="sm:h-16 sm:w-16 h-8 w-8 text-green-500 mx-auto mb-4" />

               <h2 className="sm:text-2xl text-xl font-bold text-gray-900 mb-2">Request Submitted!</h2>
               {/* Conditional Message */}
               {currentUser ? (
                  // Logged-in User Message
                  <p className="text-gray-600 mb-8 text-base md:text-lg leading-relaxed">
                     Your booking request for <span className="font-semibold">{catererData?.vendorInfo?.businessName || 'the caterer'}</span> has been sent. They will review your details and contact you shortly to discuss your event.
                  </p>
               ) : (
                  // Guest User Message (Concierge) - More prominent
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-5 mb-8 text-left">
                     <h3 className="font-semibold text-blue-800 mb-2 sm:text-lg text-md">Thank You & What Happens Next</h3>
                     <p className="text-blue-700 text-sm md:text-base leading-relaxed space-y-2">
                        {/* --- FIX: Replaced ' with &apos; --- */}
                        <span>Your request for <span className="font-semibold">{catererData?.vendorInfo?.businessName || 'the caterer'}</span> has been received!</span><br />
                        <span>To ensure a high-quality experience, your request is being handled personally by our founder, Saurabh. You&apos;ll receive a confirmation call or WhatsApp message within the next few hours to verify your details before we connect you directly with the caterer.</span><br />
                        <span className="font-medium">Your booking is in safe hands. We&apos;ll be in touch very soon!</span>
                        {/* --- END FIX --- */}
                     </p>
                  </div>
               )}

               {/* Action Button */}
               <Link
                  href={currentUser ? '/dashboard' : '/search'}
                  onClick={() => analytics?.trackLinkClick(currentUser ? 'dashboard_from_success' : 'home_from_success', currentUser ? 'dashboard' : 'home', 'post_booking')}
                  className="w-full inline-block bg-indigo-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors duration-300"
               >
                  {currentUser ? 'Go to My Dashboard' : 'Go to Seach Page'}
               </Link>
            </div>
         </div>
      );
   }

   if (!catererData) {
      return (
         <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
               <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
               <p className="text-gray-600">Failed to load caterer data. Please try again.</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen text-gray-700 bg-gray-50 py-4 px-4 sm:px-6 lg:px-8">
         <div className="max-w-6xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
               {/* Header */}
               <div className="bg-blue-600 text-white p-6">
                  <h1 className="text-2xl font-bold mb-2">Booking Request Form</h1>
               </div>

               {/* Error Alert */}
               {error && (
                  <div className="bg-red-50 border-l-4 border-red-400 p-4 m-6">
                     <div className="flex">
                        <AlertCircle className="h-5 w-5 text-red-400" />
                        <div className="ml-3">
                           <p className="text-sm text-red-700">{error}</p>
                        </div>
                     </div>
                  </div>
               )}

               <form onSubmit={handleSubmit} className="p-6 space-y-8">
                  {/* Client Details */}
                  {/* <div className="border-b border-gray-200 pb-6">
                     <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <User className="h-5 w-5 mr-2" />
                        Your Details
                     </h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                           <User className="h-4 w-4 text-gray-400 mr-2" />
                           <span className="text-sm text-gray-700">{currentUser?.name}</span>
                        </div>
                        <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                           <Phone className="h-4 w-4 text-gray-400 mr-2" />
                           <span className="text-sm text-gray-700">{currentUser?.mobile}</span>
                        </div>
                     </div>
                  </div> */}
                  {/* --- Guest Details Section (Conditional) --- */}
                  {!currentUser && (
                     <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                           <User className="h-5 w-5 mr-2" />
                           Your Contact Details *
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div>
                              <label htmlFor="clientName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                              <input
                                 type="text"
                                 id="clientName"
                                 value={formData.clientName}
                                 onChange={(e) => handleInputChange('clientName', e.target.value)}
                                 required={!currentUser} // Required only if guest
                                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                 placeholder="Enter your full name"
                              />
                           </div>
                           <div>
                              <label htmlFor="clientPhone" className="block text-sm font-medium text-gray-700 mb-1">Mobile Number</label>
                              <input
                                 type="tel" // Use tel for better mobile input
                                 id="clientPhone"
                                 value={formData.clientPhone}
                                 onChange={(e) => handleInputChange('clientPhone', e.target.value.replace(/\D/g, '').slice(0, 10))} // Allow only digits, max 10
                                 required={!currentUser} // Required only if guest
                                 className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                 placeholder="Enter 10-digit mobile number"
                                 maxLength="10"
                                 pattern="[6-9][0-9]{9}" // Basic Indian mobile pattern
                                 title="Please enter a valid 10-digit Indian mobile number"
                              />
                           </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-2">We need this to send your request to the caterer.</p>
                     </div>
                  )}
                  {/* --- End Guest Details --- */}


                  {/* Logged-in User Details (Readonly) */}
                  {currentUser && (
                     <div className="border-b border-gray-200 pb-6">
                        <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                           <User className="h-5 w-5 mr-2" />
                           Your Details
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                           <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                              <User className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-700">{currentUser?.name}</span>
                           </div>
                           <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                              <Phone className="h-4 w-4 text-gray-400 mr-2" />
                              <span className="text-sm text-gray-700">{currentUser?.mobile}</span>
                           </div>
                        </div>
                     </div>
                  )}

                  {/* Caterer & Date Info */}
                  <div className="border-b border-gray-200 pb-6">
                     <h2 className="text-lg font-semibold text-gray-900 mb-4">Booking Details</h2>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                           <span className="text-sm font-medium text-blue-900">Caterer: {vendorInfo?.ownerName}, {vendorInfo?.businessName}</span>
                        </div>
                        <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                           <Calendar className="h-4 w-4 text-blue-600 mr-2" />
                           <span className="text-sm font-medium text-blue-900">{eventDate ? new Date(eventDate).toLocaleDateString() : 'No date selected'}</span>
                        </div>
                     </div>
                  </div>

                  {/* Event Details */}
                  <div className="space-y-6">
                     <h2 className="text-lg font-semibold text-gray-900">Event Details</h2>

                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Event Type *</label>
                           <select
                              value={formData.eventType}
                              onChange={(e) => handleInputChange('eventType', e.target.value)}
                              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              required
                           >
                              <option value="">Select event type</option>
                              <option value="Wedding">Wedding</option>
                              <option value="Birthday Party">Birthday Party</option>
                              <option value="Corporate Event">Corporate Event</option>
                              <option value="Pooja/Religious">Pooja/Religious</option>
                              <option value="Baby Shower">Baby Shower</option>
                              <option value="Housewarming">Housewarming</option>
                              <option value="Small Get-Together">Small Get-Together</option>
                              <option value="Other">Other</option>
                           </select>
                        </div>

                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-2">Number of Guests *</label>
                           <div className="relative">
                              <Users className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                              <input
                                 type="number"
                                 value={formData.numGuests || ""}
                                 onChange={(e) => {
                                    const value = e.target.value === "" ? "" : Number(e.target.value);
                                    handleInputChange('numGuests', value);
                                 }}
                                 className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                 placeholder="Enter number of guests"
                                 min="0"
                                 onWheel={(e) => e.target.blur()}
                                 required
                              />
                           </div>
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Event Location (Locality in Patna) *</label>
                        <div className="relative">
                           <MapPin className="absolute left-3 top-3 h-5 w-5 text-gray-400" />
                           <input
                              type="text"
                              value={formData.eventLocation}
                              onChange={(e) => handleInputChange('eventLocation', e.target.value)}
                              className="w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              placeholder="e.g., Kankarbagh, Fraser Road, Bailey Road"
                              required
                           />
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Venue Type</label>
                        <select
                           value={formData.venueType}
                           onChange={(e) => handleInputChange('venueType', e.target.value)}
                           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                           <option value="">Select venue type</option>
                           <option value="Banquet Hall">Banquet Hall</option>
                           <option value="Home">Home</option>
                           <option value="Office">Office</option>
                           <option value="Open Ground">Open Ground</option>
                           <option value="Rooftop">Rooftop</option>
                           <option value="Other">Other</option>
                        </select>
                     </div>
                  </div>

                  {/* Catering Preferences */}
                  <div className="space-y-6">
                     <h2 className="text-lg font-semibold text-gray-900">Catering Preferences</h2>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-3">Meal Preference *</label>
                        <div className="grid grid-cols-2 gap-3">
                           {['Vegetarian Only', 'Non-Vegetarian', 'Mixed', 'Jain'].map((pref) => (
                              <label key={pref} className="flex items-center p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                                 <input
                                    type="checkbox"
                                    checked={formData.mealPreference.includes(pref)}
                                    onChange={() => handleMultiSelect('mealPreference', pref)}
                                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                 />
                                 <span className="ml-2 text-sm text-gray-700">{pref}</span>
                              </label>
                           ))}
                        </div>
                     </div>

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Cuisine Selection *</label>
                        <select
                           value={formData.selectedCuisine}
                           onChange={(e) => {
                              handleInputChange('selectedCuisine', e.target.value);
                              handleInputChange('selectedPackage', null);
                           }}
                           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           required
                        >
                           <option value="">Select cuisine</option>
                           {Array.isArray(menu?.cuisines) && menu.cuisines.length > 0 ? (
                              menu.cuisines.map((cuisine, index) => (
                                 <option key={index} value={cuisine}>
                                    {safeRender(cuisine)}
                                 </option>
                              ))
                           ) : (
                              <option disabled>No cuisines available</option>
                           )}
                        </select>
                     </div>

                     {/* Package Selection */}
                     {formData.selectedCuisine && (
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-3">Package Selection *</label>
                           <div className="space-y-3">
                              {getPackagesForCuisine(formData.selectedCuisine).map((pkg, index) => (
                                 <label
                                    key={index}
                                    className="flex items-start p-4 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer w-full"
                                 >
                                    <input
                                       type="radio"
                                       name="package"
                                       checked={formData.selectedPackage?.name === pkg.name}
                                       onChange={() => handlePackageSelection(pkg)}
                                       className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 mt-1 flex-shrink-0"
                                    />
                                    <div className="ml-3 flex-1">
                                       {/* Top section — package name & price */}
                                       <div className="flex flex-wrap justify-between items-center gap-x-2 gap-y-1">
                                          <h3 className="text-sm font-medium text-gray-900">{pkg.name}</h3>
                                          <span className="text-sm font-bold text-blue-600 whitespace-nowrap">
                                             ₹{pkg.pricePerPlate}/plate
                                          </span>
                                       </div>

                                       {/* Bottom section — item counts */}
                                       <div className="text-xs flex flex-wrap gap-x-1 gap-y-1 text-gray-600 mt-1">
                                          {Object.entries(pkg.itemCounts).map(([type, count]) => (
                                             <div
                                                key={type}
                                                className="flex items-center gap-0.5 sm:gap-1 whitespace-nowrap"
                                             >
                                                <div className="text-sm text-gray-900">{count}</div>
                                                <div className="text-xs text-gray-500 capitalize leading-tight">{type}</div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 </label>
                              ))}
                           </div>
                        </div>
                     )}

                     {/* Live Counters */}
                     {services?.liveCounters && services.liveCounters.length > 0 && (
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-3">Live Counters (Optional)</label>
                           <div className="space-y-2">
                              {services.liveCounters.map((counter, index) => (
                                 <label key={index} className="flex items-center justify-between p-3 border border-gray-300 rounded-lg hover:bg-gray-50 cursor-pointer">
                                    <div className="flex items-center">
                                       <input
                                          type="checkbox"
                                          checked={formData.selectedLiveCounters.some(c => c.name === counter.name)}
                                          onChange={() => handleMultiSelect('selectedLiveCounters', counter)}
                                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                       />
                                       <span className="ml-2 text-sm text-gray-700">{counter.name}</span>
                                    </div>
                                    <span className="text-sm font-medium text-gray-900">
                                       ₹{counter.pricePerPlate} per person
                                    </span>
                                 </label>
                              ))}
                           </div>
                        </div>
                     )}

                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">Special Requests/Notes</label>
                        <textarea
                           value={formData.specialRequests}
                           onChange={(e) => handleInputChange('specialRequests', e.target.value)}
                           rows={4}
                           className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           placeholder="Any special dietary requirements, decorations, or other requests..."
                        />
                     </div>
                  </div>

                  {/* Estimated Cost */}
                  {estimatedCost > 0 && (
                     <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-green-900 mb-2">Estimated Cost</h3>
                        <div className="text-3xl font-bold text-green-700 mb-2">₹{estimatedCost.toLocaleString()}</div>
                        <p className="text-sm text-green-600">
                           * This is an estimated quote and includes base package + selected live counters. Final pricing will be confirmed by the caterer.
                        </p>
                     </div>
                  )}

                  {/* Submit Button */}
                  <div className="pt-6">
                     <button
                        type="submit"
                        disabled={submitting || !formData.eventType || !formData.numGuests || !formData.eventLocation ||
                           formData.mealPreference.length === 0 || !formData.selectedCuisine || !formData.selectedPackage}
                        className="w-full bg-blue-600 text-white px-4 py-3 sm:py-4 sm:px-6 rounded-lg font-semibold text-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                     >
                        {submitting ? (
                           <div className="flex items-center justify-center">
                              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                              Submitting Request...
                           </div>
                        ) : (
                           `Send Booking Request (₹${estimatedCost.toLocaleString()})`
                        )}
                     </button>
                  </div>
               </form>
            </div>
         </div>
      </div>
   );
};

export default BookingRequestForm;