const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.cookies.token) {
        token = req.cookies.token;
    } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = await User.findById(decoded.id).select('-password');
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const managerOnly = (req, res, next) => {
    if (req.user && req.user.role === 'Manager') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a Manager' });
    }
};

const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'SuperAdmin') {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized as a SuperAdmin' });
    }
};

const adminOrManager = (req, res, next) => {
    if (req.user && (req.user.role === 'SuperAdmin' || req.user.role === 'Manager')) {
        next();
    } else {
        res.status(403).json({ message: 'Not authorized. Requires SuperAdmin or Manager role' });
    }
};

module.exports = { protect, managerOnly, adminOnly, adminOrManager };
