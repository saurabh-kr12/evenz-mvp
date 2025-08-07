"use client";
import React, { useState, useEffect, useCallback } from 'react';
import {
   Shield,
   FileText,
   Leaf,
   AlertTriangle,
   FileCheck,
   Edit3,
   Save,
   X,
   Download,
   Trash2
} from 'lucide-react';
import SectionHeaderWithTooltip from '../SectionHeaderWithTooltip';
import useAnalytics from '@/hooks/useAnalytics';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/context/AuthContext'; // Adjusted import to use context API

const ComplianceSection = () => {
   const [complianceData, setComplianceData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [editingCard, setEditingCard] = useState(null);
   const [formData, setFormData] = useState({});
   const [submitting, setSubmitting] = useState(false);
   const [updateSuccess, setUpdateSuccess] = useState(null); // For success feedback

   // --- Hooks ---
   const { accessToken, loading: authLoading } = useAuth();
   const analytics = useAnalytics();

   // --- Data Fetching ---
   const fetchComplianceData = useCallback(async (showLoading = true) => {
      if (showLoading) setLoading(true);
      try {
         const result = await api.get('/vendor/compliance');
         if (result.data.success) {
            setComplianceData(result.data.data);
         }
      } catch (error) {
         console.error('Failed to fetch compliance data:', error);
      } finally {
         if (showLoading) setLoading(false);
      }
   }, []);

   useEffect(() => {
      if (!authLoading && accessToken) {
         fetchComplianceData();
         analytics.services.tabViewed('compliance_section');
      }
   }, [accessToken, authLoading, fetchComplianceData]);

   // --- UI Handlers ---
   const handleEdit = (cardType) => {
      setEditingCard(cardType);
      analytics.ui.buttonClicked(`${cardType}_edit`, 'compliance_section');
      // Pre-fill form data based on the card being edited
      switch (cardType) {
         case 'fssai':
            setFormData({ number: complianceData?.fssaiLicense?.number || '' });
            break;
         case 'hygiene':
            setFormData({ details: complianceData?.hygieneAudits?.details || '' });
            break;
         case 'ingredients':
            setFormData({ details: complianceData?.ingredientSourcing?.details || '' });
            break;
         case 'allergens':
            setFormData({ details: complianceData?.allergenHandling?.details || '' });
            break;
         case 'insurance':
            setFormData({
               provided: complianceData?.insurance?.provided || false,
               details: complianceData?.insurance?.details || ''
            });
            break;
         default:
            setFormData({});
      }
   };

   const handleSave = async (cardType) => {
      setSubmitting(true);
      try {
         let endpoint = '';
         let payload = {};
         switch (cardType) {
            case 'fssai':
               endpoint = '/fssai';
               payload = { number: formData.number };
               break;
            case 'hygiene':
               endpoint = '/hygiene';
               payload = { details: formData.details };
               break;
            case 'ingredients':
               endpoint = '/ingredients';
               payload = { details: formData.details };
               break;
            case 'allergens':
               endpoint = '/allergens';
               payload = { details: formData.details };
               break;
            case 'insurance':
               endpoint = '/insurance';
               payload = { provided: formData.provided, details: formData.details };
               break;
            default:
               throw new Error('Invalid card type');
         }

         const result = await api.put(`/vendor/compliance${endpoint}`, payload);

         if (result.data.success) {
            setUpdateSuccess(cardType);
            setTimeout(() => setUpdateSuccess(null), 2000);
            analytics.services.dataSaved('compliance_section', cardType, true);
            await fetchComplianceData(false); // Refetch data without full loading screen
            setEditingCard(null);
         } else {
            alert('Failed to update: ' + (result.data.message || 'Unknown error'));
         }
      } catch (error) {
         console.error('Error saving:', error);
         alert('Failed to save changes: ' + (error.response?.data?.message || error.message));
      } finally {
         setSubmitting(false);
      }
   };

   // --- Render Logic ---
   if (loading || authLoading) {
      return <div className="text-sm sm:text-base">Loading compliance information...</div>;
   }

   const cards = [
      { id: 'fssai', title: 'FSSAI License', icon: Shield, color: 'blue', data: complianceData?.fssaiLicense, hasValue: !!complianceData?.fssaiLicense?.number },
      { id: 'hygiene', title: 'Hygiene & Audits', icon: FileCheck, color: 'green', data: complianceData?.hygieneAudits, hasValue: !!complianceData?.hygieneAudits?.details },
      { id: 'ingredients', title: 'Ingredient Sourcing', icon: Leaf, color: 'emerald', data: complianceData?.ingredientSourcing, hasValue: !!complianceData?.ingredientSourcing?.details },
      { id: 'allergens', title: 'Allergen Handling', icon: AlertTriangle, color: 'orange', data: complianceData?.allergenHandling, hasValue: !!complianceData?.allergenHandling?.details },
      { id: 'insurance', title: 'Insurance Coverage', icon: FileText, color: 'purple', data: complianceData?.insurance, hasValue: complianceData?.insurance?.provided }
   ];

   return (
      <div className="max-w-5xl min-h-screen text-gray-700">
         <div className="bg-indigo-600 mb-5 text-white rounded-lg shadow-sm p-4 sm:p-6">
            <h1 className="text-lg sm:text-xl md:text-2xl font-bold">Compliance & Food Safety</h1>
            <p className="mt-1 text-xs sm:text-sm md:text-base">Manage your compliance documentation and safety protocols</p>
         </div>

         <div className="grid w-full gap-4 sm:gap-6">
            {cards.map((card) => {
               const Icon = card.icon;
               const isEditing = editingCard === card.id;

               return (
                  <div key={card.id} className="bg-white min-w-full rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                     {/* Card Header */}
                     <div className={`px-4 sm:px-6 py-3 sm:py-4 border-b border-gray-100 bg-${card.color}-50 rounded-t-lg`}>
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-2 sm:gap-3 flex-1 min-w-0">
                              <div className={`p-1.5 sm:p-2 bg-${card.color}-100 rounded-lg flex-shrink-0`}>
                                 <Icon className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 text-${card.color}-600`} />
                              </div>
                              <div className='flex items-center flex-1 min-w-0'>
                                 <h3 className="font-semibold text-sm sm:text-base md:text-lg text-gray-900 truncate">{card.title}</h3>
                                 <SectionHeaderWithTooltip />
                              </div>
                           </div>
                           <div className="flex items-center gap-1 sm:gap-2 flex-shrink-0 ml-2">
                              {!isEditing ? (
                                 <button
                                    onClick={() => handleEdit(card.id)}
                                    className="inline-flex cursor-pointer items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-medium bg-blue-600 text-white rounded-md sm:rounded-lg hover:bg-blue-700 transition-colors"
                                 >
                                    <Edit3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    <span className="hidden xs:inline">Edit</span>
                                 </button>
                              ) : (
                                 // Only show Cancel button on mobile, Save will be at bottom
                                 <button
                                    onClick={() => {
                                       setEditingCard(null);
                                    }}
                                    className="inline-flex cursor-pointer items-center px-2 sm:px-3 py-1.5 sm:py-2 text-xs font-medium bg-gray-200 text-gray-700 rounded-md sm:rounded-lg hover:bg-gray-300 transition-colors"
                                 >
                                    <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                                    <span className="hidden xs:inline">Cancel</span>
                                 </button>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Card Content */}
                     <div className="p-4 sm:p-6">
                        {card.id === 'fssai' && (
                           <div className="space-y-3 sm:space-y-4">
                              {isEditing ? (
                                 <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                       FSSAI License Number
                                    </label>
                                    <input
                                       type="text"
                                       value={formData.number || ''}
                                       onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                       placeholder="Enter your FSSAI license number"
                                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                 </div>
                              ) : (
                                 <div>
                                    {card.data?.number ? (
                                       <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                                          <p className="font-mono text-sm sm:text-base md:text-lg text-gray-900 break-all">{card.data.number}</p>
                                       </div>
                                    ) : (
                                       <p className="text-xs sm:text-sm text-gray-500 italic">No FSSAI license number provided</p>
                                    )}
                                 </div>
                              )}
                           </div>
                        )}

                        {(card.id === 'hygiene' || card.id === 'ingredients' || card.id === 'allergens') && (
                           <div className="space-y-3 sm:space-y-4">
                              {isEditing ? (
                                 <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                       Details
                                    </label>
                                    <textarea
                                       value={formData.details || ''}
                                       onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                       placeholder={`Enter details about ${card.title.toLowerCase()}`}
                                       rows={4}
                                       className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                    />
                                 </div>
                              ) : (
                                 <div>
                                    {card.data?.details ? (
                                       <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                                          <p className="text-xs sm:text-sm md:text-base text-gray-900 whitespace-pre-wrap">{card.data.details}</p>
                                       </div>
                                    ) : (
                                       <p className="text-xs sm:text-sm text-gray-500 italic">No details provided</p>
                                    )}
                                 </div>
                              )}
                           </div>
                        )}

                        {card.id === 'insurance' && (
                           <div className="space-y-3 sm:space-y-4">
                              {isEditing ? (
                                 <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center gap-3">
                                       <input
                                          type="checkbox"
                                          id="insuranceProvided"
                                          checked={formData.provided || false}
                                          onChange={(e) => {
                                             const newValue = e.target.checked;
                                             setFormData({ ...formData, provided: newValue });

                                             // Track insurance provision toggle
                                             analytics.ui.buttonClicked(`insurance_coverage_${newValue ? 'enabled' : 'disabled'}`, 'compliance_section');
                                          }}
                                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                       />
                                       <label htmlFor="insuranceProvided" className="text-xs sm:text-sm font-medium text-gray-700">
                                          We provide insurance coverage for mishaps
                                       </label>
                                    </div>

                                    {formData.provided && (
                                       <>
                                          <div>
                                             <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-2">
                                                Insurance Details
                                             </label>
                                             <textarea
                                                value={formData.details || ''}
                                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                                placeholder="Provide details about your insurance coverage"
                                                rows={4}
                                                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                             />
                                          </div>
                                       </>
                                    )}
                                 </div>
                              ) : (
                                 <div className="space-y-3 sm:space-y-4">
                                    <div className="flex items-center gap-3">
                                       <div className={`w-3 h-3 rounded-full ${card.data?.provided ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                       <span className="text-xs sm:text-sm font-medium">
                                          {card.data?.provided ? 'Insurance provided' : 'No insurance coverage'}
                                       </span>
                                    </div>

                                    {card.data?.provided && (
                                       <>
                                          {card.data.details && (
                                             <div className="p-3 sm:p-4 bg-gray-50 rounded-lg">
                                                <p className="text-xs sm:text-sm md:text-base text-gray-900 whitespace-pre-wrap">{card.data.details}</p>
                                             </div>
                                          )}

                                          {card.data.document && (
                                             <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                                   <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 flex-shrink-0" />
                                                   <div className="min-w-0">
                                                      <p className="text-xs sm:text-sm font-medium text-blue-900 truncate">{card.data.document.filename}</p>
                                                      <p className="text-xs text-blue-600">
                                                         {(card.data.document.size / 1024 / 1024).toFixed(2)} MB
                                                      </p>
                                                   </div>
                                                </div>
                                                <div className="flex gap-1 sm:gap-2 flex-shrink-0">
                                                   <button
                                                      onClick={downloadDocument}
                                                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                                   >
                                                      <Download className="w-3 h-3 sm:w-4 sm:h-4" />
                                                   </button>
                                                   <button
                                                      onClick={deleteDocument}
                                                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                                   >
                                                      <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
                                                   </button>
                                                </div>
                                             </div>
                                          )}
                                       </>
                                    )}
                                 </div>
                              )}
                           </div>
                        )}
                     </div>

                     {/* Mobile Save Button - Only show when editing on small screens */}
                     {isEditing && (
                        <div className="px-4 py-3 border-t border-gray-100 bg-gray-50 rounded-b-lg sm:hidden">
                           <button
                              onClick={() => handleSave(card.id)}
                              disabled={submitting}
                              className="w-full inline-flex justify-center items-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                           >
                              <Save className="w-4 h-4 mr-2" />
                              {submitting ? 'Saving...' : 'Save Changes'}
                           </button>
                        </div>
                     )}

                     {/* Desktop Save Button - Only show when editing on larger screens */}
                     {isEditing && (
                        <div className="hidden sm:block px-6 py-4 border-t border-gray-100 bg-gray-50 rounded-b-lg">
                           <div className="flex justify-end">
                              <button
                                 onClick={() => handleSave(card.id)}
                                 disabled={submitting}
                                 className="inline-flex items-center px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                              >
                                 <Save className="w-4 h-4 mr-2" />
                                 {submitting ? 'Saving...' : 'Save Changes'}
                              </button>
                           </div>
                        </div>
                     )}
                  </div>
               );
            })}
         </div>
      </div>
   );
};

export default ComplianceSection;