"use client";
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { ChevronDown, ChevronUp, Plus, Trash2, Save, Check, AlertCircle, Edit3, X } from 'lucide-react';
import SectionHeaderWithTooltip from '../SectionHeaderWithTooltip';
import useAnalytics from '@/hooks/useAnalytics';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/context/AuthContext'; // Assuming api is exported from AuthContext

const CheckboxGroup = ({ title, options, values, onChange, sectionName, disabled = false }) => {
   const handleCustomOptionToggle = (index, checked) => {
      const customOptions = [...(values.customOptions || [])];
      customOptions[index] = { ...customOptions[index], selected: checked };
      onChange(`${sectionName}.customOptions`, customOptions);
   };

   const handleRemoveCustomOption = (index) => {
      const customOptions = [...(values.customOptions || [])];
      customOptions.splice(index, 1);
      onChange(`${sectionName}.customOptions`, customOptions);
   };

   return (
      <div className="space-y-3">
         <h4 className="font-medium text-gray-900 text-sm sm:text-base">{title}</h4>
         <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Standard options */}
            {Object.entries(options).map(([key, label]) => (
               <label key={key} className="flex items-center space-x-2 cursor-pointer">
                  <input
                     type="checkbox"
                     checked={values[key] || false}
                     onChange={(e) => onChange(`${sectionName}.${key}`, e.target.checked)}
                     disabled={disabled}
                     className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 disabled:text-gray-700 disabled:opacity-100"
                  />
                  <span className="text-sm text-gray-700 select-none">{label}</span>
               </label>
            ))}

            {/* Custom options from previous saves */}
            {values.customOptions && values.customOptions.map((customOption, index) => (
               <div key={`custom-${index}`} className="flex items-center space-x-2">
                  <label className="flex items-center space-x-2 cursor-pointer flex-1">
                     <input
                        type="checkbox"
                        checked={customOption.selected || false}
                        onChange={(e) => handleCustomOptionToggle(index, e.target.checked)}
                        disabled={disabled}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 disabled:text-gray-700 disabled:opacity-100"
                     />
                     <span className="text-sm text-gray-700 select-none">{customOption.specification}</span>
                  </label>
                  {!disabled && (
                     <button
                        type="button"
                        onClick={() => handleRemoveCustomOption(index)}
                        className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-50 transition-colors"
                        title="Remove custom option"
                     >
                        <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                     </button>
                  )}
               </div>
            ))}

            {/* Other (please specify) option */}
            <label className="flex items-center space-x-2 cursor-pointer">
               <input
                  type="checkbox"
                  checked={values.other?.selected || false}
                  onChange={(e) => onChange(`${sectionName}.other.selected`, e.target.checked)}
                  disabled={disabled}
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500 focus:ring-offset-0 disabled:opacity-50"
               />
               <span className="text-sm text-gray-700 select-none">Other (please specify)</span>
            </label>
         </div>

         {/* Text input for "Other" specification */}
         {values.other?.selected && (
            <div className="mt-3">
               <input
                  type="text"
                  placeholder="Please specify..."
                  value={values.other?.specification || ''}
                  onChange={(e) => onChange(`${sectionName}.other.specification`, e.target.value)}
                  disabled={disabled}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:opacity-50"
               />
               <p className="text-xs text-gray-500 mt-1">
                  This will be added as a reusable option when you save.
               </p>
            </div>
         )}
      </div>
   );
};

const getSummaryForCheckboxes = (values, options) => {
   const selected = [];

   // Add standard options
   Object.entries(options).forEach(([key, label]) => {
      if (values[key]) {
         selected.push(label);
      }
   });

   // Add custom options
   if (values.customOptions) {
      values.customOptions.forEach(customOption => {
         if (customOption.selected) {
            selected.push(customOption.specification);
         }
      });
   }

   // Add other specification
   if (values.other?.selected && values.other?.specification) {
      selected.push(values.other.specification);
   }

   return selected.length > 0 ? selected.join(', ') : 'None selected';
};

