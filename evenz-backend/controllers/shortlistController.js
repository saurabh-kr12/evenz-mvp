// File: controllers/shortlistController.js
const Shortlist = require('../models/User/Shortlist');
const Vendor = require('../models/Vendor/Vendor');
const Menu = require('../models/Vendor/Menu');
const Media = require('../models/Vendor/media');
const Legal = require('../models/Vendor/legal');

// Add to shortlist
const addToShortlist = async (req, res) => {
   try {
      const { catererId } = req.params;
      const userId = req.user._id;

      // Validate inputs
      if (!catererId) {
         return res.status(400).json({
            success: false,
            message: 'Caterer ID is required'
         });
      }

      if (!userId) {
         return res.status(401).json({
            success: false,
            message: 'User not authenticated'
         });
      }
      // Check if vendor exists
      const vendor = await Vendor.findById(catererId);

      if (!vendor) {
         return res.status(404).json({
            success: false,
            message: 'Caterer not found'
         });
      }

      // Check if already shortlisted
      const existingShortlist = await Shortlist.findOne({
         user: userId,
         vendor: catererId
      });

      if (existingShortlist) {
         return res.status(400).json({
            success: false,
            message: 'Caterer already in shortlist'
         });
      }

      // Add to shortlist
      const shortlist = new Shortlist({
         user: userId,
         vendor: catererId
      });

      await shortlist.save();

      res.status(201).json({
         success: true,
         message: 'Caterer added to shortlist',
         data: shortlist
      });

   } catch (error) {
      console.error('Error adding to shortlist:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Remove from shortlist
const removeFromShortlist = async (req, res) => {
   try {
      const { catererId } = req.params;
      const userId = req.user._id;

      if (!catererId) {
         return res.status(400).json({
            success: false,
            message: 'Caterer ID is required'
         });
      }

      if (!userId) {
         return res.status(401).json({
            success: false,
            message: 'User not authenticated'
         });
      }

      const result = await Shortlist.findOneAndDelete({
         user: userId,
         vendor: catererId
      });

      if (!result) {
         return res.status(404).json({
            success: false,
            message: 'Shortlist entry not found'
         });
      }

      res.status(200).json({
         success: true,
         message: 'Caterer removed from shortlist'
      });

   } catch (error) {
      console.error('Error removing from shortlist:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Get user's shortlist
const getShortlist = async (req, res) => {
   try {
      const userId = req.user._id;

      if (!userId) {
         return res.status(401).json({
            success: false,
            message: 'User not authenticated'
         });
      }

      const shortlists = await Shortlist.find({ user: userId })
         .populate('vendor', 'businessName ownerName city locality pinCode')
         .sort({ shortlistedAt: -1 });

      if (shortlists.length === 0) {
         return res.status(200).json({
            success: true,
            data: [],
            message: 'No caterers in shortlist'
         });
      }

      // Get additional data for shortlisted vendors
      const vendorIds = shortlists.map(s => s.vendor._id);

      const [menus, media, legal] = await Promise.all([
         Menu.find({ vendor: { $in: vendorIds } }).select('vendor cuisines packages'),
         Media.find({ vendor: { $in: vendorIds }, isCoverImage: true }),
         Legal.find({ vendor: { $in: vendorIds } }).select('vendor minGuests maxGuests')
      ]);

      // Enrich shortlist data
      const enrichedShortlist = shortlists.map(shortlist => {
         const vendor = shortlist.vendor;
         const vendorMenu = menus.find(m => m.vendor.toString() === vendor._id.toString());
         const vendorMedia = media.find(m => m.vendor.toString() === vendor._id.toString());
         const vendorLegal = legal.find(l => l.vendor.toString() === vendor._id.toString());

         // Calculate price range
         let minPrice = null, maxPrice = null;
         if (vendorMenu && vendorMenu.packages) {
            const allPackages = Array.from(vendorMenu.packages.values()).flat();
            if (allPackages.length > 0) {
               const prices = allPackages.map(pkg => pkg.pricePerPlate);
               minPrice = Math.min(...prices);
               maxPrice = Math.max(...prices);
            }
         }

         return {
            shortlistId: shortlist._id,
            caterer: {
               id: vendor._id,
               businessName: vendor.businessName,
               address: `${vendor.locality}, ${vendor.city}`,
               cuisines: vendorMenu ? vendorMenu.cuisines : [],
               coverImage: vendorMedia ? vendorMedia.path : null,
               priceRange: { min: minPrice, max: maxPrice },
               guestRange: {
                  min: vendorLegal ? vendorLegal.minGuests : null,
                  max: vendorLegal ? vendorLegal.maxGuests : null
               }
            },
            shortlistedAt: shortlist.shortlistedAt
         };
      });

      res.status(200).json({
         success: true,
         data: enrichedShortlist
      });

   } catch (error) {
      console.error('Error fetching shortlist:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

// Check if caterer is shortlisted
const checkShortlistStatus = async (req, res) => {
   try {
      const { catererId } = req.params;
      const userId = req.user._id;

      if (!catererId) {
         return res.status(400).json({
            success: false,
            message: 'Caterer ID is required'
         });
      }

      if (!userId) {
         return res.status(401).json({
            success: false,
            message: 'User not authenticated'
         });
      }

      const shortlist = await Shortlist.findOne({
         user: userId,
         vendor: catererId
      });

      res.status(200).json({
         success: true,
         isShortlisted: !!shortlist
      });

   } catch (error) {
      console.error('Error checking shortlist status:', error);
      res.status(500).json({
         success: false,
         message: 'Internal server error',
         error: error.message
      });
   }
};

module.exports = {
   addToShortlist,
   removeFromShortlist,
   getShortlist,
   checkShortlistStatus
};