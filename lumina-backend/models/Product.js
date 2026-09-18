const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true }, // e.g. "Serum", "Moisturizer"
  skinType: [{ type: String }], // e.g. ["oily", "dry", "combination"]
  concerns: [{ type: String }], // e.g. ["acne", "dryness", "aging"]
  image: String,
  description: String
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);