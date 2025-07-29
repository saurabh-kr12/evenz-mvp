// "use client";
// import React, { useState, useEffect } from 'react';
// import { Camera, Upload, X, Edit3, Save, AlertCircle, Check, Star } from 'lucide-react';
// import ExperienceCard from '../ExperienceCard';
// import SectionHeaderWithTooltip from '../SectionHeaderWithTooltip';
// import useAnalytics from '@/hooks/useAnalytics';

// const ExperienceMedia = () => {
//   const [mediaItems, setMediaItems] = useState([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [isUploading, setIsUploading] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [selectedFiles, setSelectedFiles] = useState([]);
//   const [previewUrls, setPreviewUrls] = useState([]);
//   const [error, setError] = useState('');
//   const [success, setSuccess] = useState('');
//   const [loading, setLoading] = useState(true);
//   const [coverImage, setCoverImage] = useState(null);
//   // Analytics
//   const { services, ui } = useAnalytics();

//   // Mock token - replace with actual token from your auth context
//   const token = localStorage.getItem('token');

//   useEffect(() => {
//     fetchMediaItems();
//     fetchCoverImage();
//     services.tabViewed('experience_media');
//   }, []);

//   const fetchMediaItems = async () => {
//     try {
//       setLoading(true);
//       const response = await fetch('http://localhost:5000/api/vendor/experience', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });
      
//       if (response.ok) {
//         const data = await response.json();
//         // Filter out experience data entries and only keep actual media files
//         const actualMediaFiles = (data.data || []).filter(item =>
//           item.size > 0 && item.mimetype && item.mimetype.startsWith('image/')
//         );
//         setMediaItems(actualMediaFiles);
//         console.log('Media items fetched:', actualMediaFiles);
//       } else {
//         setError('Failed to fetch media items');
//       }
//     } catch (err) {
//       setError('Error loading media items');
//       console.error('Error:', err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const fetchCoverImage = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/vendor/experience/cover', {
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         // Only set cover image if it's an actual media file
//         if (data.data && data.data.size > 0 && data.data.mimetype && data.data.mimetype.startsWith('image/')) {
//           setCoverImage(data.data);
//         }
//       }
//     } catch (err) {
//       console.error('Error fetching cover image:', err);
//     }
//   };

//   const handleFileSelect = (e) => {
//     const files = Array.from(e.target.files);
//     const currentTotal = mediaItems.length + files.length;

//     if (currentTotal > 2) {
//       setError(`Cannot select ${files.length} files. Maximum 2 photos allowed. You currently have ${mediaItems.length} photos.`);

//       // Track validation error
//       services.validationError('experience_media', 'file_limit', 'max_photos_exceeded');
//       return;
//     }

//     // Validate file types and sizes
//     const validFiles = [];
//     const invalidFiles = [];

//     files.forEach(file => {
//       if (!file.type.startsWith('image/')) {
//         invalidFiles.push(`${file.name} - Not an image file`);
//       } else if (file.size > 5 * 1024 * 1024) {
//         invalidFiles.push(`${file.name} - File too large (max 5MB)`);
//       } else {
//         validFiles.push(file);
//       }
//     });

//     if (invalidFiles.length > 0) {
//       setError(`Invalid files:\n${invalidFiles.join('\n')}`);
//       return;
//     }

//     setSelectedFiles(validFiles);

//     // Track file selection
//     if (validFiles.length > 0) {
//       ui.buttonClicked('select_photos', `experience_media_${validFiles.length}_files`);
//     }

//     // Create preview URLs
//     const urls = validFiles.map(file => URL.createObjectURL(file));
//     setPreviewUrls(urls);
//     setError('');
//   };

//   const handleUpload = async () => {
//     if (selectedFiles.length === 0) {
//       setError('Please select files to upload');
//       return;
//     }

//     setIsUploading(true);
//     setUploadProgress(0);
//     setError('');

//     try {
//       const formData = new FormData();
//       selectedFiles.forEach(file => {
//         formData.append('photos', file);
//       });

