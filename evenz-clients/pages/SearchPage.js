"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { FaSearch, FaMapMarkerAlt, FaUtensils, FaRupeeSign } from 'react-icons/fa';
import useAnalytics from '../hooks/useAnalytics'; // Adjust path as needed

const SearchPage = () => {
  const location = useParams;
  const analytics = useAnalytics();
  
  // Get query parameters for initial search (if any)
  const queryParams = new URLSearchParams(location.search);
  const initialArea = queryParams.get('area') || '';
  const initialSearch = queryParams.get('query') || '';

  const [searchParams, setSearchParams] = useState({
    area: initialArea,
    query: initialSearch,
    priceRange: [250, 1000],
    rating: 0,
    date: null,
    availableNow: false,
    cuisineType: ''
  });

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [vendors, setVendors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [availableCuisines, setAvailableCuisines] = useState([]);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 0,
    totalVendors: 0,
    hasNextPage: false,
    hasPrevPage: false
  });

  // Track page view on component mount
  useEffect(() => {
    analytics.trackPageView('search_page', 'catering_search');
    
    // Track if user came with initial search parameters
    if (initialSearch || initialArea) {
      analytics.trackCustomEvent(
        'search_page_entry_with_params',
        'search_behavior',
        `query:${initialSearch}_area:${initialArea}`
      );
    }
  }, [analytics, initialSearch, initialArea]);

  // Function to check if vendor has required details
  const hasRequiredDetails = (vendor) => {
    // Check if vendor has cuisines (array should exist and have at least one item)
    const hasCuisines = vendor.cuisines && Array.isArray(vendor.cuisines) && vendor.cuisines.length > 0;
    
    // Check if vendor has both minPrice and maxPrice
    const hasPrice = vendor.minPrice && vendor.maxPrice;

    
    
    return hasCuisines && hasPrice;
  };

  // Fetch available cuisines on component mount
  useEffect(() => {
    const fetchCuisines = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/search/cuisines`);
        const data = await response.json();
        if (data.success) {
          setAvailableCuisines(data.data);
          // Track successful cuisine fetch
          analytics.trackCustomEvent(
            'cuisines_loaded',
            'data_loading',
            'cuisines_fetch_success',
            data.data.length
          );
        }
      } catch (error) {
        console.error('Failed to fetch cuisines:', error);
        // Track cuisine fetch error
        analytics.trackError('api_error', 'cuisines_fetch_failed', 'search_page');
      }
    };
    
    fetchCuisines();
  }, []);

  // Fetch vendors based on search params
  useEffect(() => {
    const fetchVendors = async () => {
      try {
        setLoading(true);
        setError('');
        
        // Build  query parameters
        const params = new URLSearchParams();
        
        if (searchParams.query) params.append('query', searchParams.query);
        if (searchParams.area) params.append('area', searchParams.area);
        if (searchParams.priceRange[0] > 250) params.append('minPrice', searchParams.priceRange[0]);
        if (searchParams.priceRange[1] < 1000) params.append('maxPrice', searchParams.priceRange[1]);
        if (searchParams.cuisineType) params.append('cuisineType', searchParams.cuisineType);
        if (searchParams.availableNow) params.append('availableNow', 'true');
        
        params.append('page', pagination.currentPage);
        params.append('limit', '12');

        const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/search/vendors?${params}`);
        const data = await response.json();
        
        if (data.success) {
          // Filter vendors to only include those with required details
          const filteredVendors = data.data.filter(vendor => hasRequiredDetails(vendor));
          
          setVendors(filteredVendors);
          
          // Update pagination to reflect filtered results
          setPagination({
            ...data.pagination,
            totalVendors: filteredVendors.length
          });
          
          // Track successful search with exact search text
          analytics.trackSearch(
            searchParams.query || 'no_query_applied',
            filteredVendors.length,
            'vendor_search'
          );
          
          // Track detailed search results with search text
          analytics.trackCustomEvent(
            'search_completed',
            'search_results',
            `query:"${searchParams.query || 'no_query'}"_results:${filteredVendors.length}`,
            filteredVendors.length
          );
          
          // Track search with filters if any are applied
          const activeFilters = [];
          if (searchParams.area) activeFilters.push('area');
          if (searchParams.cuisineType) activeFilters.push('cuisine');
          if (searchParams.priceRange[0] > 250 || searchParams.priceRange[1] < 1000) activeFilters.push('price');
          if (searchParams.availableNow) activeFilters.push('availability');
          
          if (activeFilters.length > 0) {
            analytics.trackCustomEvent(
              'filtered_search',
              'search_behavior',
              `search:"${searchParams.query || 'no_query'}"_filters:${activeFilters.join('_')}`,
              filteredVendors.length
            );
          }
          
          // Track if search returned no results
          if (filteredVendors.length === 0 && searchParams.query) {
            analytics.trackCustomEvent(
              'zero_results_search',
              'search_issues',
              `failed_search:"${searchParams.query}"`,
              0
            );
          }
          
        } else {
          setError(data.message || 'Failed to fetch vendors');
          // Track search error
          analytics.trackError('search_error', data.message || 'vendor_fetch_failed', 'search_page');
        }
        
      } catch (error) {
        console.error('Fetch vendors error:', error);
        setError('Failed to load vendors. Please try again.');
        // Track fetch error
        analytics.trackError('api_error', 'vendor_fetch_exception', 'search_page');
      } finally {
        setLoading(false);
      }
    };

    fetchVendors();
  }, [searchParams, pagination.currentPage]);

  const handleFilterChange = (filters) => {
    // Track filter changes
    Object.keys(filters).forEach(filterKey => {
      if (filters[filterKey] !== searchParams[filterKey]) {
        analytics.trackCustomEvent(
          'filter_changed',
          'search_filters',
          `${filterKey}:${filters[filterKey]}`
        );
      }
    });
    
    setSearchParams({
      ...searchParams,
      ...filters
    });
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const handleSearch = (e) => {
    e.preventDefault();
    
    // Track form submission
    analytics.trackFormSubmit('search_form', true);
    
    // Track the exact search text entered by user
    analytics.trackSearch(searchQuery || 'empty_search', 0, 'manual_search');
    
    // Track detailed search text with additional context
    analytics.trackCustomEvent(
      'search_text_entered',
      'search_behavior',
      `search_term:${searchQuery || 'empty'}`,
      searchQuery ? searchQuery.length : 0
    );
    
    // Track search text categorization (name, cuisine, or location hints)
    if (searchQuery) {
      const searchLower = searchQuery.toLowerCase();
      let searchType = 'general';
      
      // Simple categorization based on common patterns
      if (searchLower.includes('patna') || searchLower.includes('bihar') || 
          searchLower.includes('station') || searchLower.includes('road')) {
        searchType = 'location_based';
      } else if (searchLower.includes('catering') || searchLower.includes('caterer') || 
                searchLower.includes('food') || searchLower.includes('service')) {
        searchType = 'service_based';
      } else if (searchLower.includes('indian') || searchLower.includes('chinese') || 
                searchLower.includes('continental') || searchLower.includes('bihari')) {
        searchType = 'cuisine_based';
      }
      
      analytics.trackCustomEvent(
        'search_type_classification',
        'search_analysis',
        `${searchType}:${searchQuery}`,
        searchQuery.length
      );
    }
    
    setSearchParams({
      ...searchParams,
      query: searchQuery
    });
    setPagination(prev => ({ ...prev, currentPage: 1 })); // Reset to first page
  };

  const clearAllFilters = () => {
    // Track filter clearing
    analytics.trackButtonClick('clear_all_filters', 'search_filters');
    
    setSearchParams({
      area: '',
      query: '',
      priceRange: [250, 1000],
      rating: 0,
      date: null,
      availableNow: false,
      cuisineType: ''
    });
    setSearchQuery('');
    setPagination(prev => ({ ...prev, currentPage: 1 }));
  };

  // Function to get the full image URL

  const handleVendorClick = (vendor) => {
    // Track vendor profile click with vendor ID
    analytics.trackLinkClick(
      'vendor_profile',
      `vendor_${vendor.id}`,
      'vendor_interaction'
    );
    
    // Track detailed vendor click with business name and ID
    analytics.trackCustomEvent(
      'vendor_profile_click',
      'vendor_interaction',
      `id:${vendor.id}_name:"${vendor.businessName}"_location:"${vendor.location}"`,
      vendor.minPrice
    );
    
    // Track vendor business name separately for easy filtering
    analytics.trackCustomEvent(
      'vendor_business_name_click',
      'vendor_selection',
      `business:"${vendor.businessName}"`,
      vendor.id
    );
    
    // Track vendor ID separately for technical analysis
    analytics.trackCustomEvent(
      'vendor_id_click',
      'vendor_selection',
      `vendor_id:${vendor.id}`,
      vendor.minPrice
    );
    
    // Track click position in search results
    const vendorIndex = vendors.findIndex(v => v.id === vendor.id);
    analytics.trackCustomEvent(
      'vendor_click_position',
      'search_behavior',
      `position:${vendorIndex + 1}_of_${vendors.length}_name:"${vendor.businessName}"`,
      vendorIndex + 1
    );
    
    // Track vendor details for business intelligence
    analytics.trackCustomEvent(
      'vendor_click_details',
      'vendor_analytics',
      `id:${vendor.id}_cuisines:${vendor.cuisines.length}_price_range:${vendor.minPrice}-${vendor.maxPrice}`,
      vendor.maxPrice - vendor.minPrice
    );
  };
 
  const handlePaginationClick = (direction) => {
    // Track pagination usage
    analytics.trackButtonClick(
      `pagination_${direction}`,
      'search_pagination'
    );
    
    analytics.trackCustomEvent(
      'pagination_used',
      'search_behavior',
      `page_${pagination.currentPage}_to_${direction === 'next' ? pagination.currentPage + 1 : pagination.currentPage - 1}`
    );
  };

 const VendorCard = ({ vendor, isFeatured = false }) => {
    const analytics = useAnalytics(); // Assuming you initialize it like this

    const handleVendorClick = (vendor) => {
        // Example analytics tracking
        if(analytics) {
            analytics.trackCustomEvent('vendor_card_clicked', 'search_interaction', vendor.businessName);
        }
    };

    // --- THE FIX IS HERE: The backend now sends a simple string ---
    const coverImageUrl = vendor?.coverImage;

    return (
        <div className="bg-white rounded-lg shadow-lg overflow-hidden transform transition duration-300 hover:shadow-xl hover:-translate-y-1">
            <div className="relative">
                <div className="w-full h-48 relative overflow-hidden">
                    {coverImageUrl ? (
                        <img
                            src={coverImageUrl}
                            alt={vendor.businessName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                                // Fallback to placeholder if image fails to load
                                e.target.style.display = 'none';
                                if (e.target.nextSibling) {
                                    e.target.nextSibling.style.display = 'flex';
                                }
                            }}
                        />
                    ) : null}
                    
                    <div 
                        className={`w-full h-full bg-gradient-to-r from-indigo-100 to-purple-100 flex items-center justify-center ${
                            coverImageUrl ? 'hidden' : 'flex'
                        }`}
                    >
                        <FaUtensils className="text-6xl text-indigo-300" />
                    </div>

                    {isFeatured && (
                        <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                            Featured
                        </div>
                    )}
                </div>
            </div>
            
            <div className="p-4">
                <h3 className="text-lg font-bold text-gray-800 mb-1">{vendor.businessName}</h3>
                
                <div className="flex items-center mb-2 text-gray-600">
                    <FaMapMarkerAlt className="mr-1 text-sm" />
                    <span className="text-sm">{vendor.locality}, {vendor.city}</span>
                </div>

                <div className="text-sm text-gray-600 mb-3">
                    <span className="font-medium">Cuisines: </span>
                    <span>{vendor.cuisines?.slice(0, 3).join(', ')}</span>
                    {vendor.cuisines?.length > 3 && <span className="text-gray-500"> +{vendor.cuisines.length - 3} more</span>}
                </div>

                <div className="mb-3 flex items-center gap-2">
                    <span className="font-bold text-indigo-600 flex items-center">
                        <FaRupeeSign className="mr-1" />
                        {(vendor.minPrice && vendor.maxPrice) ? `${vendor.minPrice} - ${vendor.maxPrice}` : 'N/A'}
                    </span>
                    <span className="text-gray-500 text-sm"> / person</span>
                </div>

                <div className="mt-4 grid grid-cols-1">
                    <Link
                        href={`/vendors/${vendor.id}`}
                        className="flex-1 bg-indigo-600 text-white text-center px-4 py-2 rounded-lg hover:bg-indigo-700 transition shadow-md text-sm"
                        onClick={() => handleVendorClick(vendor)}
                    >
                        View Profile
                    </Link>
                </div>
            </div>
        </div>
    );
};

  return (
    <div className="bg-white min-h-screen">
      {/* Hero Search Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-12 px-4 md:px-6 relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
        }}></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold mb-4 text-white drop-shadow-lg">Find Your Perfect Caterer in Patna</h1>
            <p className="text-lg md:text-xl text-white opacity-90">Discover top catering services for your special events</p>
          </div>

          {/* Enhanced Search Bar */}
          <form onSubmit={handleSearch} className="max-w-3xl mx-auto">
            <div className="relative flex p-1 bg-white bg-opacity-20 backdrop-blur-sm rounded-full shadow-xl">
              <input
                type="text"
                placeholder="Search by caterer name, cuisine or location..."
                className="w-full sm:placeholder:text-lg placeholder:text-sm  px-2 sm:px-5 py-3 md:px-6 md:py-4 rounded-full text-gray-800 bg-white focus:outline-none focus:ring-2 focus:ring-purple-400 shadow-md text-base md:text-lg font-medium"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => {
                  // Track search field focus
                  analytics.trackFormFieldFocus('search_form', 'main_search_input');
                }}
                onBlur={() => {
                  // Track what was in search field when user left it
                  if (searchQuery) {
                    analytics.trackCustomEvent(
                      'search_input_blur',
                      'search_interaction',
                      `blur_with_text:"${searchQuery}"`,
                      searchQuery.length
                    );
                  }
                }}
              />
              <button
                type="submit"
                className="absolute cursor-pointer right-2 top-1/2 transform -translate-y-1/2 bg-gradient-to-r from-indigo-600 to-purple-600 p-2 md:p-3 rounded-full text-white shadow-lg hover:from-indigo-700 hover:to-purple-700 transition"
                onClick={() => {
                  // Track search button click
                  analytics.trackButtonClick('search_submit_button', 'search_interaction');
                }}
              >
                <FaSearch className="text-lg md:text-xl" />
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-6 py-8">

        {/* Cuisine Type Filter */}
        {availableCuisines.length > 0 && (
          <div className="mt-6 mb-8">
            <h3 className="text-lg font-medium text-gray-700 mb-3">Cuisine Types:</h3>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => handleFilterChange({ cuisineType: '' })}
                className={`px-3 cursor-pointer py-1 rounded-full ${searchParams.cuisineType === ''
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  } transition text-sm md:text-base`}
              >
                All Cuisines
              </button>
              {availableCuisines.map((cuisine, index) => (
                <button
                  key={index}
                  onClick={() => {
                    // Track cuisine filter click
                    analytics.trackButtonClick(`cuisine_filter_${cuisine}`, 'cuisine_filter');
                    handleFilterChange({ cuisineType: cuisine });
                  }}
                  className={`px-3 cursor-pointer py-1 rounded-full ${searchParams.cuisineType === cuisine
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    } transition text-sm md:text-base`}
                >
                  {cuisine}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
            {error}
          </div>
        )}

        {/* Search Results */}
        <div className="mt-10">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800 mb-6 flex items-center">
            <span className="w-8 md:w-10 h-1 bg-indigo-600 mr-3 md:mr-4"></span>
            {loading ? 'Searching...' : `${pagination.totalVendors} Caterers Found`}
          </h2>

          {loading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-600"></div>
            </div>
          ) : vendors.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
                {vendors.map(vendor => (
                  <VendorCard key={vendor.id} vendor={vendor} />
                ))}
              </div>

              {/* Pagination */}
              {pagination.totalPages > 1 && (
                <div className="flex justify-center items-center mt-8 space-x-2">
                  <button
                    onClick={() => {
                      handlePaginationClick('previous');
                      setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }));
                    }}
                    disabled={!pagination.hasPrevPage}
                    className={`px-4 py-2 rounded-lg ${pagination.hasPrevPage 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    } transition`}
                  >
                    Previous
                  </button>
                  
                  <span className="text-gray-600">
                    Page {pagination.currentPage} of {pagination.totalPages}
                  </span>
                  
                  <button
                    onClick={() => {
                      handlePaginationClick('next');
                      setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }));
                    }}
                    disabled={!pagination.hasNextPage}
                    className={`px-4 py-2 rounded-lg ${pagination.hasNextPage 
                      ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    } transition`}
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-12 md:py-16 bg-gray-50 rounded-lg border border-gray-200 shadow-inner mx-2 md:mx-4">
              <h3 className="text-xl md:text-2xl font-semibold text-gray-800 mb-3">No caterers found</h3>
              <p className="text-gray-600 mb-6">Try adjusting your filters or search criteria</p>
              <button
                onClick={clearAllFilters}
                className="px-5 py-2 bg-indigo-600 text-white rounded-full hover:bg-indigo-700 transition cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SearchPage;