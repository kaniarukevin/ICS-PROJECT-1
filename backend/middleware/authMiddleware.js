// backend/middleware/authMiddleware.js
const jwt = require('jsonwebtoken');
const User = require('../models/user'); // Note: lowercase 'user' - adjust if your file is different

const authMiddleware = async (req, res, next) => {
	try {
		// Get token from header
		const authHeader = req.header('Authorization');
		
		if (!authHeader) {
			return res.status(401).json({ message: 'No token provided, authorization denied' });
		}

		// Check if it's a Bearer token
		if (!authHeader.startsWith('Bearer ')) {
			return res.status(401).json({ message: 'Invalid token format. Use Bearer token' });
		}

		// Extract token
		const token = authHeader.substring(7); // Remove 'Bearer ' prefix

		if (!token) {
			return res.status(401).json({ message: 'No token provided, authorization denied' });
		}

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		
		// Find user
		const user = await User.findById(decoded.userId)
			.populate('schoolId', 'name schoolType isVerified')
			.select('-password');

		if (!user) {
			return res.status(401).json({ message: 'Token is valid but user not found' });
		}

		// Check if user is active
		if (!user.isActive) {
			return res.status(401).json({ message: 'User account is disabled' });
		}

		// Add user to request object
		req.user = user;
		
		// Log successful authentication (optional)
		console.log(`🔐 Authenticated user: ${user.email} (${user.role})`);
		
		next();

	} catch (error) {
		console.error('❌ Auth middleware error:', error.message);
		
		if (error.name === 'JsonWebTokenError') {
			return res.status(401).json({ message: 'Invalid token' });
		}
		
		if (error.name === 'TokenExpiredError') {
			return res.status(401).json({ message: 'Token has expired' });
		}

		return res.status(500).json({ 
			message: 'Authentication error', 
			error: error.message 
		});
	}
};

// Optional middleware to check if user is authenticated but don't fail if not
const optionalAuth = async (req, res, next) => {
	try {
		const authHeader = req.header('Authorization');
		
		if (!authHeader || !authHeader.startsWith('Bearer ')) {
			return next(); // Continue without user
		}

		const token = authHeader.substring(7);
		
		if (!token) {
			return next(); // Continue without user
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);
		const user = await User.findById(decoded.userId)
			.populate('schoolId', 'name schoolType isVerified')
			.select('-password');

		if (user && user.isActive) {
			req.user = user;
		}

		next();

	} catch (error) {
		// If optional auth fails, just continue without user
		console.log('⚠️ Optional auth failed, continuing without user');
		next();
	}
};

module.exports = {
	authMiddleware,
	optionalAuth
};