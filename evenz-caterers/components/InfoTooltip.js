// components/InfoTooltip.js
import React, { useState, useEffect, useRef } from 'react';

const InfoTooltip = ({ message, children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef(null);

  // Toggle tooltip visibility on click/tap
  const handleClick = (e) => {
    // Prevent the click from propagating immediately if children also have clicks
    e.stopPropagation();
    setIsOpen(prev => !prev);
  };

  // Hide tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Optional: Add touchstart for better mobile responsiveness on initial tap
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [isOpen]);

  return (
    // Use a ref to detect clicks outside this component
    <span
      ref={wrapperRef}
      className="relative inline-flex items-center ml-1"
      // Desktop hover behavior: show on mouse enter, hide on mouse leave
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* We clone the child (the icon) to inject the onClick handler */}
      {React.cloneElement(children, {
        onClick: handleClick,
        // Ensure cursor-pointer is on the icon for better UX
        className: `${children.props.className || ''} cursor-pointer select-none`
      })}

      {/* Tooltip content - visibility controlled by 'isOpen' state */}
      {isOpen && (
        <div
          className="absolute bg-gray-800 text-white text-xs rounded py-2 px-3 z-[9999]
                     bottom-full left-1/2 transform -translate-x-1/2 mb-2
                     whitespace-nowrap opacity-80  transition-opacity duration-300
                     shadow-lg pointer-events-none" // pointer-events-none prevents blocking clicks through the tooltip
          // Allow clicks on the tooltip itself if it contained interactive elements (though ours doesn't)
          // onMouseDown={(e) => e.stopPropagation()} // Prevent closing immediately if clicked inside tooltip
        >
          {message}
          {/* Optional: Add a small triangle 'arrow' at the bottom */}
          <div className="absolute left-1/2 -ml-1 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800 bottom-[-4px]"></div>
        </div>
      )}
    </span>
  );
};

export default InfoTooltip;