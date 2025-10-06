"use client"
import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { FaHeart, FaMapMarkerAlt, FaPhone, FaUser, FaEye, FaTrash } from 'react-icons/fa';
import useAnalytics from '@/hooks/useAnalytics';
import { useAuth } from '@/context/AuthContext'; // 1. Import useAuth
import { api } from '@/context/AuthContext';    // 2. Import the central api instance


const UserShortlists = () => {
  const [shortlistedCaterers, setShortlistedCaterers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const analytics = useAnalytics();

  // 3. Get the authentication state from the context
  const { accessToken, loading: authLoading } = useAuth();

  // 4. Wrap the data fetching in a useCallback and useEffect
  const fetchShortlistedCaterers = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/user/shortlist');
      if (response.data.success) {
        setShortlistedCaterers(response.data.data);
      } else {
        setError(response.data.message);
      }
    } catch (err) {
      setError(err.message || 'Failed to fetch shortlisted caterers');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && accessToken) {
      analytics.trackPageView('shortlists_page', 'dashboard');
      fetchShortlistedCaterers();
    } else if (!authLoading && !accessToken) {
      setLoading(false);
    }
  }, [accessToken, authLoading, fetchShortlistedCaterers]);

  const handleRemoveFromShortlist = async (catererId, catererName) => {
    try {
      analytics.trackCustomEvent('shortlist_remove_attempt', 'user_action', catererName);

      const response = await api.delete(`/user/shortlist/${catererId}`);

      if (response.data.success) {
        setShortlistedCaterers(prev =>
          prev.filter(item => {
            // Handle both _id and id formats
            const itemId = item.caterer._id || item.caterer.id;
            return itemId !== catererId;
          })
        );
        analytics.trackCustomEvent('shortlist_removed', 'user_action', catererName);
      } else {
        setError(response.data.message || 'Failed to remove from shortlist');
      }
    } catch (error) {
      setError(error.message || 'Error removing from shortlist');
    }
  };

  const formatPrice = (priceRange) => {
    if (!priceRange || !priceRange.min || !priceRange.max) return 'Price not available';
    if (priceRange.min === priceRange.max) {
      return `₹${priceRange.min}/plate`;
    }
    return `₹${priceRange.min} - ₹${priceRange.max}/plate`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-gray-800">
        <h1 className="text-xl md:text-2xl font-semibold mb-6">Shortlisted Caterers</h1>
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-700"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-6 text-gray-800">
        <h1 className="text-xl md:text-2xl font-semibold mb-6">Shortlisted Caterers</h1>
        <div className="text-center py-12">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => {
              analytics.trackButtonClick('retry_shortlist_fetch', 'error_recovery');
              fetchShortlistedCaterers();
            }}
            className="bg-purple-700 text-white px-6 py-2 rounded-md hover:bg-purple-800 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 text-gray-800">
      <h1 className="text-xl md:text-2xl font-semibold mb-6">Shortlisted Caterers</h1>

      {shortlistedCaterers.length === 0 ? (
        <div className="min-h-[300px]">
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <FaHeart className="text-4xl md:text-5xl text-gray-400 mb-4" />
            <p className="text-gray-600 mb-4 text-sm md:text-base">
              You haven&apos;t shortlisted any caterer yet.
            </p>
            <Link
              href="/dashboard"
              onClick={() => analytics.trackLinkClick('explore_caterers', 'dashboard', 'cta')}
              className="bg-purple-700 text-white px-6 py-2 rounded-md hover:bg-purple-800 transition-colors text-sm md:text-base"
            >
              Explore Caterers
            </Link>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4 md:gap-6">
          {shortlistedCaterers.map((item) => (
            <div
              key={item.shortlistId}
              className="flex flex-col gap-3 w-full border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300"
            >
              {/* Content */}
              <div className=" p-4 w-full">
                <div className='flex justify-between items-center'>
                  <h3 className="font-semibold text-lg mb-2 text-gray-800 line-clamp-1">
                    {item.caterer.businessName}
                  </h3>
                  <div className="mb-4">
                    <p className="text-xs text-gray-500">
                      Shortlisted on {new Date(item.shortlistedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                {/* Address */}
                <div className="flex items-start gap-2 mb-2">
                  <FaMapMarkerAlt className="text-gray-500 text-sm mt-1 flex-shrink-0" />
                  <p className="text-gray-600 text-sm line-clamp-2">
                    {item.caterer.address}
                  </p>
                </div>

                {/* Price Range */}
                <div className="mb-2">
                  <p className="text-sm text-gray-600">
                    <strong className="text-purple-700">
                      {formatPrice(item.caterer.priceRange)}
                    </strong>
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4">
                  <Link
                    href={`/vendors/${item.caterer.id}`}
                    onClick={() => analytics.trackLinkClick('view_caterer_profile', `vendor_${item.caterer.id}`, 'shortlist_action')}
                    className="flex-1 bg-purple-700 text-white py-2 px-3 rounded-md hover:bg-purple-800 transition-colors text-center text-sm font-medium flex items-center justify-center gap-1"
                  >
                    <FaEye className="text-xs" />
                    View Profile
                  </Link>
                  <button
                    onClick={() => {
                      analytics.trackButtonClick('remove_from_shortlist', 'shortlist_action');
                      handleRemoveFromShortlist(item.caterer.id, item.caterer.businessName);
                    }}
                    className="cursor-pointer flex-1 bg-red-50 text-red-600 py-2 px-3 rounded-md hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-1 border border-red-200"
                  >
                    <FaTrash className="text-xs" />
                    Remove 
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default UserShortlists;