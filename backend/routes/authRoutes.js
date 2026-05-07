const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { protect, adminOnly, adminOrManager } = require('../middleware/authMiddleware');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

router.post('/register', async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: 'User already exists' });
        }
        
        // Admins can be created via seed or directly in DB. For open registration, everyone is pending.
        const user = await User.create({ name, email, password });
        if (user) {
            res.status(201).json({
                message: 'Registration successful. Waiting for SuperAdmin approval.',
                _id: user._id,
                email: user.email,
                status: user.status
            });
        } else {
            res.status(400).json({ message: 'Invalid user data' });
        }
    } catch (error) {
        console.error('Register Error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        if (user && (await user.matchPassword(password))) {
            if (user.status !== 'Approved') {
                return res.status(403).json({ message: 'Your account is pending SuperAdmin approval' });
            }
            res.cookie('token', generateToken(user._id), {
                httpOnly: true,
                secure: process.env.NODE_ENV !== 'development',
                sameSite: 'strict',
                maxAge: 30 * 24 * 60 * 60 * 1000,
            });
            res.json({
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                permissions: user.permissions,
                avatarUrl: user.avatarUrl,
                token: generateToken(user._id),
            });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        console.error('Login Error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.post('/logout', (req, res) => {
    res.cookie('token', '', {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ message: 'Logged out successfully' });
});

router.get('/users', protect, adminOrManager, async (req, res) => {
    try {
        const users = await User.find({}).select('-password');
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

const { sendApprovalEmail } = require('../utils/emailService');

router.put('/users/:id/approve', protect, adminOnly, async (req, res) => {
    try {
        const { role } = req.body;
        if (!role) {
            return res.status(400).json({ message: 'Role is required to approve user' });
        }
        
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        user.status = 'Approved';
        user.role = role;
        await user.save();

        // Send Approval Email
        await sendApprovalEmail(user.email, user.name, role);

        res.json({ message: 'User approved successfully', user: { _id: user._id, name: user.name, role: user.role, status: user.status, permissions: user.permissions } });
    } catch (error) {
        console.error('Approve User Error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.put('/users/:id/reject', protect, adminOnly, async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.status !== 'Pending') {
            return res.status(400).json({ message: 'Only pending users can be rejected' });
        }
        user.status = 'Rejected';
        await user.save();
        res.json({ message: 'User request rejected successfully' });
    } catch (error) {
        console.error('Reject User Error:', error);
        res.status(500).json({ message: error.message });
    }
});

router.put('/users/:id/permissions', protect, adminOnly, async (req, res) => {
    try {
        const { permissions } = req.body;
        const user = await User.findById(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (permissions) {
            user.permissions = { ...user.permissions, ...permissions };
        }

        await user.save();
        res.json({ message: 'Permissions updated successfully', permissions: user.permissions });
    } catch (error) {
        console.error('Update Permissions Error:', error);
        res.status(500).json({ message: error.message });
    }
});

// Delete user (SuperAdmin only)
router.delete('/delete-user/:id', protect, adminOnly, async (req, res) => {
    try {
        console.log(`[AUTH] Deleting user ID: ${req.params.id}`);
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        if (user.role === 'SuperAdmin') {
            return res.status(403).json({ message: 'SuperAdmin cannot be deleted' });
        }

        await User.findByIdAndDelete(req.params.id);
        res.json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Delete User Error:', error);
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