const SectionCard = ({
   title,
   priority,
   children,
   sectionName,
   onSave,
   requiresEdit = true,
   saving = {},
   errors = {},
   expandedSections = {},
   editingSections = {},
   toggleSection = () => { },
   toggleEditing = () => { },
   summary = null,
   showEditInCollapsed = false
}) => {
   const isEditing = editingSections[sectionName] || false;
   const isExpanded = expandedSections[sectionName] || false;
   const analytics = useAnalytics();

   return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 ">
         <div className="flex items-center justify-between p-4 hover:bg-gray-50 transition-colors">
            <div
               className="flex-1 cursor-pointer"
               onClick={() => toggleSection(sectionName)}
            >
               <div className='flex flex-row'>
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">{title}</h3>
                  <SectionHeaderWithTooltip priority={priority} />
               </div>
               {!isExpanded && summary && (
                  <p className="text-sm text-gray-600 line-clamp-2">{summary}</p>
               )}
            </div>

            <div className="flex items-center space-x-2 ml-4">
               {saving[sectionName] === 'success' && (
                  <div className="flex items-center text-green-600">
                     <Check className="h-4 w-4" />
                  </div>
               )}

               {showEditInCollapsed && !isExpanded && (
                  <button
                     onClick={(e) => {
                        e.stopPropagation();
                        toggleSection(sectionName);
                        toggleEditing(sectionName);
                        analytics.ui.buttonClicked('edit_section_collapsed', `counter_services_${sectionName}`);
                     }}
                     className="inline-flex cursor-pointer items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                     <Edit3 className="h-3 w-3 mr-1" />
                     <span>Edit</span>
                  </button>
               )}

               <button
                  onClick={() => toggleSection(sectionName)}
                  className="p-1 hover:bg-gray-200 rounded transition-colors"
               >
                  {isExpanded ?
                     <ChevronUp className="h-5 w-5 text-gray-500" /> :
                     <ChevronDown className="h-5 w-5 text-gray-500" />
                  }
               </button>
            </div>
         </div>

         {isExpanded && (
            <div className="px-4 pb-4">
               {errors[sectionName] && (
                  <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                     <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                     <span className="text-sm text-red-700">{errors[sectionName]}</span>
                  </div>
               )}

               <div className="space-y-4 mb-4">
                  {children}
               </div>

               <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                  {requiresEdit && (
                     <div>
                        {!isEditing ? (
                           <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 toggleEditing(sectionName);
                                 analytics.ui.buttonClicked('edit_section_expanded', `counter_services_${sectionName}`);
                              }}
                              className="inline-flex cursor-pointer items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                           >
                              <Edit3 className="h-4 w-4 mr-1" />
                              <span>Edit</span>
                           </button>
                        ) : (
                           <button
                              onClick={(e) => {
                                 e.stopPropagation();
                                 toggleEditing(sectionName);
                              }}
                              className="px-4 cursor-pointer py-2 bg-gray-400 hover:bg-gray-500 text-white rounded-md font-medium flex items-center space-x-2 transition-colors"
                           >
                              <X className="h-4 w-4" />
                              <span>Cancel</span>
                           </button>
                        )}
                     </div>
                  )}

                  {sectionName !== "liveCounters" && (!requiresEdit || isEditing) && (
                     <button
                        onClick={onSave}
                        disabled={saving[sectionName] === true}
                        className={`px-6 py-2 cursor-pointer rounded-md font-medium flex items-center space-x-2 transition-all duration-200 ${saving[sectionName] === 'success'
                           ? 'bg-green-600 text-white shadow-md'
                           : saving[sectionName] === 'error'
                              ? 'bg-red-600 text-white shadow-md'
                              : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 shadow-sm hover:shadow-md'
                           }`}
                     >
                        {saving[sectionName] === true ? (
                           <>
                              <div className="animate-spin  rounded-full h-4 w-4 border-b-2 border-white"></div>
                              <span>Saving...</span>
                           </>
                        ) : saving[sectionName] === 'success' ? (
                           <>
                              <Check className="h-4 w-4" />
                              <span>Saved!</span>
                           </>
                        ) : (
                           <>
                              <Save className="h-4 w-4" />
                              <span>Save Changes</span>
                           </>
                        )}
                     </button>
                  )}

               </div>
            </div>
         )}
      </div>
   );
};

