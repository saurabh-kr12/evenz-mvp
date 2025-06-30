// client/src/components/Card.js
import React from 'react';

const Card = ({ title, children }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 sm:p-8 w-full max-w-md">
      {title && <h1 className="text-xl font-bold text-center text-gray-800 mb-6">{title}</h1>}
      {children}
    </div>
  );
};

export default Card;