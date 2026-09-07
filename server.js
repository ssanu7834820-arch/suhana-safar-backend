require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const rideRoutes = require('./routes/rides');

const app = express();
app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Suhana Safar backend chal raha hai' });
});

app.use('/api/auth', authRoutes);
app.use('/api/rides', rideRoutes);

const PORT = process.env.PORT || 3000;
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('MONGODB_URI nahi mila!');
}

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('MongoDB se connect ho gaya');
    app.listen(PORT, () => console.log('Server chal raha hai port ' + PORT + ' par'));
  })
  .catch((err) => {
    console.error('MongoDB connect nahi ho paya:', err.message);
  });
