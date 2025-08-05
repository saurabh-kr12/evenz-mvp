"use client";
import React, { useState, useEffect, useCallback } from 'react';
import { Camera, Upload, X, Edit3, Save, AlertCircle, Check, Star } from 'lucide-react';
import SectionHeaderWithTooltip from '../SectionHeaderWithTooltip';
import useAnalytics from '@/hooks/useAnalytics';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/context/AuthContext'; // Ensure this is the correct import path
import Image from 'next/image';

const ExperienceMedia = () => {
  const [profile, setProfile] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [experience, setExperience] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(true);

  // Analytics
  const { services, ui } = useAnalytics();
  const { accessToken, loading: authLoading } = useAuth();

  // --- Data Fetching ---
  const fetchProfile = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/vendor/experience'); // Use the api instance
      if (response.data.success) {
        const data = response.data.data;
        setProfile(data);
        if (data?.experience) {
          setExperience(data.experience.toString());
        }
      } else {
        setProfile(null);
      }
    } catch (err) {
      setError('Error loading profile');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // 4. Wait for auth to be ready before fetching
    if (!authLoading && accessToken) {
      fetchProfile();
      services.tabViewed('experience_media');
    }
  }, [accessToken, authLoading, fetchProfile]);

  const handleUpload = async () => {
    // ... (validation logic is fine)
    setIsUploading(true);
    setError('');
    try {
      const formData = new FormData();
      if (selectedFile) formData.append('photo', selectedFile);
      if (experience.trim()) formData.append('experience', parseFloat(experience));

      // 5. Use the api instance for file upload
      const response = await api.post('/vendor/experience/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSuccess('Profile updated successfully!');
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl('');
        }
        await fetchProfile();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Upload failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error uploading profile');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateExperienceOnly = async () => {
    // ... (validation logic is fine)
    setIsUploading(true);
    setError('');
    try {
      const experienceValue = parseFloat(experience);
      // 6. Use the api instance
      const response = await api.put('/vendor/experience', { experience: experienceValue });

      if (response.data.success) {
        setSuccess('Experience updated successfully!');
        await fetchProfile();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating experience');
      console.error('Update error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateImageOnly = async () => {
    // ... (validation logic is fine)
    setIsUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);

      // 7. Use the api instance
      const response = await api.put('/vendor/experience/image', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (response.data.success) {
        setSuccess('Profile image updated successfully!');
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl('');
        }
        await fetchProfile();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Image update failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error updating image');
      console.error('Image update error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to delete your profile image?')) return;
    try {
      // 8. Use the api instance
      const response = await api.delete('/vendor/experience/image');
      if (response.data.success) {
        setSuccess('Profile image deleted successfully!');
        await fetchProfile();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        throw new Error(response.data.message || 'Delete failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error deleting image');
      console.error('Delete error:', err);
    }
  };


  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
    ui.buttonClicked('edit_experience_media', 'experience_media');
  };

  const handleSave = async () => {
    if (selectedFile && experience.trim()) {
      // Upload both image and experience
      await handleUpload();
    } else if (selectedFile && !experience.trim() && profile?.experience) {
      // Update image only (experience already exists)
      await handleUpdateImageOnly();
    } else if (!selectedFile && experience.trim()) {
      // Update experience only
      await handleUpdateExperienceOnly();
    } else if (selectedFile && !experience.trim() && !profile?.experience) {
      setError('Please enter experience value');
      return;
    } else {
      setError('Please make some changes before saving');
      return;
    }

    setIsEditing(false);
    ui.buttonClicked('save_experience_media', 'experience_media');
  };

  const handleCancel = () => {
    setIsEditing(false);
    setSelectedFile(null);
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl('');
    }
    setExperience(profile?.experience?.toString() || '');
    setError('');
    setSuccess('');
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validate file type and size
    if (!file.type.startsWith('image/')) {
      setError('Please select an image file');
      services.validationError('experience_media', 'file_type', 'invalid_image_type');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setError('File size must be less than 5MB');
      services.validationError('experience_media', 'file_size', 'file_too_large');
      return;
    }

    setSelectedFile(file);

    // Track file selection
    ui.buttonClicked('select_photo', 'experience_media_single_file');

    // Create preview URL
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setError('');
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Loading profile...</span>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg text-gray-700 shadow-md p-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center mb-4 sm:mb-0">
            <Camera className="h-6 w-6 text-blue-600 mr-3" />
            <div>
              <span className='flex'>
                <h2 className="text-xl font-semibold text-gray-900">Experience & Media</h2>
                <SectionHeaderWithTooltip priority='high' />
              </span>
              <p className="text-sm text-gray-600">
                Upload your profile image and set your experience ({profile?.cloudinaryUrl ? '1/1' : '0/1'} photo)
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2">
            {!isEditing ? (
              <button
                onClick={handleEdit}
                className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit3 className="h-4 w-4 mr-2" />
                Edit
              </button>
            ) : (
              <>
                <button
                  onClick={handleSave}
                  disabled={isUploading}
                  className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isUploading ? 'Updating...' : 'Save'}
                </button>
                <button
                  onClick={handleCancel}
                  className="flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        {/* Current Profile Image Section */}
        {profile?.cloudinaryUrl && (
          <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
            <div className="flex items-center mb-3">
              <Star className="h-5 w-5 text-yellow-500 mr-2" />
              <h3 className="text-lg font-medium text-gray-900">Current Profile Image</h3>
            </div>
            <div className="flex items-center gap-4">
              <Image
                src={profile.cloudinaryUrl}
                alt={profile.originalName}
                width={80} // w-20 = 80px
                height={80} // h-20 = 80px
                className="w-20 h-20 object-cover rounded-lg shadow-sm"
              />
              <div className="flex-1">
                <p className="font-medium text-gray-900">{profile.originalName}</p>
                <p className="text-sm text-gray-600">This is your profile image</p>
                <p className="text-xs text-gray-500">Experience: {profile.experience} years</p>
              </div>
              {isEditing && (
                <button
                  onClick={handleDeleteImage}
                  className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                >
                  Delete Image
                </button>
              )}
            </div>
          </div>
        )}

        {/* Error/Success Messages */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
            <div className="text-red-700 text-sm whitespace-pre-line">{error}</div>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
            <Check className="h-5 w-5 text-green-500 mr-3" />
            <div className="text-green-700 text-sm">{success}</div>
          </div>
        )}

        {/* Edit Section - Only visible when editing */}
        {isEditing && (
          <div className="mb-6 space-y-6">
            {/* Image Upload Section */}
            <div className="p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <span className="mt-2 block text-sm font-medium text-gray-900">
                    {profile?.cloudinaryUrl ? 'Update profile image' : 'Upload profile image'}
                  </span>
                  <span className="mt-1 block text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </span>
                </label>
                <input
                  id="file-upload"
                  name="file-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  onChange={handleFileSelect}
                />
              </div>

              {/* File Preview */}
              {previewUrl && (
                <div className="mt-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">
                    Selected Image
                  </h4>
                  <div className="relative inline-block">
                    <Image
                      src={previewUrl}
                      alt="Preview"
                      className="w-32 h-32 object-cover rounded-lg"
                    />
                    <button
                      onClick={() => {
                        setSelectedFile(null);
                        URL.revokeObjectURL(previewUrl);
                        setPreviewUrl('');
                      }}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Experience Input Section */}
            <div className="p-4 bg-gray-50 rounded-lg border border-gray-300">
              <label className="block text-sm font-medium text-gray-900 mb-2">
                Years of Experience
              </label>
              <input
                type="number"
                inputMode="numeric"
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Enter years of experience"
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent
                [&::-webkit-inner-spin-button]:appearance-none
                                           [&::-webkit-outer-spin-button]:appearance-none
                                           [appearance:textfield]
                                           "
              />
              <p className="text-xs text-gray-500 mt-1">
                Enter your total years of experience as a caterer
              </p>
            </div>
          </div>
        )}

        {/* Profile Display - When not editing */}
        {!isEditing && (
          <div>
            {profile ? (
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Your Profile
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Image Display */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Profile Image</h4>
                    {profile.cloudinaryUrl ? (
                      <div className='relative w-full h-48'>
                        <Image
                          src={profile.cloudinaryUrl}
                          alt={profile.originalName}
                          fill
                          className="object-cover rounded-lg shadow-sm"
                        />
                      </div>

                    ) : (
                      <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center">
                        <div className="text-center">
                          <Camera className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">No image uploaded</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Experience Display */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Experience</h4>
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="text-3xl font-bold text-blue-600 mb-1">
                        {profile.experience} {profile.experience === 1 ? 'year' : 'years'}
                      </div>
                      <p className="text-sm text-gray-600">
                        Professional catering experience
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-12">
                <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No profile set up yet</h3>
                <p className="text-gray-500 mb-4">
                  Create your profile by uploading an image and setting your experience.
                </p>
                {!isEditing && (
                  <button
                    onClick={() => {
                      handleEdit();
                      ui.buttonClicked('first_create_profile', 'experience_media');
                    }}
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    Create Profile
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Upload Progress */}
        {isUploading && (
          <div className="mt-4">
            <div className="bg-gray-200 rounded-full h-2">
              <div className="bg-blue-600 h-2 rounded-full animate-pulse w-full"></div>
            </div>
            <p className="text-sm text-gray-600 mt-1 text-center">
              {selectedFile ? 'Uploading image...' : 'Updating profile...'}
            </p>
          </div>
        )}
      </div>
    </>
  );
};

export default ExperienceMedia;