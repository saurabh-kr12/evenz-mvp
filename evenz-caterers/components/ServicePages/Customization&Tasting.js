"use client";
import { useState, useEffect } from 'react';
import { Save, Plus, X, AlertCircle, CheckCircle2, RefreshCw, Trash2, Edit3, Check } from 'lucide-react';

const CustomizationTasting = () => {
  const [formData, setFormData] = useState({
    allowCustomization: false,
    customizationCharges: {
      hasCharges: false,
      chargeType: 'per_plate',
      amount: 0
    },
    specialMenus: '',
    dietaryFilters: {
      vegan: false,
      jain: false,
      vegetarian: false,
      glutenFree: false,
      diabeticFriendly: false,
      lowSodium: false,
      custom: [] // Changed from other.values to custom array
    },
    tastingSession: {
      allowed: false,
      description: ''
    }
  });

  const [editingSections, setEditingSections] = useState({
    customization: false,
    dietary: false,
    tasting: false
  });

  const [loading, setLoading] = useState(true);
  const [savingSection, setSavingSection] = useState('');
  const [messages, setMessages] = useState({});
  const [newCustomFilter, setNewCustomFilter] = useState('');
  const [addingCustomFilter, setAddingCustomFilter] = useState(false);

  // API configuration
  const API_BASE = 'http://localhost:5000/api/vendor/customization';
  
  const getAuthHeaders = () => {
    // For demo purposes, we'll simulate this
    const token = localStorage.getItem('token');
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  };

  // API functions
  const apiCall = async (url, options = {}) => {
    // Simulate API calls for demo - replace with actual fetch calls
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          ok: true,
          json: () => Promise.resolve({
            success: true,
            message: options.message || 'Operation successful',
            data: formData
          })
        });
      }, 800);
    });
  };

  useEffect(() => {
    fetchCustomizationData();
  }, []);

  const fetchCustomizationData = async () => {
    try {
      setLoading(true);
      clearMessages();
      
      // Actual API call - uncomment when backend is ready
      const response = await fetch(API_BASE, {
        method: 'GET',
        headers: getAuthHeaders()
      });
      const data = await response.json();
      
      // For demo purposes
      // const response = await apiCall(API_BASE, { message: 'Data fetched successfully' });
      // const data = await response.json();
      
      if (response.ok && data.success) {
        setFormData(data.data);
      } else {
        throw new Error(data.message || 'Failed to fetch customization data');
      }
    } catch (error) {
      console.error('Error fetching customization data:', error);
      setMessage('general', 'error', 'Failed to load customization preferences. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const setMessage = (section, type, text) => {
    setMessages(prev => ({
      ...prev,
      [section]: { type, text }
    }));
    // Clear message after 5 seconds
    setTimeout(() => {
      setMessages(prev => {
        const newMessages = { ...prev };
        delete newMessages[section];
        return newMessages;
      });
    }, 2000);
  };

  const clearMessages = () => {
    setMessages({});
  };

  const toggleEdit = (section) => {
    setEditingSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
    // Clear section message when editing
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[section];
      return newMessages;
    });
  };

  const saveSection = async (section) => {
    try {
      setSavingSection(section);
      setMessage(section, '', '');

      let sectionData = {};
      let endpoint = `${API_BASE}/${section}`;
      
      switch (section) {
        case 'customization':
          sectionData = {
            allowCustomization: formData.allowCustomization,
            customizationCharges: formData.customizationCharges,
            specialMenus: formData.specialMenus
          };
          break;
        case 'dietary':
          sectionData = {
            dietaryFilters: formData.dietaryFilters
          };
          break;
        case 'tasting':
          sectionData = {
            tastingSession: formData.tastingSession
          };
          break;
      }

      // Actual API call - uncomment when backend is ready
      const response = await fetch(endpoint, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(sectionData)
      });
      const data = await response.json();

      // For demo purposes
      // const response = await apiCall(endpoint, { 
      //   message: `${section.charAt(0).toUpperCase() + section.slice(1)} preferences updated successfully` 
      // });
      // const data = await response.json();
      
      if (response.ok && data.success) {
        setMessage(section, 'success', data.message);
        setFormData(data.data);
        setEditingSections(prev => ({
          ...prev,
          [section]: false
        }));
      } else {
        throw new Error(data.message || 'Failed to save preferences');
      }
    } catch (error) {
      console.error(`Error saving ${section} data:`, error);
      setMessage(section, 'error', error.message || `Failed to save ${section} preferences. Please try again.`);
    } finally {
      setSavingSection('');
    }
  };

  const handleToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleNestedToggle = (parent, field) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: !prev[parent][field]
      }
    }));
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedInputChange = (parent, field, value) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
  };

  const handleDietaryFilterChange = (filter) => {
    setFormData(prev => ({
      ...prev,
      dietaryFilters: {
        ...prev.dietaryFilters,
        [filter]: !prev.dietaryFilters[filter]
      }
    }));
  };

  const addCustomFilter = () => {
    if (newCustomFilter.trim() && !formData.dietaryFilters.custom.includes(newCustomFilter.trim())) {
      setFormData(prev => ({
        ...prev,
        dietaryFilters: {
          ...prev.dietaryFilters,
          custom: [...prev.dietaryFilters.custom, newCustomFilter.trim()]
        }
      }));
      setNewCustomFilter('');
      setAddingCustomFilter(false);
    }
  };

  const removeCustomFilter = (index) => {
    setFormData(prev => ({
      ...prev,
      dietaryFilters: {
        ...prev.dietaryFilters,
        custom: prev.dietaryFilters.custom.filter((_, i) => i !== index)
      }
    }));
  };

  const MessageAlert = ({ section }) => {
    const message = messages[section];
    if (!message || !message.text) return null;

    return (
      <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 text-sm ${
        message.type === 'success' 
          ? 'bg-green-50 text-green-800 border border-green-200' 
          : 'bg-red-50 text-red-800 border border-red-200'
      }`}>
        {message.type === 'success' ? (
          <CheckCircle2 className="h-4 w-4 flex-shrink-0 mt-0.5" />
        ) : (
          <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
        )}
        <span>{message.text}</span>
      </div>
    );
  };

  const SectionHeader = ({ section, title, description, onSave, onToggleEdit, isEditing, isSaving }) => (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
      <div className="flex-1">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="text-sm text-gray-600 mt-1">{description}</p>
      </div>
      <div className="flex gap-2">
        {isEditing ? (
          <>
            <button
              onClick={() => onToggleEdit()}
              className="inline-flex cursor-pointer items-center px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="h-4 w-4 mr-1" />
              Cancel
            </button>
            <button
              onClick={() => onSave()}
              disabled={isSaving}
              className="inline-flex cursor-pointer items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSaving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent mr-1"></div>
              ) : (
                <Check className="h-4 w-4 mr-1" />
              )}
              {isSaving ? 'Saving...' : 'Save'}
            </button>
          </>
        ) : (
          <button
            onClick={() => onToggleEdit()}
            className="inline-flex cursor-pointer items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Edit3 className="h-4 w-4 mr-1" />
            Edit
          </button>
        )}
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-6 bg-gray-200 rounded w-1/3"></div>
              <div className="space-y-3">
                <div className="h-4 bg-gray-200 rounded"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50  text-gray-700">
      <div className="max-w-5xl mx-auto space-y-4 sm:space-y-6">
        {/* Header */}
        <div className="bg-indigo-600 text-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex justify-between gap-3">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold ">Customization & Tasting</h1>
              <p className=" mt-1 text-sm sm:text-base">Manage your menu preferences</p>
            </div>
          </div>
          <MessageAlert section="general" />
        </div>

        {/* Customization Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <SectionHeader
            section="customization"
            title="Menu Customization"
            description="Configure menu customization options and charges"
            onSave={() => saveSection('customization')}
            onToggleEdit={() => toggleEdit('customization')}
            isEditing={editingSections.customization}
            isSaving={savingSection === 'customization'}
          />
          
          <div className="space-y-4">
            {/* Allow Customization Toggle */}
            <div className="flex flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">Allow customization?</label>
                <p className="text-xs sm:text-sm text-gray-500">Let customers modify menu items</p>
              </div>
              <button
                onClick={() => handleToggle('allowCustomization')}
                disabled={!editingSections.customization}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.allowCustomization ? 'bg-blue-600' : 'bg-gray-200'
                } ${!editingSections.customization ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.allowCustomization ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Customization Charges */}
            {formData.allowCustomization && (
              <div className="ml-0 sm:ml-4 space-y-4 border-l-0 sm:border-l-2 border-gray-100 pl-0 sm:pl-4">
                <div className="flex flex-row sm:items-center sm:justify-between gap-3">
                  <div className="flex-1">
                    <label className="text-sm font-medium text-gray-900">Charge for customization?</label>
                    <p className="text-xs sm:text-sm text-gray-500">Add charges for modifications</p>
                  </div>
                  <button
                    onClick={() => handleNestedToggle('customizationCharges', 'hasCharges')}
                    disabled={!editingSections.customization}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      formData.customizationCharges.hasCharges ? 'bg-blue-600' : 'bg-gray-200'
                    } ${!editingSections.customization ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      formData.customizationCharges.hasCharges ? 'translate-x-6' : 'translate-x-1'
                    }`} />
                  </button>
                </div>

                {formData.customizationCharges.hasCharges && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Charge Type</label>
                      <div className="flex flex-row gap-3">
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="chargeType"
                            value="per_plate"
                            checked={formData.customizationCharges.chargeType === 'per_plate'}
                            onChange={(e) => handleNestedInputChange('customizationCharges', 'chargeType', e.target.value)}
                            disabled={!editingSections.customization}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2 text-sm text-gray-700">Per Plate</span>
                        </label>
                        <label className="flex items-center">
                          <input
                            type="radio"
                            name="chargeType"
                            value="fixed"
                            checked={formData.customizationCharges.chargeType === 'fixed'}
                            onChange={(e) => handleNestedInputChange('customizationCharges', 'chargeType', e.target.value)}
                            disabled={!editingSections.customization}
                            className="h-4 w-4 text-blue-600"
                          />
                          <span className="ml-2 text-sm text-gray-700">Fixed Charge</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-900 mb-2">Amount (₹)</label>
                      <input
                        type="number"
                        min="0"
                        step="1"
                        value={formData.customizationCharges.amount}
                        onChange={(e) => handleNestedInputChange('customizationCharges', 'amount', parseFloat(e.target.value) || 0)}
                        disabled={!editingSections.customization}
                        className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed"
                        placeholder="Enter amount"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Special Menus */}
            <div>
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Special Menus (Child/Elder)
              </label>
              <textarea
                value={formData.specialMenus}
                onChange={(e) => handleInputChange('specialMenus', e.target.value)}
                disabled={!editingSections.customization}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                placeholder="Describe special menu options for children, elderly, or other groups..."
              />
            </div>
          </div>
          <MessageAlert section="customization" />
        </div>

        {/* Dietary Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <SectionHeader
            section="dietary"
            title="Dietary Filters"
            description="Configure available dietary filter options"
            onSave={() => saveSection('dietary')}
            onToggleEdit={() => toggleEdit('dietary')}
            isEditing={editingSections.dietary}
            isSaving={savingSection === 'dietary'}
          />

          <div className="space-y-4">
            {/* Predefined Filters */}
            <div className="grid grid-cols-2 gap-3">
              {[
                { key: 'vegan', label: 'Vegan' },
                { key: 'jain', label: 'Jain' },
                { key: 'vegetarian', label: 'Vegetarian' },
                { key: 'glutenFree', label: 'Gluten Free' },
                { key: 'diabeticFriendly', label: 'Diabetic Friendly' },
                { key: 'lowSodium', label: 'Low Sodium' }
              ].map(filter => (
                <label key={filter.key} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.dietaryFilters[filter.key]}
                    onChange={() => handleDietaryFilterChange(filter.key)}
                    disabled={!editingSections.dietary}
                    className="h-4 w-4 text-blue-600 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                  />
                  <span className="ml-2 text-sm text-gray-700">{filter.label}</span>
                </label>
              ))}
            </div>

            {/* Custom Filters */}
            <div className="border-t pt-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
                <label className="text-sm font-medium text-gray-700">Custom Dietary Filters</label>
                {editingSections.dietary && (
                  <button
                    onClick={() => setAddingCustomFilter(!addingCustomFilter)}
                    className="inline-flex items-center px-3 py-1.5 text-sm bg-blue-100 text-blue-800 rounded-lg hover:bg-blue-200 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    Add Custom
                  </button>
                )}
              </div>

              {addingCustomFilter && editingSections.dietary && (
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newCustomFilter}
                    onChange={(e) => setNewCustomFilter(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && addCustomFilter()}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                    placeholder="Enter custom dietary filter..."
                  />
                  <button
                    onClick={addCustomFilter}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                </div>
              )}

              {formData.dietaryFilters.custom.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {formData.dietaryFilters.custom.map((value, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                    >
                      {value}
                      {editingSections.dietary && (
                        <button
                          onClick={() => removeCustomFilter(index)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      )}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
          <MessageAlert section="dietary" />
        </div>

        {/* Tasting Session Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <SectionHeader
            section="tasting"
            title="Tasting Sessions"
            description="Configure tasting session availability and details"
            onSave={() => saveSection('tasting')}
            onToggleEdit={() => toggleEdit('tasting')}
            isEditing={editingSections.tasting}
            isSaving={savingSection === 'tasting'}
          />
          
          <div className="space-y-4">
            {/* Allow Tasting Toggle */}
            <div className="flex flex-row sm:items-center sm:justify-between gap-3">
              <div className="flex-1">
                <label className="text-sm font-medium text-gray-900">Allow tasting sessions?</label>
                <p className="text-xs sm:text-sm text-gray-500">Offer customers food tasting before ordering</p>
              </div>
              <button
                onClick={() => handleNestedToggle('tastingSession', 'allowed')}
                disabled={!editingSections.tasting}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  formData.tastingSession.allowed ? 'bg-blue-600' : 'bg-gray-200'
                } ${!editingSections.tasting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  formData.tastingSession.allowed ? 'translate-x-6' : 'translate-x-1'
                }`} />
              </button>
            </div>

            {/* Tasting Description */}
            {formData.tastingSession.allowed && (
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Tasting Session Details
                </label>
                <textarea
                  value={formData.tastingSession.description}
                  onChange={(e) => handleNestedInputChange('tastingSession', 'description', e.target.value)}
                  disabled={!editingSections.tasting}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                  placeholder="Describe your tasting process, timing, costs, and conditions..."
                />
              </div>
            )}
          </div>
          <MessageAlert section="tasting" />
        </div>
      </div>
    </div>
  );
};

export default CustomizationTasting;