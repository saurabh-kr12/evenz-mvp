const express = require('express');
const router = express.Router();
const { body, query, param, validationResult } = require('express-validator');
const Vendor = require('../../models/Vendor/Vendor');
const Menu = require('../../models/Vendor/Menu');
const Media = require('../../models/Vendor/media');
const mongoose = require('mongoose');

// This regex is a whitelist for common text, allowing letters, numbers, spaces, and basic punctuation.
const safeTextRegex = /^[a-zA-Z0-9\s.,!?'"()&%$#@\-_]*$/;

// @desc    Get all vendors with filtering, sorting, and pagination
// @route   GET /api/search/vendors
// @access  Public
router.get('/vendors', [
    query('query').optional().matches(safeTextRegex).trim().escape(),
    query('area').optional().matches(safeTextRegex).trim().escape(),
    query('minPrice').optional().isNumeric().toInt(),
    query('maxPrice').optional().isNumeric().toInt(),
    query('cuisineType').optional().matches(safeTextRegex).trim().escape(),
    query('limit').optional().isNumeric().toInt(),
    query('page').optional().isNumeric().toInt()
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
    }

    try {
        const {
            query: searchQuery,
            area,
            minPrice,
            maxPrice,
            cuisineType,
            limit = 10,
            page = 1
        } = req.query;
        
        const skip = (page - 1) * limit;

        let pipeline = [];

        // Stage 1: Initial match for active vendors and basic text search
        const initialMatch = { status: 'active' };
        if (searchQuery) {
            initialMatch.$or = [
                { businessName: { $regex: searchQuery, $options: 'i' } },
                { locality: { $regex: searchQuery, $options: 'i' } },
                { city: { $regex: searchQuery, $options: 'i' } }
            ];
        }
        if (area) {
            const areaOr = initialMatch.$or || [];
            areaOr.push({ locality: { $regex: area, $options: 'i' } });
            areaOr.push({ city: { $regex: area, $options: 'i' } });
            initialMatch.$or = areaOr;
        }
        pipeline.push({ $match: initialMatch });

        // Stage 2: Join with Menus and Media
        pipeline.push({ $lookup: { from: 'menus', localField: '_id', foreignField: 'vendor', as: 'menu' } });
        pipeline.push({ $unwind: { path: '$menu', preserveNullAndEmptyArrays: true } });
        pipeline.push({ $lookup: { from: 'media', localField: '_id', foreignField: 'vendor', as: 'coverImage' } });
        pipeline.push({ $unwind: { path: '$coverImage', preserveNullAndEmptyArrays: true } });
        
        // Stage 4: Convert packages object to a flat array and calculate min/max prices.
        pipeline.push({
            $addFields: {
                packagesAsArrayOfArrays: { $objectToArray: { $ifNull: ["$menu.packages", {}] } },
            }
        });
        pipeline.push({
            $addFields: {
                allPackages: {
                    $reduce: {
                        input: "$packagesAsArrayOfArrays.v",
                        initialValue: [],
                        in: { $concatArrays: ["$$value", "$$this"] }
                    }
                }
            }
        });
        pipeline.push({
            $addFields: {
                minPrice: { $min: "$allPackages.pricePerPlate" },
                maxPrice: { $max: "$allPackages.pricePerPlate" }
            }
        });

        // Stage 5: Apply post-join filters for cuisine and price
        let postJoinMatch = {};
        if (cuisineType) {
            postJoinMatch['menu.cuisines'] = { $regex: cuisineType, $options: 'i' };
        }
        if (minPrice) {
            postJoinMatch['minPrice'] = { $gte: minPrice };
        }
        if (maxPrice) {
            postJoinMatch['maxPrice'] = { $lte: maxPrice };
        }
        if (Object.keys(postJoinMatch).length > 0) {
            pipeline.push({ $match: postJoinMatch });
        }

        // Stage 6: Sort by Rank and then by creation date
        pipeline.push({ $sort: { rank: 1, createdAt: -1 } });

        // Stage 7: Pagination and Final Projection
        pipeline.push({
            $facet: {
                paginatedResults: [
                    { $skip: skip },
                    { $limit: limit },
                    {
                        $project: {
                            id: '$_id', 
                            _id: 0,
                            businessName: 1, 
                            ownerName: 1, 
                            locality: 1, 
                            city: 1, 
                            pinCode: 1,
                            cuisines: "$menu.cuisines",
                            minPrice: 1, 
                            maxPrice: 1,
                            coverImage: "$coverImage.cloudinaryUrl",
                            experience: "$coverImage.experience",
                            rank: 1
                        }
                    }
                ],
                totalCount: [{ $count: 'count' }]
            }
        });
        
        const result = await Vendor.aggregate(pipeline);
        
        const vendors = result[0].paginatedResults;
        const totalVendors = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
        const totalPages = Math.ceil(totalVendors / limit);

        res.json({
            success: true,
            data: vendors,
            pagination: {
                currentPage: page,
                totalPages,
                totalVendors,
                hasNextPage: page < totalPages,
                hasPrevPage: page > 1
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

// @desc   Get all unique cuisines from all vendors
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

    // Validate ObjectId
    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid vendor ID format'
      });
    }

    // Only find active vendors
    const vendor = await Vendor.findOne({ 
      _id: id,
      status: 'active' // Only active vendors
    })
      .select('businessName ownerName locality city pinCode fullAddress')
      .lean();

    if (!vendor) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found or not available'
      });
    }

    // Get menu and media data
    const [menu, media] = await Promise.all([
      Menu.findOne({ vendor: id, isActive: true }).lean(),
      Media.findVendorProfile(id)
    ]);

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
      coverImage: media ? {
        cloudinaryUrl: media.cloudinaryUrl,
        originalName: media.originalName,
        experience: media.experience
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