// backend/middleware/roleAuth.js

// Role-based authorization middleware
const requireRole = (allowedRoles) => {
	// Ensure allowedRoles is an array
	const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

	return (req, res, next) => {
		try {
			// Check if user exists (should be set by authMiddleware)
			if (!req.user) {
				console.log('❌ Role check failed: No user in request');
				return res.status(401).json({ 
					message: 'Authentication required for this resource' 
				});
			}

			// Check if user has required role
			if (!roles.includes(req.user.role)) {
				console.log(`❌ Role check failed: User ${req.user.email} has role "${req.user.role}", requires one of: [${roles.join(', ')}]`);
				return res.status(403).json({ 
					message: 'Insufficient permissions to access this resource',
					required: roles,
					current: req.user.role
				});
			}

			// Log successful role check
			console.log(`✅ Role check passed: User ${req.user.email} (${req.user.role}) accessing ${req.method} ${req.originalUrl}`);
			
			next();

		} catch (error) {
			console.error('❌ Role authorization error:', error);
			return res.status(500).json({ 
				message: 'Error checking user permissions',
				error: error.message 
			});
		}
	};
};

// Check if user is a system admin
const requireSystemAdmin = requireRole(['system_admin']);

// Check if user is a school admin
const requireSchoolAdmin = requireRole(['school_admin']);

// Check if user is a parent
const requireParent = requireRole(['parent']);

// Check if user is admin (system or school)
const requireAdmin = requireRole(['system_admin', 'school_admin']);

// Check if user is system admin or the owner of the resource
const requireSystemAdminOrOwner = (getOwnerId) => {
	return async (req, res, next) => {
		try {
			// Check if user exists
			if (!req.user) {
				return res.status(401).json({ 
					message: 'Authentication required for this resource' 
				});
			}

			// If user is system admin, allow access
			if (req.user.role === 'system_admin') {
				console.log(`✅ System admin access granted: ${req.user.email}`);
				return next();
			}

			// Otherwise, check if user owns the resource
			let ownerId;
			if (typeof getOwnerId === 'function') {
				ownerId = await getOwnerId(req);
			} else if (typeof getOwnerId === 'string') {
				ownerId = req.params[getOwnerId] || req.body[getOwnerId];
			} else {
				ownerId = req.user._id;
			}

			if (req.user._id.toString() === ownerId.toString()) {
				console.log(`✅ Owner access granted: ${req.user.email}`);
				return next();
			}

			console.log(`❌ Access denied: User ${req.user.email} is not owner or system admin`);
			return res.status(403).json({ 
				message: 'Access denied. You can only access your own resources.' 
			});

		} catch (error) {
			console.error('❌ Owner/system admin check error:', error);
			return res.status(500).json({ 
				message: 'Error checking resource permissions',
				error: error.message 
			});
		}
	};
};

// Check if user can access school resources (school admin for their school or system admin)
const requireSchoolAccess = async (req, res, next) => {
	try {
		// Check if user exists
		if (!req.user) {
			return res.status(401).json({ 
				message: 'Authentication required for this resource' 
			});
		}

		// System admins can access any school
		if (req.user.role === 'system_admin') {
			console.log(`✅ System admin school access granted: ${req.user.email}`);
			return next();
		}

		// School admins can only access their own school
		if (req.user.role === 'school_admin') {
			if (!req.user.schoolId) {
				return res.status(403).json({ 
					message: 'School admin account is not associated with a school' 
				});
			}

			// Check if accessing their own school (schoolId might be in params, body, or query)
			const targetSchoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;
			
			if (targetSchoolId && req.user.schoolId._id.toString() !== targetSchoolId.toString()) {
				console.log(`❌ School access denied: Admin ${req.user.email} trying to access different school`);
				return res.status(403).json({ 
					message: 'You can only access your own school resources' 
				});
			}

			console.log(`✅ School admin access granted: ${req.user.email} for school ${req.user.schoolId.name}`);
			return next();
		}

		console.log(`❌ School access denied: User ${req.user.email} with role ${req.user.role} cannot access school resources`);
		return res.status(403).json({ 
			message: 'Insufficient permissions to access school resources' 
		});

	} catch (error) {
		console.error('❌ School access check error:', error);
		return res.status(500).json({ 
			message: 'Error checking school permissions',
			error: error.message 
		});
	}
};

// Check if user is verified
const requireVerified = (req, res, next) => {
	try {
		if (!req.user) {
			return res.status(401).json({ 
				message: 'Authentication required for this resource' 
			});
		}

		if (!req.user.isVerified) {
			console.log(`❌ Verification required: User ${req.user.email} is not verified`);
			return res.status(403).json({ 
				message: 'Account verification required to access this resource' 
			});
		}

		console.log(`✅ Verification check passed: ${req.user.email}`);
		next();

	} catch (error) {
		console.error('❌ Verification check error:', error);
		return res.status(500).json({ 
			message: 'Error checking verification status',
			error: error.message 
		});
	}
};

// Combine multiple authorization checks
const combineAuth = (...middlewares) => {
	return (req, res, next) => {
		const runMiddleware = (index) => {
			if (index >= middlewares.length) {
				return next();
			}

			middlewares[index](req, res, (error) => {
				if (error) {
					return next(error);
				}
				runMiddleware(index + 1);
			});
		};

		runMiddleware(0);
	};
};

module.exports = {
	requireRole,
	requireSystemAdmin,
	requireSchoolAdmin,
	requireParent,
	requireAdmin,
	requireSystemAdminOrOwner,
	requireSchoolAccess,
	requireVerified,
	combineAuth
};