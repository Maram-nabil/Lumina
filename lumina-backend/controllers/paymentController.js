const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Order = require('../models/Order');

exports.createPaymentIntent = async (req, res) => {
  try {
    const { orderId } = req.body;

    const order = await Order.findOne({ _id: orderId, user: req.userId });
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.totalPrice * 100), // Stripe بيتعامل بالقروش/السنتات
      currency: 'usd',
      metadata: { orderId: order._id.toString() }
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};