// pages/HomePage.js
import React from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaRegCalendarCheck, FaRupeeSign, FaShieldAlt } from 'react-icons/fa';

const HomePage = () => {

  // Mock data for vendors with descriptive image placeholders
  const vendorCategories = [
    {
      id: 'caterers',
      name: 'Caterers',
      description: 'Find the perfect caterers for your special occasions',
      coverImage: 'Gemini_Generated_Image_573rit573rit573r.jpeg'
    },
    {
      id: 'photographers',
      name: 'Photographers',
      description: 'Capture your moments with professional wedding photographers',
      coverImage: 'photography.jpg'
    },
    {
      id: 'decorators',
      name: 'Decorators',
      description: 'Transform your venue with stunning wedding decorations',
      coverImage: 'decoration-coverpage.jpeg'
    },
    {
      id: 'djs',
      name: 'DJs',
      description: 'Keep the celebration alive with our professional wedding DJs',
      coverImage: 'dj-coverpage.jpg'
    }
  ];


  // Mock data for testimonials
  const testimonials = [
    {
      id: 1,
      text: 'The caterer we found through this platform made our wedding unforgettable with delicious food. Highly recommend!',
      author: 'Priya S.',
      role: 'Bride',
      image: '/api/placeholder/60/60'
    },
    {
      id: 2,
      text: 'Booking was a breeze, and the caterer was professional and the food was exceptional. Will definitely use this service again!',
      author: 'Ankit K.',
      role: 'Groom',
      image: '/api/placeholder/60/60'
    },
    {
      id: 3,
      text: 'As a caterer, this platform has significantly increased my client base and streamlined my booking process.',
      author: 'Meera J.',
      role: 'Caterer',
      image: '/api/placeholder/60/60'
    }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-pink-500 to-purple-600 py-20 px-6 md:px-12 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-6">Find the Perfect Vendors for Your Special events</h1>
          <p className="text-xl mb-10">Browse, compare, and book best vendors in Patna</p>
          <div className="bg-white rounded-lg shadow-lg p-2 flex flex-col md:flex-row">
            <input
              type="text"
              placeholder="Search by area in Patna..."
              className="flex-grow p-3 outline-none text-gray-700 rounded-lg md:rounded-r-none"
            />
            <Link to="/search" className="mt-2 md:mt-0 bg-pink-600 hover:bg-pink-700 text-white py-3 px-6 rounded-lg md:rounded-l-none transition duration-300 flex items-center justify-center">
              <FaSearch className="mr-2" /> Find Caterers
            </Link>
          </div>
        </div>
      </section>
      {/* How It Works Section */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">How It Works</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaSearch className="text-2xl text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Search</h3>
              <p className="text-gray-600">Find Caterers based on location, price, and reviews</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRegCalendarCheck className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Book</h3>
              <p className="text-gray-600">Choose your date and time with real-time availability</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaRupeeSign className="text-2xl text-pink-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Pay Securely</h3>
              <p className="text-gray-600">Pay 50% advance through our secure payment system</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaShieldAlt className="text-2xl text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-800">Enjoy</h3>
              <p className="text-gray-600">Get quality service with our satisfaction guarantee</p>
            </div>
          </div>
        </div>
      </section>

      {/* Our Services */}
      <section className="py-16 px-6 md:px-12 bg-gray-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">Our Services</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {vendorCategories.map(category => (
              <Link
                to={category.id === 'caterers' ? '/catering-services' : `/${category.id}`}
                key={category.id}
                className="block bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-2"
              >
                <div className="relative">
                  <img
                    src={category.coverImage}
                    alt={category.name}
                    className="w-full h-64 object-cover"
                  />
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-l from-pink-500 to-pink-600 p-4 text-white">
                    <h3 className="text-2xl font-bold">{category.name}</h3>
                    <p className="text-sm">{category.description}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-16 px-6 md:px-12 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">What Our Users Say</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map(testimonial => (
              <div key={testimonial.id} className="bg-gray-50 p-6 rounded-lg shadow-md">
                <p className="text-gray-600 mb-6 italic">"{testimonial.text}"</p>
                <div className="flex items-center">
                  <img src={testimonial.image} alt={testimonial.author} className="w-12 h-12 rounded-full mr-4" />
                  <div>
                    <h4 className="font-semibold text-gray-800">{testimonial.author}</h4>
                    <p className="text-gray-500 text-sm">{testimonial.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Join as Vendor CTA */}
      <section className="py-16 px-6 md:px-12 bg-gradient-to-r from-purple-600 to-pink-500 text-white">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4">Are You a Caterer?</h2>
          <p className="text-xl mb-8">Join our platform to get more bookings and grow your business</p>
          <Link to="/register?type=vendor" className="inline-block bg-white text-purple-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-lg shadow-md transition duration-300">
            Join as a Caterer
          </Link>
        </div>
      </section>
    </div>
  );
};

export default HomePage;