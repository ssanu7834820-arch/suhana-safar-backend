const express = require('express');
const router = express.Router();
const User = require('../models/User');

function randOtp() {
  return String(Math.floor(1000 + Math.random() * 9000));
}

router.post('/signup', async (req, res) => {
  try {
    const { mobile, name, role, vehicleType, vehicleNumber } = req.body;
    if (!mobile || !name || !role) {
      return res.status(400).json({ error: 'mobile, name, role zaroori hai' });
    }
    const existing = await User.findOne({ mobile });
    if (existing) {
      return res.status(400).json({ error: 'Ye mobile number pehle se registered hai' });
    }
    const user = await User.create({
      mobile, name, role,
      vehicleType: role === 'driver' ? vehicleType : null,
      vehicleNumber: role === 'driver' ? vehicleNumber : null
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/send-otp', async (req, res) => {
  try {
    const { mobile } = req.body;
    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ error: 'Ye mobile number registered nahi hai' });

    const otp = randOtp();
    user.currentOtp = otp;
    user.otpExpiresAt = new Date(Date.now() + 5 * 60 * 1000);
    await user.save();

    res.json({ success: true, message: 'OTP bhej diya (testing mode)', otp_for_testing: otp });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { mobile, otp } = req.body;
    const user = await User.findOne({ mobile });
    if (!user) return res.status(404).json({ error: 'User nahi mila' });

    if (user.currentOtp !== otp) return res.status(400).json({ error: 'OTP galat hai' });
    if (user.otpExpiresAt < new Date()) return res.status(400).json({ error: 'OTP expire ho gaya' });

    user.currentOtp = null;
    user.otpExpiresAt = null;
    await user.save();

    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/toggle-online', async (req, res) => {
  try {
    const { mobile, isOnline } = req.body;
    const user = await User.findOneAndUpdate({ mobile, role: 'driver' }, { isOnline }, { new: true });
    if (!user) return res.status(404).json({ error: 'Driver nahi mila' });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
