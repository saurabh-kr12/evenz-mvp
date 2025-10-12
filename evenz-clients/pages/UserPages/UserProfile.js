"use client";
import React from 'react';
import YourProfile from '../ClientProfile';

const UserProfile = () => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 text-gray-800">
      {/* Personal Information Section */}
      <YourProfile />
      {/* FAQs Section */}
      <div className="mt-10">
        <h2 className="text-lg md:text-xl font-medium mb-4">FAQs</h2>
        <div className="mb-4">
          <h3 className="font-medium mb-2 text-sm md:text-base">What happens when I update my email address (or mobile number)?</h3>
          <p className="text-gray-600 text-sm">Your login email id (or mobile number) changes, likewise. You&apos;ll receive all your account related communication on your updated email address (or mobile number).</p>
        </div>
        <div className="mb-4">
          <h3 className="font-medium mb-2 text-sm md:text-base">When will my Evenz.in account be updated with the new email address (or mobile number)?</h3>
          <p className="text-gray-600 text-sm">
            The changes will take effect immediately after you confirm the verification code sent to your email or mobile number. If the updated details are not visible, please refresh the page.
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;