// File: routes/searchRoutes.js
const express = require('express');
const router = express.Router();
const Vendor = require('../../models/Vendor/Vendor');
const Menu = require('../../models/Vendor/Menu');
const Media = require('../../models/Vendor/media');

// @desc    Get all vendors with their menu data and cover images for search page
// @route   GET /api/search/vendors
// @access  Public
router.get('/vendors', async (req, res) => {
  try {
    const {
      query,
      area,
      minPrice,
      maxPrice,
      cuisineType,
      limit = 50,
      page = 1
    } = req.query;

    // Build search filters
    let vendorFilter = {};
    
    // Search by business name, locality, or city
    if (query) {
      vendorFilter.$or = [
        { businessName: { $regex: query, $options: 'i' } },
        { locality: { $regex: query, $options: 'i' } },
        { city: { $regex: query, $options: 'i' } }
      ];
    }

    // Filter by area (locality or city)
    if (area) {
      vendorFilter.$or = [
        { locality: { $regex: area, $options: 'i' } },
        { city: { $regex: area, $options: 'i' } }
      ];
    }

    // Get all vendors first
    const vendors = await Vendor.find(vendorFilter)
      .select('businessName ownerName locality city pinCode fullAddress createdAt')
      .lean();

    if (!vendors.length) {
      return res.status(200).json({
        success: true,
        data: [],
        pagination: {
          currentPage: parseInt(page),
          totalPages: 0,
          totalVendors: 0,
          hasNextPage: false,
          hasPrevPage: false
        }
      });
    }

    // Get vendor IDs
    const vendorIds = vendors.map(vendor => vendor._id);

    // Get menu data for all vendors
    const menus = await Menu.find({ 
      vendor: { $in: vendorIds },
      isActive: true 
    }).lean();

    // Get cover images for all vendors
    const coverImages = await Media.find({
      vendor: { $in: vendorIds },
      isCoverImage: true
    }).select('vendor filename').lean();

    // Create a map of vendor ID to menu data
    const menuMap = new Map();
    menus.forEach(menu => {
      menuMap.set(menu.vendor.toString(), menu);
    });

    // Create a map of vendor ID to cover image
    const coverImageMap = new Map();
    coverImages.forEach(image => {
      coverImageMap.set(image.vendor.toString(), image);
    });

    // Process vendors and combine with menu data and cover images
    let processedVendors = vendors.map(vendor => {
      const menu = menuMap.get(vendor._id.toString());
      const coverImage = coverImageMap.get(vendor._id.toString());
      
      let cuisines = [];
      let minPrice = null;
      let maxPrice = null;
      
      if (menu && menu.packages) {
        // Extract cuisines
        cuisines = menu.cuisines || [];
        
        // Calculate min and max prices from all packages
        const allPrices = [];
        
        // Convert packages Map to Object if needed
        const packagesObj = menu.packages instanceof Map ? 
          Object.fromEntries(menu.packages) : menu.packages;
        
        Object.values(packagesObj).forEach(cuisinePackages => {
          if (Array.isArray(cuisinePackages)) {
            cuisinePackages.forEach(pkg => {
              if (pkg.pricePerPlate && pkg.isActive !== false) {
                allPrices.push(pkg.pricePerPlate);
              }
            });
          }
        });
        
        if (allPrices.length > 0) {
          minPrice = Math.min(...allPrices);
          maxPrice = Math.max(...allPrices);
        }
      }

      return {
        id: vendor._id,
        businessName: vendor.businessName,
        ownerName: vendor.ownerName,
        location: `${vendor.locality}, ${vendor.city}`,
        locality: vendor.locality,
        city: vendor.city,
        pinCode: vendor.pinCode,
        fullAddress: vendor.fullAddress,
        cuisines: cuisines,
        minPrice: minPrice,
        maxPrice: maxPrice,
        hasMenu: !!menu,
        coverImage: coverImage ? {
          filename: coverImage.filename,
          url: `/uploads/vendor/experience/${coverImage.filename}`
        } : null,
        // Add default values for features not yet implemented
        rating: 0,
        reviewCount: 0,
        availableToday: true, // You can implement this logic later
        featured: false // You can implement featured logic later
      };
    });

    // Apply additional filters
    if (cuisineType) {
      processedVendors = processedVendors.filter(vendor => 
        vendor.cuisines.some(cuisine => 
          cuisine.toLowerCase().includes(cuisineType.toLowerCase())
        )
      );
    }

    if (minPrice || maxPrice) {
      processedVendors = processedVendors.filter(vendor => {
        if (!vendor.minPrice) return false;
        
        const meetMinPrice = !minPrice || vendor.minPrice >= parseInt(minPrice);
        const meetMaxPrice = !maxPrice || vendor.maxPrice <= parseInt(maxPrice);
        
        return meetMinPrice && meetMaxPrice;
      });
    }

    // Pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + parseInt(limit);
    const paginatedVendors = processedVendors.slice(startIndex, endIndex);

    res.status(200).json({
      success: true,
      data: paginatedVendors,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(processedVendors.length / limit),
        totalVendors: processedVendors.length,
        hasNextPage: endIndex < processedVendors.length,
        hasPrevPage: startIndex > 0
      }
    });

  } catch (error) {
    console.error('Search vendors error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendors',
      error: error.message
    });
  }
});

// @desc    Get all unique cuisines from all vendors
// @route   GET /api/search/cuisines
// @access  Public
router.get('/cuisines', async (req, res) => {
  try {
    const menus = await Menu.find({ isActive: true })
      .select('cuisines')
      .lean();

    const allCuisines = new Set();
    menus.forEach(menu => {
      if (menu.cuisines) {
        menu.cuisines.forEach(cuisine => allCuisines.add(cuisine));
      }
    });

    const uniqueCuisines = Array.from(allCuisines).sort();

    res.status(200).json({
      success: true,
      data: uniqueCuisines
    });

  } catch (error) {
    console.error('Get cuisines error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch cuisines',
      error: error.message
    });
  }
});

// @desc    Get vendor details by ID for search page
// @route   GET /api/search/vendor/:id
// @access  Public
router.get('/vendor/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const vendor = await Vendor.findById(id)
      .select('businessName ownerName locality city pinCode fullAddress')
      .lean();

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found'
      });
    }

    const menu = await Menu.findOne({ vendor: id, isActive: true }).lean();
    const coverImage = await Media.findOne({ vendor: id, isCoverImage: true })
      .select('filename').lean();

    let cuisines = [];
    let minPrice = null;
    let maxPrice = null;
    let packages = [];
    
    if (menu && menu.packages) {
      cuisines = menu.cuisines || [];
      
      // Process packages
      const packagesObj = menu.packages instanceof Map ? 
        Object.fromEntries(menu.packages) : menu.packages;
      
      const allPrices = [];
      
      Object.entries(packagesObj).forEach(([cuisine, cuisinePackages]) => {
        if (Array.isArray(cuisinePackages)) {
          cuisinePackages.forEach(pkg => {
            if (pkg.pricePerPlate && pkg.isActive !== false) {
              allPrices.push(pkg.pricePerPlate);
              packages.push({
                ...pkg,
                cuisine: cuisine
              });
            }
          });
        }
      });
      
      if (allPrices.length > 0) {
        minPrice = Math.min(...allPrices);
        maxPrice = Math.max(...allPrices);
      }
    }

    const vendorDetails = {
      id: vendor._id,
      businessName: vendor.businessName,
      ownerName: vendor.ownerName,
      location: `${vendor.locality}, ${vendor.city}`,
      locality: vendor.locality,
      city: vendor.city,
      pinCode: vendor.pinCode,
      fullAddress: vendor.fullAddress,
      cuisines: cuisines,
      minPrice: minPrice,
      maxPrice: maxPrice,
      packages: packages,
      hasMenu: !!menu,
      coverImage: coverImage ? {
        filename: coverImage.filename,
        url: `/api/vendor/experience/image/${coverImage.filename}`
      } : null,
      rating: 0,
      reviewCount: 0,
      availableToday: true
    };

    res.status(200).json({
      success: true,
      data: vendorDetails
    });

  } catch (error) {
    console.error('Get vendor details error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch vendor details',
      error: error.message
    });
  }
});

module.exports = router;