const LiveCounterCard = ({
   counter,
   index,
   isEditing,
   onEdit,
   onDelete,
   onUpdate,
   onSave,
   saving,
   errors
}) => {
   const counterId = counter._id;
   const savingKey = `liveCounter-${counterId}`;

   return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
         {!isEditing ? (
            // Summary View
            <div className="flex justify-between items-start">
               <div className="flex-1">
                  <h5 className="font-medium text-gray-800 mb-1">{counter.name || `Counter #${index + 1}`}</h5>
                  <p className="text-sm text-gray-600 mb-1">₹{counter.pricePerPlate} per plate</p>
                  {counter.description && (
                     <p className="text-xs text-gray-500 line-clamp-2">{counter.description}</p>
                  )}
               </div>
               <div className="flex items-center space-x-2 ml-4">
                  {saving[savingKey] === 'success' && (
                     <div className="flex items-center text-green-600">
                        <Check className="h-4 w-4" />
                     </div>
                  )}
                  <button
                     onClick={onEdit}
                     className="text-blue-600 hover:bg-blue-50 p-1 rounded transition-colors"
                     title="Edit counter"
                  >
                     <Edit3 className="h-4 w-4" />
                  </button>
                  <button
                     onClick={onDelete}
                     className="text-red-600 hover:bg-red-50 p-1 rounded transition-colors"
                     title="Delete counter"
                  >
                     <Trash2 className="h-4 w-4" />
                  </button>
               </div>
            </div>
         ) : (
            // Edit View
            <div className="space-y-3">
               <div className="flex justify-between items-start">
                  <h5 className="font-medium text-gray-800">Editing Counter #{index + 1}</h5>
                  <button
                     onClick={() => onEdit()}
                     className="text-gray-500 hover:bg-gray-200 p-1 rounded transition-colors"
                     title="Cancel editing"
                  >
                     <X className="h-4 w-4" />
                  </button>
               </div>

               {errors[savingKey] && (
                  <div className="p-2 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                     <AlertCircle className="h-3 w-3 text-red-500 flex-shrink-0" />
                     <span className="text-xs text-red-700">{errors[savingKey]}</span>
                  </div>
               )}

               <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                     <label className="block text-xs font-medium text-gray-600 mb-1">Counter Name</label>
                     <input
                        type="text"
                        placeholder="e.g., Chaat Counter"
                        value={counter.name}
                        onChange={(e) => onUpdate(index, 'name', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
                     />
                  </div>
                  <div>
                     <label className="block text-xs font-medium text-gray-600 mb-1">Price per Plate</label>
                     <div className="relative">
                        <span className="absolute left-3 top-2 text-gray-500 text-sm">₹</span>
                        <input
                           type="number"
                           inputMode="numeric"
                           placeholder="0"
                           min="0"
                           value={counter.pricePerPlate}
                           onChange={(e) => onUpdate(index, 'pricePerPlate', Number(e.target.value) || 0)}
                           className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors
                           [&::-webkit-inner-spin-button]:appearance-none
                                           [&::-webkit-outer-spin-button]:appearance-none
                                           [appearance:textfield]
                                           "
                        />
                     </div>
                  </div>
               </div>

               <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                  <textarea
                     placeholder="Describe what's included in this counter..."
                     value={counter.description}
                     onChange={(e) => onUpdate(index, 'description', e.target.value)}
                     rows="2"
                     className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors resize-none"
                  />
               </div>

               <div className="flex justify-end pt-2">
                  <button
                     onClick={() => onSave(counter, counter.isNew)}
                     disabled={saving[savingKey] === true || !counter.name || !counter.description}
                     className={`px-4 py-2 rounded-md font-medium flex items-center space-x-2 transition-all duration-200 text-sm ${saving[savingKey] === 'success'
                        ? 'bg-green-600 text-white shadow-md'
                        : saving[savingKey] === 'error'
                           ? 'bg-red-600 text-white shadow-md'
                           : 'bg-blue-600 hover:bg-blue-700 text-white disabled:opacity-50 shadow-sm hover:shadow-md'
                        }`}
                  >
                     {saving[savingKey] === true ? (
                        <>
                           <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-white"></div>
                           <span>Saving...</span>
                        </>
                     ) : saving[savingKey] === 'success' ? (
                        <>
                           <Check className="h-3 w-3" />
                           <span>Saved!</span>
                        </>
                     ) : (
                        <>
                           <Save className="h-3 w-3" />
                           <span>Save Counter</span>
                        </>
                     )}
                  </button>
               </div>
            </div>
         )}
      </div>
   );
};

const CounterNServices = () => {
   const [services, setServices] = useState(null);
   const [loading, setLoading] = useState(true);
   const [saving, setSaving] = useState({});
   const [expandedSections, setExpandedSections] = useState({});
   const [editingSections, setEditingSections] = useState({});
   const [editingCounters, setEditingCounters] = useState({});
   const [errors, setErrors] = useState({});
   const inputRefs = useRef({});
   // Analytics
   const { services: analyticsServices } = useAnalytics();
   const analytics = useAnalytics();
   const { accessToken, loading: authLoading } = useAuth();

   // Initialize default services data
   const defaultServices = {
      mealServiceTypes: {
         buffet: false,
         plated: false,
         liveCounters: false,
         familyStyle: false,
         cocktailStyle: false,
         customOptions: [],
         other: { selected: false, specification: '' }
      },
      liveCounters: [],
      staffDetails: '',
      tableware: {
         plates: false,
         bowls: false,
         cutlery: false,
         glasses: false,
         servingUtensils: false,
         linens: false,
         customOptions: [],
         other: { selected: false, specification: '' }
      },
      setupBreakdownProcess: '',
      deliveryLogistics: '',
      availableForEvents: {
         birthday: false,
         wedding: false,
         corporate: false,
         funerals: false,
         religious: false,
         smallGathering: false,
         customOptions: [],
         other: { selected: false, specification: '' }
      },
      staffProvided: {
         ratio: { staffCount: 1, guestCount: 10 },
         cost: 0,
         costType: 'per_hour'
      },
      waterService: {
         includedInPackage: false,
         jarWaterCharges: 0,
         bottleWaterCharges: 0
      }
   };

   const fetchServices = useCallback(async () => {
      setLoading(true);
      try {
         const response = await api.get('/vendor/services');
         if (response.data.success) {
            // Use a default structure to prevent errors if some fields are missing
            const defaultData = { liveCounters: [], mealServiceTypes: {}, tableware: {}, availableForEvents: {}, staffProvided: { ratio: {} }, waterService: {} };
            setServices({ ...defaultData, ...response.data.data });
         } else {
            throw new Error(response.data.message || 'Failed to fetch services');
         }
      } catch (error) {
         console.error('Error fetching services:', error);
         setErrors({ general: error.response?.data?.message || 'Could not load your services data.' });
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => {
        // Only fetch data when authentication is complete and a token is available
        if (!authLoading && accessToken) {
            fetchServices();
            analyticsServices.tabViewed('counter_services');
        }
    }, [accessToken, authLoading, fetchServices]);

    const saveSection = async (sectionName, sectionData) => {
        setSaving(prev => ({ ...prev, [sectionName]: true }));
        setErrors(prev => ({ ...prev, [sectionName]: null }));
        try {
            const response = await api.put('/vendor/services', { [sectionName]: sectionData });
            if (response.data.success) {
                setServices(prev => ({ ...prev, ...response.data.services }));
                setSaving(prev => ({ ...prev, [sectionName]: 'success' }));
                setEditingSections(prev => ({ ...prev, [sectionName]: false }));
                analyticsServices.sectionUpdated('counter_services', sectionName, 'save');
                setTimeout(() => setSaving(prev => ({ ...prev, [sectionName]: false })), 2000);
            } else {
                throw new Error(response.data.message || 'Failed to save');
            }
        } catch (error) {
            console.error(`Error saving ${sectionName}:`, error);
            const errorMessage = error.response?.data?.message || 'An error occurred while saving.';
            setErrors(prev => ({ ...prev, [sectionName]: errorMessage }));
            setSaving(prev => ({ ...prev, [sectionName]: 'error' }));
            setTimeout(() => setSaving(prev => ({ ...prev, [sectionName]: false })), 3000);
        }
    };

    const saveLiveCounter = async (counter, isNew = false) => {
        const savingKey = `liveCounter-${counter._id || 'new'}`;
        setSaving(prev => ({ ...prev, [savingKey]: true }));
        setErrors(prev => ({ ...prev, [savingKey]: null }));
        try {
            const payload = {
                name: counter.name,
                description: counter.description,
                pricePerPlate: counter.pricePerPlate
            };
            const response = isNew
                ? await api.post('/vendor/services/live-counters', payload)
                : await api.put(`/vendor/services/live-counters/${counter._id}`, payload);

            if (response.data.success) {
                await fetchServices(); // Refresh all data
                setSaving(prev => ({ ...prev, [savingKey]: 'success' }));
                if (isNew) analyticsServices.counterAdded('live_counter', counter.name);
                else analyticsServices.sectionUpdated('counter_services', 'live_counter', 'edit');
                setTimeout(() => setSaving(prev => ({ ...prev, [savingKey]: false })), 2000);
            } else {
                throw new Error(response.data.message || 'Failed to save live counter');
            }
        } catch (error) {
            console.error('Error saving live counter:', error);
            const errorMessage = error.response?.data?.message || 'An error occurred.';
            setErrors(prev => ({ ...prev, [savingKey]: errorMessage }));
            setSaving(prev => ({ ...prev, [savingKey]: 'error' }));
            setTimeout(() => setSaving(prev => ({ ...prev, [savingKey]: false })), 3000);
        }
    };

    const deleteLiveCounter = async (counterId) => {
        try {
            const response = await api.delete(`/vendor/services/live-counters/${counterId}`);
            if (response.data.success) {
                await fetchServices(); // Refresh data
            } else {
                throw new Error(response.data.message || 'Failed to delete live counter');
            }
        } catch (error) {
            console.error('Error deleting live counter:', error);
            setErrors(prev => ({ ...prev, liveCounters: error.response?.data?.message || 'Could not delete counter.' }));
        }
    };

   const toggleSection = (sectionName) => {
      const isExpanding = !expandedSections[sectionName];

      setExpandedSections(prev => ({
         ...prev,
         [sectionName]: isExpanding
      }));

      // Track section viewing
      if (isExpanding) {
         analyticsServices.sectionCompleted('counter_services', sectionName, 0);
      }
   };

   const toggleEditing = (sectionName) => {
      setEditingSections(prev => ({
         ...prev,
         [sectionName]: !prev[sectionName]
      }));
   };

   const toggleCounterEditing = (counterId) => {
      setEditingCounters(prev => ({
         ...prev,
         [counterId]: !prev[counterId]
      }));
   };

   // Fixed updateServices to prevent re-renders that lose focus
   const updateServices = useCallback((path, value) => {
      setServices(prev => {
         if (!prev) return prev;
         const newServices = { ...prev };
         const keys = path.split('.');
         let current = newServices;

         for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
               current[keys[i]] = {};
            } else {
               current[keys[i]] = { ...current[keys[i]] };
            }
            current = current[keys[i]];
         }

         current[keys[keys.length - 1]] = value;
         return newServices;
      });
   }, []);

   const addLiveCounter = () => {
      // Track add counter action
      analytics.ui.buttonClicked('add_live_counter', 'counter_services');
      const newCounter = {
         _id: `temp-${Date.now()}`,
         name: '',
         description: '',
         pricePerPlate: 0,
         isNew: true
      };

      setServices(prev => ({
         ...prev,
         liveCounters: [...prev.liveCounters, newCounter]
      }));

      // Auto-edit new counter
      setEditingCounters(prev => ({ ...prev, [newCounter._id]: true }));
   };

   const removeLiveCounter = async (index, counterId) => {
      if (counterId && !counterId.startsWith('temp-')) {
         await deleteLiveCounter(counterId);
      } else {
         setServices(prev => ({
            ...prev,
            liveCounters: prev.liveCounters.filter((_, i) => i !== index)
         }));
      }
   };

   const updateLiveCounter = useCallback((index, field, value) => {
      setServices(prev => ({
         ...prev,
         liveCounters: prev.liveCounters.map((counter, i) =>
            i === index ? { ...counter, [field]: value } : counter
         )
      }));
   }, []);

   if (loading) {
      return (
         <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
               <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
               <p className="text-gray-600">Loading services...</p>
            </div>
         </div>
      );
   }

   if (!services) {
      return (
         <div className="flex items-center justify-center min-h-96">
            <div className="text-center">
               <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
               <p className="text-gray-600">Failed to load services. Please refresh the page.</p>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-gray-50 text-gray-700 ">
         <div className="max-w-5xl mx-auto space-y-5">
            {/* Header */}
            <div className="bg-indigo-600 text-white rounded-lg shadow-sm p-4 sm:p-6">
               <h1 className="text-xl  sm:text-2xl font-bold flex">
                  <span>
                     Live Counters & Services
                  </span>
               </h1>
               <p className="mt-1 text-sm sm:text-base">Configure your live counters, catering services, staff details, and logistics information</p>
            </div>

            {/* Live Counters */}
            <SectionCard
               title="Live Counters"
               sectionName="liveCounters"
               priority="medium"
               onSave={() => { }}
               requiresEdit={false}
               saving={saving}
               errors={errors}
               expandedSections={expandedSections}
               editingSections={editingSections}
               toggleSection={toggleSection}
               toggleEditing={toggleEditing}
               summary={`${services.liveCounters.length} counter${services.liveCounters.length !== 1 ? 's' : ''} configured`}
            >
               <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                     <h4 className="font-medium text-gray-900">Live Counter Options</h4>
                     <button
                        onClick={addLiveCounter}
                        className="flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                     >
                        <Plus className="h-4 w-4" />
                        <span>Add Counter</span>
                     </button>
                  </div>

                  {errors.liveCounters && (
                     <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-center space-x-2">
                        <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                        <span className="text-sm text-red-700">{errors.liveCounters}</span>
                     </div>
                  )}

                  {services.liveCounters.length > 0 ? (
                     <div className="space-y-4">
                        {services.liveCounters.map((counter, index) => (
                           <LiveCounterCard
                              key={counter._id}
                              counter={counter}
                              index={index}
                              isEditing={editingCounters[counter._id]}
                              onEdit={() => toggleCounterEditing(counter._id)}
                              onDelete={() => removeLiveCounter(index, counter._id)}
                              onUpdate={updateLiveCounter}
                              onSave={saveLiveCounter}
                              saving={saving}
                              errors={errors}
                           />
                        ))}
                     </div>
                  ) : (
                     <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                        <div className="mx-auto w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                           <Plus className="h-6 w-6 text-gray-400" />
                        </div>
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Live Counters</h3>
                        <p className="text-gray-600 mb-4">Add live counters to showcase interactive food stations</p>
                        <button
                           onClick={addLiveCounter}
                           className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                        >
                           <Plus className="h-4 w-4" />
                           <span>Add Your First Counter</span>
                        </button>
                     </div>
                  )}
               </div>
            </SectionCard>

            {/* Meal Service Types */}
            <SectionCard
               title="Meal Service Types"
               priority="medium"
               sectionName="mealServiceTypes"
               onSave={() => saveSection('mealServiceTypes', services.mealServiceTypes)}
               saving={saving}
               errors={errors}
               expandedSections={expandedSections}
               editingSections={editingSections}
               toggleSection={toggleSection}
               toggleEditing={toggleEditing}
               showEditInCollapsed={true}
               summary={getSummaryForCheckboxes(services.mealServiceTypes, {
                  buffet: 'Buffet Service',
                  plated: 'Plated Service',
                  liveCounters: 'Live Counters',
                  familyStyle: 'Family Style',
                  cocktailStyle: 'Cocktail Style'
               })}
            >
               <CheckboxGroup
                  title="Available Service Types"
                  options={{
                     buffet: 'Buffet Service',
                     plated: 'Plated Service',
                     liveCounters: 'Live Counters',
                     familyStyle: 'Family Style',
                     cocktailStyle: 'Cocktail Style'
                  }}
                  values={services.mealServiceTypes}
                  onChange={updateServices}
                  sectionName="mealServiceTypes"
                  disabled={!editingSections.mealServiceTypes}
               />
            </SectionCard>

            {/* Available for Events */}
            <SectionCard
               title="Available for Events"
               priority="high"
               sectionName="availableForEvents"
               onSave={() => saveSection('availableForEvents', services.availableForEvents)}
               saving={saving}
               errors={errors}
               expandedSections={expandedSections}
               editingSections={editingSections}
               toggleSection={toggleSection}
               toggleEditing={toggleEditing}
               showEditInCollapsed={true}
               summary={getSummaryForCheckboxes(services.availableForEvents, {
                  birthday: 'Birthday Parties',
                  wedding: 'Weddings',
                  corporate: 'Corporate Events',
                  funerals: 'Funerals',
                  religious: 'Religious Ceremonies',
                  smallGathering: 'Small Gatherings'
               })}
            >
               <CheckboxGroup
                  title="Event Types You Cater"
                  options={{
                     birthday: 'Birthday Parties',
                     wedding: 'Weddings',
                     corporate: 'Corporate Events',
                     funerals: 'Funerals',
                     religious: 'Religious Ceremonies',
                     smallGathering: 'Small Gatherings'
                  }}
                  values={services.availableForEvents}
                  onChange={updateServices}
                  sectionName="availableForEvents"
                  disabled={!editingSections.availableForEvents}
               />
            </SectionCard>

            {/* Staff Details */}
            <SectionCard
               title="Staff Details"
               priority="low"
               sectionName="staffDetails"
               onSave={() => saveSection('staffDetails', services.staffDetails)}
               saving={saving}
               errors={errors}
               expandedSections={expandedSections}
               editingSections={editingSections}
               toggleSection={toggleSection}
               toggleEditing={toggleEditing}
               showEditInCollapsed={true}
               summary={services.staffDetails ? (services.staffDetails.length > 100 ? services.staffDetails.substring(0, 100) + '...' : services.staffDetails) : 'No staff details provided'}
            >
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Staff Information
                  </label>
                  <textarea
                     placeholder="Describe your staff capabilities, uniforms, training, etc..."
                     value={services.staffDetails}
                     onChange={(e) => updateServices('staffDetails', e.target.value)}
                     disabled={!editingSections.staffDetails}
                     rows="4"
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:opacity-50 resize-none"
                  />
               </div>
            </SectionCard>

            {/* Tableware */}
            <SectionCard
               title="Tableware & Equipment"
               priority="low"
               sectionName="tableware"
               onSave={() => saveSection('tableware', services.tableware)}
               saving={saving}
               errors={errors}
               expandedSections={expandedSections}
               editingSections={editingSections}
               toggleSection={toggleSection}
               toggleEditing={toggleEditing}
               showEditInCollapsed={true}
               summary={getSummaryForCheckboxes(services.tableware, {
                  plates: 'Plates',
                  bowls: 'Bowls',
                  cutlery: 'Cutlery',
                  glasses: 'Glasses',
                  servingUtensils: 'Serving Utensils',
                  linens: 'Linens'
               })}
            >
               <CheckboxGroup
                  title="Available Tableware & Equipment"
                  options={{
                     plates: 'Plates',
                     bowls: 'Bowls',
                     cutlery: 'Cutlery',
                     glasses: 'Glasses',
                     servingUtensils: 'Serving Utensils',
                     linens: 'Linens'
                  }}
                  values={services.tableware}
                  onChange={updateServices}
                  sectionName="tableware"
                  disabled={!editingSections.tableware}
               />
            </SectionCard>

            {/* Setup & Breakdown Process */}
            <SectionCard
               title="Setup & Breakdown Process"
               priority="low"
               sectionName="setupBreakdownProcess"
               onSave={() => saveSection('setupBreakdownProcess', services.setupBreakdownProcess)}
               saving={saving}
               errors={errors}
               expandedSections={expandedSections}
               editingSections={editingSections}
               toggleSection={toggleSection}
               toggleEditing={toggleEditing}
               showEditInCollapsed={true}
               summary={services.setupBreakdownProcess ? (services.setupBreakdownProcess.length > 100 ? services.setupBreakdownProcess.substring(0, 100) + '...' : services.setupBreakdownProcess) : 'No setup process details provided'}
            >
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Setup & Breakdown Details
                  </label>
                  <textarea
                     placeholder="Describe your setup and breakdown process, timing, requirements..."
                     value={services.setupBreakdownProcess}
                     onChange={(e) => updateServices('setupBreakdownProcess', e.target.value)}
                     disabled={!editingSections.setupBreakdownProcess}
                     rows="4"
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:opacity-50 resize-none"
                  />
               </div>
            </SectionCard>

            {/* Delivery Logistics */}
            <SectionCard
               title="Delivery Logistics"
               priority="low"
               sectionName="deliveryLogistics"
               onSave={() => saveSection('deliveryLogistics', services.deliveryLogistics)}
               saving={saving}
               errors={errors}
               expandedSections={expandedSections}
               editingSections={editingSections}
               toggleSection={toggleSection}
               toggleEditing={toggleEditing}
               showEditInCollapsed={true}
               summary={services.deliveryLogistics ? (services.deliveryLogistics.length > 100 ? services.deliveryLogistics.substring(0, 100) + '...' : services.deliveryLogistics) : 'No delivery logistics provided'}
            >
               <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                     Delivery & Transportation Details
                  </label>
                  <textarea
                     placeholder="Describe delivery areas, timing, transportation methods, fees..."
                     value={services.deliveryLogistics}
                     onChange={(e) => updateServices('deliveryLogistics', e.target.value)}
                     disabled={!editingSections.deliveryLogistics}
                     rows="4"
                     className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:opacity-50 resize-none"
                  />
               </div>
            </SectionCard>


            {/* Staff Provided */}
            <SectionCard
               title="Staff Provided"
               priority="medium"
               sectionName="staffProvided"
               onSave={() => saveSection('staffProvided', services.staffProvided)}
               saving={saving}
               errors={errors}
               expandedSections={expandedSections}
               editingSections={editingSections}
               toggleSection={toggleSection}
               toggleEditing={toggleEditing}
               showEditInCollapsed={true}
               summary={`${services.staffProvided.ratio.staffCount} staff per ${services.staffProvided.ratio.guestCount} guests - ₹${services.staffProvided.cost} ${services.staffProvided.costType.replace('_', ' ')}`}
            >
               <div className="space-y-4">
                  <div>
                     <h4 className="font-medium text-gray-900 mb-3">Staff to Guest Ratio</h4>
                     <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Staff Count</label>
                           <input
                              type="number"
                              inputMode="numeric"
                              min="1"
                              value={services.staffProvided.ratio.staffCount}
                              onChange={(e) => updateServices('staffProvided.ratio.staffCount', Number(e.target.value) || 1)}
                              disabled={!editingSections.staffProvided}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:opacity-50
                              [&::-webkit-inner-spin-button]:appearance-none
                                           [&::-webkit-outer-spin-button]:appearance-none
                                           [appearance:textfield]
                                           "
                           />
                        </div>
                        <div>
                           <label className="block text-sm font-medium text-gray-700 mb-1">Guest Count</label>
                           <input
                              type="number"
                              inputMode="numeric"
                              min="1"
                              value={services.staffProvided.ratio.guestCount}
                              onChange={(e) => updateServices('staffProvided.ratio.guestCount', Number(e.target.value) || 10)}
                              disabled={!editingSections.staffProvided}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:opacity-50
                              [&::-webkit-inner-spin-button]:appearance-none
                                           [&::-webkit-outer-spin-button]:appearance-none
                                           [appearance:textfield]
                                           "
                           />
                        </div>
                     </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Staff Cost</label>
                        <div className="relative">
                           <span className="absolute left-3 top-2 text-gray-500">₹</span>
                           <input
                              type="number"
                              min="0"
                              inputMode="numeric"
                              value={services.staffProvided.cost}
                              onChange={(e) => updateServices('staffProvided.cost', Number(e.target.value) || 0)}
                              disabled={!editingSections.staffProvided}
                              className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:opacity-50
                              [&::-webkit-inner-spin-button]:appearance-none
                                           [&::-webkit-outer-spin-button]:appearance-none
                                           [appearance:textfield]
                                           "
                           />
                        </div>
                     </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Cost Type</label>
                        <select
                           value={services.staffProvided.costType}
                           onChange={(e) => updateServices('staffProvided.costType', e.target.value)}
                           disabled={!editingSections.staffProvided}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors disabled:bg-gray-100 disabled:opacity-50"
                        >
                           <option value="per_hour">Per Hour</option>
                           <option value="per_day">Per Day</option>
                           <option value="per_event">Per Event</option>
                        </select>
                     </div>
                  </div>
               </div>
            </SectionCard>
         </div>
      </div>
   );
};

export default CounterNServices;