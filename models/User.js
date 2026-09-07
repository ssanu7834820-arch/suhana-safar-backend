const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  mobile: { type: String, required: true, unique: true, trim: true },
  name: { type: String, required: true, trim: true },
  role: { type: String, enum: ['passenger', 'driver'], required: true },

  vehicleType: { type: String, enum: ['bike', 'toto', 'erik', 'auto', null], default: null },
  vehicleNumber: { type: String, default: null },
  isOnline: { type: Boolean, default: false },
  rating: { type: Number, default: 5 },
  totalRides: { type: Number, default: 0 },
  isVerified: { type: Boolean, default: false },

  currentOtp: { type: String, default: null },
  otpExpiresAt: { type: Date, default: null },

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
