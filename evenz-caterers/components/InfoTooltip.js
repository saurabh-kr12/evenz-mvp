// components/InfoTooltip.js
import React, { useState, useEffect, useRef } from 'react';

const InfoTooltip = ({ message, children }) => {
    const [isOpen, setIsOpen] = useState(false);
    const wrapperRef = useRef(null);
    const tooltipRef = useRef(null);
    
    // State to hold the dynamic position classes
    const [positionClasses, setPositionClasses] = useState('left-1/2 -translate-x-1/2');

    const handleClick = (e) => {
        e.stopPropagation();
        setIsOpen(prev => !prev);
    };

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener("mousedown", handleClickOutside);
            document.addEventListener("touchstart", handleClickOutside);
        }

        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            document.removeEventListener("touchstart", handleClickOutside);
        };
    }, [isOpen]);

    // --- THE FIX: Dynamic Positioning Logic ---
    // This effect runs when the tooltip opens to calculate the best position.
    useEffect(() => {
        if (isOpen && tooltipRef.current && wrapperRef.current) {
            const tooltipRect = tooltipRef.current.getBoundingClientRect();
            
            // Check if the centered position would overflow the right edge of the screen
            if (tooltipRect.right > window.innerWidth) {
                // If it overflows, align it to the right edge of the icon
                setPositionClasses('right-0');
            } 
            // Check if the centered position would overflow the left edge
            else if (tooltipRect.left < 0) {
                // If it overflows, align it to the left edge of the icon
                setPositionClasses('left-0');
            } 
            // If it fits, keep it centered
            else {
                setPositionClasses('left-1/2 -translate-x-1/2');
            }
        }
    }, [isOpen]);

    return (
        <span
            ref={wrapperRef}
            className="relative inline-flex items-center"
            onMouseEnter={() => setIsOpen(true)}
            onMouseLeave={() => setIsOpen(false)}
        >
            {React.cloneElement(children, {
                onClick: handleClick,
                className: `${children.props.className || ''} cursor-pointer select-none`
            })}

            {isOpen && (
                <div
                    ref={tooltipRef}
                    // --- THE FIX: Updated classes for wrapping and positioning ---
                    className={`absolute bg-gray-900 text-white text-xs rounded-lg py-2 px-3 z-50
                                bottom-full mb-2
                                w-56 text-center whitespace-normal  // Allows text to wrap within a 56-unit width
                                ${positionClasses} // Applies the dynamic position
                                opacity-95 transition-opacity duration-300
                                shadow-lg pointer-events-none`}
                >
                    {message}
                    {/* The arrow will now correctly point down from the tooltip */}
                    <div className="absolute left-1/2 -ml-1 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-900 bottom-[-4px]"></div>
                </div>
            )}
        </span>
    );
};

export default InfoTooltip;
