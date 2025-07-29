import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, CalendarCheck, Lightbulb, Users, Target } from 'lucide-react';

const FoundersWord = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const slides = [
    {
      id: 1,
      icon: CalendarCheck,
      title: "The Spark",
      content: "My cousin's wedding in Bihar became a wake-up call. Her brother, an Army officer, wasted 7-8 days of leave just to manually coordinate vendors - photographers, decorators, caterers.",
      quote: "Why can't this be seamless with just an internet connection?",
      bgGradient: "from-blue-50 to-indigo-100"
    },
    {
      id: 2,
      icon: Users,
      title: "The Real Problem",
      content: "Existing platforms only offer contact details. Clients face endless inquiries and hidden prices. Vendors pay hefty fees for poor visibility and non-serious leads.",
      quote: "Both sides frustrated, no real solution in sight.",
      bgGradient: "from-purple-50 to-pink-100"
    },
    {
      id: 3,
      icon: Lightbulb,
      title: "Enter Evenz.in",
      content: "Born from these frustrations, Evenz.in brings transparency and easy bookings to India's event industry. Starting with catering in Patna.",
      quote: "Transforming event booking - one city at a time.",
      bgGradient: "from-green-50 to-emerald-100"
    },
    {
      id: 4,
      icon: Target,
      title: "Our Mission",
      content: "Making every celebration stress-free through verified vendors, transparent pricing, and easy bookings. We're not just building a platform - we're crafting experiences.",
      quote: "Seamless, transparent, delightful event planning.",
      bgGradient: "from-orange-50 to-red-100"
    }
  ];

  const totalSlides = slides.length;

  // Auto-slide functionality
  useEffect(() => {
    if (!isHovered) {
      const interval = setInterval(() => {
        setCurrentSlide((prev) => (prev + 1) % totalSlides);
      }, 5000); // 5 seconds per slide
      return () => clearInterval(interval);
    }
  }, [isHovered, totalSlides]);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % totalSlides);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  return (
    <section className="py-6 sm:py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-900 mb-6">
            Our Story: Why We Built Evenz.in
          </h2>
          
          {/* Founder Image */}
          {/* <div className="flex justify-center mb-6">
            <div className="relative">
              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 p-1 shadow-lg">
                <img 
                  src="" 
                  alt="Founder" 
                  className="w-full h-full rounded-full object-cover bg-gray-200"
                  onError={(e) => {
                    e.target.style.display = 'none';
                    e.target.nextSibling.style.display = 'flex';
                  }}
                />
                <div className="w-full h-full rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-600 font-bold text-xl sm:text-2xl" style={{display: 'none'}}>
                  F
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full border-3 border-white shadow-lg"></div>
            </div>
          </div> */}
        </div>

        {/* Carousel Container */}
        <div 
          className="relative overflow-hidden rounded-2xl shadow-2xl max-w-2xl mx-auto"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onTouchStart={() => setIsHovered(true)}
          onTouchEnd={() => setTimeout(() => setIsHovered(false), 3000)}
        >
          {/* Slides */}
          <div 
            className="flex transition-transform duration-700 ease-in-out"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {slides.map((slide, index) => {
              const IconComponent = slide.icon;
              return (
                <div key={slide.id} className="min-w-full">
                  <div className={`bg-gradient-to-br ${slide.bgGradient} px-6 sm:p-8 lg:p-10 min-h-[400px] sm:min-h-[420px] flex items-center`}>
                    <div className="max-w-xl mx-auto text-center">
                      {/* Icon */}
                      <div className="flex justify-center mb-4">
                        <div className="p-3 bg-white rounded-full shadow-lg">
                          <IconComponent className="w-8 h-8 text-indigo-600" />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 mb-4">
                        {slide.title}
                      </h3>

                      {/* Content */}
                      <div className="space-y-4 text-center">
                        <p className="text-base sm:text-lg text-gray-700 leading-relaxed">
                          {slide.content}
                        </p>

                        {/* Quote */}
                        <div className="bg-white/70 backdrop-blur-sm p-4 rounded-lg shadow-lg border-l-4 border-indigo-500">
                          <p className="text-lg sm:text-xl font-semibold text-indigo-700 italic">
                            "{slide.quote}"
                          </p>
                        </div>
                      </div>

                      {/* Slide Counter */}
                      <div className="mt-4 text-xs text-gray-500 font-medium">
                        {index + 1} of {totalSlides}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Navigation Arrows */}
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 z-10"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>

          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 rounded-full p-3 shadow-lg transition-all duration-200 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-indigo-500 z-10"
            aria-label="Next slide"
          >
            <ChevronRight className="w-6 h-6" />
          </button>

          {/* Pagination Dots */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-3">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`w-3 h-3 rounded-full transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                  index === currentSlide 
                    ? 'bg-indigo-600 scale-125' 
                    : 'bg-white/70 hover:bg-white/90'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Progress Bar */}
          <div className="absolute bottom-0 left-0 w-full h-1 bg-black/10">
            <div 
              className="h-full bg-gradient-to-r from-indigo-500 to-purple-600 transition-all duration-700 ease-in-out"
              style={{ width: `${((currentSlide + 1) / totalSlides) * 100}%` }}
            />
          </div>
        </div>

        {/* Mobile Touch Instructions */}
        <div className="mt-8 text-center sm:hidden">
          <p className="text-sm text-gray-500">
            Swipe left or right • Tap to pause auto-scroll
          </p>
        </div>
      </div>
    </section>
  );
};

export default FoundersWord;