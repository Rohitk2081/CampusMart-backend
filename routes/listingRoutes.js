const express = require('express');
const router = express.Router();
const upload = require('../utils/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');
const {
  createListing,
  getListings,
  updateListing,
  deleteListing,
} = require('../controllers/listingController');

// Create
router.post('/', protect, upload.single('image'), createListing);

// Read
router.get('/', getListings);

// Update
router.put('/:id', protect, upload.single('image'), updateListing);

// Delete
router.delete('/:id', protect, deleteListing);

module.exports = router;