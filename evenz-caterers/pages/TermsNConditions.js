"use client"
import React from 'react';

const CatererTermsAndConditions = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-8 lg:px-16">
      <div className="max-w-6xl mx-auto bg-white p-6 sm:p-8 rounded-2xl shadow-lg">
        <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 text-center mb-10">
          Caterer Terms & Conditions
        </h1>

        <div className="space-y-8 text-gray-700 text-[15px] leading-relaxed">
          <p>
            Welcome to <strong>Evenz.in</strong>. These Caterer Terms & Conditions (&quot;Terms&quot;) govern your use of the Evenz.in platform as a caterer. By registering, you agree to these Terms.
          </p>

          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-md">
            <p className="text-red-700 font-semibold">
              Disclaimer: Evenz.in is a Technology Platform Only.
            </p>
            <p className="mt-2 text-sm text-red-600">
              Evenz.in operates solely as a digital marketplace to connect you with clients. We are not your employer, agent, or business partner. We do not manage bookings, service delivery, payments, or contracts between you and clients. You are solely responsible for your services and agreements.
            </p>
          </div>

          {/* Section 1 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              1. Registration & Profile Accuracy
            </h2>
            <p>You agree to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Provide accurate and up-to-date business details.</li>
              <li>Regularly update availability, packages, and pricing.</li>
              <li>Maintain legal licenses (e.g., FSSAI) as applicable.</li>
              <li>Note that incomplete profiles may reduce visibility.</li>
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              2. Receiving and Managing Leads & Bookings
            </h2>
            <p>You agree to:</p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Review booking requests promptly.</li>
              <li>
                <strong>Unlocking Fee (₹200):</strong> This grants you access to a client’s contact number to initiate communication.
              </li>
              <li>Respond promptly and professionally to clients.</li>
              <li>Negotiate and manage bookings directly with clients.</li>
              <li>
                Use the platform only for legitimate catering business.
              </li>
              <li>
                <em>Evenz.in does not guarantee bookings or act as an intermediary.</em>
              </li>
            </ul>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              3. Fees & Payments to Evenz.in (Unlocking Fee)
            </h2>
            <p>
              <strong>Evenz.in uses a pay-per-request model.</strong> There are no subscriptions or listing fees.
            </p>
            <p>
              <strong>Unlocking Fee:</strong> ₹200 (non-refundable) per request to access client contact information.
            </p>
            <ul className="list-disc list-inside ml-4 space-y-1">
              <li>Charged only when you choose to unlock a lead.</li>
              <li>Fee is non-refundable after details are accessed.</li>
              <li>Fee may change with prior notice.</li>
            </ul>
            <p className="mt-2">
              <strong>Payments from Clients:</strong> All payments must be handled directly between you and the client. Evenz.in does not process or guarantee payments.
            </p>
          </section>

          {/* Section 4 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              4. Service Delivery & Client Agreements
            </h2>
            <p>
              You are fully responsible for your catering service quality and delivery. Any agreements made with clients are solely between you and the client. Evenz.in holds no responsibility for food quality, hygiene, delivery, or customer satisfaction.
            </p>
          </section>

          {/* Section 5 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              5. Compliance & Standards
            </h2>
            <p>
              Your business must comply with all legal requirements including FSSAI, health regulations, and local laws. You must uphold high standards of hygiene, service, and professionalism.
            </p>
          </section>

          {/* Section 6 */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              6. Contact Us
            </h2>
            <p>
              For any questions regarding these Terms, please contact us at{' '}
              <a href="mailto:support@evenz.in" className="text-blue-600 underline">
                support@evenz.in
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
};

export default CatererTermsAndConditions;
