import React from 'react';

const ClientTermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-8">
          Client Terms & Conditions
        </h1>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            Welcome to <strong>Evenz.in</strong>. These Client Terms & Conditions ("Terms") govern your use of the Evenz.in platform as a client seeking catering services. By accessing or using our website, you agree to be bound by these Terms.
          </p>

          <div className="border-l-4 border-red-700 bg-red-50 p-4">
            <p className="font-semibold text-red-800 mb-1">
              <strong>Disclaimer: Evenz.in is a Technology Platform Only.</strong> 
            </p>
            <p className="text-red-700 text-sm">
              Evenz.in operates solely as a digital marketplace to connect clients with independent caterers. <strong>We do not provide catering services ourselves</strong>, nor do we participate in, supervise, or take any responsibility for the actual booking, service delivery, quality of food or service, payment collection, cancellation, or any other aspect of the agreement formed directly between you (the Client) and the Caterer. All such responsibilities and liabilities rest solely with the Client and the Caterer. Evenz.in only facilitates this connection by allowing caterers to access your contact details for a specific booking request after they fulfill certain platform requirements.
            </p>
          </div>

          {/* Section 1 */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-4">
            1. Your Account
          </h2>
          <p>
            To use certain features, you must register for a client account. You agree to provide accurate and complete information and maintain the confidentiality of your account credentials. You are responsible for all activities that occur under your account.
          </p>

          {/* Section 2 */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-4">
            2. Using Our Service to Find Caterers and Send Requests
          </h2>
          <p>
            You can browse Caterer profiles, send booking requests, and receive quotes for your events. When you send a booking request, your event details and mobile number will be shared with the selected Caterer after they have successfully requested access via Evenz.in.
          </p>
          <p>
            Caterer profiles are created and maintained by the Caterers themselves. While we strive to present accurate information, <strong>we do not endorse any specific Caterer</strong>, and encourage you to do your own due diligence before making any commitments.
          </p>

          {/* Section 3 */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-4">
            3. Agreements with Caterers & Our Non-Responsibility
          </h2>
          <p>
            Any agreement or transaction for catering services is strictly between you and the Caterer. <strong>Evenz.in is not a party to these agreements</strong> and disclaims all liability for the quality, legality, or execution of services. You are responsible for confirming all service details, pricing, payment, and cancellation policies directly with the Caterer.
          </p>

          {/* Section 4 */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-4">
            4. Payments & Disputes
          </h2>
          <p>
            Payments for catering services are made directly to the Caterer based on your agreed terms. <strong>Evenz.in does not process or guarantee these payments</strong>. Platform fees (if any) apply only to Caterers. In case of disputes, you must resolve them directly with the Caterer. We may assist at our discretion but are not obligated to intervene.
          </p>

          {/* Section 5 */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-4">
            5. Your Conduct
          </h2>
          <p>
            You agree to use Evenz.in responsibly. Any form of fraud, misrepresentation, or harmful activity toward the platform or its users is strictly prohibited and may lead to legal consequences or account termination.
          </p>

          {/* Section 6 */}
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-4">
            6. Contact Us
          </h2>
          <p>
            For any questions regarding these Terms, you may contact us at{' '}
            <a href="mailto:support@evenz.in" className="text-blue-600 underline">
              support@evenz.in
            </a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientTermsAndConditions;
