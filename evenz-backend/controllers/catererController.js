// File: controllers/catererController.js
const Vendor = require('../models/Vendor/Vendor');
const Menu = require('../models/Vendor/Menu');
const Services = require('../models/Vendor/Services');
const Legal = require('../models/Vendor/legal');
const Compliance = require('../models/Vendor/Compliance');
const Media = require('../models/Vendor/media');
const Customization = require('../models/Vendor/Customization');
const mongoose = require('mongoose');

const getCatererProfile = async (req, res) => {
  try {
    const { catererId } = req.params;

    // Validate if catererId is provided and is a valid ObjectId
    if (!catererId || catererId === 'undefined') {
      return res.status(400).json({
        success: false,
        message: 'Caterer ID is required'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(catererId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid caterer ID format'
      });
    }

     // Check if vendor exists AND is active
    const vendor = await Vendor.findOne({ 
      _id: catererId, 
      status: 'active' // Only active vendors
    });

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Caterer not found or not available'
      });
    }

    // Fetch all related data in parallel
    const [
      menu,
      services,
      legal,
      compliance,
      media,
      customization
    ] = await Promise.all([
      Menu.findOne({ vendor: catererId }),
      Services.findOne({ vendor: catererId }),
      Legal.findOne({ vendor: catererId }),
      Compliance.findOne({ vendorId: catererId }),
      Media.findVendorProfile(catererId),
      Customization.findOne({ vendor: catererId })
    ]);

    // Structure the response data
    const profileData = {
      // Basic vendor info
      vendorInfo: {
        id: vendor._id,
        businessName: vendor.businessName,
        ownerName: vendor.ownerName,
        email: vendor.email,
        mobile: vendor.mobile,
        address: {
          fullAddress: vendor.fullAddress,
          locality: vendor.locality,
          city: vendor.city,
          pinCode: vendor.pinCode
        },
        createdAt: vendor.createdAt
      },

      // Gallery & Media - FIXED experience logic
      gallery: {
        cloudinaryUrl: media ? media.cloudinaryUrl : null,
        experience: media ? media.experience : null,
        originalName: media ? media.originalName : null,
        mimetype: media ? media.mimetype : null,
        size: media ? media.size : null,
        uploadedAt: media ? media.uploadedAt : null
      },

      // Menu & Cuisines
      menu: menu ? {
        cuisines: menu.cuisines || [],
        packages: menu.packages ? Object.fromEntries(menu.packages) : {},
        totalPackages: menu.packages ? Array.from(menu.packages.values()).reduce((total, packages) => total + packages.length, 0) : 0,
        isActive: menu.isActive
      } : null,

      // Services & Logistics
      services: services ? {
        mealServiceTypes: services.mealServiceTypes || [],
        liveCounters: services.liveCounters || [],
        staffDetails: services.staffDetails || {},
        tableware: services.tableware,
        setupBreakdownProcess: services.setupBreakdownProcess,
        deliveryLogistics: services.deliveryLogistics,
        availableForEvents: services.availableForEvents,
        staffProvided: services.staffProvided,
        waterService: services.waterService
      } : null,

      // Legal & Payment Info
      legal: legal ? {
        gstRegistrationNumber: legal.gstRegistrationNumber,
        acceptedPaymentModes: legal.acceptedPaymentModes || [],
        bookingAdvance: legal.bookingAdvance,
        minGuests: legal.minGuests,
        maxGuests: legal.maxGuests,
        minimumNoticeDays: legal.minimumNoticeDays,
        cancellationRefundPolicy: legal.cancellationRefundPolicy,
        agreementContract: legal.agreementContract,
        certificates: legal.certificates || []
      } : null,

      // Compliance & Safety
      compliance: compliance ? {
        fssaiLicense: compliance.fssaiLicense,
        hygieneAudits: compliance.hygieneAudits,
        ingredientSourcing: compliance.ingredientSourcing,
        allergenHandling: compliance.allergenHandling,
        insurance: compliance.insurance
      } : null,

      // Customization & Tasting
      customization: customization ? {
        allowCustomization: customization.allowCustomization,
        customizationCharges: customization.customizationCharges,
        specialMenus: customization.specialMenus || [],
        dietaryFilters: customization.dietaryFilters || {},
        tastingSession: customization.tastingSession || {},
        activeDietaryFilters: customization.getActiveDietaryFilters ? customization.getActiveDietaryFilters() : [],
        hasDietaryFilters: customization.hasDietaryFilters || false
      } : null
    };

    res.status(200).json({
      success: true,
      data: profileData
    });

  } catch (error) {
    console.error('Error fetching caterer profile:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

// Get all caterers with basic info (for listing pages)
const getAllCaterers = async (req, res) => {
  try {
    const { page = 1, limit = 10, city, cuisine, minPrice, maxPrice } = req.query;

    let matchConditions = {
      status: 'active' // Only active vendors
    };

    // Filter by city if provided
    if (city) {
      matchConditions.city = new RegExp(city, 'i');
    }

    const vendors = await Vendor.find(matchConditions)
      .select('businessName ownerName city locality pinCode fullAddress')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    // Get additional data for each vendor
    const vendorIds = vendors.map(v => v._id);

    const [menus, media, legal] = await Promise.all([
      Menu.find({ vendor: { $in: vendorIds } }).select('vendor cuisines packages'),
      Media.find({ vendor: { $in: vendorIds }, isCoverImage: true }),
      Legal.find({ vendor: { $in: vendorIds } }).select('vendor minGuests maxGuests')
    ]);

    // Combine data
    const enrichedVendors = vendors.map(vendor => {
      const vendorMenu = menus.find(m => m.vendor.toString() === vendor._id.toString());
      const vendorMedia = media.find(m => m.vendor.toString() === vendor._id.toString());
      const vendorLegal = legal.find(l => l.vendor.toString() === vendor._id.toString());

      // Calculate price range from packages
      let minPrice = null, maxPrice = null;
      if (vendorMenu && vendorMenu.packages) {
        const allPackages = Array.from(vendorMenu.packages.values()).flat();
        if (allPackages.length > 0) {
          const prices = allPackages.map(pkg => pkg.pricePerPlate).filter(price => price && price > 0);
          if (prices.length > 0) {
            minPrice = Math.min(...prices);
            maxPrice = Math.max(...prices);
          }
        }
      }

      return {
        id: vendor._id,
        businessName: vendor.businessName,
        address: `${vendor.locality}, ${vendor.city}`,
        cuisines: vendorMenu ? (vendorMenu.cuisines || []) : [],
        coverImage: vendorMedia ? vendorMedia.path : null,
        priceRange: { min: minPrice, max: maxPrice },
        guestRange: {
          min: vendorLegal ? vendorLegal.minGuests : null,
          max: vendorLegal ? vendorLegal.maxGuests : null
        }
      };
    });

    const total = await Vendor.countDocuments(matchConditions);

    res.status(200).json({
      success: true,
      data: enrichedVendors,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / limit)
      }
    });

  } catch (error) {
    console.error('Error fetching caterers:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

const getProfileStatus = async (req, res) => {
  try {
    const catererId = req.vendor._id; // From JWT middleware

    // Check if vendor exists
    const vendor = await Vendor.findById(catererId);
    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Caterer not found'
      });
    }

    // Fetch all related data in parallel
    const [
      menu,
      services,
      legal,
      compliance,
      media,
      customization
    ] = await Promise.all([
      Menu.findOne({ vendor: catererId }),
      Services.findOne({ vendor: catererId }),
      Legal.findOne({ vendor: catererId }),
      Compliance.findOne({ vendorId: catererId }),
      Media.find({ vendor: catererId }),
      Customization.findOne({ vendor: catererId })
    ]);

    // Helper function to check if array/object has meaningful data
    const hasData = (data) => {
      if (!data) return false;
      if (Array.isArray(data)) return data.length > 0;
      if (typeof data === 'object') return Object.keys(data).length > 0;
      return Boolean(data);
    };

    // HIGH PRIORITY CHECKS

    // 1. Packages and Cuisines Saved
    const packagesAndCuisinesSaved =
      menu &&
      Array.isArray(menu.cuisines) &&
      menu.cuisines.length > 0 &&
      menu.packages instanceof Map &&
      menu.packages.size > 0 &&
      [...menu.packages.values()].some(
        (pkgArray) => Array.isArray(pkgArray) && pkgArray.length > 0
      );

    // 2. Min/Max Guests and Available for Events
    const minMaxGuestsAvailableForEventsFilled = legal &&
      legal.minGuests &&
      legal.maxGuests &&
      services &&
      hasData(services.availableForEvents);

    // 3. Cover Image Uploaded
    const coverImageUploaded = media &&
      media.some(m => m.isCoverImage === true);

    // MEDIUM PRIORITY CHECKS

    // 4. Live Counters and Service Types
    const liveCountersServiceTypesFilled = services &&
      hasData(services.liveCounters) &&
      hasData(services.mealServiceTypes);

    // 5. Staff Details and Tableware
    const staffDetailsTablewareFilled = services &&
      hasData(services.staffDetails) &&
      services.tableware !== undefined &&
      services.tableware !== null;

    // 6. Dietary Filters and Customization
    const dietaryFiltersCustomizationFilled = customization &&
      customization.allowCustomization !== undefined &&
      hasData(customization.dietaryFilters);

    // 7. Experience Information
    const experienceFilled = media &&
      media.some(m => m.experience !== undefined && m.experience !== null);

    // LOW PRIORITY CHECKS

    // 8. Legal Details
    const legalDetailsFilled = legal &&
      legal.gstRegistrationNumber &&
      hasData(legal.acceptedPaymentModes) &&
      legal.bookingAdvance !== undefined &&
      legal.minimumNoticeDays !== undefined;

    // 9. Compliance Details
    const complianceDetailsFilled = compliance &&
      compliance.fssaiLicense &&
      hasData(compliance.hygieneAudits) &&
      hasData(compliance.ingredientSourcing);

    // Construct response
    const profileStatus = {
      packagesAndCuisinesSaved,
      minMaxGuestsAvailableForEventsFilled,
      coverImageUploaded,
      liveCountersServiceTypesFilled,
      staffDetailsTablewareFilled,
      dietaryFiltersCustomizationFilled,
      experienceFilled,
      legalDetailsFilled,
      complianceDetailsFilled
    };

    // Add completion percentage for analytics
    const totalFields = Object.keys(profileStatus).length;
    const completedFields = Object.values(profileStatus).filter(Boolean).length;
    const completionPercentage = Math.round((completedFields / totalFields) * 100);

    res.status(200).json({
      success: true,
      profileStatus,
      completionPercentage,
      completedFields,
      totalFields
    });

  } catch (error) {
    console.error('Error fetching profile status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error',
      error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
  }
};

module.exports = {
  getCatererProfile,
  getAllCaterers,
  getProfileStatus
};