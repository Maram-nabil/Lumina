const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/', reviewController.getAllReviews);
router.get('/product/:productId', reviewController.getReviewsByProduct);
router.post('/', authMiddleware, reviewController.createReview);

module.exports = router;