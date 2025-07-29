import React from 'react';

const ClientPrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 rounded-lg shadow-md">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 text-center mb-8">
          Client Privacy Policy
        </h1>

        <div className="space-y-6 text-gray-700 leading-relaxed">
          <p>
            Your privacy matters deeply to us. At <strong>Evenz.in</strong>, we are dedicated to safeguarding your personal information and being fully transparent about how we handle your data. This Privacy Policy describes how we collect, use, and share information specifically for individuals using our platform to discover and connect with catering services.
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-4">
            1. Information We Collect From You
          </h2>
          <p>
            When you use Evenz.in as a client, we collect the following types of information to facilitate your experience and provide relevant services:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Account and Profile Information:</strong> Name, email address, and mobile number provided during registration.</li>
            <li><strong>Booking Request Details:</strong> Information about your event (e.g., type, date, guest count, location, and custom notes) submitted when requesting services from a caterer.</li>
            <li><strong>Communications:</strong> Records of your inquiries, feedback, or other correspondence with our support team.</li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-4">
            2. Information We Collect Automatically
          </h2>
          <p>
            To improve our services and diagnose technical issues, we collect certain data automatically when you interact with our platform:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Device and Usage Information:</strong> Includes your IP address, browser type, device type, operating system, access times, referring URLs, and pages viewed.</li>
            <li><strong>Cookies and Tracking Technologies:</strong> We use cookies and similar tools to enhance your experience, analyze usage patterns, and personalize content. You can manage cookie preferences in your browser settings.</li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-4">
            3. How We Use Your Information
          </h2>
          <p>
            The information we collect is used for the following purposes:
          </p>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Service Enablement:</strong> To help you browse caterers, send booking requests, and facilitate direct communication with service providers.</li>
            <li><strong>Connection with Caterers:</strong> Your event details and mobile number are shared only with the caterer you selected, and only after they have completed the necessary steps to access the request.</li>
            <li><strong>Communication:</strong> To send important transactional updates and respond to customer support requests.</li>
            <li><strong>Platform Insights:</strong> To analyze client behavior, monitor usage trends, and improve our offerings.</li>
            <li><strong>Security & Compliance:</strong> To protect our systems, users, and comply with applicable legal requirements.</li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-4">
            4. How We Share Your Information
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>With Caterers:</strong> Your event details and mobile number are shared only with the caterer you sent a booking request to—after they’ve successfully processed their access request. This is solely for communication related to your event.</li>
            <li><strong>Service Providers:</strong> We may share your data with trusted vendors (e.g., hosting providers, analytics services) who assist in operating our platform. These partners are bound by strict confidentiality obligations.</li>
            <li><strong>Legal Requirements:</strong> We may disclose your data if required by law or when necessary to protect our legal rights or public safety.</li>
            <li><strong>Business Transfers:</strong> In the event of a business acquisition, merger, or asset transfer, your information may be included as part of the transaction.</li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-4">
            5. Your Choices and Rights
          </h2>
          <ul className="list-disc list-inside space-y-2 ml-4">
            <li><strong>Account Access:</strong> You can view and update your account details anytime through the client dashboard.</li>
            <li><strong>Communication Preferences:</strong> You may opt out of non-essential communications such as marketing messages, but will still receive important service-related updates.</li>
            <li><strong>Data Access and Deletion:</strong> You have the right to request access to, correction of, or deletion of your personal data (subject to legal and operational limits). Please contact us to exercise these rights.</li>
          </ul>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-4">
            6. Data Security
          </h2>
          <p>
            We employ reasonable administrative, technical, and physical safeguards to protect your data. While we strive to use industry-best practices, no method of transmission over the internet or storage is 100% secure.
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-4">
            7. Changes to This Policy
          </h2>
          <p>
            We may revise this Privacy Policy periodically. Significant changes will be communicated via email or a prominent notice on our platform. We encourage you to review this page regularly.
          </p>

          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mt-8 mb-4">
            8. Contact Us
          </h2>
          <p>
            For any questions or concerns regarding this Privacy Policy, please reach out to our support team at <a href="mailto:support@evenz.in" className="text-blue-600 underline">support@evenz.in</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ClientPrivacyPolicy;
