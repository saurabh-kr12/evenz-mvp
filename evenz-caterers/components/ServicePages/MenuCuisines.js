"use client";
import React, { useState, useEffect, useCallback } from 'react';
import SectionHeaderWithTooltip from '../SectionHeaderWithTooltip';
import { ChevronDown, ChevronUp, Plus, Edit, Trash2, Save, X, Check, AlertTriangle } from 'lucide-react';
import useAnalytics from '@/hooks/useAnalytics';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/context/AuthContext'; // Import the axios instance

// Confirmation Dialog Component
const ConfirmationDialog = ({ isOpen, onClose, onConfirm, title, message, confirmText, cancelText, type }) => {
   if (!isOpen) return null;

   return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
         <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="p-6">
               <div className="flex items-center mb-4">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${type === 'danger' ? 'bg-red-100' : 'bg-yellow-100'
                     }`}>
                     <AlertTriangle className={`w-5 h-5 ${type === 'danger' ? 'text-red-600' : 'text-yellow-600'
                        }`} />
                  </div>
                  <div className="ml-3">
                     <h3 className="text-lg font-medium text-gray-900">{title}</h3>
                  </div>
               </div>
               <div className="mb-6">
                  <p className="text-sm text-gray-500">{message}</p>
               </div>
               <div className="flex flex-col sm:flex-row gap-3 sm:gap-3 sm:justify-end">
                  <button
                     onClick={onClose}
                     className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                     {cancelText || 'Cancel'}
                  </button>
                  <button
                     onClick={onConfirm}
                     className={`px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 ${type === 'danger'
                        ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500'
                        : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500'
                        }`}
                  >
                     {confirmText || 'Confirm'}
                  </button>
               </div>
            </div>
         </div>
      </div>
   );
};

const MenuCuisinesModule = () => {
   // State Management
   const [selectedCuisines, setSelectedCuisines] = useState([]);
   const [otherCuisine, setOtherCuisine] = useState('');
   const [showOtherInput, setShowOtherInput] = useState(false);
   const [savedCuisines, setSavedCuisines] = useState([]);
   const [packages, setPackages] = useState({});
   const [expandedPackages, setExpandedPackages] = useState({});
   const [editingPackage, setEditingPackage] = useState(null);
   const [editingItem, setEditingItem] = useState(null);
   const [isLoading, setIsLoading] = useState(true);
   const [error, setError] = useState('');
   const [showCuisineForm, setShowCuisineForm] = useState(false);
   const { accessToken, loading: authLoading, currentUser } = useAuth();

   // Analytics
   const { services, ui } = useAnalytics();

   // Confirmation dialog state
   const [confirmDialog, setConfirmDialog] = useState({
      isOpen: false,
      title: '',
      message: '',
      onConfirm: null,
      type: 'danger'
   });

   // Predefined cuisine options
   const cuisineOptions = [
      'North Indian',
      'South Indian',
      'Chinese',
      'Continental',
      'Mughlai',
      'Italian',
      'Mexican',
      'Thai',
      'Japanese'
   ];

   // Package form structure
   const initialPackageForm = {
      name: '',
      type: 'veg',
      description: '',
      pricePerPlate: '',
      itemCounts: {
         starters: 0,
         mains: 0,
         breads: 0,
         beverages: 0,
         desserts: 0
      },
      menuItems: []
   };

   // Menu item form structure
   const initialItemForm = {
      type: 'starter',
      vegNonVeg: 'veg',
      name: '',
      extraPrice: ''
   };

   const [packageForm, setPackageForm] = useState(initialPackageForm);
   const [itemForm, setItemForm] = useState(initialItemForm);
   const [showPackageForm, setShowPackageForm] = useState({});
   const [showItemForm, setShowItemForm] = useState({});

   // Confirmation dialog helpers
   const showConfirmation = ({ title, message, onConfirm, type = 'danger' }) => {
      setConfirmDialog({
         isOpen: true,
         title,
         message,
         onConfirm,
         type
      });
   };

   const closeConfirmation = () => {
      setConfirmDialog({
         isOpen: false,
         title: '',
         message: '',
         onConfirm: null,
         type: 'danger'
      });
   };

   const handleConfirm = () => {
      if (confirmDialog.onConfirm) {
         confirmDialog.onConfirm();
      }
      closeConfirmation();
   };

   const loadExistingData = useCallback(async () => {
      setIsLoading(true);
      setError('');
      try {
         const response = await api.get('/vendor/menu');
         if (response.data.success) {
            const menuData = response.data.data;
            setSavedCuisines(menuData.cuisines || []);
            setSelectedCuisines(menuData.cuisines || []);
            setPackages(menuData.packages || {});
         }
      } catch (err) {
         console.error('Failed to load menu data:', err);
         setError(err.message || 'Failed to load menu data');
      } finally {
         setIsLoading(false);
      }
   }, []);

   // Load existing data on component mount
   useEffect(() => {
      if (!authLoading && accessToken) {
         loadExistingData();
         services.tabViewed('menu_cuisines');
      }
      // services.tabViewed('menu_cuisines');
   }, [accessToken, authLoading, loadExistingData]);



   // Get all available cuisines (predefined + custom)
   const getAllCuisines = () => {
      const allCuisines = [...cuisineOptions];
      savedCuisines.forEach(cuisine => {
         if (!cuisineOptions.includes(cuisine)) {
            allCuisines.push(cuisine);
         }
      });
      return allCuisines;
   };

   // Cuisine selection handlers
   const handleCuisineChange = (cuisine) => {
      // Track cuisine selection
      const isSelecting = !selectedCuisines.includes(cuisine);
      if (isSelecting && cuisine !== 'Other') {
         services.cuisineSelected(cuisine, 'menu_cuisines');
      }

      if (cuisine === 'Other') {
         setShowOtherInput(!showOtherInput);
         if (!showOtherInput) {
            setSelectedCuisines([...selectedCuisines, cuisine]);
         } else {
            setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
            setOtherCuisine('');
         }
      } else {
         if (selectedCuisines.includes(cuisine)) {
            setSelectedCuisines(selectedCuisines.filter(c => c !== cuisine));
         } else {
            setSelectedCuisines([...selectedCuisines, cuisine]);
         }
      }
   };

   const saveCuisines = async () => {
      setIsLoading(true);
      setError('');
      try {
         let cuisinesToSave = selectedCuisines.filter(c => c !== 'Other');
         if (showOtherInput && otherCuisine.trim()) {
            cuisinesToSave.push(otherCuisine.trim());
         }

         const response = await api.post('/vendor/menu/cuisines', { cuisines: cuisinesToSave });

         if (response.data.success) {
            const menuData = response.data.data;
            setSavedCuisines(menuData.cuisines);
            setSelectedCuisines(menuData.cuisines);
            setPackages(menuData.packages);
            setShowOtherInput(false);
            setOtherCuisine('');
            setShowCuisineForm(false);
            services.sectionCompleted('menu_cuisines', 'cuisines', cuisinesToSave.length);
         }
      } catch (err) {
         console.error('Failed to save cuisines:', err);
         setError(err.message || 'Failed to save cuisines');
      } finally {
         setIsLoading(false);
      }
   };


   // Package handlers
   const handlePackageFormChange = (field, value) => {
      if (field.startsWith('itemCounts.')) {
         const countField = field.split('.')[1];
         setPackageForm(prev => ({
            ...prev,
            itemCounts: {
               ...prev.itemCounts,
               [countField]: parseInt(value) || 0
            }
         }));
      } else {
         setPackageForm(prev => ({ ...prev, [field]: value }));
      }
   };

   const savePackage = async (cuisine) => {
      setIsLoading(true);
      setError('');
      try {
         const packageData = { ...packageForm, cuisine };
         let response;
         if (editingPackage) {
            response = await api.put(`/vendor/menu/packages/${editingPackage._id}`, packageData);
         } else {
            response = await api.post('/vendor/menu/packages', packageData);
         }

         if (response.data.success) {
            await loadExistingData();
            setPackageForm(initialPackageForm);
            setShowPackageForm(prev => ({ ...prev, [cuisine]: false }));
            setEditingPackage(null);
         }
      } catch (err) {
         console.error('Failed to save package:', err);
         setError(err.message || 'Failed to save package');
      } finally {
         setIsLoading(false);
      }
   };

   const editPackage = (cuisine, packageData) => {
      setPackageForm(packageData);
      setEditingPackage(packageData);
      setShowPackageForm(prev => ({ ...prev, [cuisine]: true }));
   };

   const deletePackage = async (cuisine, packageData) => {
      setIsLoading(true);
      setError('');
      try {
         const response = await api.delete(`/vendor/menu/packages/${packageData._id}?cuisine=${encodeURIComponent(cuisine)}`);
         if (response.data.success) {
            await loadExistingData();
         }
      } catch (err) {
         console.error('Failed to delete package:', err);
         setError(err.response?.data?.message || 'Failed to delete package');
      } finally {
         setIsLoading(false);
      }
   };

   const confirmDeletePackage = (cuisine, packageData) => {
      showConfirmation({
         title: 'Delete Package',
         message: `Are you sure you want to delete the package "${packageData.name}"? This action cannot be undone and will also delete all menu items in this package.`,
         onConfirm: () => deletePackage(cuisine, packageData),
         type: 'danger'
      });
   };

   // Menu item handlers
   const handleItemFormChange = (field, value) => {
      setItemForm(prev => ({ ...prev, [field]: value }));
   };

   const saveMenuItem = async (cuisine, packageData) => {
      setIsLoading(true);
      setError('');
      try {
         const itemData = { ...itemForm, cuisine, packageId: packageData._id };
         let response;
         if (editingItem) {
            response = await api.put(`/vendor/menu/items/${editingItem._id}`, itemData);
         } else {
            response = await api.post('/vendor/menu/items', itemData);
         }

         if (response.data.success) {
            await loadExistingData();
            setItemForm(initialItemForm);
            setShowItemForm(prev => ({ ...prev, [`${cuisine}-${packageData._id}`]: false }));
            setEditingItem(null);
         }
      } catch (err) {
         console.error('Failed to save menu item:', err);
         setError(err.message || 'Failed to save menu item');
      } finally {
         setIsLoading(false);
      }
   };

   const editMenuItem = (cuisine, packageData, item) => {
      setItemForm(item);
      setEditingItem(item);
      setShowItemForm(prev => ({ ...prev, [`${cuisine}-${packageData._id}`]: true }));
   };

   const deleteMenuItem = async (cuisine, packageData, item) => {
      setIsLoading(true);
      setError('');
      try {
         const response = await api.delete(`/vendor/menu/items/${item._id}?cuisine=${encodeURIComponent(cuisine)}&packageId=${packageData._id}`);
         if (response.data.success) {
            await loadExistingData();
         }
      } catch (err) {
         console.error('Failed to delete menu item:', err);
         setError(err.message || 'Failed to delete menu item');
      } finally {
         setIsLoading(false);
      }
   };

   const confirmDeleteMenuItem = (cuisine, packageData, item) => {
      showConfirmation({
         title: 'Delete Menu Item',
         message: `Are you sure you want to delete the menu item "${item.name}"? This action cannot be undone.`,
         onConfirm: () => deleteMenuItem(cuisine, packageData, item),
         type: 'danger'
      });
   };

   const togglePackageExpansion = (cuisine, packageData) => {
      const key = `${cuisine}-${packageData._id}`;
      setExpandedPackages(prev => ({
         ...prev,
         [key]: !prev[key]
      }));
   };

   return (
      <div className="w-full max-w-none sm:max-w-6xl mx-auto p-3 sm:p-6 bg-white shadow-lg rounded-lg text-gray-700">
         <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 text-gray-800 flex ">
            <span>Menu & Cuisines Management</span>
            <SectionHeaderWithTooltip priority="high" />
         </h2>
         {/* Confirmation Dialog */}
         <ConfirmationDialog
            isOpen={confirmDialog.isOpen}
            onClose={closeConfirmation}
            onConfirm={handleConfirm}
            title={confirmDialog.title}
            message={confirmDialog.message}
            confirmText="Delete"
            cancelText="Cancel"
            type={confirmDialog.type}
         />

         {error && (
            <div className="mb-4 p-3 sm:p-4 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
               {error}
            </div>
         )}

         {isLoading && (
            <div className="mb-4 p-3 sm:p-4 bg-blue-100 border border-blue-400 text-blue-700 rounded text-sm">
               Loading...
            </div>
         )}

         {/* Your Saved Cuisines Section */}
         <div className="mb-6 sm:mb-8 border border-gray-300 rounded-lg p-3 sm:p-4">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
               <h3 className="text-lg sm:text-xl font-semibold text-gray-700">Your Saved Cuisines</h3>
               <button
                  onClick={() => {
                     setShowCuisineForm(!showCuisineForm)
                     ui.buttonClicked('add_cuisines', 'menu_cuisines');
                  }}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 flex items-center cursor-pointer text-sm sm:text-base self-start sm:self-auto"
               >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Your Cuisines
               </button>
            </div>

            {savedCuisines.length > 0 ? (
               <div className="flex flex-wrap gap-2">
                  {savedCuisines.map(cuisine => (
                     <span
                        key={cuisine}
                        className="bg-green-100 text-green-800 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm"
                     >
                        {cuisine}
                     </span>
                  ))}
               </div>
            ) : (
               <p className="text-gray-500 text-sm">No cuisines added yet. Click "Add Your Cuisines" to get started.</p>
            )}

            {/* Expandable Cuisine Selection Form */}
            {showCuisineForm && (
               <div className="mt-4 p-3 sm:p-4 bg-gray-50 rounded-lg">
                  <h4 className="text-base sm:text-lg font-semibold mb-3 text-gray-700">Select Your Cuisines</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                     {getAllCuisines().map(cuisine => (
                        <label key={cuisine} className="flex items-center cursor-pointer">
                           <input
                              type="checkbox"
                              checked={selectedCuisines.includes(cuisine)}
                              onChange={() => handleCuisineChange(cuisine)}
                              className="mr-2 h-4 w-4 text-blue-600 cursor-pointer"
                           />
                           <span className="text-gray-700 text-sm sm:text-base">{cuisine}</span>
                        </label>
                     ))}
                     <label className="flex items-center cursor-pointer">
                        <input
                           type="checkbox"
                           checked={selectedCuisines.includes('Other')}
                           onChange={() => handleCuisineChange('Other')}
                           className="mr-2 h-4 w-4 text-blue-600 cursor-pointer"
                        />
                        <span className="text-gray-700 text-sm sm:text-base">Other</span>
                     </label>
                  </div>

                  {showOtherInput && (
                     <div className="mb-4">
                        <input
                           type="text"
                           value={otherCuisine}
                           onChange={(e) => setOtherCuisine(e.target.value)}
                           placeholder="Enter custom cuisine"
                           className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                        />
                     </div>
                  )}

                  <div className="flex flex-col sm:flex-row gap-2">
                     <button
                        onClick={saveCuisines}
                        disabled={isLoading}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 disabled:opacity-50 flex items-center cursor-pointer text-sm sm:text-base"
                     >
                        <Save className="w-4 h-4 mr-2" />
                        Save Cuisines
                     </button>
                     <button
                        onClick={() => {
                           setShowCuisineForm(false);
                           setSelectedCuisines([...savedCuisines]);
                           setShowOtherInput(false);
                           setOtherCuisine('');
                        }}
                        className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center cursor-pointer text-sm sm:text-base"
                     >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                     </button>
                  </div>
               </div>
            )}
         </div>

         {/* Packages Section */}
         {savedCuisines.length > 0 && (
            <div>
               <h3 className="text-lg sm:text-xl font-semibold mb-4 sm:mb-6 text-gray-700 flex">
                  <span>
                     Manage Packages by Cuisine
                  </span>
                  <SectionHeaderWithTooltip priority="high" />

               </h3>

               {savedCuisines.map(cuisine => (
                  <div key={cuisine} className="mb-6 sm:mb-8 border border-gray-200 rounded-lg p-3 sm:p-4">
                     <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 gap-3">
                        <h4 className="text-base sm:text-lg font-semibold text-gray-800">{cuisine}</h4>
                        <button
                           onClick={() => {
                              setShowPackageForm(prev => ({ ...prev, [cuisine]: !prev[cuisine] }))
                              ui.buttonClicked('add_package', `menu_cuisines_${cuisine}`);
                           }}
                           className="bg-green-600 text-white px-3 sm:px-4 py-2 rounded hover:bg-green-700 flex items-center cursor-pointer text-sm sm:text-base self-start sm:self-auto"
                        >
                           <Plus className="w-4 h-4 mr-2" />
                           Add Package
                        </button>
                     </div>

                     {/* Package Form */}
                     {showPackageForm[cuisine] && (
                        <div className="mb-6 p-3 sm:p-4 bg-gray-50 rounded-lg">
                           <h5 className="font-semibold mb-3 text-sm sm:text-base">
                              {editingPackage ? 'Edit Package' : 'Add New Package'}
                           </h5>
                           <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                              <input
                                 type="text"
                                 placeholder="Package Name"
                                 value={packageForm.name}
                                 onChange={(e) => handlePackageFormChange('name', e.target.value)}
                                 className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                              />
                              <select
                                 value={packageForm.type}
                                 onChange={(e) => handlePackageFormChange('type', e.target.value)}
                                 className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm sm:text-base"
                              >
                                 <option value="veg">Vegetarian</option>
                                 <option value="non-veg">Non-Vegetarian</option>
                                 <option value="both">Both</option>
                              </select>
                              <input
                                 type="number"
                                 inputMode="numeric"
                                 placeholder="Price per Plate"
                                 value={packageForm.pricePerPlate}
                                 onChange={(e) => handlePackageFormChange('pricePerPlate', e.target.value)}
                                 className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm sm:text-base sm:col-span-2 
                                           [&::-webkit-inner-spin-button]:appearance-none
                                           [&::-webkit-outer-spin-button]:appearance-none
                                           [appearance:textfield]
                                           "
                              />
                           </div>
                           <textarea
                              placeholder="Package Description"
                              value={packageForm.description}
                              onChange={(e) => handlePackageFormChange('description', e.target.value)}
                              className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 mb-4 text-sm sm:text-base"
                              rows="3"
                           />

                           {/* Item Counts */}
                           <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4 mb-4">
                              {Object.keys(packageForm.itemCounts).map(category => (
                                 <div key={category}>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 capitalize">
                                       {category}
                                    </label>
                                    <input
                                       type="number"
                                       inputMode="numeric"
                                       min="0"
                                       value={packageForm.itemCounts[category]}
                                       onChange={(e) => handlePackageFormChange(`itemCounts.${category}`, e.target.value)}
                                       className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm
                                       [&::-webkit-inner-spin-button]:appearance-none
                                           [&::-webkit-outer-spin-button]:appearance-none
                                           [appearance:textfield]
                                           "

                                    />
                                 </div>
                              ))}
                           </div>

                           <div className="flex flex-col sm:flex-row gap-2">
                              <button
                                 onClick={() => savePackage(cuisine)}
                                 disabled={isLoading}
                                 className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 disabled:opacity-50 flex items-center cursor-pointer text-sm sm:text-base"
                              >
                                 <Check className="w-4 h-4 mr-2" />
                                 {editingPackage ? 'Update' : 'Save'} Package
                              </button>
                              <button
                                 onClick={() => {
                                    setShowPackageForm(prev => ({ ...prev, [cuisine]: false }));
                                    setPackageForm(initialPackageForm);
                                    setEditingPackage(null);
                                 }}
                                 className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center cursor-pointer text-sm sm:text-base"
                              >
                                 <X className="w-4 h-4 mr-2" />
                                 Cancel
                              </button>
                           </div>
                        </div>
                     )}

                     {/* Existing Packages */}
                     {packages[cuisine] && packages[cuisine].map(pkg => (
                        <div key={pkg._id} className="mb-4 border border-gray-200 rounded-lg">
                           <div className="p-3 sm:p-4 bg-gray-50">
                              <div className="flex flex-col sm:flex-row sm:justify-between gap-3">
                                 <div className="flex-1">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4">
                                       <h5 className="font-semibold text-gray-800 text-sm sm:text-base">{pkg.name}</h5>
                                       <span className={`px-2 py-1 rounded-full text-xs w-fit ${pkg.type === 'veg' ? 'bg-green-100 text-green-800' :
                                          pkg.type === 'non-veg' ? 'bg-red-100 text-red-800' :
                                             'bg-yellow-100 text-yellow-800'
                                          }`}>
                                          {pkg.type === 'veg' ? 'Vegetarian' :
                                             pkg.type === 'non-veg' ? 'Non-Vegetarian' : 'Both'}
                                       </span>
                                       <span className="text-base sm:text-lg font-bold text-blue-600">₹{pkg.pricePerPlate}/plate</span>
                                    </div>

                                    {/* Item Counts Summary */}
                                    <div className="mt-2 flex flex-wrap gap-2 text-xs sm:text-sm">
                                       {Object.entries(pkg.itemCounts || {}).map(([category, count]) => (
                                          count > 0 && (
                                             <span key={category} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                                                {count} {category}
                                             </span>
                                          )
                                       ))}
                                    </div>
                                 </div>
                                 <div className="flex items-center gap-2 sm:gap-3 self-start sm:self-center">
                                    <button
                                       onClick={() => {
                                          setShowItemForm(prev => ({ ...prev, [`${cuisine}-${pkg._id}`]: !prev[`${cuisine}-${pkg._id}`] }))
                                          ui.buttonClicked('add_menu_item', `menu_cuisines_${cuisine}_${pkg.name}`);
                                       }}
                                       className="bg-purple-600 text-white px-3 py-1 rounded hover:bg-purple-700 flex items-center cursor-pointer text-xs sm:text-sm"
                                    >
                                       <Plus className="w-3 h-3 mr-1" />
                                       Add Item
                                    </button>
                                    <button
                                       onClick={() => editPackage(cuisine, pkg)}
                                       className="text-blue-600 hover:text-blue-800 cursor-pointer"
                                    >
                                       <Edit className="w-4 h-4" />
                                    </button>
                                    <button
                                       onClick={() => confirmDeletePackage(cuisine, pkg)}
                                       className="text-red-600 hover:text-red-800 cursor-pointer"
                                    >
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                    <button
                                       onClick={() => togglePackageExpansion(cuisine, pkg)}
                                       className="text-gray-600 hover:text-gray-800 cursor-pointer"
                                    >
                                       {expandedPackages[`${cuisine}-${pkg._id}`] ?
                                          <ChevronUp className="w-4 h-4" /> :
                                          <ChevronDown className="w-4 h-4" />
                                       }
                                    </button>
                                 </div>
                              </div>
                           </div>

                           {/* Menu Item Form */}
                           {showItemForm[`${cuisine}-${pkg._id}`] && (
                              <div className="p-3 sm:p-4 bg-blue-50 border-t">
                                 <h6 className="font-semibold mb-3 text-sm sm:text-base">
                                    {editingItem ? 'Edit Menu Item' : 'Add Menu Item'}
                                 </h6>
                                 <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-4">
                                    <select
                                       value={itemForm.type}
                                       onChange={(e) => handleItemFormChange('type', e.target.value)}
                                       className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm sm:text-base"
                                    >
                                       <option value="starter">Starter</option>
                                       <option value="main">Main Course</option>
                                       <option value="bread">Bread</option>
                                       <option value="beverage">Beverage</option>
                                       <option value="dessert">Dessert</option>
                                    </select>
                                    <select
                                       value={itemForm.vegNonVeg}
                                       onChange={(e) => handleItemFormChange('vegNonVeg', e.target.value)}
                                       className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 cursor-pointer text-sm sm:text-base"
                                    >
                                       <option value="veg">Vegetarian</option>
                                       <option value="non-veg">Non-Vegetarian</option>
                                    </select>
                                    <input
                                       type="text"
                                       placeholder="Item Name"
                                       value={itemForm.name}
                                       onChange={(e) => handleItemFormChange('name', e.target.value)}
                                       className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm sm:text-base"
                                    />
                                    <input
                                       type="number"
                                       inputMode="numeric"
                                       placeholder="Extra Price (optional)"
                                       value={itemForm.extraPrice}
                                       onChange={(e) => handleItemFormChange('extraPrice', e.target.value)}
                                       className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 text-sm sm:text-base
                                       [&::-webkit-inner-spin-button]:appearance-none
                                           [&::-webkit-outer-spin-button]:appearance-none
                                           [appearance:textfield]
                                           "
                                    />
                                 </div>

                                 <div className="flex flex-col sm:flex-row gap-2">
                                    <button
                                       onClick={() => saveMenuItem(cuisine, pkg)}
                                       disabled={isLoading}
                                       className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 disabled:opacity-50 flex items-center cursor-pointer text-sm sm:text-base"
                                    >
                                       <Check className="w-4 h-4 mr-2" />
                                       {editingItem ? 'Update' : 'Save'} Item
                                    </button>
                                    <button
                                       onClick={() => {
                                          setShowItemForm(prev => ({ ...prev, [`${cuisine}-${pkg._id}`]: false }));
                                          setItemForm(initialItemForm);
                                          setEditingItem(null);
                                       }}
                                       className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 flex items-center cursor-pointer text-sm sm:text-base"
                                    >
                                       <X className="w-4 h-4 mr-2" />
                                       Cancel
                                    </button>
                                 </div>
                              </div>
                           )}

                           {/* Menu Items Display */}
                           {expandedPackages[`${cuisine}-${pkg._id}`] && (
                              <div className="p-3 sm:p-4 border-t">
                                 {/* Menu Items List */}
                                 {pkg.menuItems && pkg.menuItems.length > 0 ? (
                                    <div>
                                       <h6 className="font-semibold mb-2 text-sm sm:text-base">Menu Items:</h6>
                                       <div className="space-y-2">
                                          {pkg.menuItems.map(item => (
                                             <div key={item._id} className="flex flex-row justify-between items-center p-3 bg-white rounded border gap-2 sm:gap-3 min-h-[60px]">
                                                <div className="flex flex-row items-center gap-2 sm:gap-3 flex-1 min-w-0">
                                                   <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap flex-shrink-0 ${item.vegNonVeg === 'veg' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                                                      }`}>
                                                      {item.vegNonVeg === 'veg' ? 'Veg' : 'Non-Veg'}
                                                   </span>
                                                   <span className="font-medium text-sm sm:text-base truncate flex-1 min-w-0">{item.name}</span>
                                                   <span className="text-xs sm:text-sm text-gray-600 capitalize whitespace-nowrap flex-shrink-0">({item.type})</span>
                                                   {item.extraPrice > 0 && (
                                                      <span className="text-xs sm:text-sm font-medium text-green-600 whitespace-nowrap flex-shrink-0">+₹{item.extraPrice}</span>
                                                   )}
                                                </div>

                                                <div className="flex gap-2 sm:gap-4 flex-shrink-0">
                                                   <button
                                                      onClick={() => editMenuItem(cuisine, pkg, item)}
                                                      className="text-blue-600 hover:text-blue-800 cursor-pointer p-1"
                                                   >
                                                      <Edit className="w-4 h-4" />
                                                   </button>
                                                   <button
                                                      onClick={() => confirmDeleteMenuItem(cuisine, pkg, item)}
                                                      className="text-red-600 hover:text-red-800 cursor-pointer p-1"
                                                   >
                                                      <Trash2 className="w-4 h-4" />
                                                   </button>
                                                </div>
                                             </div>
                                          ))}
                                       </div>
                                    </div>
                                 ) : (
                                    <p className="text-gray-500 text-sm">No menu items added yet. Click "Add Item" to get started.</p>
                                 )}
                              </div>
                           )}
                        </div>
                     ))}

                     {(!packages[cuisine] || packages[cuisine].length === 0) && (
                        <p className="text-gray-500 text-sm">No packages created yet. Click "Add Package" to get started.</p>
                     )}
                  </div>
               ))}
            </div>
         )}
      </div>
   );
};

export default MenuCuisinesModule;