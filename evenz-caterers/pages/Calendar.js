"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, Save, Edit3, ChevronDown, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import useAnalytics from '@/hooks/useAnalytics';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/context/AuthContext'; // Ensure this is the correct import path

const AvailabilityCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDates, setSelectedDates] = useState([]);
  const [availability, setAvailability] = useState({});
  const [selectedDate, setSelectedDate] = useState(null);
  const [bulkMode, setBulkMode] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [showYearDropdown, setShowYearDropdown] = useState(false);
  const [bulkAction, setBulkAction] = useState('unavailable'); // 'available' or 'unavailable'
  const [bulkNotes, setBulkNotes] = useState('');

  // --- Hooks ---
  const { accessToken, loading: authLoading } = useAuth();
  const { calendar, ui } = useAnalytics(); // Add this line

  // Get current date without time for comparison
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // --- Data Fetching ---
  const loadAvailability = useCallback(async (dateToLoad) => {
    setLoading(true);
    try {
      const month = dateToLoad.getMonth() + 1;
      const year = dateToLoad.getFullYear();

      // 4. Use the api instance for the GET request
      const response = await api.get(`/vendor/availability?month=${month}&year=${year}`);

      if (response.data.success) {
        setAvailability(prev => ({ ...prev, ...response.data.data }));
      }
    } catch (error) {
      console.error('Error loading availability:', error);
      setMessage('Error loading availability data.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  }, []); // Empty dependency array means this function is created only once

  useEffect(() => {
    // 5. Wait for auth to be ready before fetching data
    if (!authLoading && accessToken) {
      loadAvailability(currentDate);
      calendar.pageViewed('availability_calendar');
    }
  }, [currentDate, accessToken, authLoading, loadAvailability]);

  // --- Data Saving ---
  const handleSave = async () => {
    if (!selectedDate || !isEditable(selectedDate)) return;
    const dateKey = formatDateKey(selectedDate);
    const dateData = availability[dateKey];
    if (!dateData) return;

    setLoading(true);
    try {
      const payload = { availability: { [dateKey]: dateData } };
      // 6. Use the api instance for the POST request
      const response = await api.post('/vendor/availability', payload);

      if (response.data.success) {
        setMessage(`Availability saved for ${selectedDate.toLocaleDateString()}!`);
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error(response.data.message || 'Failed to save');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error saving availability.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleBulkUpdate = async () => {
    if (selectedDates.length === 0) return;
    const bulkUpdates = selectedDates.map(dateKey => ({
      date: new Date(dateKey + 'T00:00:00.000Z'),
      isAvailable: bulkAction === 'available',
      notes: bulkAction === 'unavailable' ? bulkNotes : ''
    }));

    setLoading(true);
    try {
      // 7. Use the api instance for the POST request
      const response = await api.post('/vendor/availability', { bulkUpdate: bulkUpdates });

      if (response.data.success) {
        // Manually update local state for instant feedback
        const updates = {};
        bulkUpdates.forEach(update => {
          const key = formatDateKey(update.date);
          updates[key] = { isAvailable: update.isAvailable, notes: update.notes };
        });
        setAvailability(prev => ({ ...prev, ...updates }));

        setMessage(`Successfully updated ${bulkUpdates.length} dates!`);
        setTimeout(() => setMessage(''), 3000);

        // Reset bulk mode
        setSelectedDates([]);
        setBulkMode(false);
        setBulkNotes('');
      } else {
        throw new Error(response.data.message || 'Failed to update');
      }
    } catch (error) {
      setMessage(error.response?.data?.message || 'Error saving bulk changes.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Get days in current month
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days = [];

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Check if date is in the past
  const isPastDate = (date) => {
    if (!date) return false;
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck < today;
  };

  // Check if date is editable (today or future)
  const isEditable = (date) => {
    if (!date) return false;
    const dateToCheck = new Date(date);
    dateToCheck.setHours(0, 0, 0, 0);
    return dateToCheck >= today;
  };

  // Replace the existing formatDateKey function with:
  const formatDateKey = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Get availability status for a date
  const getDateStatus = (date) => {
    if (!date) return null;
    const dateKey = formatDateKey(date);
    const dateAvailability = availability[dateKey];

    if (!dateAvailability) return null;

    return dateAvailability.isAvailable ? 'available' : 'unavailable';
  };

  // Handle date click
  const handleDateClick = (date) => {
    if (!date) return;

    // Don't allow selection of past dates for editing
    if (isPastDate(date) && bulkMode) return;

    if (bulkMode) {
      // Only allow future dates in bulk mode
      if (!isPastDate(date)) {
        const dateKey = formatDateKey(date);
        const wasSelected = selectedDates.includes(dateKey);
        setSelectedDates(prev =>
          prev.includes(dateKey)
            ? prev.filter(d => d !== dateKey)
            : [...prev, dateKey]
        );

        // Add this analytics call:
        ui.buttonClicked(
          wasSelected ? 'bulk_date_deselected' : 'bulk_date_selected',
          'availability_calendar'
        );
      }
    } else {
      setSelectedDate(date);
      ui.buttonClicked('single_date_selected', 'availability_calendar');
      // Initialize availability for this date if not exists and it's editable
      const dateKey = formatDateKey(date);
      if (!availability[dateKey] && isEditable(date)) {
        setAvailability(prev => ({
          ...prev,
          [dateKey]: {
            isAvailable: true,
            notes: ''
          }
        }));
      }
    }
  };

  // Update availability for selected date
  const updateAvailability = (isAvailable) => {
    if (!selectedDate || !isEditable(selectedDate)) return;

    const dateKey = formatDateKey(selectedDate);
    setAvailability(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        isAvailable
      }
    }));

    calendar.availabilityStatusChanged(isAvailable ? 'available' : 'unavailable'); // Add this line
  };

  // Update notes for selected date
  const updateNotes = (notes) => {
    if (!selectedDate || !isEditable(selectedDate)) return;

    const dateKey = formatDateKey(selectedDate);
    setAvailability(prev => ({
      ...prev,
      [dateKey]: {
        ...prev[dateKey],
        notes
      }
    }));
  };

  // Navigation
  const navigateMonth = (direction) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setMonth(prev.getMonth() + direction);
      return newDate;
    });
    ui.buttonClicked(direction > 0 ? 'next_month' : 'previous_month', 'availability_calendar');
  };

  // Handle year change
  const handleYearChange = (year) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      newDate.setFullYear(year);
      return newDate;
    });
    setShowYearDropdown(false);

    ui.buttonClicked('year_changed', 'availability_calendar');
  };

  // Get available years (current year + next 5 years)
  const getAvailableYears = () => {
    const currentYear = new Date().getFullYear();
    const years = [];
    for (let i = 0; i <= 5; i++) {
      years.push(currentYear + i);
    }
    return years;
  };

  const days = getDaysInMonth(currentDate);
  const selectedDateData = selectedDate ? availability[formatDateKey(selectedDate)] : null;
  const availableYears = getAvailableYears();

  return (
    <div className="min-h-screen py-4 bg-gray-50 text-gray-800 ">
      <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8 bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="p-4 sm:p-6 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Calendar className="w-5 h-5 sm:w-6 sm:h-6" />
                Availability Calendar
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                Manage your catering availability
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <button
                // Find this existing onClick handler and replace it:
                onClick={() => {
                  const newBulkMode = !bulkMode;
                  setBulkMode(newBulkMode);
                  setSelectedDates([]);
                  setBulkNotes('');

                  // Add these analytics calls:
                  if (newBulkMode) {
                    ui.buttonClicked('bulk_edit_enabled', 'availability_calendar');
                  } else {
                    ui.buttonClicked('bulk_edit_disabled', 'availability_calendar');
                  }
                }}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${bulkMode
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
              >
                {bulkMode ? 'Exit Bulk' : 'Bulk Edit'}
              </button>

              {/* Show save button only when not in bulk mode */}
              {!bulkMode && (
                <button
                  onClick={handleSave}
                  disabled={loading || !selectedDate || !isEditable(selectedDate)}
                  className="px-3 py-2 bg-green-600 text-white text-sm font-medium rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-1"
                >
                  <Save className="w-4 h-4" />
                  {loading ? 'Saving...' : 'Save'}
                </button>
              )}
            </div>
          </div>

          {/* Message */}
          {message && (
            <div className={`mt-4 p-3 rounded-md text-sm ${message.includes('Error')
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-green-50 text-green-700 border border-green-200'
              }`}>
              {message}
            </div>
          )}
        </div>

        <div className="p-4 sm:p-6">
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Calendar */}
            <div className="lg:col-span-2">
              {/* Month Navigation */}
              <div className="flex justify-between items-center mb-4">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-semibold">
                    {currentDate.toLocaleDateString('en-US', { month: 'long' })}
                  </h2>
                  <div className="relative">
                    <button
                      onClick={() => setShowYearDropdown(!showYearDropdown)}
                      className="flex items-center gap-1 px-2 py-1 hover:bg-gray-100 rounded-md text-lg font-semibold"
                    >
                      {currentDate.getFullYear()}
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    {showYearDropdown && (
                      <div className="absolute top-full left-0 mt-1 bg-white border border-gray-200 rounded-md shadow-lg z-10 min-w-[100px]">
                        {availableYears.map(year => (
                          <button
                            key={year}
                            onClick={() => handleYearChange(year)}
                            className={`w-full px-3 py-2 text-left hover:bg-gray-50 first:rounded-t-md last:rounded-b-md transition-colors ${year === currentDate.getFullYear() ? 'bg-blue-50 text-blue-600 font-medium' : ''
                              }`}
                          >
                            {year}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => navigateMonth(1)}
                  className="p-2 hover:bg-gray-100 rounded-md transition-colors"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>

              {/* Week Headers */}
              <div className="grid grid-cols-7 gap-1 mb-2">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                  <div key={index} className="text-center text-xs sm:text-sm font-medium text-gray-500 p-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar Days */}
              <div className="grid grid-cols-7 gap-1">
                {days.map((date, index) => {
                  if (!date) {
                    return <div key={index} className="p-2 sm:p-3"></div>;
                  }

                  const dateKey = formatDateKey(date);
                  const status = getDateStatus(date);
                  const isSelected = selectedDate && formatDateKey(selectedDate) === dateKey;
                  const isBulkSelected = selectedDates.includes(dateKey);
                  const isToday = date.toDateString() === new Date().toDateString();
                  const isPast = isPastDate(date);

                  return (
                    <button
                      key={dateKey}
                      onClick={() => handleDateClick(date)}
                      disabled={isPast && bulkMode}
                      className={`
                        p-2 sm:p-3 text-xs sm:text-sm rounded-md border-2 transition-all min-h-[40px] sm:min-h-[48px] flex items-center justify-center
                        ${isSelected ? 'border-blue-500 bg-blue-50' : 'border-transparent'}
                        ${isBulkSelected ? 'border-purple-500 bg-purple-50' : ''}
                        ${isToday ? 'font-bold ring-2 ring-blue-300' : ''}
                        ${isPast ? 'opacity-30 bg-gray-100' : ''}
                        ${isPast && bulkMode ? 'cursor-not-allowed' : 'cursor-pointer'}
                        ${status === 'available' ? 'bg-gray-100 text-green-800' : ''}
                        ${status === 'unavailable' ? 'bg-red-400 text-white' : ''}
                        ${!status && !isSelected && !isBulkSelected ? 'bg-gray-100 hover:bg-gray-200' : ''}
                      `}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-4 grid grid-cols-2 sm:flex sm:flex-wrap gap-2 text-xs">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-300 border border-green-400 rounded"></div>
                  <span>Available</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-red-400 border border-red-500 rounded"></div>
                  <span>Unavailable</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-gray-200 rounded"></div>
                  <span>Past</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 border-2 border-blue-500 bg-blue-50 rounded"></div>
                  <span>Selected</span>
                </div>
              </div>
            </div>

            {/* Date Details / Actions */}
            <div className="bg-gray-50 p-4 rounded-lg">
              {bulkMode ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    Bulk Edit Mode
                  </h3>

                  <div className="space-y-4">
                    <p className="text-sm text-gray-600">
                      Selected {selectedDates.length} date(s) for bulk update
                    </p>

                    {selectedDates.length > 0 && (
                      <>
                        {/* Bulk Action Selection */}
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-2">
                            Action
                          </label>
                          <div className="space-y-2">
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="bulkAction"
                                value="available"
                                checked={bulkAction === 'available'}
                                onChange={(e) => {
                                  setBulkAction(e.target.value);
                                  ui.buttonClicked('bulk_action_available_selected', 'availability_calendar'); // Add this line
                                }}

                                className="mr-2"
                              />
                              <span className="text-sm">Mark as Available</span>
                            </label>
                            <label className="flex items-center">
                              <input
                                type="radio"
                                name="bulkAction"
                                value="unavailable"
                                checked={bulkAction === 'unavailable'}
                                onChange={(e) => {
                                  setBulkAction(e.target.value);
                                  ui.buttonClicked('bulk_action_unavailable_selected', 'availability_calendar'); // Add this line
                                }}
                                className="mr-2"
                              />
                              <span className="text-sm">Mark as Unavailable</span>
                            </label>
                          </div>
                        </div>

                        {/* Bulk Notes (only for unavailable) */}
                        {bulkAction === 'unavailable' && (
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                              Notes (Optional)
                            </label>
                            <textarea
                              value={bulkNotes}
                              onChange={(e) => setBulkNotes(e.target.value)}
                              placeholder="e.g., Festival holidays, Personal leave"
                              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                              rows="3"
                              maxLength="500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              {bulkNotes.length}/500 characters
                            </p>
                          </div>
                        )}

                        {/* Bulk Action Button */}
                        <button
                          onClick={handleBulkUpdate}
                          disabled={loading}
                          className={`w-full px-4 py-2 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 ${bulkAction === 'available'
                            ? 'bg-green-600 hover:bg-green-700'
                            : 'bg-red-600 hover:bg-red-700'
                            }`}
                        >
                          {loading ? 'Updating...' : `Mark ${selectedDates.length} dates as ${bulkAction}`}
                        </button>
                      </>
                    )}

                    <div className="text-xs text-gray-500 space-y-1">
                      <p>• Click on future dates to select them</p>
                      <p>• Past dates cannot be edited</p>
                      <p>• Use radio buttons to choose bulk action</p>
                    </div>
                  </div>
                </div>
              ) : selectedDate ? (
                <div>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <Edit3 className="w-5 h-5" />
                    {selectedDate.toLocaleDateString('en-US', {
                      weekday: 'long',
                      month: 'short',
                      day: 'numeric'
                    })}
                    {isPastDate(selectedDate) && (
                      <span className="text-xs bg-gray-200 text-gray-600 px-2 py-1 rounded">
                        View Only
                      </span>
                    )}
                  </h3>

                  <div className="space-y-4">
                    {/* Availability Toggle */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        Availability Status
                      </label>
                      <div className="space-y-2">
                        <label className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${selectedDateData?.isAvailable === true ? 'border-green-500 bg-green-50' : 'border-gray-300'
                          } ${!isEditable(selectedDate) ? 'opacity-60 cursor-not-allowed' : ''}`}>
                          <input
                            type="radio"
                            name="availability"
                            checked={selectedDateData?.isAvailable === true}
                            onChange={() => updateAvailability(true)}
                            disabled={!isEditable(selectedDate)}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium text-green-700">Available</div>
                            <div className="text-xs text-green-600">Ready to accept bookings</div>
                          </div>
                        </label>

                        <label className={`flex items-center p-3 border rounded-md cursor-pointer transition-colors ${selectedDateData?.isAvailable === false ? 'border-red-500 bg-red-50' : 'border-gray-300'
                          } ${!isEditable(selectedDate) ? 'opacity-60 cursor-not-allowed' : ''}`}>
                          <input
                            type="radio"
                            name="availability"
                            checked={selectedDateData?.isAvailable === false}
                            onChange={() => updateAvailability(false)}
                            disabled={!isEditable(selectedDate)}
                            className="mr-3"
                          />
                          <div>
                            <div className="font-medium text-red-700">Unavailable</div>
                            <div className="text-xs text-red-600">Not accepting bookings</div>
                          </div>
                        </label>
                      </div>
                    </div>

                    {/* Notes (show for unavailable or if notes exist) */}
                    {(selectedDateData?.isAvailable === false || selectedDateData?.notes) && (
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Notes {selectedDateData?.isAvailable === false ? '' : '(Optional)'}
                        </label>
                        <textarea
                          value={selectedDateData?.notes || ''}
                          onChange={(e) => updateNotes(e.target.value)}
                          placeholder={isEditable(selectedDate)
                            ? "e.g., Already booked, Personal event, Equipment maintenance"
                            : "No notes available"
                          }
                          disabled={!isEditable(selectedDate)}
                          className={`w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${!isEditable(selectedDate) ? 'bg-gray-100 cursor-not-allowed' : ''
                            }`}
                          rows="3"
                          maxLength="500"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          {(selectedDateData?.notes || '').length}/500 characters
                        </p>
                      </div>
                    )}

                    {/* Single Date Save Button */}
                    {isEditable(selectedDate) && (
                      <button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        <Save className="w-4 h-4" />
                        {loading ? 'Saving...' : 'Save This Date'}
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p className="font-medium">Select a date to manage availability</p>
                  <div className="text-sm mt-2 space-y-1">
                    <p>
                      {bulkMode ? 'Bulk mode: Select multiple future dates' : 'Click on any date to get started'}
                    </p>
                    <p className="text-xs text-gray-400">
                      Past dates are view-only
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AvailabilityCalendar;