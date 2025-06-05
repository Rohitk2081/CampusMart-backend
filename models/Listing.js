const mongoose = require('mongoose');

const listingSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  price: { type: Number, required: true },
  image: String,
  category: {
    type: String,
    required: true,
    enum: ['Books', 'Electronics', 'Clothing', 'Furniture', 'Services', 'Other'],
    default: 'Other'
  },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: true });

module.exports = mongoose.model('Listing', listingSchema);