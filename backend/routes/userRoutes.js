const express = require('express');
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const router = express.Router();
const User = require('../models/User');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname || '').toLowerCase() || '.jpg';
    cb(null, `avatar-${req.user._id}-${Date.now()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  // On desktop browsers, modern formats like AVIF/HEIC may be used.
  // Accept any image/* mimetype to avoid false rejects across devices.
  const ok = typeof file.mimetype === 'string' && file.mimetype.startsWith('image/');
  cb(ok ? null : new Error('Only image files are allowed'), ok);
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 3 * 1024 * 1024 }, // 3MB
});

router.get('/me', protect, async (req, res) => {
  res.json({
    _id: req.user._id,
    name: req.user.name,
    email: req.user.email,
    role: req.user.role,
    avatarUrl: req.user.avatarUrl || '',
  });
});

router.put('/me', protect, async (req, res) => {
  const { name } = req.body;
  try {
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (typeof name === 'string' && name.trim()) user.name = name.trim();
    const updated = await user.save();

    res.json({
      _id: updated._id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      avatarUrl: updated.avatarUrl || '',
    });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to update profile' });
  }
});

router.post('/me/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const publicPath = `/uploads/${req.file.filename}`;
    user.avatarUrl = publicPath;
    await user.save();

    res.json({ avatarUrl: publicPath });
  } catch (error) {
    res.status(500).json({ message: error.message || 'Failed to upload avatar' });
  }
});

// UserRoutes module export
module.exports = router;

