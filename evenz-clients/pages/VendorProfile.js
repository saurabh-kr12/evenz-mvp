"use client";
import React, { useState, useEffect,useRef } from 'react';
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
import  useAnalytics  from '@/hooks/useAnalytics';

const CatererProfileView = () => {
   const { id: catererId } = useParams();
   const [catererData, setCatererData] = useState(null);
   const [isShortlisted, setIsShortlisted] = useState(false);
   const [showBookingModal, setShowBookingModal] = useState(false);
   const [showTooltip, setShowTooltip] = useState(false);
   const [activeTab, setActiveTab] = useState('overview');
   const [error, setError] = useState(null);
   const [loading, setLoading] = useState(true);
   const { currentUser } = useAuth();
   const analytics = useAnalytics();

   // Tab time tracking
   const tabStartTime = useRef(Date.now());
   const pageStartTime = useRef(Date.now());
   const tabTimeSpent = useRef({});


   // Component mount tracking
   useEffect(() => {
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

   useEffect(() => {
      fetchCatererProfile();
      checkShortlistStatus(catererId);
   }, [catererId]);

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

   const fetchCatererProfile = async () => {
      try {
         setLoading(true);

         // Track profile fetch start
         analytics.trackCustomEvent(
            'profile_fetch_started',
            'api_call',
            `caterer_${catererId}`,
            0
         );

         const response = await fetch(`http://localhost:5000/api/caterers-details/${catererId}/view-profile`);

         if (!response.ok) {
            throw new Error('Failed to fetch caterer profile');
         }

         const data = await response.json();
         if (data.success) {
            setCatererData(data.data);
            // Track successful profile load
            analytics.trackCustomEvent(
               'profile_loaded_success',
               'api_call',
               `caterer_${catererId}`,
               0
            );
         } else {
            throw new Error(data.message || 'Failed to load caterer profile');
         }
      } catch (err) {
         setError(err.message);
         // Track profile load error
         analytics.trackError(
            'profile_load_error',
            err.message,
            'caterer_profile'
         );
      } finally {
         setLoading(false);
      }
   };

   const checkShortlistStatus = async (catererId) => {
      try {
         const catererIdString = typeof catererId === 'object' ? catererId._id || catererId.id : catererId;

         const token = localStorage.getItem('clientToken');
         const response = await fetch(`http://localhost:5000/api/user/shortlist/${catererIdString}/status`, {
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         });
         const data = await response.json();
         if (data.success) {
            setIsShortlisted(data.isShortlisted);
         }
      } catch (error) {
         console.error('Error checking shortlist status:', error);
      }
   };

   // handleShortlist function to toggle shortlist status
   // Enhanced handleShortlist function with analytics
   const handleShortlist = async (catererId) => {
      try {
         const catererIdString = typeof catererId === 'object' ? catererId._id || catererId.id : catererId;

         if (!catererIdString) {
            console.error('Invalid caterer ID provided');
            analytics.trackError(
               'invalid_caterer_id',
               'Missing caterer ID',
               'caterer_profile'
            );
            return;
         }

         const token = localStorage.getItem('clientToken');

         if (!token) {
            console.error('No authentication token found');
            analytics.trackError(
               'auth_token_missing',
               'No authentication token',
               'caterer_profile'
            );
            return;
         }

         // Track shortlist action start
         const action = isShortlisted ? 'remove_from_shortlist' : 'add_to_shortlist';
         analytics.trackCustomEvent(
            `${action}_started`,
            'shortlist_interaction',
            `caterer_${catererIdString}`,
            0
         );

         if (isShortlisted) {
            // Remove from shortlist
            const response = await fetch(`http://localhost:5000/api/user/shortlist/${catererIdString}`, {
               method: 'DELETE',
               headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
               }
            });

            const data = await response.json();

            if (data.success) {
               setIsShortlisted(false);
               
               // Track successful removal
               analytics.trackCustomEvent(
                  'remove_from_shortlist_success',
                  'shortlist_interaction',
                  `caterer_${catererIdString}`,
                  0
               );
               
               console.log('Caterer removed from shortlist');
            } else {
               console.error('Failed to remove from shortlist:', data.message);
               analytics.trackError(
                  'shortlist_remove_error',
                  data.message,
                  'caterer_profile'
               );
            }
         } else {
            // Add to shortlist
            const response = await fetch(`http://localhost:5000/api/user/shortlist/${catererIdString}`, {
               method: 'POST',
               headers: {
                  'Authorization': `Bearer ${token}`,
                  'Content-Type': 'application/json'
               }
            });

            const data = await response.json();

            if (data.success) {
               setIsShortlisted(true);
               
               // Track successful addition
               analytics.trackCustomEvent(
                  'add_to_shortlist_success',
                  'shortlist_interaction',
                  `caterer_${catererIdString}`,
                  0
               );
               
               // Track conversion event
               analytics.trackConversion('vendor_shortlisted', 1);
               
               console.log('Caterer added to shortlist');
            } else {
               console.error('Failed to add to shortlist:', data.message);
               analytics.trackError(
                  'shortlist_add_error',
                  data.message,
                  'caterer_profile'
               );
            }
         }
      } catch (error) {
         console.error('Error toggling shortlist:', error);
         analytics.trackError(
            'shortlist_toggle_error',
            error.message,
            'caterer_profile'
         );
      }
   };

   // Enhanced handleShare function with analytics
   const handleShare = () => {
      // Track share button click
      analytics.trackButtonClick('share_profile', 'social_sharing');
      
      const shareData = {
         title: catererData?.businessName || 'Check out this vendor on Evenz',
         text: `Check out ${catererData?.businessName} on Evenz!`,
         url: window.location.href,
      };

      if (navigator.share) {
         navigator.share(shareData)
            .then(() => {
               console.log('Shared successfully');
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
   // Add this helper function at the top of your component
   const getImageUrl = (imagePath) => {
      if (!imagePath) return '/placeholder-image.jpg'; // fallback image

      // If it's already a full URL, return as is
      if (imagePath.startsWith('http')) {
         return imagePath;
      }

      // Convert backslashes to forward slashes and construct full URL
      const normalizedPath = imagePath.replace(/\\/g, '/');
      return `http://localhost:5000/${normalizedPath}`;
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

                     <div className="flex gap-2 mt-3">
                        {gallery.images?.slice(1, 4).map((item, index) => (
                           <div key={index} className="w-20 h-20 bg-gray-200 rounded-lg overflow-hidden">
                              <img
                                 src={getImageUrl(item.url || item.path)}
                                 alt=""
                                 className="w-full h-full object-cover"
                                 onError={(e) => {
                                    e.target.src = '/placeholder-image.jpg';
                                 }}
                              />
                           </div>
                        ))}
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
                        { id: 'overview', label: 'Overview' },
                        { id: 'menu', label: 'Menu & Packages' },
                        { id: 'services', label: 'Services' },
                        { id: 'customization', label: 'Customization' },
                        { id: 'compliance', label: 'Compliance' },
                        { id: 'policies', label: 'Policies' }
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
            {activeTab === 'overview' && (
               <div className="space-y-6">
                  {/* Meal Service Types */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Utensils className="w-5 h-5" />
                        Meal Service Types
                     </h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3 min-h-[2rem] items-center">
                        {(() => {
                           const mealServices = safeObjectEntries(catererData?.services?.mealServiceTypes)
                              .filter(([key, value]) => typeof value === 'boolean');

                           return mealServices.length > 0 ? (
                              mealServices.map(([key, value]) => (
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
                              ))
                           ) : (
                              <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200 col-span-full">
                                 Meal services not specified
                              </div>
                           );
                        })()}
                     </div>
                  </div>

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

                     return (packages && typeof packages === 'object' && Object.keys(packages).length > 0) ? (
                        Object.entries(packages).map(([cuisineType, packages]) => (
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
                        ))
                     ) : (
                        <div className="bg-white p-6 rounded-lg shadow-sm">
                           <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                              No packages configured
                           </div>
                        </div>
                     );
                  })()}
               </div>
            )}

            {activeTab === 'services' && (
               <div className="space-y-6">
                  {/* Staff Details */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Users className="w-5 h-5" />
                        Staff Details
                     </h3>
                     {(() => {
                        const staffDetails = services?.staffDetails;

                        const hasStaffDetails =
                           typeof staffDetails === "string"
                              ? staffDetails.trim() !== "" && staffDetails.trim() !== "{}"
                              : staffDetails && Object.keys(staffDetails).length > 0;

                        return hasStaffDetails ? (
                           <>
                              <p className="text-gray-600 mb-4">{safeRender(staffDetails)}</p>
                              <div className="bg-gray-50 p-4 rounded-lg">
                                 <div className="flex justify-between items-center">
                                    <span className="text-gray-700">Staff Cost:</span>
                                    <span className="font-semibold text-gray-600">
                                       ₹{safeRender(services?.staffProvided?.cost)}{" "}
                                       {safeRender(
                                          services?.staffProvided?.costType?.replace("_", " ")
                                       )}
                                    </span>
                                 </div>
                                 <div className="text-sm text-gray-500 mt-1">
                                    Ratio: {safeRender(services?.staffProvided?.ratio?.staffCount)} staff
                                    per {safeRender(services?.staffProvided?.ratio?.guestCount)} guests
                                 </div>
                              </div>
                           </>
                        ) : (
                           <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                              Staff details not specified
                           </div>
                        );
                     })()}

                  </div>

                  {/* Tableware */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-3">Tableware Provided</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3 min-h-[2rem] items-center">
                        {(() => {
                           const tableware = safeObjectEntries(services?.tableware)
                              .filter(([key, value]) => typeof value === 'boolean');

                           return tableware.length > 0 ? (
                              tableware.map(([key, value]) => (
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
                              ))
                           ) : (
                              <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200 col-span-full">
                                 Tableware details not specified
                              </div>
                           );
                        })()}
                     </div>
                  </div>

                  {/* Delivery & Setup */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-3">Delivery & Setup</h3>
                     {services?.deliveryLogistics ? (
                        <p className="text-gray-600">{safeRender(services?.deliveryLogistics)}</p>
                     ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                           Delivery and setup details not specified
                        </div>
                     )}
                  </div>
               </div>
            )}

            {activeTab === 'customization' && (
               <div className="space-y-6">
                  {/* Customization Allowed */}
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

                  {/* Dietary Filters */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-3">Dietary Options</h3>
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-3 min-h-[2rem] items-center">
                        {(() => {
                           const dietaryFilters = safeObjectEntries(customization?.dietaryFilters)
                              .filter(([key, value]) => typeof value === 'boolean');

                           return dietaryFilters.length > 0 ? (
                              dietaryFilters.map(([key, value]) => (
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
                              ))
                           ) : (
                              <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200 col-span-full">
                                 Dietary options not specified
                              </div>
                           );
                        })()}
                     </div>

                     {customization?.dietaryFilters?.custom && Array.isArray(customization.dietaryFilters.custom) && customization.dietaryFilters.custom.length > 0 && (
                        <div className="mt-4">
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

                  {/* Special Menus */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-3">Special Menus</h3>

                     {Array.isArray(customization?.specialMenus) && customization.specialMenus.length > 0 ? (
                        <ul className="list-disc list-inside text-gray-600 space-y-1">
                           {customization.specialMenus.map((menu, index) => (
                              <li key={index}>{safeRender(menu)}</li>
                           ))}
                        </ul>
                     ) : typeof customization?.specialMenus === "string" && customization.specialMenus.trim() !== "" ? (
                        <p className="text-gray-600">{safeRender(customization.specialMenus)}</p>
                     ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                           Special menus not specified
                        </div>
                     )}
                  </div>



                  {/* Tasting Session */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-3">Tasting Session</h3>
                     {customization?.tastingSession?.allowed ? (
                        <>
                           <div className="flex items-center gap-2 mb-2">
                              <CheckCircle className="w-5 h-5 text-green-500" />
                              <span className="font-medium text-green-700">Tasting Session Available</span>
                           </div>
                           <p className="text-gray-600">{safeRender(customization?.tastingSession?.description)}</p>
                        </>
                     ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                           Tasting session not available
                        </div>
                     )}
                  </div>
               </div>
            )}

            {activeTab === 'compliance' && (
               <div className="space-y-6">
                  {/* FSSAI License */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5" />
                        FSSAI License
                     </h3>
                     {compliance?.fssaiLicense?.number ? (
                        <div className="bg-green-50 p-3 rounded-lg">
                           <span className="text-green-700 font-medium">
                              License Number: {safeRender(compliance?.fssaiLicense?.number)}
                           </span>
                        </div>
                     ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                           FSSAI license not specified
                        </div>
                     )}
                  </div>

                  {/* Hygiene Audits */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-3">Hygiene Audits</h3>
                     {compliance?.hygieneAudits?.details ? (
                        <p className="text-gray-600">{safeRender(compliance?.hygieneAudits?.details)}</p>
                     ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                           Hygiene audit details not specified
                        </div>
                     )}
                  </div>

                  {/* Allergen Handling */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-3">Allergen Handling</h3>
                     {compliance?.allergenHandling?.details ? (
                        <p className="text-gray-600">{safeRender(compliance?.allergenHandling?.details)}</p>
                     ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                           Allergen handling details not specified
                        </div>
                     )}
                  </div>

                  {/* Insurance */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-3">Insurance</h3>
                     {compliance?.insurance?.provided && compliance?.insurance?.details ? (
                        <>
                           <div className="flex items-center gap-2 mb-2">
                              {compliance?.insurance?.provided ? (
                                 <CheckCircle className="w-5 h-5 text-green-500" />
                              ) : (
                                 <XCircle className="w-5 h-5 text-red-500" />
                              )}
                              <span className={`font-medium ${compliance?.insurance?.provided ? 'text-green-700' : 'text-red-700'
                                 }`}>
                                 {compliance?.insurance?.provided ? 'Insurance Provided' : 'No Insurance'}
                              </span>
                           </div>
                           <p className="text-gray-600">{safeRender(compliance?.insurance?.details)}</p>
                        </>
                     ) : !compliance?.insurance?.provided && (
                        <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                           Insurance details not specified
                        </div>
                     )}
                  </div>
               </div>
            )}

            {activeTab === 'policies' && (
               <div className="space-y-6">
                  {/* Payment Information */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                        <CreditCard className="w-5 h-5" />
                        Payment Information
                     </h3>
                     <div className="space-y-4">
                        <div>
                           <h4 className="font-medium text-gray-900 mb-2">Accepted Payment Methods:</h4>
                           <div className="flex flex-wrap gap-2 min-h-[2rem] items-center">
                              {(() => {
                                 const paymentMethods = safeObjectEntries(legal?.acceptedPaymentModes)
                                    .filter(([key, value]) => value === true);

                                 return paymentMethods.length > 0 ? (
                                    paymentMethods.map(([key]) => (
                                       <span key={key} className="bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-sm capitalize">
                                          {key === 'netBanking' ? 'Net Banking' : key}
                                       </span>
                                    ))
                                 ) : (
                                    <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                                       Payment methods not specified
                                    </div>
                                 );
                              })()}
                           </div>
                        </div>
                        {legal?.bookingAdvance?.value ? (
                           <div className="bg-orange-50 p-3 rounded-lg">
                              <span className="text-orange-700 font-medium">
                                 Booking Advance: {safeRender(legal?.bookingAdvance?.value)}%
                              </span>
                           </div>
                        ) : (
                           <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                              Booking advance not specified
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Booking Policies */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-3">Booking Policies</h3>
                     <div className="space-y-3 text-gray-700">
                        {legal?.minimumNoticeDays || legal?.gstRegistrationNumber ? (
                           <>
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
                           </>
                        ) : (
                           <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                              Booking policies not specified
                           </div>
                        )}
                     </div>
                  </div>

                  {/* Cancellation Policy */}
                  <div className="bg-white p-6 rounded-lg shadow-sm">
                     <h3 className="font-semibold text-gray-900 mb-3">Cancellation & Refund Policy</h3>
                     {legal?.cancellationRefundPolicy ? (
                        <p className="text-gray-600">{safeRender(legal?.cancellationRefundPolicy)}</p>
                     ) : (
                        <div className="bg-gray-50 px-3 py-2 rounded-lg text-gray-500 text-sm italic border-2 border-dashed border-gray-200">
                           Cancellation and refund policy not specified
                        </div>
                     )}
                  </div>
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