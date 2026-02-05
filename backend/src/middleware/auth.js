const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Protect routes - verify JWT token
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from token
            req.user = await User.findById(decoded.id).select('-password');

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: 'ไม่พบผู้ใช้งาน'
                });
            }

            next();
        } catch (error) {
            console.error('Auth error:', error);
            return res.status(401).json({
                success: false,
                message: 'Token ไม่ถูกต้องหรือหมดอายุ'
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'กรุณาเข้าสู่ระบบ'
        });
    }
};

// Admin only middleware
const adminOnly = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        return res.status(403).json({
            success: false,
            message: 'เฉพาะผู้ดูแลระบบเท่านั้น'
        });
    }
};

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d'
    });
};

module.exports = { protect, adminOnly, generateToken };