//       const response = await fetch('http://localhost:5000/api/vendor/experience/upload', {
//         method: 'POST',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//         body: formData,
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setSuccess(`${selectedFiles.length} photo(s) uploaded successfully!`);

//         // Track media upload
//         services.mediaUploaded('experience_photo', selectedFiles.length);

//         // Clear selected files and previews
//         setSelectedFiles([]);
//         previewUrls.forEach(url => URL.revokeObjectURL(url));
//         setPreviewUrls([]);

//         // Refresh media items
//         await fetchMediaItems();
//         await fetchCoverImage();

//         // Clear success message after 3 seconds
//         setTimeout(() => setSuccess(''), 3000);
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || 'Upload failed');
//       }
//     } catch (err) {
//       setError('Error uploading files');
//       console.error('Upload error:', err);
//     } finally {
//       setIsUploading(false);
//       setUploadProgress(0);
//     }
//   };

//   const handleSetCoverImage = async (mediaId) => {
//     try {
//       const response = await fetch(`http://localhost:5000/api/vendor/experience/cover/${mediaId}`, {
//         method: 'PUT',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         const data = await response.json();
//         setSuccess('Cover image updated successfully!');

//         // Track cover image setting
//         ui.buttonClicked('set_cover_image', 'experience_media');

//         // Refresh media items and cover image
//         await fetchMediaItems();
//         await fetchCoverImage();

//         setTimeout(() => setSuccess(''), 3000);
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || 'Failed to set cover image');
//       }
//     } catch (err) {
//       setError('Error setting cover image');
//       console.error('Cover image error:', err);
//     }
//   };

//   const handleRemoveCoverImage = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/vendor/experience/cover', {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       if (response.ok) {
//         setSuccess('Cover image removed successfully!');

//         ui.buttonClicked('remove_cover_image', 'experience_media');

//         // Refresh media items and cover image
//         await fetchMediaItems();
//         await fetchCoverImage();

//         setTimeout(() => setSuccess(''), 3000);
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || 'Failed to remove cover image');
//       }
//     } catch (err) {
//       setError('Error removing cover image');
//       console.error('Remove cover error:', err);
//     }
//   };

//   const handleDelete = async (mediaId) => {
//     if (!window.confirm('Are you sure you want to delete this photo?')) {
//       return;
//     }

//     try {
//       const response = await fetch(`http://localhost:5000/api/vendor/experience/${mediaId}`, {
//         method: 'DELETE',
//         headers: {
//           'Authorization': `Bearer ${token}`,
//         },
//       });

//       if (response.ok) {
//         setSuccess('Photo deleted successfully!');

//         ui.buttonClicked('delete_photo', 'experience_media');
//         await fetchMediaItems();
//         await fetchCoverImage();
//         setTimeout(() => setSuccess(''), 3000);
//       } else {
//         const errorData = await response.json();
//         setError(errorData.message || 'Delete failed');
//       }
//     } catch (err) {
//       setError('Error deleting photo');
//       console.error('Delete error:', err);
//     }
//   };

//   const handleEdit = () => {
//     setIsEditing(true);
//     setError('');
//     setSuccess('');

//     ui.buttonClicked('edit_experience_media', 'experience_media');
//   };

//   const handleSave = async () => {
//     if (selectedFiles.length > 0) {
//       await handleUpload();
//     }
//     setIsEditing(false);

//     ui.buttonClicked('save_experience_media', 'experience_media');
//   };

//   const handleCancel = () => {
//     setIsEditing(false);
//     setSelectedFiles([]);
//     previewUrls.forEach(url => URL.revokeObjectURL(url));
//     setPreviewUrls([]);
//     setError('');
//     setSuccess('');
//   };

