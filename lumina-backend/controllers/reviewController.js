const Review = require('../models/Review');

exports.createReview = async (req, res) => {
  try {
    const { product, rating, comment } = req.body;

    const newReview = new Review({
      user: req.userId,
      product,
      rating,
      comment
    });

    const savedReview = await newReview.save();
    const populatedReview = await savedReview.populate('user', 'name');

    res.status(201).json(populatedReview);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
};

exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('user', 'name')
      .populate('product', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getReviewsByProduct = async (req, res) => {
  try {
    const reviews = await Review.find({ product: req.params.productId })
      .populate('user', 'name')
      .sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};