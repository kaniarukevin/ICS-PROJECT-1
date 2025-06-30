// Role-based authorization middleware
const roleAuth = (allowedRoles) => {
	return (req, res, next) => {
		try {
			// User should be attached to req by authMiddleware
			if (!req.user) {
				console.log('❌ Role auth failed: No user found in request');
				return res.status(401).json({ message: 'Access denied. No user found.' });
			}

			console.log(`🔐 Role check: User ${req.user.name} (${req.user.role}) trying to access route requiring: ${allowedRoles.join(', ')}`);

			// Check if user's role is in the allowed roles array
			if (!allowedRoles.includes(req.user.role)) {
				console.log(`❌ Role auth failed: User role "${req.user.role}" not in allowed roles: ${allowedRoles.join(', ')}`);
				return res.status(403).json({ 
					message: 'Access denied. Insufficient permissions.',
					userRole: req.user.role,
					requiredRoles: allowedRoles
				});
			}

			console.log(`✅ Role auth passed: User ${req.user.name} has required role`);
			next();
		} catch (error) {
			console.error('❌ Role auth middleware error:', error);
			res.status(500).json({ 
				message: 'Server error in role authorization', 
				error: error.message 
			});
		}
	};
};

module.exports = roleAuth;