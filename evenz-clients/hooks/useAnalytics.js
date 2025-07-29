// hooks/useAnalytics.js
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import * as gtag from '@/lib/gtag';

const useAnalytics = () => {
  const router = useRouter();

  // Track page views on route changes
  useEffect(() => {
    const handleRouteChange = (url) => {
      gtag.pageview(url);
    };

    // Listen for route changes
    router.events?.on('routeChangeComplete', handleRouteChange);
    
    // Cleanup
    return () => {
      router.events?.off('routeChangeComplete', handleRouteChange);
    };
  }, [router]);

  // Predefined tracking functions for common events
  const analytics = {
    // Page tracking
    trackPageView: (pageName, category = 'page_view') => {
      gtag.event({
        action: 'page_view',
        category: category,
        label: `${pageName}_loaded`
      });
    },

    // Form interactions
    trackFormStart: (formName) => {
      gtag.event({
        action: 'form_start',
        category: 'form_interaction',
        label: `${formName}_started`
      });
    },

    trackFormSubmit: (formName, success = true) => {
      gtag.event({
        action: success ? 'form_submit_success' : 'form_submit_failed',
        category: 'form_interaction',
        label: `${formName}_${success ? 'success' : 'error'}`
      });
    },

    trackFormFieldFocus: (formName, fieldName) => {
      gtag.event({
        action: 'form_field_focus',
        category: 'form_interaction',
        label: `${formName}_${fieldName}_focused`
      });
    },

    // Button clicks
    trackButtonClick: (buttonName, category = 'button_click') => {
      gtag.event({
        action: 'button_click',
        category: category,
        label: buttonName
      });
    },

    // Link clicks
    trackLinkClick: (linkName, destination, category = 'link_click') => {
      gtag.event({
        action: 'link_click',
        category: category,
        label: `${linkName}_to_${destination}`
      });
    },

    // Search events
    trackSearch: (query, resultsCount = 0, category = 'search') => {
      gtag.event({
        action: 'search_performed',
        category: category,
        label: query,
        value: resultsCount
      });
    },

    // Authentication events
    trackAuth: (action, success = true, method = 'email') => {
      gtag.event({
        action: success ? `${action}_success` : `${action}_failed`,
        category: 'authentication',
        label: `${method}_${action}_${success ? 'success' : 'error'}`
      });
    },

    // Booking/Purchase events
    trackBooking: (action, vendorType = '', value = 0) => {
      gtag.event({
        action: action,
        category: 'booking',
        label: vendorType,
        value: value
      });
    },

    // Error tracking
    trackError: (errorType, errorMessage, page) => {
      gtag.event({
        action: 'error_occurred',
        category: 'error',
        label: `${page}_${errorType}_${errorMessage}`
      });
    },

    // Custom events
    trackCustomEvent: (action, category, label, value = 0) => {
      gtag.event({
        action: action,
        category: category,
        label: label,
        value: value
      });
    },

    // Conversion tracking
    trackConversion: (eventName, value = 0) => {
      gtag.event({
        action: eventName,
        category: 'conversion',
        label: 'goal_completed',
        value: value
      });
    }
  };

  return analytics;
};

export default useAnalytics;