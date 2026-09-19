const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  items: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
      quantity: { type: Number, required: true, default: 1 }
    }
  ],
  totalPrice: { type: Number, required: true },
  shippingAddress: {
    fullName: String,
    address: String,
    city: String,
    phone: String
  },
  status: { type: String, default: 'pending' } // pending, paid, shipped, delivered
}, { timestamps: true });

module.exports = mongoose.model('Order', orderSchema);