//   if (loading) {
//     return (
//       <div className="bg-white rounded-lg shadow-md p-6">
//         <div className="flex items-center justify-center py-8">
//           <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
//           <span className="ml-2 text-gray-600">Loading media...</span>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <>
//       <div className="bg-white rounded-lg shadow-md p-6">
//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
//           <div className="flex items-center mb-4 sm:mb-0">
//             <Camera className="h-6 w-6 text-blue-600 mr-3" />
//             <div>
//               <span className='flex'>
//                 <h2 className="text-xl font-semibold text-gray-900">Experience & Media</h2>
//                 <SectionHeaderWithTooltip priority='high' />
//               </span>
//               <p className="text-sm text-gray-600">
//                 Upload photos from your past events ({mediaItems.length}/2 photos)
//               </p>
//             </div>
//           </div>

//           <div className="flex flex-col sm:flex-row gap-2">
//             {!isEditing ? (
//               <button
//                 onClick={handleEdit}
//                 className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 <Edit3 className="h-4 w-4 mr-2" />
//                 Edit
//               </button>
//             ) : (
//               <>
//                 <button
//                   onClick={handleSave}
//                   disabled={isUploading}
//                   className="flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
//                 >
//                   <Save className="h-4 w-4 mr-2" />
//                   {isUploading ? 'Uploading...' : 'Save'}
//                 </button>
//                 <button
//                   onClick={handleCancel}
//                   className="flex items-center justify-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
//                 >
//                   Cancel
//                 </button>
//               </>
//             )}
//           </div>
//         </div>

//         {/* Cover Image Section */}
//         {coverImage && (
//           <div className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-200">
//             <div className="flex items-center mb-3">
//               <Star className="h-5 w-5 text-yellow-500 mr-2" />
//               <h3 className="text-lg font-medium text-gray-900">Current Cover Image</h3>
//             </div>
//             <div className="flex items-center gap-4">
//               <img
//                 src={`http://localhost:5000/uploads/vendor/experience/${coverImage.filename}`}
//                 alt={coverImage.originalName}
//                 className="w-20 h-20 object-cover rounded-lg shadow-sm"
//               />
//               <div className="flex-1">
//                 <p className="font-medium text-gray-900">{coverImage.originalName}</p>
//                 <p className="text-sm text-gray-600">This image will be displayed as your profile cover</p>
//               </div>
//               {isEditing && (
//                 <button
//                   onClick={handleRemoveCoverImage}
//                   className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
//                 >
//                   Remove Cover
//                 </button>
//               )}
//             </div>
//           </div>
//         )}

//         {/* Error/Success Messages */}
//         {error && (
//           <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
//             <AlertCircle className="h-5 w-5 text-red-500 mr-3 mt-0.5 flex-shrink-0" />
//             <div className="text-red-700 text-sm whitespace-pre-line">{error}</div>
//           </div>
//         )}

//         {success && (
//           <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
//             <Check className="h-5 w-5 text-green-500 mr-3" />
//             <div className="text-green-700 text-sm">{success}</div>
//           </div>
//         )}

//         {/* Upload Section - Only visible when editing */}
//         {isEditing && (
//           <div className="mb-6 p-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
//             <div className="text-center">
//               <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//               <label htmlFor="file-upload" className="cursor-pointer">
//                 <span className="mt-2 block text-sm font-medium text-gray-900">
//                   Upload event photos
//                 </span>
//                 <span className="mt-1 block text-xs text-gray-500">
//                   PNG, JPG, GIF up to 5MB each (Max {2 - mediaItems.length} more photos)
//                 </span>
//               </label>
//               <input
//                 id="file-upload"
//                 name="file-upload"
//                 type="file"
//                 className="sr-only"
//                 multiple
//                 accept="image/*"
//                 onChange={handleFileSelect}
//                 disabled={mediaItems.length >= 2}
//               />
//             </div>

