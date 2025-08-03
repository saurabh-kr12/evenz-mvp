import React from 'react';

const CatererPrivacyPolicy = () => {
  return (
    <section className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto bg-white p-6 sm:p-10 rounded-lg shadow-md">
        <header className="mb-10 text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900">
            Caterer Privacy Policy
          </h1>
        </header>

        <article className="space-y-10 text-gray-800 text-base leading-relaxed">
          <p>
            Your privacy is critically important to us. At <strong>Evenz.in</strong>, we are committed to protecting your personal information and being transparent about our data practices. This Privacy Policy outlines how we collect, use, and share information specifically for caterers using the Evenz.in platform to offer their services and connect with clients.
          </p>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">1. Information We Collect From You</h2>
            <p>We collect the following information when you register and use Evenz.in as a caterer:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Account and Business Info:</strong> Name, email, mobile, business name, legal entity, and contact details.</li>
              <li><strong>Profile Details:</strong> Services, pricing, photos, cuisines, and features.</li>
              <li><strong>Compliance Data:</strong> FSSAI license, GSTIN, and other required documents.</li>
              <li><strong>Lead Activity:</strong> Booking requests and communication history.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">2. Information We Collect Automatically</h2>
            <p>We automatically collect usage data to monitor platform performance and improve the experience:</p>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Device & Usage Info:</strong> IP address, device/browser type, OS, referral URLs, user behaviour and site interaction stats.</li>
              <li><strong>Cookies:</strong> Used to enhance functionality, personalize content, and analyze traffic.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">3. How We Use Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Profile Management:</strong> Create and maintain your caterer profile.</li>
              <li><strong>Lead Delivery:</strong> Send client booking requests to your dashboard.</li>
              <li><strong>Fee Processing:</strong> Process access fees for lead contact info.</li>
              <li><strong>Compliance:</strong> Verify identity and business legitimacy.</li>
              <li><strong>Communication:</strong> Platform updates and customer support.</li>
              <li><strong>Analytics:</strong> Research how caterers use our tools.</li>
              <li><strong>Security:</strong> Prevent misuse and comply with regulations.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">4. How We Share Your Information</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>With Clients:</strong> Your public-facing profile is shared with potential clients.</li>
              <li><strong>With Service Providers:</strong> Vendors assisting with payments, hosting, analytics, etc.</li>
              <li><strong>Legal Disclosures:</strong> When legally required or to protect rights and safety.</li>
              <li><strong>Business Transfers:</strong> In the event of a merger or acquisition.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">5. Your Choices and Rights</h2>
            <ul className="list-disc list-inside space-y-2 ml-4">
              <li><strong>Profile Updates:</strong> You can update your profile anytime via the dashboard.</li>
              <li><strong>Email Preferences:</strong> You may opt out of marketing emails while still receiving essential notifications.</li>
              <li><strong>Data Access or Deletion:</strong> You can request access or deletion of your data, subject to legal limits.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">6. Data Security</h2>
            <p>
              We take reasonable technical and organizational measures to safeguard your personal and business information. However, no system is 100% secure, and we encourage you to take care with how you share your information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">7. Changes to This Privacy Policy</h2>
            <p>
              We may update this policy occasionally. Any significant changes will be communicated via email or posted on our website.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">8. Contact Us</h2>
            <p>
              If you have any questions or concerns about this Privacy Policy, please reach out to us at <a href="mailto:support@evenz.in" className="text-blue-600 hover:underline">support@evenz.in</a>.
            </p>
          </section>
        </article>
      </div>
    </section>
  );
};

export default CatererPrivacyPolicy;
