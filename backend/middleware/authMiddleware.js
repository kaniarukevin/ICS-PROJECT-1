const jwt = require('jsonwebtoken');
const User = require('../models/user');

const authMiddleware = async (req, res, next) => {
	try {
		// Get token from header
		const authHeader = req.header('Authorization');
		
		if (!authHeader) {
			console.log('❌ Auth failed: No Authorization header');
			return res.status(401).json({ message: 'Access denied. No token provided.' });
		}

		if (!authHeader.startsWith('Bearer ')) {
			console.log('❌ Auth failed: Invalid token format');
			return res.status(401).json({ message: 'Access denied. Invalid token format.' });
		}

		// Remove 'Bearer ' from token
		const token = authHeader.slice(7);
		
		if (!token) {
			console.log('❌ Auth failed: Empty token');
			return res.status(401).json({ message: 'Access denied. No token provided.' });
		}

		console.log('🔐 Verifying token...');

		// Verify token
		const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
		
		console.log(`🔐 Token decoded for user ID: ${decoded.userId}`);

		// Get user from database
		const user = await User.findById(decoded.userId).select('-password');
		
		if (!user) {
			console.log('❌ Auth failed: User not found in database');
			return res.status(401).json({ message: 'Token is not valid. User not found.' });
		}

		if (!user.isActive) {
			console.log(`❌ Auth failed: User ${user.name} account is deactivated`);
			return res.status(401).json({ message: 'Account is deactivated.' });
		}

		console.log(`✅ Auth successful: User ${user.name} (${user.role})`);

		// Add user to request object
		req.user = user;
		next();
		
	} catch (error) {
		if (error.name === 'JsonWebTokenError') {
			console.log('❌ Auth failed: Invalid token');
			return res.status(401).json({ message: 'Token is not valid.' });
		}
		if (error.name === 'TokenExpiredError') {
			console.log('❌ Auth failed: Token expired');
			return res.status(401).json({ message: 'Token has expired.' });
		}
		
		console.error('❌ Auth middleware error:', error);
		res.status(500).json({ 
			message: 'Server error in authentication', 
			error: error.message 
		});
	}
};

module.exports = authMiddleware;