//             {/* File Previews */}
//             {previewUrls.length > 0 && (
//               <div className="mt-4">
//                 <h4 className="text-sm font-medium text-gray-900 mb-2">
//                   Selected Files ({previewUrls.length})
//                 </h4>
//                 <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
//                   {previewUrls.map((url, index) => (
//                     <div key={index} className="relative">
//                       <img
//                         src={url}
//                         alt={`Preview ${index + 1}`}
//                         className="w-full h-20 object-cover rounded-lg"
//                       />
//                       <button
//                         onClick={() => {
//                           const newFiles = [...selectedFiles];
//                           const newUrls = [...previewUrls];
//                           URL.revokeObjectURL(newUrls[index]);
//                           newFiles.splice(index, 1);
//                           newUrls.splice(index, 1);
//                           setSelectedFiles(newFiles);
//                           setPreviewUrls(newUrls);
//                         }}
//                         className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
//                       >
//                         <X className="h-3 w-3" />
//                       </button>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         )}

//         {/* Existing Media Gallery */}
//         {mediaItems.length > 0 ? (
//           <div>
//             <h3 className="text-lg font-medium text-gray-900 mb-4">
//               Your Event Photos ({mediaItems.length})
//             </h3>
//             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
//               {mediaItems.map((item) => (
//                 <div key={item._id} className="relative group">
//                   <div className="relative">
//                     <img
//                       src={`http://localhost:5000/uploads/vendor/experience/${item.filename}`}
//                       alt={item.originalName}
//                       className={`w-full h-24 sm:h-32 object-cover rounded-lg shadow-sm hover:shadow-md transition-shadow ${item.isCoverImage ? 'ring-2 ring-yellow-400 ring-offset-2' : ''
//                         }`}
//                     />
//                     {item.isCoverImage && (
//                       <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full flex items-center">
//                         <Star className="h-3 w-3 mr-1" />
//                         Cover
//                       </div>
//                     )}
//                   </div>

//                   {isEditing && (
//                     <div className="absolute top-2 right-2 flex flex-col gap-1">
//                       <button
//                         onClick={() => handleDelete(item._id)}
//                         className="bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600 transition-colors shadow-lg"
//                       >
//                         <X className="h-4 w-4" />
//                       </button>
//                       {!item.isCoverImage && (
//                         <button
//                           onClick={() => handleSetCoverImage(item._id)}
//                           className="bg-yellow-500 text-white rounded-full p-1.5 hover:bg-yellow-600 transition-colors shadow-lg"
//                           title="Set as cover image"
//                         >
//                           <Star className="h-4 w-4" />
//                         </button>
//                       )}
//                     </div>
//                   )}

//                   <div className="mt-1">
//                     <p className="text-xs text-gray-500 truncate" title={item.originalName}>
//                       {item.originalName}
//                     </p>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         ) : (
//           <div className="text-center py-12">
//             <Camera className="mx-auto h-12 w-12 text-gray-400 mb-4" />
//             <h3 className="text-lg font-medium text-gray-900 mb-2">No photos uploaded yet</h3>
//             <p className="text-gray-500 mb-4">
//               Start building your portfolio by uploading photos from your past events.
//             </p>
//             {!isEditing && (
//               <button
//                 onClick={() => {
//                   handleEdit();
//                   ui.buttonClicked('first_upload_photos', 'experience_media');
//                 }}
//                 className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
//               >
//                 <Upload className="h-4 w-4 mr-2" />
//                 Upload Photos
//               </button>
//             )}
//           </div>
//         )}

//         {/* Upload Progress */}
//         {isUploading && (
//           <div className="mt-4">
//             <div className="bg-gray-200 rounded-full h-2">
//               <div
//                 className="bg-blue-600 h-2 rounded-full transition-all duration-300"
//                 style={{ width: `${uploadProgress}%` }}
//               ></div>
//             </div>
//             <p className="text-sm text-gray-600 mt-1 text-center">
//               Uploading... {uploadProgress}%
//             </p>
//           </div>
//         )}
//       </div>
//       {/* Experience Card */}
//       <ExperienceCard />
//     </>
//   );
// };

// export default ExperienceMedia;

