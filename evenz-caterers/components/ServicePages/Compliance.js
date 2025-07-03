"use client";
import React, { useState, useEffect } from 'react';
import {
   Shield,
   FileText,
   Leaf,
   AlertTriangle,
   FileCheck,
   Edit3,
   Save,
   X,
   Upload,
   Download,
   Trash2,
   CheckCircle,
   Clock
} from 'lucide-react';

const ComplianceSection = () => {
   const [complianceData, setComplianceData] = useState(null);
   const [loading, setLoading] = useState(true);
   const [editingCard, setEditingCard] = useState(null);
   const [formData, setFormData] = useState({});
   const [uploadFile, setUploadFile] = useState(null);
   const [submitting, setSubmitting] = useState(false);
   const [updateSuccess, setUpdateSuccess] = useState(null); // For success feedback

   // Get auth token from localStorage or your auth context
   const getAuthToken = () => {
      return localStorage.getItem('token'); // Adjust based on your auth implementation
   };

   const apiCall = async (url, options = {}) => {
      const token = getAuthToken();
      const response = await fetch(`http://localhost:5000/api/vendor/compliance${url}`, {
         ...options,
         headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            ...options.headers,
         },
      });
      return response.json();
   };

   const fetchComplianceData = async (showLoading = true) => {
      try {
         if (showLoading) setLoading(true);
         const result = await apiCall('');
         if (result.success) {
            setComplianceData(result.data);
         }
      } catch (error) {
         console.error('Failed to fetch compliance data:', error);
      } finally {
         if (showLoading) setLoading(false);
      }
   };

   useEffect(() => {
      fetchComplianceData();
   }, []);

   const handleEdit = (cardType) => {
      setEditingCard(cardType);

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
      }
   };

   // Optimistic update function
   const updateComplianceDataOptimistically = (cardType, newData) => {
      setComplianceData(prev => {
         if (!prev) return prev;
         
         const updated = { ...prev };
         switch (cardType) {
            case 'fssai':
               updated.fssaiLicense = { ...prev.fssaiLicense, ...newData };
               break;
            case 'hygiene':
               updated.hygieneAudits = { ...prev.hygieneAudits, ...newData };
               break;
            case 'ingredients':
               updated.ingredientSourcing = { ...prev.ingredientSourcing, ...newData };
               break;
            case 'allergens':
               updated.allergenHandling = { ...prev.allergenHandling, ...newData };
               break;
            case 'insurance':
               updated.insurance = { ...prev.insurance, ...newData };
               break;
         }
         return updated;
      });
   };

   const handleSave = async (cardType) => {
      try {
         setSubmitting(true);
         let result;
         let optimisticData = {};

         switch (cardType) {
            case 'fssai':
               optimisticData = { number: formData.number };
               updateComplianceDataOptimistically(cardType, optimisticData);
               result = await apiCall('/fssai', {
                  method: 'PUT',
                  body: JSON.stringify({ number: formData.number })
               });
               break;
            case 'hygiene':
               optimisticData = { details: formData.details };
               updateComplianceDataOptimistically(cardType, optimisticData);
               result = await apiCall('/hygiene', {
                  method: 'PUT',
                  body: JSON.stringify({ details: formData.details })
               });
               break;
            case 'ingredients':
               optimisticData = { details: formData.details };
               updateComplianceDataOptimistically(cardType, optimisticData);
               result = await apiCall('/ingredients', {
                  method: 'PUT',
                  body: JSON.stringify({ details: formData.details })
               });
               break;
            case 'allergens':
               optimisticData = { details: formData.details };
               updateComplianceDataOptimistically(cardType, optimisticData);
               result = await apiCall('/allergens', {
                  method: 'PUT',
                  body: JSON.stringify({ details: formData.details })
               });
               break;
            case 'insurance':
               // For insurance, we need to handle file uploads differently
               // Don't do optimistic update for file uploads
               const insuranceFormData = new FormData();
               insuranceFormData.append('provided', formData.provided);
               insuranceFormData.append('details', formData.details);
               if (uploadFile) {
                  insuranceFormData.append('document', uploadFile);
               }

               const token = getAuthToken();
               const response = await fetch('http://localhost:5000/api/vendor/compliance/insurance', {
                  method: 'PUT',
                  headers: {
                     'Authorization': `Bearer ${token}`,
                  },
                  body: insuranceFormData
               });
               result = await response.json();
               break;
         }

         if (result.success) {
            // Show success feedback
            setUpdateSuccess(cardType);
            setTimeout(() => setUpdateSuccess(null), 2000);
            
            // Only refetch for insurance (file uploads) or if optimistic update failed
            if (cardType === 'insurance') {
               await fetchComplianceData(false); // Don't show loading spinner
            }
            
            setEditingCard(null);
            setUploadFile(null);
         } else {
            // Revert optimistic update on failure
            await fetchComplianceData(false);
            alert('Failed to update: ' + result.message);
         }
      } catch (error) {
         console.error('Error saving:', error);
         // Revert optimistic update on error
         await fetchComplianceData(false);
         alert('Failed to save changes');
      } finally {
         setSubmitting(false);
      }
   };

   const handleCancel = () => {
      setEditingCard(null);
      setUploadFile(null);
      setFormData({});
   };

   const handleFileUpload = (e) => {
      const file = e.target.files[0];
      if (file && file.size <= 5 * 1024 * 1024) { // 5MB limit
         setUploadFile(file);
      } else {
         alert('File size must be less than 5MB');
      }
   };

   const downloadDocument = () => {
      const token = getAuthToken();
      window.open(`http://localhost:5000/api/vendor/compliance/insurance/document?token=${token}`, '_blank');
   };

   const deleteDocument = async () => {
      if (confirm('Are you sure you want to delete this document?')) {
         try {
            const result = await apiCall('/insurance/document', { method: 'DELETE' });
            if (result.success) {
               // Optimistically remove document
               updateComplianceDataOptimistically('insurance', { 
                  document: null,
                  documentName: null 
               });
               setUpdateSuccess('insurance');
               setTimeout(() => setUpdateSuccess(null), 2000);
            }
         } catch (error) {
            console.error('Error deleting document:', error);
            // Revert on error
            await fetchComplianceData(false);
         }
      }
   };

   const formatDate = (dateString) => {
      return new Date(dateString).toLocaleDateString('en-US', {
         year: 'numeric',
         month: 'short',
         day: 'numeric',
         hour: '2-digit',
         minute: '2-digit'
      });
   };

   if (loading) {
      return (
         <div className="p-6">
            <div className="animate-pulse space-y-6">
               {[1, 2, 3, 4, 5].map(i => (
                  <div key={i} className="bg-gray-200 rounded-lg h-48"></div>
               ))}
            </div>
         </div>
      );
   }

   const cards = [
      {
         id: 'fssai',
         title: 'FSSAI License',
         icon: Shield,
         color: 'blue',
         data: complianceData?.fssaiLicense,
         hasValue: !!complianceData?.fssaiLicense?.number
      },
      {
         id: 'hygiene',
         title: 'Hygiene & Audits',
         icon: FileCheck,
         color: 'green',
         data: complianceData?.hygieneAudits,
         hasValue: !!complianceData?.hygieneAudits?.details
      },
      {
         id: 'ingredients',
         title: 'Ingredient Sourcing',
         icon: Leaf,
         color: 'emerald',
         data: complianceData?.ingredientSourcing,
         hasValue: !!complianceData?.ingredientSourcing?.details
      },
      {
         id: 'allergens',
         title: 'Allergen Handling',
         icon: AlertTriangle,
         color: 'orange',
         data: complianceData?.allergenHandling,
         hasValue: !!complianceData?.allergenHandling?.details
      },
      {
         id: 'insurance',
         title: 'Insurance Coverage',
         icon: FileText,
         color: 'purple',
         data: complianceData?.insurance,
         hasValue: complianceData?.insurance?.provided
      }
   ];

   return (
      <div className="max-w-5xl min-h-screen text-gray-700">
         <div className="bg-indigo-600 mb-5 text-white rounded-lg shadow-sm p-4 sm:p-6">
            <h1 className="text-xl  sm:text-2xl font-bold">Compliance & Food Safety</h1>
            <p className="mt-1 text-sm sm:text-base">Manage your compliance documentation and safety protocols</p>
         </div>

         <div className="grid w-full gap-6 ">
            {cards.map((card) => {
               const Icon = card.icon;
               const isEditing = editingCard === card.id;

               return (
                  <div key={card.id} className="bg-white min-w-full rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
                     {/* Card Header */}
                     <div className={`px-6 py-4 border-b border-gray-100 bg-${card.color}-50 rounded-t-lg`}>
                        <div className="flex items-center justify-between">
                           <div className="flex items-center gap-3">
                              <div className={`p-2 bg-${card.color}-100 rounded-lg`}>
                                 <Icon className={`w-5 h-5 text-${card.color}-600`} />
                              </div>
                              <div>
                                 <h3 className="font-semibold text-gray-900">{card.title}</h3>

                              </div>
                           </div>
                           <div className="flex items-center gap-2">

                              {!isEditing ? (
                                 <button
                                    onClick={() => handleEdit(card.id)}
                                    className="inline-flex cursor-pointer items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                 >
                                    <Edit3 className="w-4 h-4 mr-1" />
                                    Edit
                                 </button>
                              ) : (
                                 <div className="flex gap-1">

                                    <button
                                       onClick={() => {
                                          setEditingCard(null);
                                          setUploadFile(null);
                                       }}
                                       className="inline-flex cursor-pointer items-center px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                       <X className="w-4 h-4 mr-1" />
                                       Cancel
                                    </button>
                                    <button
                                       onClick={() => handleSave(card.id)}
                                       disabled={submitting}
                                       className="inline-flex cursor-pointer items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                       <Save className="w-4 h-4 mr-1" />
                                       Save
                                    </button>
                                 </div>
                              )}
                           </div>
                        </div>
                     </div>

                     {/* Card Content */}
                     <div className="p-6">
                        {card.id === 'fssai' && (
                           <div className="space-y-4">
                              {isEditing ? (
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                       FSSAI License Number
                                    </label>
                                    <input
                                       type="text"
                                       value={formData.number || ''}
                                       onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                                       placeholder="Enter your FSSAI license number"
                                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                 </div>
                              ) : (
                                 <div>
                                    {card.data?.number ? (
                                       <div className="p-4 bg-gray-50 rounded-lg">
                                          <p className="font-mono text-lg text-gray-900">{card.data.number}</p>
                                       </div>
                                    ) : (
                                       <p className="text-gray-500 italic">No FSSAI license number provided</p>
                                    )}
                                 </div>
                              )}
                           </div>
                        )}

                        {(card.id === 'hygiene' || card.id === 'ingredients' || card.id === 'allergens') && (
                           <div className="space-y-4">
                              {isEditing ? (
                                 <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                       Details
                                    </label>
                                    <textarea
                                       value={formData.details || ''}
                                       onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                       placeholder={`Enter details about ${card.title.toLowerCase()}`}
                                       rows={6}
                                       className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                    />
                                 </div>
                              ) : (
                                 <div>
                                    {card.data?.details ? (
                                       <div className="p-4 bg-gray-50 rounded-lg">
                                          <p className="text-gray-900 whitespace-pre-wrap">{card.data.details}</p>
                                       </div>
                                    ) : (
                                       <p className="text-gray-500 italic">No details provided</p>
                                    )}
                                 </div>
                              )}
                           </div>
                        )}

                        {card.id === 'insurance' && (
                           <div className="space-y-4">
                              {isEditing ? (
                                 <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                       <input
                                          type="checkbox"
                                          id="insuranceProvided"
                                          checked={formData.provided || false}
                                          onChange={(e) => setFormData({ ...formData, provided: e.target.checked })}
                                          className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                       />
                                       <label htmlFor="insuranceProvided" className="text-sm font-medium text-gray-700">
                                          We provide insurance coverage for mishaps
                                       </label>
                                    </div>

                                    {formData.provided && (
                                       <>
                                          <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Insurance Details
                                             </label>
                                             <textarea
                                                value={formData.details || ''}
                                                onChange={(e) => setFormData({ ...formData, details: e.target.value })}
                                                placeholder="Provide details about your insurance coverage"
                                                rows={4}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
                                             />
                                          </div>

                                          <div>
                                             <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Upload Insurance Document (Optional)
                                             </label>
                                             <div className="flex items-center gap-3">
                                                <input
                                                   type="file"
                                                   onChange={handleFileUpload}
                                                   accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                                   className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
                                                {uploadFile && (
                                                   <span className="text-sm text-green-600">
                                                      ✓ {uploadFile.name}
                                                   </span>
                                                )}
                                             </div>
                                             <p className="text-xs text-gray-500 mt-1">
                                                Supported formats: PDF, DOC, DOCX, JPG, PNG (Max 5MB)
                                             </p>
                                          </div>
                                       </>
                                    )}
                                 </div>
                              ) : (
                                 <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                       <div className={`w-3 h-3 rounded-full ${card.data?.provided ? 'bg-green-500' : 'bg-red-500'}`}></div>
                                       <span className="font-medium">
                                          {card.data?.provided ? 'Insurance provided' : 'No insurance coverage'}
                                       </span>
                                    </div>

                                    {card.data?.provided && (
                                       <>
                                          {card.data.details && (
                                             <div className="p-4 bg-gray-50 rounded-lg">
                                                <p className="text-gray-900 whitespace-pre-wrap">{card.data.details}</p>
                                             </div>
                                          )}

                                          {card.data.document && (
                                             <div className="flex items-center justify-between p-3 bg-blue-50 rounded-lg">
                                                <div className="flex items-center gap-3">
                                                   <FileText className="w-5 h-5 text-blue-600" />
                                                   <div>
                                                      <p className="font-medium text-blue-900">{card.data.document.filename}</p>
                                                      <p className="text-sm text-blue-600">
                                                         {(card.data.document.size / 1024 / 1024).toFixed(2)} MB
                                                      </p>
                                                   </div>
                                                </div>
                                                <div className="flex gap-2">
                                                   <button
                                                      onClick={downloadDocument}
                                                      className="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-100 rounded-lg transition-colors"
                                                   >
                                                      <Download className="w-4 h-4" />
                                                   </button>
                                                   <button
                                                      onClick={deleteDocument}
                                                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-100 rounded-lg transition-colors"
                                                   >
                                                      <Trash2 className="w-4 h-4" />
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
                  </div>
               );
            })}
         </div>
      </div>
   );
};

export default ComplianceSection;