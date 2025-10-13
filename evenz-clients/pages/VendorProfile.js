"use client";
import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import {
   Heart,
   MapPin,
   Users,
   Calendar,
   ChefHat,
   Utensils,
   Shield,
   CreditCard,
   AlertCircle,
   CheckCircle,
   XCircle,
   Star,
   Share2
} from 'lucide-react';
import { FaUtensils } from 'react-icons/fa';
import BookingModal from '@/components/BookingModal';
import { useAuth } from '@/context/AuthContext';
import useAnalytics from '@/hooks/useAnalytics';
import { api } from '@/context/AuthContext';

const CatererProfileView = () => {
   const params = useParams();
   const catererId = params?.id;
   const [catererData, setCatererData] = useState(null);
   const [isShortlisted, setIsShortlisted] = useState(false);
   const [showBookingModal, setShowBookingModal] = useState(false);
   const [showTooltip, setShowTooltip] = useState(false);
   const [activeTab, setActiveTab] = useState('menu');
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(true);
   const analytics = useAnalytics();

   // Get auth state from the central context
   const { currentUser, accessToken, loading: authLoading } = useAuth();
   // Tab time tracking
   const tabStartTime = useRef(Date.now());
   const pageStartTime = useRef(Date.now());
   const tabTimeSpent = useRef({});

   const fetchAllData = useCallback(async () => {
      setLoading(true);
      try {
         // Fetch public caterer profile
         const profileResponse = await api.get(`/caterers-details/${catererId}/view-profile`);
         if (profileResponse.data.success) {
            setCatererData(profileResponse.data.data);
         } else {
            throw new Error(profileResponse.data.message || 'Failed to load caterer profile');
         }

         // If the user is logged in, check their shortlist status
         if (accessToken) {
            const shortlistResponse = await api.get(`/user/shortlist/${catererId}/status`);
            if (shortlistResponse.data.success) {
               setIsShortlisted(shortlistResponse.data.isShortlisted);
            }
         }
      } catch (err) {
         setError(err.message || 'An error occurred while loading the profile.');
         analytics.trackError('profile_load_error', err.message, 'caterer_profile');
      } finally {
         setLoading(false);
      }
   }, [catererId, accessToken]);

   // Fetch data when the component mounts or when the auth state changes
   useEffect(() => {
      // We can fetch data as soon as the catererId is available,
      // and the fetchAllData function will handle the auth state internally.
      if (catererId) {
         fetchAllData();
      }
   }, [catererId, fetchAllData]);

   // Component mount tracking
   useEffect(() => {
      if (!catererId) return;
      // Track page view
      analytics.trackPageView('caterer_profile', 'vendor_discovery');

      // Track profile view event
      analytics.trackCustomEvent(
         'profile_viewed',
         'vendor_interaction',
         `caterer_${catererId}`,
         0
      );

      pageStartTime.current = Date.now();
      tabStartTime.current = Date.now();

      return () => {
         // Track total time spent on page
         const totalTimeSpent = Math.round((Date.now() - pageStartTime.current) / 1000);
         analytics.trackCustomEvent(
            'page_time_spent',
            'engagement',
            'caterer_profile',
            totalTimeSpent
         );
      };
   }, []);

   // Track tab changes and time spent
   useEffect(() => {
      // Record time spent in previous tab
      if (tabStartTime.current) {
         const timeSpent = Math.round((Date.now() - tabStartTime.current) / 1000);
         const previousTab = Object.keys(tabTimeSpent.current).length === 0 ? 'overview' : activeTab;

         if (timeSpent > 0) {
            tabTimeSpent.current[previousTab] = (tabTimeSpent.current[previousTab] || 0) + timeSpent;

            // Track tab time spent
            analytics.trackCustomEvent(
               'tab_time_spent',
               'engagement',
               `${previousTab}_tab`,
               timeSpent
            );
         }
      }

      // Track tab switch
      analytics.trackCustomEvent(
         'tab_switched',
         'navigation',
         `switched_to_${activeTab}`,
         0
      );

      // Reset timer for new tab
      tabStartTime.current = Date.now();
   }, [activeTab]);

   // Handle toggling the shortlist status
   const handleShortlist = async () => {
      if (!currentUser) {
         // Optional: prompt user to log in
         alert('Please log in to shortlist caterers.');
         return;
      }

      try {
         const action = isShortlisted ? 'remove_from_shortlist' : 'add_to_shortlist';
         analytics.trackCustomEvent(`${action}_started`, 'shortlist_interaction', `caterer_${catererId}`);

         let response;
         if (isShortlisted) {
            // Remove from shortlist
            response = await api.delete(`/user/shortlist/${catererId}`);
         } else {
            // Add to shortlist
            response = await api.post(`/user/shortlist/${catererId}`);
         }

         if (response.data.success) {
            setIsShortlisted(!isShortlisted); // Toggle the state
            analytics.trackCustomEvent(`${action}_success`, 'shortlist_interaction', `caterer_${catererId}`);
         } else {
            throw new Error(response.data.message);
         }
      } catch (err) {
         setError(err.message || 'Failed to update shortlist. Please try again.');
         analytics.trackError('shortlist_toggle_error', err.message, 'caterer_profile');
      }
   };

   // Enhanced handleShare function with analytics
   const handleShare = () => {
      // Track share button click
      analytics.trackButtonClick('share_profile', 'social_sharing');

      const shareData = {
         title: vendorInfo?.businessName || 'Check out this vendor on Evenz.in',
         text: `Check out ${vendorInfo?.businessName} on Evenz.in!`,
         url: window.location.href,
      };

      if (navigator.share) {
         navigator.share(shareData)
            .then(() => {
               // Track successful share
               analytics.trackCustomEvent(
                  'share_success',
                  'social_sharing',
                  'native_share',
                  0
               );
            })
            .catch((error) => {
               console.error('Sharing failed:', error);
               analytics.trackError(
                  'share_error',
                  error.message,
                  'caterer_profile'
               );
            });
      } else {
         // Fallback: copy link
         navigator.clipboard.writeText(window.location.href)
            .then(() => {
               alert("Link copied to clipboard!");
               analytics.trackCustomEvent(
                  'share_fallback_success',
                  'social_sharing',
                  'clipboard_copy',
                  0
               );
            })
            .catch(() => {
               alert("Sharing is not supported in this browser. Please copy the link manually.");
               analytics.trackCustomEvent(
                  'share_fallback_failed',
                  'social_sharing',
                  'clipboard_failed',
                  0
               );
            });
      }
   };

   // Enhanced tab switching with analytics
   const handleTabChange = (tabId) => {
      // Track tab click
      analytics.trackButtonClick(`${tabId}_tab`, 'navigation');

      setActiveTab(tabId);
   };


   // Enhanced booking modal functions
   const handleBookingModalOpen = () => {
      // Track booking modal open
      analytics.trackButtonClick('check_availability', 'booking_funnel');
      analytics.trackCustomEvent(
         'booking_modal_opened',
         'booking_funnel',
         `caterer_${catererId}`,
         0
      );

      setShowBookingModal(true);
   };

   const handleBookingModalClose = () => {
      // Track booking modal close
      analytics.trackCustomEvent(
         'booking_modal_closed',
         'booking_funnel',
         `caterer_${catererId}`,
         0
      );

      setShowBookingModal(false);
   };

   // Handle tooltip interactions
   const handleTooltipToggle = () => {
      if (!currentUser) {
         // Track login prompt shown
         analytics.trackCustomEvent(
            'login_prompt_shown',
            'authentication',
            'shortlist_attempt',
            0
         );

         setShowTooltip(prev => !prev);
      }
   };

   // Track login link click
   const handleLoginLinkClick = () => {
      analytics.trackLinkClick(
         'login_from_shortlist_tooltip',
         'login_page',
         'authentication'
      );
   };

   // Helper function to safely render values
   const safeRender = (value, defaultText = 'Not specified') => {
      if (value === null || value === undefined || value === '' || value === "") {
         return defaultText;
      }
      if (typeof value === 'object') {
         return JSON.stringify(value);
      }
      return String(value);
   };

   const safeObjectEntries = (obj) => { if (!obj || typeof obj !== 'object') return []; return Object.entries(obj); };

   // Group master menu items by category for the new "Full Menu" tab
   const groupedMasterMenu = useMemo(() => {
      if (!catererData?.menu?.masterMenuItems || catererData.menu.masterMenuItems.length === 0) return null;
      return catererData.menu.masterMenuItems.reduce((acc, item) => {
         (acc[item.category] = acc[item.category] || []).push(item);
         return acc;
      }, {});
   }, [catererData]);

   // Helper to check if a section has meaningful data
   const hasContent = (data) => {
      if (!data) return false;
      if (typeof data === 'string') return data.trim() !== '';
      if (Array.isArray(data)) return data.length > 0;
      if (typeof data === 'object') return Object.values(data).some(v => v === true || (typeof v === 'string' && v.trim() !== ''));
      return false;
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="flex flex-col items-center space-y-4">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
               <p className="text-gray-600">Loading caterer profile...</p>
            </div>
         </div>
      );
   }

   if (error || !catererData) {
      return (
         <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full text-center">
               <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
               <h2 className="text-xl font-semibold text-gray-900 mb-2">Error Loading Profile</h2>
               <p className="text-gray-600 mb-4">{error || 'Caterer not found'}</p>
               <button
                  onClick={() => window.history.back()}
                  className="bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors"
               >
                  Go Back
               </button>
            </div>
         </div>
      );
   }

   const { vendorInfo, gallery, menu, services, legal, compliance, customization } = catererData;

   return (
      <div className="min-h-screen bg-gray-50">
         {/* Header */}
         <div className="bg-white text-gray-700 shadow-sm sticky top-17 z-40">
            <div className="max-w-7xl mx-auto px-4 sm:px-9 py-3 flex items-center justify-between">
               <div className="flex items-center gap-3">
                  <h1 className="font-semibold text-lg truncate">{safeRender(vendorInfo?.businessName)}</h1>
               </div>
               <div className="flex items-center gap-2">
                  <button onClick={handleShare} className="p-2 hover:bg-gray-100 rounded-full">
                     <Share2 className="w-5 h-5" />
                  </button>
                  <div className="relative group">
                     <button
                        onClick={() => {
                           if (currentUser) {
                              handleShortlist(catererId);
                           } else {
                              handleTooltipToggle(); // Toggle tooltip visibility
                           }
                        }}
                        className={`p-2 rounded-full transition-colors 
                             ${currentUser
                              ? (isShortlisted
                                 ? 'bg-red-50 text-red-500 hover:bg-red-100'
                                 : 'bg-gray-100 hover:bg-gray-200')
                              : 'bg-gray-200 cursor-not-allowed'
                           }`}
                     >
                        <Heart className={`w-5 h-5 ${isShortlisted && currentUser ? 'fill-current' : ''}`} />
                     </button>

                     {/* Tooltip for non-logged in users */}
                     {!currentUser && showTooltip && (
                        <div className="absolute right-0 mt-2 w-64 p-3 bg-white border border-gray-200 rounded-lg shadow-md z-50 text-sm sm:text-sm">
                           <p className="text-gray-700">
                              {/* <span className="font-semibold">Log in </span> */}

                              <Link
                                 href="/login"
                                 onClick={handleLoginLinkClick}
                                 className="text-white px-2 py-1 rounded-md bg-purple-700 mr-1 font-medium mt-1 inline-block"
                              >
                                 Login
                              </Link>
                              to shortlist this caterer and save them for later.

                           </p>

                        </div>
                     )}
                  </div>
               </div>
            </div>
         </div>

         {/* Hero Section */}
         <div className="bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-9 py-6">
               <div className="flex flex-col lg:flex-row gap-6">
                  {/* Gallery */}
                  <div className="lg:w-1/2">
                     {gallery?.cloudinaryUrl ? (

                        <div className="aspect-video bg-gray-200 rounded-lg overflow-hidden relative">
                           <img
                              src={gallery?.cloudinaryUrl}
                              alt="Caterer"
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                 e.target.src = '/placeholder-image.jpg'; // Fallback if image fails to load
                              }}
                           />
                        </div>
                     ) : null}

                     {/* Placeholder (shown when no image or image fails to load) */}
                     <div
                        className={`w-full h-full bg-gradient-to-r rounded-lg from-indigo-100 to-purple-100 flex items-center justify-center ${gallery?.cloudinaryUrl ? 'hidden' : 'flex'
                           }`}
                     >
                        <FaUtensils className="text-6xl text-indigo-300" />
                     </div>
                  </div>

                  {/* Basic Info */}
                  <div className="lg:w-1/2">
                     <div className="flex items-start justify-between mb-3">
                        <div>
                           <h1 className="text-2xl font-bold text-gray-900">{safeRender(vendorInfo?.businessName)}</h1>
                           <p className="text-gray-600">by {safeRender(vendorInfo?.ownerName)}</p>
                        </div>
                     </div>

                     <div className="space-y-3 mb-4 sm:mb-6">
                        <div className="flex items-start gap-2">
                           <MapPin className="w-5 h-5 text-gray-400 mt-0.5 flex-shrink-0" />
                           <span className="text-gray-600 text-sm">
                              {safeRender(vendorInfo?.address?.locality)}, {safeRender(vendorInfo?.address?.city)} - {safeRender(vendorInfo?.address?.pinCode)}
                           </span>
                        </div>
                     </div>

                     {/* Quick Stats Grid - Including Experience */}
                     <div className="grid grid-cols-3 gap-3 w-full mb-4">
                        {/* Experience Card */}
                        {gallery?.experience && (
                           <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-2 sm:p-3 md:p-4 rounded-lg border border-green-100">
                              <div className="flex items-center gap-1 sm:gap-2 mb-1">
                                 <Star className="w-3 h-3 sm:w-4 sm:h-4 text-green-600" />
                                 <div className="text-green-600 text-[10px] sm:text-xs font-medium uppercase tracking-wide">
                                    Experience
                                 </div>
                              </div>
                              <div className="flex items-baseline gap-1">
                                 <span className="text-xl sm:text-2xl font-bold text-green-700">
                                    {gallery.experience}
                                 </span>
                                 <span className="text-green-600 font-medium text-xs sm:text-sm">
                                    Years
                                 </span>
                              </div>
                           </div>
                        )}

                        {/* Min Guests Card */}
                        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-2 sm:p-3 md:p-4 rounded-lg border border-orange-100">
                           <div className="flex items-center gap-1 sm:gap-2 mb-1">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-orange-600" />
                              <div className="text-orange-600 text-[10px] sm:text-xs font-medium uppercase tracking-wide">
                                 Min Guests
                              </div>
                           </div>
                           <div className="text-xl sm:text-2xl font-bold text-orange-700">
                              {safeRender(legal?.minGuests)}
                           </div>
                        </div>

                        {/* Max Guests Card */}
                        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-2 sm:p-3 md:p-4 rounded-lg border border-blue-100">
                           <div className="flex items-center gap-1 sm:gap-2 mb-1">
                              <Users className="w-3 h-3 sm:w-4 sm:h-4 text-blue-600" />
                              <div className="text-blue-600 text-[10px] sm:text-xs font-medium uppercase tracking-wide">
                                 Max Guests
                              </div>
                           </div>
                           <div className="text-xl sm:text-2xl font-bold text-blue-700">
                              {safeRender(legal?.maxGuests)}
                           </div>
                        </div>
                     </div>

                     {/* Event Types */}
                     <div className="mb-4">
                        <h3 className="font-semibold text-gray-900 mb-2">Available for Events</h3>
                        <div className="flex flex-wrap gap-2 min-h-[2rem] items-center">
                           {(() => {
                              const availableEvents = safeObjectEntries(catererData?.services?.availableForEvents)
                                 .filter(([key, value]) => value === true);

                              return availableEvents.length > 0 ? (
                                 availableEvents.map(([key]) => (
                                    <span key={key} className="bg-gray-100 px-3 py-1 rounded-full text-sm text-gray-700 capitalize">
                                       {safeRender(key.replace(/([A-Z])/g, ' $1').trim())}
                                    </span>
                                 ))
                              ) : (
                                 <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                                    No event types configured
                                 </div>
                              );
                           })()}
                        </div>
                     </div>
                  </div>
               </div>
            </div>

            {/* Tab Navigation */}
            <div className="border-b border-gray-200">
               <div className="max-w-7xl mx-auto px-4 sm:px-9">
                  <div className="flex  space-x-8 overflow-x-auto">
                     {[
                        { id: 'menu', label: 'Packages & Counters' },
                        // Conditionally render the "Full Menu" tab
                        ...(groupedMasterMenu ? [{ id: 'full-menu', label: 'Full Menu' }] : []),
                        { id: 'services', label: 'Services & Logistics' },
                        { id: 'policies', label: 'Policies & Safety' }
                     ].map((tab) => (
                        <button
                           key={tab.id}
                           onClick={() => handleTabChange(tab.id)}
                           className={`py-4 cursor-pointer px-1 border-b-2 font-medium text-sm whitespace-nowrap ${activeTab === tab.id
                              ? 'border-orange-500 text-orange-600'
                              : 'border-transparent text-gray-500 hover:text-gray-700'
                              }`}
                        >
                           {tab.label}
                        </button>
                     ))}
                  </div>
               </div>
            </div>
         </div>

         {/* Tab Content */}
         <div className="max-w-7xl mx-auto px-4 sm:px-9 py-6">
            {activeTab === 'menu' && (
               <div className="space-y-6">
                  {/* Cuisines */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-3">Cuisines Offered</h3>
                     <div className="flex flex-wrap gap-2 min-h-[2rem] items-center">
                        {(() => {
                           const cuisines = menu.cuisines;

                           return (cuisines && Array.isArray(cuisines) && cuisines.length > 0) ? (
                              cuisines.map((cuisine, index) => (
                                 <span key={index} className="bg-orange-50 text-orange-700 px-4 py-2 rounded-lg font-medium">
                                    {safeRender(cuisine)}
                                 </span>
                              ))
                           ) : (
                              <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                                 No cuisines specified
                              </div>
                           );
                        })()}
                     </div>
                  </div>

                  {/* Packages */}
                  {(() => {
                     const packages = menu.packages;

                     // Check if packages exist and have valid data
                     if (!packages || typeof packages !== 'object' || Object.keys(packages).length === 0) {
                        return null;
                     }

                     // Filter out cuisine types that have no packages
                     const validCuisines = Object.entries(packages).filter(
                        ([cuisineType, packageList]) => Array.isArray(packageList) && packageList.length > 0
                     );

                     // If no valid cuisines with packages, don't render anything
                     if (validCuisines.length === 0) {
                        return null;
                     }

                     return validCuisines.map(([cuisineType, packages]) => (
                        <div key={cuisineType} className="bg-white p-4 sm:p-6 rounded-lg shadow-sm">
                           <h3 className="font-semibold text-gray-900 mb-4 text-lg sm:text-xl">{safeRender(cuisineType)} Packages</h3>
                           <div className="space-y-4 sm:space-y-6">
                              {packages.map((pkg) => (
                                 <div key={pkg._id} className="border border-gray-200 rounded-lg p-3 sm:p-4">
                                    {/* Header with name and price */}
                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4">
                                       <div className="flex-1">
                                          <h4 className="font-medium text-gray-900 text-base sm:text-lg">{pkg.name}</h4>
                                          <p className="text-sm text-gray-600 mt-1 leading-relaxed">{pkg.description}</p>
                                          <div className="flex items-center gap-2 mt-2">
                                             <span className={`px-2 py-1 rounded-full text-xs font-medium ${pkg.type === 'veg'
                                                ? 'bg-green-100 text-green-700'
                                                : pkg.type === 'non-veg'
                                                   ? 'bg-red-100 text-red-700'
                                                   : 'bg-orange-100 text-orange-700'
                                                }`}>
                                                {pkg.type === 'both' ? 'Veg & Non-Veg' : pkg.type.toUpperCase()}
                                             </span>
                                          </div>
                                       </div>
                                       <div className="text-left sm:text-right flex-shrink-0">
                                          <div className="text-xl sm:text-2xl font-bold text-orange-600">₹{pkg.pricePerPlate}</div>
                                          <div className="text-sm text-gray-500">per plate</div>
                                       </div>
                                    </div>

                                    {/* Item Counts - More responsive grid */}
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4">
                                       {Object.entries(pkg.itemCounts).map(([type, count]) => (
                                          <div key={type} className="text-center bg-gray-50 rounded-lg py-2 px-1">
                                             <div className="text-base sm:text-lg font-semibold text-gray-900">{count}</div>
                                             <div className="text-xs text-gray-500 capitalize leading-tight">{type}</div>
                                          </div>
                                       ))}
                                    </div>

                                    {/* Menu Items - Improved mobile layout */}
                                    <div className="space-y-3 ">
                                       <h5 className="font-medium text-gray-900 text-sm sm:text-base">Menu Items:</h5>
                                       <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2 sm:gap-3 mb-4 ">
                                          {pkg.menuItems.map((item, index) => (
                                             <div key={index} className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-1 sm:gap-2 p-2 sm:p-0 bg-gray-50 sm:bg-transparent rounded-lg sm:rounded-none">
                                                <div className="flex items-center gap-2 flex-1">
                                                   <span className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full flex-shrink-0 ${item.vegNonVeg === 'veg' ? 'bg-green-800' : 'bg-red-500'
                                                      }`}></span>
                                                   <div className="flex flex-col sm:flex-row sm:items-center sm:gap-2 min-w-0">
                                                      <span className="capitalize text-xs sm:text-sm text-gray-600 font-medium">{item.type}:</span>
                                                      <span className="font-medium text-sm sm:text-sm text-gray-900 break-words">{item.name}</span>
                                                   </div>
                                                </div>
                                                {item.extraPrice > 0 && (
                                                   <span className="text-orange-600 font-medium text-sm flex-shrink-0 self-start sm:self-center">+₹{item.extraPrice}</span>
                                                )}
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 </div>
                              ))}
                           </div>
                        </div>
                     ));
                  })()}

                  {/* Live Counters */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                        <ChefHat className="w-5 h-5" />
                        Live Counters
                     </h3>
                     <div className="space-y-4 min-h-[2rem] items-center">
                        {(() => {
                           const liveCounters = catererData?.services?.liveCounters;

                           return (liveCounters && Array.isArray(liveCounters) && liveCounters.length > 0) ? (
                              liveCounters.map((counter, index) => (
                                 <div key={index} className="border border-gray-200 rounded-lg p-4">
                                    <div className="flex justify-between items-start mb-2">
                                       <h4 className="font-medium text-gray-900">{safeRender(counter.name)}</h4>
                                       <span className="text-orange-600 font-semibold">₹{safeRender(counter.pricePerPlate)}/plate</span>
                                    </div>
                                    <p className="text-gray-600 text-sm">{safeRender(counter.description)}</p>
                                 </div>
                              ))
                           ) : (
                              <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                                 Live counters not configured
                              </div>
                           );
                        })()}
                     </div>
                  </div>
               </div>
            )}

            {activeTab === 'full-menu' && groupedMasterMenu && (
               <div className="bg-white p-6 rounded-lg shadow-sm">
                  <h3 className="font-semibold text-gray-900 mb-4 text-xl">Full Menu Library</h3>
                  <div className="space-y-6">
                     {Object.entries(groupedMasterMenu).map(([category, items]) => (
                        <div key={category}>
                           <h4 className="font-medium text-gray-800 text-lg mb-3 capitalize">{category}</h4>
                           <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                              {items.map(item => (
                                 <div key={item._id} className="flex items-center gap-2 p-2 bg-gray-50 rounded">
                                    <span className={`w-2 h-2 rounded-full ${item.type === 'veg' ? 'bg-green-500' : 'bg-red-500'}`}></span>
                                    <p className="text-gray-700 text-sm">{item.name}</p>
                                    {item.extraCharge > 0 && <span className="text-xs text-orange-600 font-medium">(+₹{item.extraCharge})</span>}
                                 </div>
                              ))}
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {activeTab === 'services' && (
               <div className="space-y-6">

                  {/* Meal Service Types */}
                  {(() => {
                     const mealServices = safeObjectEntries(catererData?.services?.mealServiceTypes)
                        .filter(([key, value]) => typeof value === 'boolean');

                     if (mealServices.length === 0) return null;

                     return (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                           <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Utensils className="w-5 h-5" />
                              Meal Service Types
                           </h3>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {mealServices.map(([key, value]) => (
                                 <div key={key} className="flex items-center gap-2">
                                    {value ? (
                                       <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                       <XCircle className="w-5 h-5 text-gray-300" />
                                    )}
                                    <span className={`text-sm capitalize ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                                       {safeRender(key.replace(/([A-Z])/g, ' $1').trim())}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     );
                  })()}

                  {/* Staff Details */}
                  {(() => {
                     const staffDetails = services?.staffDetails;
                     const hasStaffDetails =
                        typeof staffDetails === "string"
                           ? staffDetails.trim() !== "" && staffDetails.trim() !== "{}"
                           : staffDetails && Object.keys(staffDetails).length > 0;

                     if (!hasStaffDetails) return null;

                     return (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                           <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <Users className="w-5 h-5" />
                              Staff Details
                           </h3>
                           <p className="text-gray-600 mb-4">{safeRender(staffDetails)}</p>
                        </div>
                     );
                  })()}

                  {/* Tableware */}
                  {(() => {
                     const tableware = safeObjectEntries(services?.tableware)
                        .filter(([key, value]) => typeof value === 'boolean');

                     if (tableware.length === 0) return null;

                     return (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                           <h3 className="font-semibold text-gray-900 mb-3">Tableware Provided</h3>
                           <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                              {tableware.map(([key, value]) => (
                                 <div key={key} className="flex items-center gap-2">
                                    {value ? (
                                       <CheckCircle className="w-5 h-5 text-green-500" />
                                    ) : (
                                       <XCircle className="w-5 h-5 text-gray-300" />
                                    )}
                                    <span className={`text-sm capitalize ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                                       {safeRender(key)}
                                    </span>
                                 </div>
                              ))}
                           </div>
                        </div>
                     );
                  })()}

                  {/* Customization Allowed */}
                  {(customization?.allowCustomization !== undefined ||
                     (customization?.allowCustomization && customization?.customizationCharges.hasCharges)) && (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                           <h3 className="font-semibold text-gray-900 mb-3">Menu Customization</h3>
                           <div className="flex items-center gap-2 mb-3">
                              {customization?.allowCustomization ? (
                                 <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                 <XCircle className="w-5 h-5 text-red-500" />
                              )}
                              <span className={`font-medium ${customization?.allowCustomization ? 'text-green-700' : 'text-red-700'
                                 }`}>
                                 {customization?.allowCustomization ? 'Customization Available' : 'No Customization'}
                              </span>
                           </div>

                           {customization?.allowCustomization && customization?.customizationCharges.hasCharges && (
                              <div className="bg-orange-50 p-3 rounded-lg">
                                 <span className="text-orange-700 font-medium">
                                    Customization Charges: ₹{safeRender(customization?.customizationCharges.amount)}
                                    {customization?.customizationCharges.chargeType === 'per_plate' ? ' per plate' : ' fixed'}
                                 </span>
                              </div>
                           )}
                        </div>
                     )}

                  {/* Dietary Filters */}
                  {(() => {
                     const dietaryFilters = safeObjectEntries(customization?.dietaryFilters)
                        .filter(([key, value]) => typeof value === 'boolean');
                     const hasCustomDietary = Array.isArray(customization?.dietaryFilters?.custom) &&
                        customization.dietaryFilters.custom.length > 0;

                     if (dietaryFilters.length === 0 && !hasCustomDietary) return null;

                     return (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                           <h3 className="font-semibold text-gray-900 mb-3">Dietary Options</h3>
                           {dietaryFilters.length > 0 && (
                              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                 {dietaryFilters.map(([key, value]) => (
                                    <div key={key} className="flex items-center gap-2">
                                       {value ? (
                                          <CheckCircle className="w-5 h-5 text-green-500" />
                                       ) : (
                                          <XCircle className="w-5 h-5 text-gray-300" />
                                       )}
                                       <span className={`text-sm capitalize ${value ? 'text-gray-900' : 'text-gray-400'}`}>
                                          {safeRender(key.replace(/([A-Z])/g, ' $1').trim())}
                                       </span>
                                    </div>
                                 ))}
                              </div>
                           )}

                           {hasCustomDietary && (
                              <div className={dietaryFilters.length > 0 ? "mt-4" : ""}>
                                 <h4 className="font-medium text-gray-900 mb-2">Custom Dietary Options:</h4>
                                 <div className="flex flex-wrap gap-2">
                                    {customization.dietaryFilters.custom.map((filter, index) => (
                                       <span key={index} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm">
                                          {safeRender(filter)}
                                       </span>
                                    ))}
                                 </div>
                              </div>
                           )}
                        </div>
                     );
                  })()}

                  {/* Special Menus */}
                  {(() => {
                     const hasSpecialMenus = (Array.isArray(customization?.specialMenus) && customization.specialMenus.length > 0) ||
                        (typeof customization?.specialMenus === "string" && customization.specialMenus.trim() !== "");

                     if (!hasSpecialMenus) return null;

                     return (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                           <h3 className="font-semibold text-gray-900 mb-3">Special Menus</h3>
                           {Array.isArray(customization?.specialMenus) ? (
                              <ul className="list-disc list-inside text-gray-600 space-y-1">
                                 {customization.specialMenus.map((menu, index) => (
                                    <li key={index}>{safeRender(menu)}</li>
                                 ))}
                              </ul>
                           ) : (
                              <p className="text-gray-600">{safeRender(customization.specialMenus)}</p>
                           )}
                        </div>
                     );
                  })()}

                  {/* Tasting Session */}
                  {customization?.tastingSession?.allowed && (
                     <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-3">Tasting Session</h3>
                        <>
                           <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="font-medium text-green-700">Tasting Session Available</span>
                           </div>
                           <p className="text-gray-600">{safeRender(customization?.tastingSession?.description)}</p>
                        </>
                     </div>
                  )}

                  {/* Delivery & Setup */}
                  {services?.deliveryLogistics && (
                     <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-3">Delivery & Setup</h3>
                        <p className="text-gray-600">{safeRender(services?.deliveryLogistics)}</p>
                     </div>
                  )}

               </div>
            )}

            {activeTab === 'policies' && (
               <div className="space-y-6">
                  {/* Payment Information */}
                  {(() => {
                     const paymentMethods = safeObjectEntries(legal?.acceptedPaymentModes)
                        .filter(([key, value]) => value === true);
                     const hasBookingAdvance = legal?.bookingAdvance?.value;

                     if (paymentMethods.length === 0 && !hasBookingAdvance) return null;

                     return (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                           <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                              <CreditCard className="w-5 h-5" />
                              Payment Information
                           </h3>
                           <div className="space-y-4">
                              {paymentMethods.length > 0 && (
                                 <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Accepted Payment Methods:</h4>
                                    <div className="flex flex-wrap gap-2">
                                       {paymentMethods.map(([key]) => (
                                          <span key={key} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm capitalize">
                                             {key === 'netBanking' ? 'Net Banking' : key}
                                          </span>
                                       ))}
                                    </div>
                                 </div>
                              )}
                              {hasBookingAdvance && (
                                 <div className="bg-orange-50 p-3 rounded-lg">
                                    <span className="text-orange-700 font-medium">
                                       Booking Advance: {safeRender(legal?.bookingAdvance?.value)}%
                                    </span>
                                 </div>
                              )}
                           </div>
                        </div>
                     );
                  })()}

                  {/* Booking Policies */}
                  {(legal?.minimumNoticeDays || legal?.gstRegistrationNumber) && (
                     <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-3">Booking Policies</h3>
                        <div className="space-y-3 text-gray-700">
                           {legal?.minimumNoticeDays && (
                              <div className="flex justify-between items-center">
                                 <span className="text-gray-600">Minimum Notice Period:</span>
                                 <span className="font-medium">{safeRender(legal?.minimumNoticeDays)} days</span>
                              </div>
                           )}
                           {legal?.gstRegistrationNumber && (
                              <div className="flex justify-between items-center">
                                 <span className="text-gray-600">GST Registration:</span>
                                 <span className="font-medium">{safeRender(legal?.gstRegistrationNumber)}</span>
                              </div>
                           )}
                        </div>
                     </div>
                  )}

                  {/* Cancellation Policy */}
                  {legal?.cancellationRefundPolicy && (
                     <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-3">Cancellation & Refund Policy</h3>
                        <p className="text-gray-600">{safeRender(legal?.cancellationRefundPolicy)}</p>
                     </div>
                  )}

                  {/* FSSAI License */}
                  {compliance?.fssaiLicense?.number && (
                     <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                           <Shield className="w-5 h-5" />
                           FSSAI License
                        </h3>
                        <div className="bg-green-50 p-3 rounded-lg">
                           <span className="text-green-700 font-medium">
                              License Number: {safeRender(compliance?.fssaiLicense?.number)}
                           </span>
                        </div>
                     </div>
                  )}

                  {/* Hygiene Audits */}
                  {compliance?.hygieneAudits?.details && (
                     <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-3">Hygiene Audits</h3>
                        <p className="text-gray-600">{safeRender(compliance?.hygieneAudits?.details)}</p>
                     </div>
                  )}

                  {/* Allergen Handling */}
                  {compliance?.allergenHandling?.details && (
                     <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-3">Allergen Handling</h3>
                        <p className="text-gray-600">{safeRender(compliance?.allergenHandling?.details)}</p>
                     </div>
                  )}

                  {/* Insurance */}
                  {(compliance?.insurance?.provided && compliance?.insurance?.details) && (
                     <div className="bg-white p-6 rounded-lg shadow-sm">
                        <h3 className="font-semibold text-gray-900 mb-3">Insurance</h3>
                        <div className="flex items-center gap-2 mb-2">
                           <CheckCircle className="w-5 h-5 text-green-500" />
                           <span className="font-medium text-green-700">Insurance Provided</span>
                        </div>
                        <p className="text-gray-600">{safeRender(compliance?.insurance?.details)}</p>
                     </div>
                  )}
               </div>
            )}
         </div>

         {/* Floating Action Button */}
         <div className="fixed bottom-6 right-6">
            <button
               onClick={handleBookingModalOpen}
               className="bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 rounded-full shadow-lg flex items-center gap-2 font-medium"
            >
               <Calendar className="w-5 h-5" />
               Check Availability
            </button>
         </div>

         {/* Booking Modal */}
         <BookingModal
            vendor={vendorInfo}
            showModal={showBookingModal}
            onClose={handleBookingModalClose}
         />
      </div>
   );
};

export default CatererProfileView;