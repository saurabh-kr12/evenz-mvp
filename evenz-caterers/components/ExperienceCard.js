"use client"
import React, { useState, useEffect } from 'react';
import { Edit, Save, X, Briefcase, Calendar, Plus } from 'lucide-react';
import SectionHeaderWithTooltip from './SectionHeaderWithTooltip';
import useAnalytics from '@/hooks/useAnalytics';

const ExperienceCard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [tempExperience, setTempExperience] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const { ui } = useAnalytics();

  // Fetch profile data on component mount
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('http://localhost:5000/api/vendor/experience', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
      } else {
        // Profile not found, user can add new one
        setProfile(null);
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setError('Failed to load profile data');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
    setTempExperience(profile?.experience?.toString() || '');
    setError('');
  };

  const handleCancel = () => {
    setEditing(false);
    setTempExperience('');
    setError('');
  };

  const handleSave = async () => {
    if (!tempExperience.trim()) {
      setError('Please enter experience in years');
      return;
    }

    const experienceValue = parseFloat(tempExperience);
    if (isNaN(experienceValue) || experienceValue < 0) {
      setError('Please enter a valid number of years');
      return;
    }

    try {
      setSaving(true);
      setError('');

      let response;
      
      if (profile) {
        // Update existing profile experience
        response = await fetch('http://localhost:5000/api/vendor/experience', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            experience: experienceValue
          })
        });
      } else {
        // Create new profile with experience only (legacy route)
        response = await fetch('http://localhost:5000/api/vendor/experience/add-experience', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: JSON.stringify({
            experience: experienceValue
          })
        });
      }

      const data = await response.json();

      if (data.success) {
        // Refresh profile data
        await fetchProfile();
        setEditing(false);
        setTempExperience('');

        ui.buttonClicked('saved_experience', 'experience_card');
      } else {
        setError(data.message || 'Failed to save experience');
      }
    } catch (error) {
      console.error('Error saving experience:', error);
      setError('Failed to save experience. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const formatExperience = (years) => {
    if (!years && years !== 0) return '0 years';
    if (years === 1) return '1 year';
    if (years % 1 === 0) return `${years} years`;
    return `${years} years`;
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 max-w-sm sm:max-w-md mx-auto">
        <div className="animate-pulse">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
            <div className="h-6 bg-gray-200 rounded w-24"></div>
          </div>
          <div className="h-10 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-20"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white text-gray-700 rounded-lg shadow-md p-4 sm:p-6 max-w-sm sm:max-w-5xl mt-6 mx-auto border border-gray-100">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="bg-blue-100 p-2 rounded-full">
            <Briefcase className="w-5 h-5 text-blue-600" />
          </div>
          <div className='flex'>
            <h3 className="text-lg font-semibold text-gray-800">Experience</h3>
            <SectionHeaderWithTooltip priority="high" />
          </div>
        </div>

        {!editing && (
          <button
            onClick={handleEdit}
            className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors duration-200"
            title="Edit experience"
          >
            <Edit className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Content */}
      <div className="space-y-3">
        {!editing ? (
          // Display Mode
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Calendar className="w-4 h-4 text-gray-500" />
              <span className="text-2xl font-bold text-gray-800">
                {profile?.experience !== undefined ? formatExperience(profile.experience) : 'No experience added'}
              </span>
            </div>

            {profile && (
              <div className="space-y-1">
                <p className="text-sm text-gray-500">
                  Last updated: {new Date(profile.updatedAt || profile.createdAt).toLocaleDateString()}
                </p>
                {profile.cloudinaryUrl && (
                  <p className="text-xs text-gray-400">
                    Profile image: ✓ Uploaded
                  </p>
                )}
              </div>
            )}

            {!profile && (
              <p className="text-sm text-gray-500">
                Add your professional experience to help clients understand your expertise
              </p>
            )}
          </div>
        ) : (
          // Edit Mode
          <div className="space-y-3">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Years of Experience
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={tempExperience}
                onChange={(e) => setTempExperience(e.target.value)}
                placeholder="Enter years of experience"
                min="0"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
              />
              <p className="text-xs text-gray-500">
                Enter your total years of experience as a caterer
              </p>
            </div>

            {error && (
              <div className="text-red-600 text-sm bg-red-50 p-2 rounded-md">
                {error}
              </div>
            )}

            <div className="flex space-x-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center space-x-2 text-sm font-medium"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    {profile ? <Save className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                    <span>{profile ? 'Update' : 'Add'}</span>
                  </>
                )}
              </button>

              <button
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 disabled:bg-gray-100 disabled:cursor-not-allowed transition-colors duration-200 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExperienceCard;