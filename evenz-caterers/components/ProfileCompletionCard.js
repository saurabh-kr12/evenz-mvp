import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  AlertCircle,
  TrendingUp,
  Shield,
  CheckCircle,
  ArrowRight,
  Eye,
  Loader2
} from 'lucide-react';
import useAnalytics from '@/hooks/useAnalytics';

const ProfileCompletionCard = () => {
  const router = useRouter();
  const { dashboard, ui } = useAnalytics();
  const [profileStatus, setProfileStatus] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Get auth token from localStorage
  const authToken = localStorage.getItem('token');

  useEffect(() => {
    fetchProfileStatus();
  }, []);

  useEffect(() => {
    if (profileStatus && !loading) {
      const completionStatus = getCompletionStatus();
      if (completionStatus) {
        dashboard.profileCompletionCardViewed(completionStatus.priority);
      }
    }
  }, [profileStatus, loading, dashboard]);
  
  const fetchProfileStatus = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('http://localhost:5000/api/caterers-details/profile-status', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch profile status');
      }

      const result = await response.json();
      setProfileStatus(result.profileStatus);
    } catch (err) {
      setError(err.message);
      console.error('Profile status fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const getCompletionStatus = () => {
    if (!profileStatus) return null;

    const {
      packagesAndCuisinesSaved,
      minMaxGuestsAvailableForEventsFilled,
      coverImageUploaded,
      liveCountersServiceTypesFilled,
      staffDetailsTablewareFilled,
      dietaryFiltersCustomizationFilled,
      experienceFilled,
      legalDetailsFilled,
      complianceDetailsFilled
    } = profileStatus;

    // High Priority: Profile not live
    if (!packagesAndCuisinesSaved || (!minMaxGuestsAvailableForEventsFilled && !coverImageUploaded)) {
      return {
        priority: 'high',
        title: 'Action Required: Go Live!',
        message: 'Your profile is currently hidden from clients. To start receiving leads, please add at least one Package and define your Cuisines in the "Menu & Cuisines" and "Services & Logistics" sections.',
        buttonText: 'Go to Menu & Cuisines',
        buttonLink: '/services?tab=menu',
        bgColor: 'bg-amber-50',
        borderColor: 'border-amber-200',
        textColor: 'text-amber-800',
        iconColor: 'text-amber-600',
        buttonColor: 'bg-amber-600 hover:bg-amber-700',
        icon: AlertCircle
      };
    }

    // Medium Priority: Profile live but incomplete
    if (!liveCountersServiceTypesFilled || !experienceFilled) {
      return {
        priority: 'medium',
        title: 'Boost Your Leads!',
        message: 'Your profile is live, but completing essential details like Min/Max Guests, Serving Style, and adding a Cover Image will significantly improve your visibility and attract more relevant clients.',
        buttonText: 'Complete Your Profile Details',
        buttonLink: '/services?tab=services',
        bgColor: 'bg-blue-50',
        borderColor: 'border-blue-200',
        textColor: 'text-blue-800',
        iconColor: 'text-blue-600',
        buttonColor: 'bg-blue-600 hover:bg-blue-700',
        icon: TrendingUp
      };
    }

    // Low Priority: Legal/Compliance incomplete
    if (!legalDetailsFilled || !complianceDetailsFilled) {
      return {
        priority: 'low',
        title: 'Build Client Trust!',
        message: 'Enhance your professional image and build greater client confidence by completing your Legal, Payment, Compliance, and Safety information.',
        buttonText: 'Go to Legal & Payment',
        buttonLink: '/services?tab=legal',
        bgColor: 'bg-green-50',
        borderColor: 'border-green-200',
        textColor: 'text-green-800',
        iconColor: 'text-green-600',
        buttonColor: 'bg-green-600 hover:bg-green-700',
        icon: Shield
      };
    }

    // Profile Complete
    return {
      priority: 'complete',
      title: 'Fantastic! Your profile is 100% complete and optimized for leads!',
      message: 'Keep your services updated to stay ahead.',
      buttonText: 'View Public Profile',
      buttonLink: '/public-profile',
      bgColor: 'bg-emerald-50',
      borderColor: 'border-emerald-200',
      textColor: 'text-emerald-800',
      iconColor: 'text-emerald-600',
      buttonColor: 'bg-emerald-600 hover:bg-emerald-700',
      icon: CheckCircle
    };
  };

  const handleNavigation = (link) => {
    const completionStatus = getCompletionStatus();

    // Track profile completion card clicks with priority and destination
    ui.buttonClicked(`profile_completion_${completionStatus.priority}`, 'dashboard');
    dashboard.profileCompletionAction(completionStatus.priority, link);

    router.push(link);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <div className="flex items-center justify-center space-x-3">
          <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
          <span className="text-gray-600">Loading profile status...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-6">
        <div className="flex items-center space-x-3">
          <AlertCircle className="w-6 h-6 text-red-600" />
          <div>
            <h3 className="font-semibold text-red-800">Error Loading Profile Status</h3>
            <p className="text-sm text-red-600 mt-1">{error}</p>
          </div>
        </div>
        <button
          onClick={() => {
            ui.buttonClicked('profile_status_retry', 'dashboard');
            fetchProfileStatus();
          }}
          className="mt-4 bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors text-sm"
        >
          Try Again
        </button>
      </div>
    );
  }

  const completionStatus = getCompletionStatus();

  if (!completionStatus) {
    return null;
  }

  const Icon = completionStatus.icon;

  return (
    <div className={`${completionStatus.bgColor} border ${completionStatus.borderColor} rounded-lg p-6 mb-6`}>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex-1">
          <div className="flex items-center space-x-3 mb-3">
            <div className={`p-2 rounded-lg ${completionStatus.bgColor}`}>
              <Icon className={`w-6 h-6 ${completionStatus.iconColor}`} />
            </div>
            <h2 className={`text-lg font-semibold ${completionStatus.textColor}`}>
              {completionStatus.title}
            </h2>
          </div>

          <p className={`text-sm ${completionStatus.textColor} leading-relaxed mb-4`}>
            {completionStatus.message}
          </p>

          {/* Progress indicators for high/medium priority */}
          {completionStatus.priority !== 'complete' && (
            <div className="mt-4">
              <div className="flex items-center space-x-2 text-xs">
                <div className={`w-2 h-2 rounded-full ${completionStatus.priority === 'high' ? 'bg-amber-500' :
                  completionStatus.priority === 'medium' ? 'bg-blue-500' : 'bg-green-500'
                  }`}></div>
                <span className={`${completionStatus.textColor} font-medium`}>
                  {completionStatus.priority === 'high' ? 'Critical' :
                    completionStatus.priority === 'medium' ? 'Important' : 'Optional'}
                </span>
                <span className={`${completionStatus.textColor} opacity-75`}>
                  • Complete to improve lead generation
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex-shrink-0">
          <button
            onClick={() => handleNavigation(completionStatus.buttonLink)}
            className={`${completionStatus.buttonColor} text-white px-6 py-3 rounded-md transition-colors flex items-center space-x-2 font-medium shadow-sm hover:shadow-md`}
          >
            <span>{completionStatus.buttonText}</span>
            {completionStatus.priority === 'complete' ? (
              <Eye className="w-4 h-4" />
            ) : (
              <ArrowRight className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Additional context for different priorities */}
      {completionStatus.priority === 'high' && (
        <div className="mt-4 p-3 bg-amber-100 rounded-md">
          <p className="text-xs text-amber-700">
            💡 <strong>Tip:</strong> Profiles with packages and cuisines get 3x more leads than incomplete profiles.
          </p>
        </div>
      )}

      {completionStatus.priority === 'medium' && (
        <div className="mt-4 p-3 bg-blue-100 rounded-md">
          <p className="text-xs text-blue-700">
            💡 <strong>Tip:</strong> Complete profiles with images and detailed services rank higher in search results.
          </p>
        </div>
      )}

      {completionStatus.priority === 'complete' && (
        <div className="mt-4 p-3 bg-emerald-100 rounded-md">
          <p className="text-xs text-emerald-700">
            🎉 <strong>Well done!</strong> Your profile is fully optimized. Keep your availability calendar updated for best results.
          </p>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletionCard;