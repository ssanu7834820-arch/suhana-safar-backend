const express = require('express');
const router = express.Router();
const Ride = require('../models/Ride');
const User = require('../models/User');

function randOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

router.post('/book', async (req, res) => {
  try {
    const { passengerMobile, pickup, drop, distanceKm, vehicleType, fare, paymentMethod } = req.body;
    const passenger = await User.findOne({ mobile: passengerMobile, role: 'passenger' });
    if (!passenger) return res.status(404).json({ error: 'Passenger nahi mila' });

    const ride = await Ride.create({
      passenger: passenger._id,
      pickup, drop, distanceKm, vehicleType, fare, paymentMethod,
      rideOtp: randOtp(),
      status: 'searching'
    });

    res.json({ success: true, ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/available', async (req, res) => {
  try {
    const rides = await Ride.find({ status: 'searching' })
      .populate('passenger', 'name mobile rating')
      .sort({ createdAt: -1 })
      .limit(20);
    res.json({ success: true, rides });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/accept', async (req, res) => {
  try {
    const { driverMobile } = req.body;
    const driver = await User.findOne({ mobile: driverMobile, role: 'driver' });
    if (!driver) return res.status(404).json({ error: 'Driver nahi mila' });

    const ride = await Ride.findOneAndUpdate(
      { _id: req.params.id, status: 'searching' },
      { driver: driver._id, status: 'accepted' },
      { new: true }
    ).populate('passenger', 'name mobile rating').populate('driver', 'name mobile vehicleNumber vehicleType rating');

    if (!ride) return res.status(400).json({ error: 'Ye ride ab available nahi hai' });
    res.json({ success: true, ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/start', async (req, res) => {
  try {
    const { otp } = req.body;
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride nahi mili' });
    if (ride.rideOtp !== otp) return res.status(400).json({ error: 'OTP galat hai' });

    ride.status = 'ongoing';
    await ride.save();
    res.json({ success: true, ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/:id/complete', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id);
    if (!ride) return res.status(404).json({ error: 'Ride nahi mili' });

    ride.status = 'completed';
    ride.completedAt = new Date();
    if (ride.paymentMethod === 'upi') ride.paymentStatus = 'paid';
    await ride.save();

    if (ride.driver) {
      await User.findByIdAndUpdate(ride.driver, { $inc: { totalRides: 1 } });
    }

    res.json({ success: true, ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const ride = await Ride.findById(req.params.id)
      .populate('passenger', 'name mobile rating')
      .populate('driver', 'name mobile vehicleNumber vehicleType rating');
    if (!ride) return res.status(404).json({ error: 'Ride nahi mili' });
    res.json({ success: true, ride });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history/:mobile', async (req, res) => {
  try {
    const user = await User.findOne({ mobile: req.params.mobile });
    if (!user) return res.status(404).json({ error: 'User nahi mila' });

    const filter = user.role === 'driver' ? { driver: user._id } : { passenger: user._id };
    const rides = await Ride.find(filter).sort({ createdAt: -1 }).limit(50);
    res.json({ success: true, rides });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
