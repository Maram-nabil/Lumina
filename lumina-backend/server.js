require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const productRoutes = require('./routes/productRoutes');
const routineRoutes = require('./routes/routineRoutes');
const authRoutes = require('./routes/authRoutes');
const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ Connected to MongoDB Atlas'))
  .catch((err) => console.error('❌ Connection error:', err));

app.get('/', (req, res) => {
  res.send('LUMINA backend is running');
});

app.use('/api/products', productRoutes);
app.use('/api/routine-finder', routineRoutes);
app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));