import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router';
import { FaHeart, FaMapMarkerAlt, FaPhone, FaUser, FaEye, FaTrash } from 'react-icons/fa';

const UserShortlists = () => {
  const [shortlistedCaterers, setShortlistedCaterers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Fetch shortlisted caterers on component mount
  useEffect(() => {
    fetchShortlistedCaterers();
  }, []);

  const fetchShortlistedCaterers = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('http://localhost:5000/api/user/shortlist', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        setShortlistedCaterers(data.data);
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to fetch shortlisted caterers');
      console.error('Error fetching shortlist:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFromShortlist = async (catererId, catererName) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:5000/api/user/shortlist/${catererId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();

      if (data.success) {
        // Remove from local state
        setShortlistedCaterers(prev =>
          prev.filter(item => item.caterer.id !== catererId)
        );
        // Optional: Show success message
        console.log(`${catererName} removed from shortlist`);
      } else {
        console.error('Failed to remove from shortlist:', data.message);
      }
    } catch (error) {
      console.error('Error removing from shortlist:', error);
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
            onClick={fetchShortlistedCaterers}
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
              You haven't shortlisted any caterer yet.
            </p>
            <Link
              to="/dashboard"
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
                <div className="flex flex-col gap-3">
                  <div className="flex gap-4">
                    <Link
                      to={`/vendors/${item.caterer.id}`}
                      className="flex-1 bg-purple-700 text-white py-2 px-3 rounded-md hover:bg-purple-800 transition-colors text-center text-sm font-medium flex items-center justify-center gap-1"
                    >
                      <FaEye className="text-xs" />
                      View Profile
                    </Link>
                    <Link
                      to={`/booking/${item.caterer.id}`}
                      className="flex-1 bg-green-600 text-white py-2 px-3 rounded-md hover:bg-green-700 transition-colors text-center text-sm font-medium"
                    >
                      Book Now
                    </Link>
                  </div>
                  <button
                    onClick={() => handleRemoveFromShortlist(item.caterer.id, item.caterer.businessName)}
                    className="w-full cursor-pointer bg-red-50 text-red-600 py-2 px-3 rounded-md hover:bg-red-100 transition-colors text-sm font-medium flex items-center justify-center gap-1 border border-red-200"
                  >
                    <FaTrash className="text-xs" />
                    Remove from Shortlist
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