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
            const user = await User.findById(decoded.id).select('-password');
            
            if (!user) {
                return res.status(401).json({ message: 'Not authorized, user not found' });
            }

            if (user.status !== 'Approved') {
                return res.status(403).json({ message: 'Account is not approved. Please contact SuperAdmin.' });
            }

            req.user = user;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
        }
    } else {
        res.status(401).json({ message: 'Not authorized, no token' });
    }
};

const checkPermission = (module, action) => {
    return (req, res, next) => {
        if (req.user && req.user.role === 'SuperAdmin') {
            return next();
        }

        if (
            req.user &&
            req.user.permissions &&
            req.user.permissions[module] &&
            req.user.permissions[module][action]
        ) {
            next();
        } else {
            res.status(403).json({ message: `Access denied. You do not have permission to ${action} ${module}.` });
        }
    };
};

const managerOnly = (req, res, next) => {
    if (req.user && (req.user.role === 'Manager' || req.user.role === 'SuperAdmin')) {
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

module.exports = { protect, checkPermission, managerOnly, adminOnly, adminOrManager };