"use client";
import React, { useState, useEffect } from 'react';
import { Camera, Upload, X, Edit3, Save, AlertCircle, Check, Star } from 'lucide-react';
import ExperienceCard from '../ExperienceCard';
import SectionHeaderWithTooltip from '../SectionHeaderWithTooltip';
import useAnalytics from '@/hooks/useAnalytics';

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

  // Mock token - replace with actual token from your auth context
  const token = localStorage.getItem('token');

  useEffect(() => {
    fetchProfile();
    services.tabViewed('experience_media');
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch('http://localhost:5000/api/vendor/experience', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setProfile(data.data);
        if (data.data?.experience) {
          setExperience(data.data.experience.toString());
        }
        console.log('Profile fetched:', data.data);
      } else {
        // Profile not found, this is okay for new vendors
        setProfile(null);
      }
    } catch (err) {
      setError('Error loading profile');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
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

  const handleUpload = async () => {
    if (!selectedFile && !experience.trim()) {
      setError('Please select an image or enter experience');
      return;
    }

    if (experience.trim()) {
      const experienceValue = parseFloat(experience);
      if (isNaN(experienceValue) || experienceValue < 0) {
        setError('Please enter a valid experience value');
        return;
      }
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      
      if (selectedFile) {
        formData.append('photo', selectedFile);
      }
      
      if (experience.trim()) {
        formData.append('experience', parseFloat(experience));
      }

      const response = await fetch('http://localhost:5000/api/vendor/experience/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        setSuccess('Profile updated successfully!');

        // Track media upload
        if (selectedFile) {
          services.mediaUploaded('experience_photo', 1);
        }

        // Clear selected file and preview
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl('');
        }

        // Refresh profile
        await fetchProfile();

        // Clear success message after 3 seconds
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Upload failed');
      }
    } catch (err) {
      setError('Error uploading profile');
      console.error('Upload error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateExperienceOnly = async () => {
    if (!experience.trim()) {
      setError('Please enter experience value');
      return;
    }

    const experienceValue = parseFloat(experience);
    if (isNaN(experienceValue) || experienceValue < 0) {
      setError('Please enter a valid experience value');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/vendor/experience', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ experience: experienceValue }),
      });

      if (response.ok) {
        setSuccess('Experience updated successfully!');
        await fetchProfile();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Update failed');
      }
    } catch (err) {
      setError('Error updating experience');
      console.error('Update error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleUpdateImageOnly = async () => {
    if (!selectedFile) {
      setError('Please select an image');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      const formData = new FormData();
      formData.append('photo', selectedFile);

      const response = await fetch('http://localhost:5000/api/vendor/experience/image', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        setSuccess('Profile image updated successfully!');
        services.mediaUploaded('experience_photo', 1);

        // Clear selected file and preview
        setSelectedFile(null);
        if (previewUrl) {
          URL.revokeObjectURL(previewUrl);
          setPreviewUrl('');
        }

        await fetchProfile();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Image update failed');
      }
    } catch (err) {
      setError('Error updating image');
      console.error('Image update error:', err);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDeleteImage = async () => {
    if (!window.confirm('Are you sure you want to delete your profile image?')) {
      return;
    }

    try {
      const response = await fetch('http://localhost:5000/api/vendor/experience/image', {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setSuccess('Profile image deleted successfully!');
        ui.buttonClicked('delete_photo', 'experience_media');
        await fetchProfile();
        setTimeout(() => setSuccess(''), 3000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Delete failed');
      }
    } catch (err) {
      setError('Error deleting image');
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
              <img
                src={profile.cloudinaryUrl}
                alt={profile.originalName}
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
                    <img
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
                value={experience}
                onChange={(e) => setExperience(e.target.value)}
                placeholder="Enter years of experience"
                min="0"
                step="0.5"
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                      <img
                        src={profile.cloudinaryUrl}
                        alt={profile.originalName}
                        className="w-full h-48 object-cover rounded-lg shadow-sm"
                      />
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
      {/* Experience Card */}
      {/* <ExperienceCard /> */}
    </>
  );
};

export default ExperienceMedia;