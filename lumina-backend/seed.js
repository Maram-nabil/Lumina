require('dotenv').config();
const mongoose = require('mongoose');
const Product = require('./models/Product');
const sampleProducts = [
  {
    name: "Botanical Elixir",
    price: 38,
    category: "Serum",
    skinType: ["dry", "combination"],
    concerns: ["dryness", "dullness"],
    description: "Skin Perfection Complex"
  },
  {
    name: "Hydra-Gel",
    price: 40,
    category: "Moisturizer",
    skinType: ["oily", "combination"],
    concerns: ["dryness", "pores"],
    description: "Skincare Poreline Complex"
  },
  {
    name: "Cellular Renewal Serum",
    price: 50,
    category: "Serum",
    skinType: ["dry", "aging"],
    concerns: ["aging", "dullness"],
    description: "Skin Regeneration Complex"
  },
  {
  name: "Gentle Cleanser",
  price: 25,
  category: "Cleanser",
  skinType: ["oily", "dry", "combination"],
  concerns: ["acne", "dullness"],
  description: "Daily Cleansing Gel"
},
{
  name: "Balancing Toner",
  price: 30,
  category: "Toner",
  skinType: ["oily", "combination"],
  concerns: ["pores", "acne"],
  description: "Pore-Refining Toner"
}
];

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('✅ Connected. Seeding data...');
    await Product.deleteMany({}); // بيمسح أي بيانات قديمة الأول
    await Product.insertMany(sampleProducts);
    console.log('✅ Products seeded successfully!');
    process.exit();
  })
  .catch((err) => {
    console.error('❌ Error:', err);
    process.exit(1);
  });