const mongoose = require('mongoose');

const rideSchema = new mongoose.Schema({
  passenger: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  driver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },

  pickup: { type: String, required: true },
  drop: { type: String, required: true },
  distanceKm: { type: Number, required: true },

  vehicleType: { type: String, enum: ['bike', 'toto', 'erik', 'auto'], required: true },
  fare: { type: Number, required: true },

  paymentMethod: { type: String, enum: ['cash', 'upi'], required: true },
  paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },

  rideOtp: { type: String, required: true },

  status: {
    type: String,
    enum: ['searching', 'accepted', 'ongoing', 'completed', 'cancelled'],
    default: 'searching'
  },

  passengerRating: { type: Number, default: null },

  createdAt: { type: Date, default: Date.now },
  completedAt: { type: Date, default: null }
});

module.exports = mongoose.model('Ride', rideSchema);
