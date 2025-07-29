// components/SectionHeaderWithTooltip.js
import React from 'react';
import { Info } from 'lucide-react'; // Or your preferred info icon
import InfoTooltip from './InfoTooltip'; // Adjust path if needed

const priorityMessages = {
   high: "This section contains essential details required for your profile to be visible and receive leads.",
   medium: "Completing this section significantly enhances your profile, attracting more relevant leads and improving client matching.",
   low: "Providing these details builds client trust, showcases your professionalism, and ensures smoother operations."
};

const SectionHeaderWithTooltip = ({ title, priority = 'low', children }) => {
   const tooltipMessage = priorityMessages[priority] || priorityMessages.low;
   const isHighPriority = priority === 'high';

   return (
      //  <div className="flex items-center mb-4">
      //    <h3 className="text-xl font-semibold text-gray-800 flex items-center">
      //      {title}
      //    </h3>
      //    {children} {/* For any extra elements like buttons or other info */}
      //  </div>

      <>
         {isHighPriority && (
            <span className="text-red-500 ml-1 leading-none text-2xl relative top-[-2px]">*</span>
         )}
         <InfoTooltip message={tooltipMessage}>
            <Info className="w-4 h-4 text-gray-400 ml-2 cursor-pointer" />
         </InfoTooltip>
      </>
   );
};

export default SectionHeaderWithTooltip;
