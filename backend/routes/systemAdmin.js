// backend/routes/systemAdmin.js (Debug Version - Use if still having issues)
const express = require('express');
const router = express.Router();

// Import middleware with error handling
let authMiddleware, requireRole;

try {
	const authModule = require('../middleware/authMiddleware');
	// Handle different export patterns
	if (typeof authModule === 'function') {
		authMiddleware = authModule;
	} else if (authModule.authMiddleware) {
		authMiddleware = authModule.authMiddleware;
	} else {
		console.error('❌ authMiddleware not found in auth module');
	}
} catch (error) {
	console.error('❌ Error importing authMiddleware:', error.message);
}

try {
	const roleAuth = require('../middleware/roleAuth');
	requireRole = roleAuth.requireRole;
	if (!requireRole) {
		console.error('❌ requireRole not found in roleAuth module');
	}
} catch (error) {
	console.error('❌ Error importing roleAuth:', error.message);
	// Create a simple fallback
	requireRole = (roles) => (req, res, next) => {
		if (!req.user) {
			return res.status(401).json({ message: 'Authentication required' });
		}
		if (!roles.includes(req.user.role)) {
			return res.status(403).json({ message: 'Insufficient permissions' });
		}
		next();
	};
}

// Import controllers with error handling
let controllers = {};
try {
	controllers = require('../controllers/systemAdminController');
} catch (error) {
	console.error('❌ Error importing systemAdminController:', error.message);
	// Create fallback controllers
	controllers = {
		getDashboard: (req, res) => res.json({ message: 'Dashboard endpoint - controller not loaded' }),
		getSchools: (req, res) => res.json({ message: 'Schools endpoint - controller not loaded' }),
		updateSchoolApproval: (req, res) => res.json({ message: 'Update school endpoint - controller not loaded' }),
		getUsers: (req, res) => res.json({ message: 'Users endpoint - controller not loaded' }),
		updateUserStatus: (req, res) => res.json({ message: 'Update user endpoint - controller not loaded' }),
		getReports: (req, res) => res.json({ message: 'Reports endpoint - controller not loaded' }),
		getAllBookings: (req, res) => res.json({ message: 'Bookings endpoint - controller not loaded' })
	};
}

// Apply middleware if available
if (authMiddleware && typeof authMiddleware === 'function') {
	router.use(authMiddleware);
	console.log('✅ System Admin: Auth middleware applied');
} else {
	console.log('⚠️ System Admin: Auth middleware not available');
}

if (requireRole && typeof requireRole === 'function') {
	router.use(requireRole(['system_admin']));
	console.log('✅ System Admin: Role middleware applied');
} else {
	console.log('⚠️ System Admin: Role middleware not available');
}

// Log all system admin API calls
router.use((req, res, next) => {
	console.log(`🔐 System Admin API: ${req.method} ${req.path} by ${req.user?.name || 'Unknown'}`);
	next();
});

// Dashboard routes
router.get('/dashboard', controllers.getDashboard);

// School management routes
router.get('/schools', controllers.getSchools);
router.put('/schools/:schoolId/approve', controllers.updateSchoolApproval);

// User management routes
router.get('/users', controllers.getUsers);
router.put('/users/:userId/status', controllers.updateUserStatus);

// Reports and analytics routes
router.get('/reports', controllers.getReports);

// Booking management routes
router.get('/bookings', controllers.getAllBookings);

// Health check for system admin routes
router.get('/health', (req, res) => {
	res.json({
		status: 'System Admin routes are working (debug mode)',
		user: req.user ? {
			id: req.user._id || req.user.id,
			name: req.user.name,
			email: req.user.email,
			role: req.user.role
		} : null,
		middleware: {
			auth: !!authMiddleware,
			role: !!requireRole
		},
		timestamp: new Date().toISOString()
	});
});

module.exports = router;