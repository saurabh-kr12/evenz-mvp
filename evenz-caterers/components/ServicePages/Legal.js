"use client";
import React, { useState, useEffect } from 'react';
import { Shield, CreditCard, Users, Calendar, AlertCircle, CheckCircle, Loader, Edit3, Save, XCircle } from 'lucide-react';
import SectionHeaderWithTooltip from '../SectionHeaderWithTooltip';
import useAnalytics from '@/hooks/useAnalytics';

const LegalPaymentSection = () => {
   const [legalData, setLegalData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState({});
   const [errors, setErrors] = useState({});
   const [success, setSuccess] = useState({});
   const [editMode, setEditMode] = useState({});
   const analytics = useAnalytics();

   // Form states for each card
   const [gstInfo, setGstInfo] = useState({ gstNumber: '' });
   const [paymentModes, setPaymentModes] = useState({
      upi: false,
      cash: false,
      card: false,
      netBanking: false,
      wallet: false
   });
   const [bookingAdvance, setBookingAdvance] = useState({
      type: 'percentage',
      value: 0
   });
   const [policies, setPolicies] = useState({
      minimumNoticeDays: 1,
      cancellationRefundPolicy: ''
   });

   // Fetch legal data on component mount
   useEffect(() => {
      fetchLegalData();
      // Track tab view
      analytics.services.tabViewed('legal_payment');
   }, []);

   const fetchLegalData = async () => {
      try {
         const token = localStorage.getItem('token');
         const response = await fetch('http://localhost:5000/api/vendor/legal', {
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            }
         });

         if (response.ok) {
            const data = await response.json();

            // Clean up the data - remove agreementContract if it's empty or has no valid file
            if (data.agreementContract && (!data.agreementContract.filename || !data.agreementContract.size || data.agreementContract.size === 0)) {
               data.agreementContract = null;
            }

            setLegalData(data);

            // Populate form states
            setGstInfo({ gstNumber: data.gstRegistrationNumber || '' });
            setPaymentModes(data.acceptedPaymentModes || {
               upi: false, cash: false, card: false, netBanking: false, wallet: false
            });
            setBookingAdvance(data.bookingAdvance || { type: 'percentage', value: 0 });

            setPolicies({
               minimumNoticeDays: data.minimumNoticeDays || 1,
               cancellationRefundPolicy: data.cancellationRefundPolicy || ''
            });
         }
      } catch (error) {
         console.error('Error fetching legal data:', error);
         setErrors({ general: 'Failed to load legal information' });
      } finally {
         setLoading(false);
      }
   };

   const toggleEditMode = (section) => {
      setEditMode(prev => ({ ...prev, [section]: !prev[section] }));

      // Track edit action
      if (!editMode[section]) {
         analytics.ui.buttonClicked(`${section}_edit`, 'legal_payment');
      }

      // Clear any existing errors/success for this section
      setErrors(prev => ({ ...prev, [section]: null }));
      setSuccess(prev => ({ ...prev, [section]: null }));
   };

   const showSuccess = (section, message) => {
      setSuccess({ ...success, [section]: message });
      setTimeout(() => {
         setSuccess(prev => ({ ...prev, [section]: null }));
      }, 3000);
   };

   const showError = (section, message) => {
      setErrors({ ...errors, [section]: message });
      setTimeout(() => {
         setErrors(prev => ({ ...prev, [section]: null }));
      }, 5000);
   };

   // Update GST Information
   const updateGstInfo = async () => {
      setSaving(prev => ({ ...prev, gst: true }));
      try {
         const token = localStorage.getItem('token');
         const response = await fetch('http://localhost:5000/api/vendor/legal', {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               gstRegistrationNumber: gstInfo.gstNumber
            })
         });

         if (response.ok) {
            showSuccess('gst', 'GST information updated successfully');
            setEditMode(prev => ({ ...prev, gst: false }));
            fetchLegalData();
            // Track GST info completion
            analytics.services.legalInfoCompleted('gst_information');
         } else {
            const data = await response.json();
            showError('gst', data.message || 'Failed to update GST information');
         }
      } catch (error) {
         showError('gst', 'Network error occurred');
      }
      setSaving(prev => ({ ...prev, gst: false }));
   };

   // Update Payment Modes
   const updatePaymentModes = async () => {
      setSaving(prev => ({ ...prev, payment: true }));
      try {
         const token = localStorage.getItem('token');
         const response = await fetch('http://localhost:5000/api/vendor/legal', {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               acceptedPaymentModes: paymentModes
            })
         });

         if (response.ok) {
            showSuccess('payment', 'Payment modes updated successfully');
            setEditMode(prev => ({ ...prev, payment: false }));
            fetchLegalData();

            // Track enabled payment modes
            const enabledModes = Object.entries(paymentModes)
               .filter(([_, enabled]) => enabled)
               .map(([mode, _]) => mode);

            enabledModes.forEach(mode => {
               analytics.ui.buttonClicked(`payment_mode_${mode}_enabled`, 'legal_payment');
            });
         } else {
            const data = await response.json();
            showError('payment', data.message || 'Failed to update payment modes');
         }
      } catch (error) {
         showError('payment', 'Network error occurred');
      }
      setSaving(prev => ({ ...prev, payment: false }));
   };

   const updateBookingAdvance = async () => {
      setSaving(prev => ({ ...prev, advance: true }));
      try {
         const token = localStorage.getItem('token');
         const response = await fetch('http://localhost:5000/api/vendor/legal', {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               bookingAdvance: bookingAdvance
            })
         });

         if (response.ok) {
            showSuccess('advance', 'Booking advance updated successfully');
            fetchLegalData();

            // Track booking advance configuration
            analytics.ui.buttonClicked(`booking_advance_${bookingAdvance.type}_${bookingAdvance.value}`, 'legal_payment');
         } else {
            const data = await response.json();
            showError('advance', data.message || 'Failed to update booking advance');
         }
      } catch (error) {
         showError('advance', 'Network error occurred');
      }
      setSaving(prev => ({ ...prev, advance: false }));
   };

   // Update Policies
   const updatePolicies = async () => {
      setSaving(prev => ({ ...prev, policies: true }));
      try {
         const token = localStorage.getItem('token');
         const response = await fetch('http://localhost:5000/api/vendor/legal', {
            method: 'PUT',
            headers: {
               'Authorization': `Bearer ${token}`,
               'Content-Type': 'application/json'
            },
            body: JSON.stringify({
               minimumNoticeDays: policies.minimumNoticeDays,
               cancellationRefundPolicy: policies.cancellationRefundPolicy
            })
         });

         if (response.ok) {
            showSuccess('policies', 'Policies updated successfully');
            setEditMode(prev => ({ ...prev, policies: false }));
            fetchLegalData();

            // Track policies completion
            analytics.services.legalInfoCompleted('booking_policies');
         } else {
            const data = await response.json();
            showError('policies', data.message || 'Failed to update policies');
         }
      } catch (error) {
         showError('policies', 'Network error occurred');
      }
      setSaving(prev => ({ ...prev, policies: false }));
   };

   if (loading) {
      return (
         <div className="flex items-center justify-center p-8">
            <Loader className="w-8 h-8 animate-spin text-blue-600" />
            <span className="ml-2 text-gray-600">Loading legal information...</span>
         </div>
      );
   }

   return (
      <div className="max-w-5xl mx-auto text-gray-700 space-y-6">
         <div className="bg-indigo-600 text-white rounded-lg shadow-sm p-4 sm:p-6">
            <h1 className="text-xl  sm:text-2xl font-bold ">Legal & Payment Information</h1>
            <p className="mt-1 text-sm sm:text-base">Manage your legal documents, payment settings, and policies</p>
         </div>
         {/* File Uploads Card */}
         <div className="rounded-lg w-full">
            {errors.files && (
               <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                  <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                  <span className="text-red-700 text-sm">{errors.files}</span>
               </div>
            )}

            {success.files && (
               <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                  <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                  <span className="text-green-700 text-sm">{success.files}</span>
               </div>
            )}

            <div className="w-full flex flex-col gap-6">

               {/* GST Information Card */}
               <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center">
                        <Shield className="w-5 h-5 text-green-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900">GST Information</h2>
                        <SectionHeaderWithTooltip />
                     </div>
                     <button
                        onClick={() => toggleEditMode('gst')}
                        className="inline-flex cursor-pointer items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                     >
                        {editMode.gst ? (
                           <>
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel
                           </>
                        ) : (
                           <>
                              <Edit3 className="w-4 h-4 mr-1" />
                              Edit
                           </>
                        )}
                     </button>
                  </div>

                  {errors.gst && (
                     <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                        <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-red-700 text-sm">{errors.gst}</span>
                     </div>
                  )}

                  {success.gst && (
                     <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-green-700 text-sm">{success.gst}</span>
                     </div>
                  )}

                  <div className="space-y-4">
                     <div>
                        <label htmlFor="gst-number" className="block text-sm font-medium text-gray-700 mb-2">
                           GST Registration Number
                        </label>
                        {editMode.gst ? (
                           <input
                              type="text"
                              id="gst-number"
                              value={gstInfo.gstNumber}
                              onChange={(e) => setGstInfo({ ...gstInfo, gstNumber: e.target.value })}
                              placeholder="Enter GST registration number"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           />
                        ) : (
                           <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                              {gstInfo.gstNumber || 'Not provided'}
                           </div>
                        )}
                     </div>

                     {editMode.gst && (
                        <div className="flex justify-end">
                           <button
                              onClick={updateGstInfo}
                              disabled={saving.gst}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                           >
                              {saving.gst ? (
                                 <>
                                    <Loader className="w-4 h-4 animate-spin mr-2" />
                                    Saving...
                                 </>
                              ) : (
                                 <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save GST Info
                                 </>
                              )}
                           </button>
                        </div>
                     )}
                  </div>
               </div>

               {/* Payment Modes Card */}
               <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-purple-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900">Accepted Payment Modes</h2>
                        <SectionHeaderWithTooltip />
                     </div>
                     <button
                        onClick={() => toggleEditMode('payment')}
                        className="inline-flex cursor-pointer items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                     >
                        {editMode.payment ? (
                           <>
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel
                           </>
                        ) : (
                           <>
                              <Edit3 className="w-4 h-4 mr-1" />
                              Edit
                           </>
                        )}
                     </button>
                  </div>

                  {errors.payment && (
                     <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                        <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-red-700 text-sm">{errors.payment}</span>
                     </div>
                  )}

                  {success.payment && (
                     <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-green-700 text-sm">{success.payment}</span>
                     </div>
                  )}

                  <div className="space-y-4">
                     <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {Object.entries(paymentModes).map(([mode, enabled]) => (
                           <label key={mode} className={`flex items-center space-x-2 ${editMode.payment ? 'cursor-pointer' : 'cursor-default'}`}>
                              <input
                                 type="checkbox"
                                 checked={enabled}
                                 disabled={!editMode.payment}
                                 onChange={(e) => setPaymentModes({ ...paymentModes, [mode]: e.target.checked })}
                                 className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 focus:ring-2 disabled:opacity-50"
                              />
                              <span className="text-sm font-medium text-gray-700 capitalize">
                                 {mode === 'netBanking' ? 'Net Banking' : mode}
                              </span>
                           </label>
                        ))}
                     </div>

                     {editMode.payment && (
                        <div className="flex justify-end">
                           <button
                              onClick={updatePaymentModes}
                              disabled={saving.payment}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                           >
                              {saving.payment ? (
                                 <>
                                    <Loader className="w-4 h-4 animate-spin mr-2" />
                                    Saving...
                                 </>
                              ) : (
                                 <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Payment Modes
                                 </>
                              )}
                           </button>
                        </div>
                     )}
                  </div>
               </div>

               {/* Booking Advance Card */}
               <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center">
                        <CreditCard className="w-5 h-5 text-orange-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900">Booking Advance</h2>
                        <SectionHeaderWithTooltip />
                     </div>
                     <button
                        onClick={() => toggleEditMode('advance')}
                        className="inline-flex cursor-pointer items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                     >
                        {editMode.advance ? (
                           <>
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel
                           </>
                        ) : (
                           <>
                              <Edit3 className="w-4 h-4 mr-1" />
                              Edit
                           </>
                        )}
                     </button>
                  </div>

                  {errors.advance && (
                     <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                        <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-red-700 text-sm">{errors.advance}</span>
                     </div>
                  )}

                  {success.advance && (
                     <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-green-700 text-sm">{success.advance}</span>
                     </div>
                  )}

                  <div className="space-y-4">
                     {editMode.advance ? (
                        <>
                           <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                              <div className="flex items-center space-x-4">
                                 <label className="flex items-center cursor-pointer">
                                    <input
                                       type="radio"
                                       name="advance-type"
                                       value="percentage"
                                       checked={bookingAdvance.type === 'percentage'}
                                       // For percentage radio button
                                       onChange={(e) => {
                                          setBookingAdvance({ ...bookingAdvance, type: e.target.value });
                                          analytics.ui.buttonClicked('advance_type_percentage_selected', 'legal_payment');
                                       }}
                                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Percentage (%)</span>
                                 </label>
                                 <label className="flex items-center cursor-pointer">
                                    <input
                                       type="radio"
                                       name="advance-type"
                                       value="fixed"
                                       checked={bookingAdvance.type === 'fixed'}
                                       // For fixed radio button  
                                       onChange={(e) => {
                                          setBookingAdvance({ ...bookingAdvance, type: e.target.value });
                                          analytics.ui.buttonClicked('advance_type_fixed_selected', 'legal_payment');
                                       }}
                                       className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 focus:ring-blue-500 focus:ring-2"
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Fixed Amount (₹)</span>
                                 </label>
                              </div>

                              <div className="flex-1">
                                 <input
                                    type="number"
                                    inputMode="numeric"
                                    value={bookingAdvance.value}
                                    onChange={(e) => setBookingAdvance({ ...bookingAdvance, value: parseFloat(e.target.value) || 0 })}
                                    placeholder={bookingAdvance.type === 'percentage' ? 'Enter percentage' : 'Enter amount'}
                                    min="0"
                                    max={bookingAdvance.type === 'percentage' ? 100 : undefined}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                                    [&::-webkit-inner-spin-button]:appearance-none
                                           [&::-webkit-outer-spin-button]:appearance-none
                                           [appearance:textfield]
                                           "
                                 />
                              </div>
                           </div>

                           <div className="flex justify-end">
                              <button
                                 onClick={updateBookingAdvance}
                                 disabled={saving.advance}
                                 className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                              >
                                 {saving.advance ? (
                                    <>
                                       <Loader className="w-4 h-4 animate-spin mr-2" />
                                       Saving...
                                    </>
                                 ) : (
                                    <>
                                       <Save className="w-4 h-4 mr-2" />
                                       Save Advance
                                    </>
                                 )}
                              </button>
                           </div>
                        </>
                     ) : (
                        <div className="px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                           {bookingAdvance.value > 0
                              ? `${bookingAdvance.value}${bookingAdvance.type === 'percentage' ? '%' : ' ₹'} (${bookingAdvance.type === 'percentage' ? 'Percentage' : 'Fixed Amount'})`
                              : 'Not configured'
                           }
                        </div>
                     )}
                  </div>
               </div>

               {/* Policies Card */}
               <div className="bg-white rounded-lg shadow-md p-6">
                  <div className="flex items-center justify-between mb-4">
                     <div className="flex items-center">
                        <Calendar className="w-5 h-5 text-teal-600 mr-2" />
                        <h2 className="text-xl font-semibold text-gray-900">Booking Policies</h2>
                        <SectionHeaderWithTooltip />
                     </div>
                     <button
                        onClick={() => toggleEditMode('policies')}
                        className="flex items-center text-white px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 rounded-md cursor-pointer"
                     >
                        {editMode.policies ? (
                           <>
                              <XCircle className="w-4 h-4 mr-1" />
                              Cancel
                           </>
                        ) : (
                           <>
                              <Edit3 className="w-4 h-4 mr-1" />
                              Edit
                           </>
                        )}
                     </button>
                  </div>

                  {errors.policies && (
                     <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
                        <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-red-700 text-sm">{errors.policies}</span>
                     </div>
                  )}

                  {success.policies && (
                     <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
                        <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-green-700 text-sm">{success.policies}</span>
                     </div>
                  )}

                  <div className="space-y-4">
                     <div>
                        <label htmlFor="notice-days" className="block text-sm font-medium text-gray-700 mb-2">
                           Minimum Notice Days for Booking
                        </label>
                        {editMode.policies ? (
                           <input
                              type="number"
                              inputMode="numeric"
                              id="notice-days"
                              value={policies.minimumNoticeDays}
                              onChange={(e) => setPolicies({ ...policies, minimumNoticeDays: parseInt(e.target.value) || 1 })}
                              min="1"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                              [&::-webkit-inner-spin-button]:appearance-none
                                           [&::-webkit-outer-spin-button]:appearance-none
                                           [appearance:textfield]
                                           "
                           />
                        ) : (
                           <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                              {policies.minimumNoticeDays} day(s)
                           </div>
                        )}
                     </div>

                     <div>
                        <label htmlFor="cancellation-policy" className="block text-sm font-medium text-gray-700 mb-2">
                           Cancellation & Refund Policy
                        </label>
                        {editMode.policies ? (
                           <textarea
                              id="cancellation-policy"
                              value={policies.cancellationRefundPolicy}
                              onChange={(e) => setPolicies({ ...policies, cancellationRefundPolicy: e.target.value })}
                              placeholder="Enter your cancellation and refund policy..."
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                           />
                        ) : (
                           <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50 min-h-[100px]">
                              {policies.cancellationRefundPolicy || 'Not provided'}
                           </div>
                        )}
                     </div>

                     {editMode.policies && (
                        <div className="flex justify-end">
                           <button
                              onClick={updatePolicies}
                              disabled={saving.policies}
                              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                           >
                              {saving.policies ? (
                                 <>
                                    <Loader className="w-4 h-4 animate-spin mr-2" />
                                    Saving...
                                 </>
                              ) : (
                                 <>
                                    <Save className="w-4 h-4 mr-2" />
                                    Save Policies
                                 </>
                              )}
                           </button>
                        </div>
                     )}
                  </div>
               </div>

            </div>
         </div>
      </div>
   );
};

export default LegalPaymentSection;