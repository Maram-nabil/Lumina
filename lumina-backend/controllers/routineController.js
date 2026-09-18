const Product = require('../models/Product');

exports.findRoutine = async (req, res) => {
  try {
    const { skinType, concerns } = req.body;

    if (!skinType) {
      return res.status(400).json({ error: 'skinType is required' });
    }

    // نجيب المنتجات اللي بتطابق نوع البشرة، ولو فيه concerns نضيفهم كشرط إضافي
    const query = { skinType: skinType };
    if (concerns && concerns.length > 0) {
      query.concerns = { $in: concerns };
    }

    const matchedProducts = await Product.find(query);

    // نرتبهم حسب خطوات الروتين المنطقية
    const stepOrder = ["Cleanser", "Toner", "Serum", "Moisturizer"];
    const routine = stepOrder
      .map(step => matchedProducts.find(p => p.category === step))
      .filter(Boolean); // بيشيل أي خطوة مفيش منتج بيغطيها

    if (routine.length === 0) {
      return res.status(404).json({ message: 'No matching routine found for this skin type' });
    }

    res.json({
      skinType,
      concerns: concerns || [],
      routine
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};