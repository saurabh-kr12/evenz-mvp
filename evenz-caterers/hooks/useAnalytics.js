// hooks/useAnalytics.js
import { useCallback } from 'react';
import { event } from '@/lib/gtag';

const useAnalytics = () => {
   const trackEvent = useCallback((eventData) => {
      const { action, category, label, value, customParameters = {} } = eventData;

      // Track with Google Analytics
      event({
         action,
         category,
         label,
         value,
         ...customParameters
      });

   }, []);

   // Registration specific events
   const registration = {
      stepStarted: (stepNumber, stepName) => {
         trackEvent({
            action: 'step_started',
            category: 'registration',
            label: `Step ${stepNumber}: ${stepName}`,
            value: stepNumber
         });
      },

      stepCompleted: (stepNumber, stepName) => {
         trackEvent({
            action: 'step_completed',
            category: 'registration',
            label: `Step ${stepNumber}: ${stepName}`,
            value: stepNumber
         });
      },

      otpSent: (type) => {
         trackEvent({
            action: 'otp_sent',
            category: 'registration',
            label: `${type}_otp`,
            customParameters: {
               otp_type: type
            }
         });
      },

      otpResent: (type) => {
         trackEvent({
            action: 'otp_resent',
            category: 'registration',
            label: `${type}_otp_resent`,
            customParameters: {
               otp_type: type
            }
         });
      },

      otpVerified: (type) => {
         trackEvent({
            action: 'otp_verified',
            category: 'registration',
            label: `${type}_otp_verified`,
            customParameters: {
               otp_type: type
            }
         });
      },

      registrationCompleted: (city, state) => {
         trackEvent({
            action: 'registration_completed',
            category: 'registration',
            label: 'successful_registration',
            customParameters: {
               user_city: city,
               user_state: state,
               registration_flow: 'vendor'
            }
         });
      },

      registrationAbandoned: (stepNumber, stepName) => {
         trackEvent({
            action: 'registration_abandoned',
            category: 'registration',
            label: `abandoned_at_step_${stepNumber}`,
            value: stepNumber,
            customParameters: {
               step_name: stepName
            }
         });
      },

      termsAccepted: () => {
         trackEvent({
            action: 'terms_accepted',
            category: 'registration',
            label: 'terms_and_conditions_accepted'
         });
      },

      locationSelected: (state, city) => {
         trackEvent({
            action: 'location_selected',
            category: 'registration',
            label: `${state}_${city}`,
            customParameters: {
               selected_state: state,
               selected_city: city
            }
         });
      },

      patnaMessageShown: () => {
         trackEvent({
            action: 'patna_message_shown',
            category: 'registration',
            label: 'non_patna_city_selected'
         });
      }
   };

   // Login specific events
   const login = {
      loginAttempt: () => {
         trackEvent({
            action: 'login_attempt',
            category: 'authentication',
            label: 'login_button_clicked'
         });
      },

      loginSuccess: () => {
         trackEvent({
            action: 'login_success',
            category: 'authentication',
            label: 'successful_login'
         });
      },

      loginFailed: (reason) => {
         trackEvent({
            action: 'login_failed',
            category: 'authentication',
            label: reason || 'login_error'
         });
      },

      forgotPassword: () => {
         trackEvent({
            action: 'forgot_password',
            category: 'authentication',
            label: 'forgot_password_clicked'
         });
      }
   };

   // Dashboard/Service specific events
   const dashboard = {
      pageViewed: (pageName) => {
         trackEvent({
            action: 'page_viewed',
            category: 'dashboard',
            label: pageName
         });
      },

      serviceUpdated: (serviceType) => {
         trackEvent({
            action: 'service_updated',
            category: 'services',
            label: serviceType
         });
      },

      profileCompleted: () => {
         trackEvent({
            action: 'profile_completed',
            category: 'onboarding',
            label: 'vendor_profile_completed'
         });
      },

      profileCompletionAction: (priority, destination) => {
         trackEvent({
            action: 'profile_completion_action',
            category: 'profile_management',
            label: `${priority}_priority_to_${destination.replace('/', '').replace('?', '_')}`,
            customParameters: {
               completion_priority: priority,
               destination_page: destination
            }
         });
      },

      profileCompletionCardViewed: (priority) => {
         trackEvent({
            action: 'profile_completion_card_viewed',
            category: 'profile_management',
            label: `${priority}_priority_card_shown`,
            customParameters: {
               completion_priority: priority
            }
         });
      },

      profileFieldUpdated: (fieldName) => {
         trackEvent({
            action: 'profile_field_updated',
            category: 'profile_management',
            label: `${fieldName}_field_updated`,
            customParameters: {
               field_name: fieldName,
               update_type: fieldName.includes('verified') ? 'verification' : 'edit'
            }
         });
      }
   };

   // Bookings specific events
   const bookings = {
      unlockAttempt: (bookingId) => {
         trackEvent({
            action: 'unlock_attempt',
            category: 'bookings',
            label: 'booking_unlock_requested',
            customParameters: {
               booking_id: bookingId
            }
         });
      },

      unlockSuccess: (unlockType, bookingId) => {
         trackEvent({
            action: 'unlock_success',
            category: 'bookings',
            label: `${unlockType}_unlock_completed`,
            customParameters: {
               unlock_type: unlockType,
               booking_id: bookingId
            }
         });
      },

      unlockFailed: (bookingId, reason) => {
         trackEvent({
            action: 'unlock_failed',
            category: 'bookings',
            label: `unlock_failed_${reason}`,
            customParameters: {
               booking_id: bookingId,
               failure_reason: reason
            }
         });
      },

      paymentInitiated: (bookingId, amount) => {
         trackEvent({
            action: 'payment_initiated',
            category: 'bookings_payment',
            label: 'razorpay_payment_started',
            value: amount,
            customParameters: {
               booking_id: bookingId,
               payment_amount: amount
            }
         });
      },

      paymentSuccess: (bookingId, paymentId) => {
         trackEvent({
            action: 'payment_success',
            category: 'bookings_payment',
            label: 'razorpay_payment_completed',
            customParameters: {
               booking_id: bookingId,
               payment_id: paymentId
            }
         });
      },

      paymentFailed: (bookingId, reason) => {
         trackEvent({
            action: 'payment_failed',
            category: 'bookings_payment',
            label: `payment_failed_${reason}`,
            customParameters: {
               booking_id: bookingId,
               failure_reason: reason
            }
         });
      },

      paymentCancelled: (bookingId) => {
         trackEvent({
            action: 'payment_cancelled',
            category: 'bookings_payment',
            label: 'user_cancelled_payment',
            customParameters: {
               booking_id: bookingId
            }
         });
      },

      statusUpdated: (bookingId, newStatus, oldStatus) => {
         trackEvent({
            action: 'status_updated',
            category: 'bookings',
            label: `status_changed_to_${newStatus.toLowerCase()}`,
            customParameters: {
               booking_id: bookingId,
               new_status: newStatus,
               old_status: oldStatus || 'unlocked'
            }
         });
      },

      statusUpdateFailed: (bookingId, intendedStatus, reason) => {
         trackEvent({
            action: 'status_update_failed',
            category: 'bookings',
            label: `status_update_failed_${reason}`,
            customParameters: {
               booking_id: bookingId,
               intended_status: intendedStatus,
               failure_reason: reason
            }
         });
      },

      clientContactClicked: (contactType, bookingId) => {
         trackEvent({
            action: 'client_contact_clicked',
            category: 'bookings',
            label: `${contactType}_contact_initiated`,
            customParameters: {
               contact_type: contactType,
               booking_id: bookingId
            }
         });
      },

      tabSwitched: (fromTab, toTab) => {
         trackEvent({
            action: 'tab_switched',
            category: 'bookings',
            label: `switched_from_${fromTab}_to_${toTab}`,
            customParameters: {
               from_tab: fromTab,
               to_tab: toTab
            }
         });
      }
   };

   // Services specific events
   const services = {
      // Tab navigation and time tracking
      tabViewed: (tabName) => {
         trackEvent({
            action: 'tab_viewed',
            category: 'services_management',
            label: `${tabName}_tab_opened`,
            customParameters: {
               tab_name: tabName,
               timestamp: new Date().toISOString()
            }
         });
      },

      tabSwitched: (fromTab, toTab) => {
         trackEvent({
            action: 'tab_switched',
            category: 'services_management',
            label: `switched_from_${fromTab}_to_${toTab}`,
            customParameters: {
               from_tab: fromTab,
               to_tab: toTab
            }
         });
      },

      tabTimeSpent: (tabName, timeInSeconds) => {
         trackEvent({
            action: 'tab_time_spent',
            category: 'services_management',
            label: `${tabName}_tab_engagement`,
            value: timeInSeconds,
            customParameters: {
               tab_name: tabName,
               time_spent_seconds: timeInSeconds,
               engagement_level: timeInSeconds > 60 ? 'high' : timeInSeconds > 20 ? 'medium' : 'low'
            }
         });
      },

      // Section completion tracking
      sectionCompleted: (tabName, sectionName, itemsAdded = 0) => {
         trackEvent({
            action: 'section_completed',
            category: 'services_management',
            label: `${tabName}_${sectionName}_completed`,
            value: itemsAdded,
            customParameters: {
               tab_name: tabName,
               section_name: sectionName,
               items_added: itemsAdded
            }
         });
      },

      sectionUpdated: (tabName, sectionName, updateType = 'edit') => {
         trackEvent({
            action: 'section_updated',
            category: 'services_management',
            label: `${tabName}_${sectionName}_${updateType}`,
            customParameters: {
               tab_name: tabName,
               section_name: sectionName,
               update_type: updateType
            }
         });
      },

      // Specific service actions
      menuItemAdded: (itemType, tabName) => {
         trackEvent({
            action: 'menu_item_added',
            category: 'services_content',
            label: `${itemType}_added_in_${tabName}`,
            customParameters: {
               item_type: itemType,
               tab_name: tabName
            }
         });
      },

      packageCreated: (packageType, pricePerPlate) => {
         trackEvent({
            action: 'package_created',
            category: 'services_content',
            label: `${packageType}_package_created`,
            value: pricePerPlate,
            customParameters: {
               package_type: packageType,
               price_per_plate: pricePerPlate
            }
         });
      },

      cuisineSelected: (cuisineName, tabName) => {
         trackEvent({
            action: 'cuisine_selected',
            category: 'services_content',
            label: `${cuisineName}_cuisine_selected`,
            customParameters: {
               cuisine_name: cuisineName,
               tab_name: tabName
            }
         });
      },

      counterAdded: (counterType, counterName) => {
         trackEvent({
            action: 'counter_added',
            category: 'services_content',
            label: `${counterType}_counter_added`,
            customParameters: {
               counter_type: counterType,
               counter_name: counterName
            }
         });
      },

      guestLimitSet: (minGuests, maxGuests) => {
         trackEvent({
            action: 'guest_limit_set',
            category: 'services_content',
            label: 'guest_capacity_configured',
            customParameters: {
               min_guests: minGuests,
               max_guests: maxGuests,
               capacity_range: `${minGuests}-${maxGuests}`
            }
         });
      },

      dietFilterEnabled: (filterType) => {
         trackEvent({
            action: 'diet_filter_enabled',
            category: 'services_content',
            label: `${filterType}_filter_enabled`,
            customParameters: {
               filter_type: filterType
            }
         });
      },

      mediaUploaded: (mediaType, mediaCount = 1) => {
         trackEvent({
            action: 'media_uploaded',
            category: 'services_content',
            label: `${mediaType}_uploaded`,
            value: mediaCount,
            customParameters: {
               media_type: mediaType,
               media_count: mediaCount
            }
         });
      },

      legalInfoCompleted: (infoType) => {
         trackEvent({
            action: 'legal_info_completed',
            category: 'services_compliance',
            label: `${infoType}_info_completed`,
            customParameters: {
               info_type: infoType
            }
         });
      },

      complianceDocUploaded: (docType) => {
         trackEvent({
            action: 'compliance_doc_uploaded',
            category: 'services_compliance',
            label: `${docType}_document_uploaded`,
            customParameters: {
               document_type: docType
            }
         });
      },

      // Form validation and errors
      validationError: (tabName, fieldName, errorType) => {
         trackEvent({
            action: 'validation_error',
            category: 'services_errors',
            label: `${tabName}_${fieldName}_validation_failed`,
            customParameters: {
               tab_name: tabName,
               field_name: fieldName,
               error_type: errorType
            }
         });
      },

      complianceInfoCompleted: (complianceType) => {
         trackEvent({
            action: 'compliance_info_completed',
            category: 'services_compliance',
            label: `${complianceType}_info_completed`,
            customParameters: {
               compliance_type: complianceType
            }
         });
      },

      insuranceCoverageToggled: (enabled) => {
         trackEvent({
            action: 'insurance_coverage_toggled',
            category: 'services_compliance',
            label: `insurance_${enabled ? 'enabled' : 'disabled'}`,
            customParameters: {
               insurance_enabled: enabled
            }
         });
      },

      // Save/Submit actions
      dataSaved: (tabName, dataType, isComplete = false) => {
         trackEvent({
            action: 'data_saved',
            category: 'services_management',
            label: `${tabName}_${dataType}_saved`,
            customParameters: {
               tab_name: tabName,
               data_type: dataType,
               is_complete: isComplete,
               save_status: isComplete ? 'complete' : 'partial'
            }
         });
      }


   };
   // Calendar specific events
   const calendar = {
      eventBooked: (eventType, eventDate) => {
         trackEvent({
            action: 'event_booked',
            category: 'bookings',
            label: eventType,
            customParameters: {
               event_date: eventDate
            }
         });
      },

      availabilityUpdated: () => {
         trackEvent({
            action: 'availability_updated',
            category: 'calendar',
            label: 'vendor_availability_set'
         });
      },

      // Add these methods to the existing calendar object:
      availabilityStatusChanged: (status) => {
         trackEvent({
            action: 'availability_status_changed',
            category: 'calendar',
            label: `status_changed_to_${status}`,
            customParameters: {
               new_status: status
            }
         });
      },

      bulkAvailabilityUpdated: (datesCount, action) => {
         trackEvent({
            action: 'bulk_availability_updated',
            category: 'calendar',
            label: `bulk_${action}_update`,
            value: datesCount,
            customParameters: {
               dates_updated: datesCount,
               bulk_action: action
            }
         });
      },

      singleDateAvailabilityUpdated: (status) => {
         trackEvent({
            action: 'single_date_availability_updated',
            category: 'calendar',
            label: `single_date_${status}`,
            customParameters: {
               availability_status: status
            }
         });
      },

      pageViewed: (pageName) => {
         trackEvent({
            action: 'page_viewed',
            category: 'calendar',
            label: pageName
         });
      }
   };

   // General UI interactions
   const ui = {
      buttonClicked: (buttonName, context) => {
         trackEvent({
            action: 'button_clicked',
            category: 'ui_interaction',
            label: buttonName,
            customParameters: {
               context: context
            }
         });
      },

      modalOpened: (modalName) => {
         trackEvent({
            action: 'modal_opened',
            category: 'ui_interaction',
            label: modalName
         });
      },

      modalClosed: (modalName) => {
         trackEvent({
            action: 'modal_closed',
            category: 'ui_interaction',
            label: modalName
         });
      }
   };

   return {
      trackEvent,
      registration,
      login,
      dashboard,
      bookings,
      services,
      calendar,
      ui
   };
};

export default useAnalytics;