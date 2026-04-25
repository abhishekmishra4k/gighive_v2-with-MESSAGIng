const express = require('express');
const router = express.Router();
const { register, login, verifyOtp, me, searchUsers, getDirectory } = require('../controllers/user');
const { auth } = require('../middleware/user');

router.post('/register', register);
router.post('/login', login);
router.post('/verify-otp', verifyOtp);

// Protected — get current authenticated user
router.get('/me', auth, me);

// 🔍 User search & directory
router.get('/search',    auth, searchUsers);
router.get('/directory', auth, getDirectory);

// Basic profile update (protected)
router.put('/profile', auth, async (req, res) => {
  try {
    const User = require('../models/user');
    const userId = req.user.id;
    const updates = req.body;
    const user = await User.findByIdAndUpdate(userId, updates, { new: true }).select('-password -otp -otpExpires');
    if (!user) return res.status(404).json({ msg: 'User not found' });
    res.json({ user });
  } catch (err) {
    console.error('--- PROFILE UPDATE ERROR ---', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

module.exports = router;