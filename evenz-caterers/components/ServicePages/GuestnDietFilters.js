"use client";
import { useState, useEffect,useCallback } from 'react';
import { Save, Plus, X, AlertCircle, CheckCircle2, RefreshCw, Trash2, Edit3, Check, Users, XCircle, Loader } from 'lucide-react';
import SectionHeaderWithTooltip from '../SectionHeaderWithTooltip';
import useAnalytics from '@/hooks/useAnalytics';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/context/AuthContext';

const GuestnDietFilters = () => {
  const [editingSections, setEditingSections] = useState({
    customization: false,
    dietary: false,
    tasting: false
  });
  const [formData, setFormData] = useState(null); // Start as null
  const [guestLimits, setGuestLimits] = useState({ minGuests: '', maxGuests: '' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState({});
  const [errors, setErrors] = useState({});
  const [success, setSuccess] = useState({});
  const [editMode, setEditMode] = useState({});
  const [savingSection, setSavingSection] = useState('');
  const [messages, setMessages] = useState({});
  const [newCustomFilter, setNewCustomFilter] = useState('');
  const [addingCustomFilter, setAddingCustomFilter] = useState(false);

  // --- Hooks ---
  const { accessToken, loading: authLoading } = useAuth();
  const analytics = useAnalytics();

  // --- Data Fetching ---
  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch both sets of data in parallel
      const [customizationRes, legalRes] = await Promise.all([
        api.get('/vendor/customization'),
        api.get('/vendor/legal')
      ]);

      if (customizationRes.data.success) {
        setFormData(customizationRes.data.data);
      } else {
        throw new Error(customizationRes.data.message || 'Failed to fetch customization data');
      }

      if (legalRes.data.success) {
        const legalData = legalRes.data.data;
        setGuestLimits({
          minGuests: legalData.minGuests || '',
          maxGuests: legalData.maxGuests || ''
        });
      } else {
        throw new Error(legalRes.data.message || 'Failed to fetch legal data');
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setMessages(prev => ({ ...prev, general: { type: 'error', text: 'Failed to load data. Please refresh.' } }));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && accessToken) {
      fetchData();
      analytics.services.tabViewed('guest_diet_filters');
    }
  }, [accessToken, authLoading, fetchData]);

  // --- Data Saving ---
  const updateGuestLimits = async () => {
    if (guestLimits.minGuests && guestLimits.maxGuests && parseInt(guestLimits.minGuests) > parseInt(guestLimits.maxGuests)) {
      showError('guests', 'Minimum guests cannot be greater than maximum guests');
      return;
    }
    setSaving(prev => ({ ...prev, guests: true }));
    try {
      const payload = {
        minGuests: guestLimits.minGuests ? parseInt(guestLimits.minGuests) : undefined,
        maxGuests: guestLimits.maxGuests ? parseInt(guestLimits.maxGuests) : undefined
      };
      const response = await api.put('/vendor/legal', payload);
      if (response.data.success) {
        showSuccess('guests', 'Guest limits updated successfully');
        setEditMode(prev => ({ ...prev, guests: false }));
        // No need to refetch, just update local state
        setGuestLimits({
          minGuests: response.data.legal.minGuests || '',
          maxGuests: response.data.legal.maxGuests || ''
        });
      } else {
        throw new Error(response.data.message || 'Failed to update guest limits');
      }
    } catch (error) {
      showError('guests', error.response?.data?.message || 'A network error occurred.');
    } finally {
      setSaving(prev => ({ ...prev, guests: false }));
    }
  };

  const saveSection = async (section) => {
    setSavingSection(section);
    setMessage(section, '', '');
    try {
      let sectionData = {};
      switch (section) {
        case 'customization':
          sectionData = { allowCustomization: formData.allowCustomization, customizationCharges: formData.customizationCharges, specialMenus: formData.specialMenus };
          break;
        case 'dietary':
          sectionData = { dietaryFilters: formData.dietaryFilters };
          break;

        case 'tasting':
          sectionData = { tastingSession: formData.tastingSession };
          break;
        default:
          return;
      }

      const response = await api.patch(`/vendor/customization/${section}`, sectionData);

      if (response.data.success) {
        setMessage(section, 'success', response.data.message);
        setFormData(response.data.data);
        setEditingSections(prev => ({ ...prev, [section]: false }));
      } else {
        throw new Error(response.data.message || 'Failed to save preferences');
      }
    } catch (error) {
      console.error(`Error saving ${section} data:`, error);
      setMessage(section, 'error', error.response?.data?.message || `Failed to save ${section} preferences.`);
    } finally {
      setSavingSection('');
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

    // Track edit action
    if (!editingSections[section]) {
      analytics.ui.buttonClicked(`${section}_edit`, 'guest_diet_filters');
    }

    // Clear section message when editing
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[section];
      return newMessages;
    });
  };

  // Guest Limits Functions
  const toggleEditMode = (section) => {
    setEditMode(prev => ({ ...prev, [section]: !prev[section] }));

    // Track edit mode toggle
    if (!editMode[section]) {
      analytics.ui.buttonClicked(`${section}_edit`, 'guest_diet_filters');
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

  const handleToggle = (field) => {
    setFormData(prev => ({
      ...prev,
      [field]: !prev[field]
    }));

    // Track important toggles
    if (field === 'allowCustomization') {
      analytics.ui.buttonClicked(`${field}_${'enabled'}`, 'guest_diet_filters');
    }
  };

  const handleNestedToggle = (parent, field) => {
    setFormData(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent] || {},
        [field]: !prev[parent]?.[field]
      }
    }));

    // Track important nested toggles
    if (parent === 'tastingSession') {
      analytics.ui.buttonClicked('tasting_session_enabled', 'guest_diet_filters');
    }
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

      // Track custom filter addition
      analytics.ui.buttonClicked('add_custom_diet_filter', 'guest_diet_filters');
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
      <div className={`mt-3 p-3 rounded-lg flex items-start gap-2 text-sm ${message.type === 'success'
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

  const SectionHeader = ({ section, title, priority, description, onSave, onToggleEdit, isEditing, isSaving }) => (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
      <div className="flex-1">
        <div className='flex '>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          <SectionHeaderWithTooltip priority={priority} />
        </div>
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
              <h1 className="text-xl sm:text-2xl font-bold ">Guest Limits & Dietary Filters</h1>
              <p className=" mt-1 text-sm sm:text-base">Manage your guest limits, dietry filters, customizations and tasting sessions</p>
            </div>
          </div>
          <MessageAlert section="general" />
        </div>

        {/* Guest Limits Card */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center">
              <Users className="w-5 h-5 text-indigo-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Guest Limits</h2>
              <SectionHeaderWithTooltip
                priority="high"
              />
            </div>
            <button
              onClick={() => toggleEditMode('guests')}
              className="inline-flex cursor-pointer items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              {editMode.guests ? (
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

          {errors.guests && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-center">
              <AlertCircle className="w-4 h-4 text-red-600 mr-2" />
              <span className="text-red-700 text-sm">{errors.guests}</span>
            </div>
          )}

          {success.guests && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-md flex items-center">
              <CheckCircle2 className="w-4 h-4 text-green-600 mr-2" />
              <span className="text-green-700 text-sm">{success.guests}</span>
            </div>
          )}

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="min-guests" className="block text-sm font-medium text-gray-700 mb-2">
                  Minimum Guests
                </label>
                {editMode.guests ? (
                  <input
                    type="number"
                    inputMode="numeric"
                    id="min-guests"
                    value={guestLimits.minGuests}
                    onChange={(e) => setGuestLimits({ ...guestLimits, minGuests: e.target.value })}
                    placeholder="Enter minimum guests"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    [&::-webkit-inner-spin-button]:appearance-none
                                           [&::-webkit-outer-spin-button]:appearance-none
                                           [appearance:textfield]
                                           "
                  />
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                    {guestLimits.minGuests || 'Not set'}
                  </div>
                )}
              </div>

              <div>
                <label htmlFor="max-guests" className="block text-sm font-medium text-gray-700 mb-2">
                  Maximum Guests
                </label>
                {editMode.guests ? (
                  <input
                    type="number"
                    inputMode="numeric"
                    id="max-guests"
                    value={guestLimits.maxGuests}
                    onChange={(e) => setGuestLimits({ ...guestLimits, maxGuests: e.target.value })}
                    placeholder="Enter maximum guests"
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
                    [&::-webkit-inner-spin-button]:appearance-none
                                           [&::-webkit-outer-spin-button]:appearance-none
                                           [appearance:textfield]
                                           "
                  />
                ) : (
                  <div className="w-full px-3 py-2 border border-gray-200 rounded-md bg-gray-50">
                    {guestLimits.maxGuests || 'Not set'}
                  </div>
                )}
              </div>
            </div>

            {editMode.guests && (
              <div className="flex justify-end">
                <button
                  onClick={updateGuestLimits}
                  disabled={saving.guests}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {saving.guests ? (
                    <>
                      <Loader className="w-4 h-4 animate-spin mr-2" />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save className="w-4 h-4 mr-2" />
                      Save Guest Limits
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>


        {/* Dietary Filters Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 sm:p-6">
          <SectionHeader
            section="dietary"
            priority="medium"
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
                    checked={!!formData.dietaryFilters?.[filter.key]}
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.allowCustomization ? 'bg-blue-600' : 'bg-gray-200'
                  } ${!editingSections.customization ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.allowCustomization ? 'translate-x-6' : 'translate-x-1'
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
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.customizationCharges.hasCharges ? 'bg-blue-600' : 'bg-gray-200'
                      } ${!editingSections.customization ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.customizationCharges.hasCharges ? 'translate-x-6' : 'translate-x-1'
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
                        inputMode="numeric"
                        min="0"
                        step="1"
                        value={formData?.customizationCharges?.amount || ''}
                        onChange={(e) => handleNestedInputChange('customizationCharges', 'amount', parseFloat(e.target.value) || 0)}
                        disabled={!editingSections.customization}
                        className="w-full sm:w-48 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent disabled:opacity-50 disabled:cursor-not-allowed
                        [&::-webkit-inner-spin-button]:appearance-none
                                           [&::-webkit-outer-spin-button]:appearance-none
                                           [appearance:textfield]
                                           "
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
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${formData.tastingSession?.allowed ? 'bg-blue-600' : 'bg-gray-200'
                  } ${!editingSections.tasting ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${formData.tastingSession?.allowed ? 'translate-x-6' : 'translate-x-1'
                  }`} />
              </button>
            </div>

            {/* Tasting Description */}
            {formData.tastingSession?.allowed && (
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

export default GuestnDietFilters;