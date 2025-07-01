// backend/routes/schoolAdmin.js (Debug Version - Use this temporarily)
const express = require('express');
const router = express.Router();

// Import middleware - adjust paths as needed
let authMiddleware, requireRole;

try {
	authMiddleware = require('../middleware/authMiddleware');
	// If authMiddleware exports an object, destructure it
	if (typeof authMiddleware === 'object' && authMiddleware.authMiddleware) {
		authMiddleware = authMiddleware.authMiddleware;
	}
} catch (error) {
	console.error('❌ Error importing authMiddleware:', error.message);
}

try {
	const roleAuth = require('../middleware/roleAuth');
	requireRole = roleAuth.requireRole;
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

// Import controllers
let controllers = {};
try {
	controllers = require('../controllers/schoolAdminController');
} catch (error) {
	console.error('❌ Error importing schoolAdminController:', error.message);
	// Create fallback controllers
	controllers = {
		getDashboard: (req, res) => res.json({ message: 'Dashboard endpoint - controller not loaded' }),
		getTours: (req, res) => res.json({ message: 'Tours endpoint - controller not loaded' }),
		createTour: (req, res) => res.json({ message: 'Create tour endpoint - controller not loaded' }),
		updateTour: (req, res) => res.json({ message: 'Update tour endpoint - controller not loaded' }),
		deleteTour: (req, res) => res.json({ message: 'Delete tour endpoint - controller not loaded' }),
		getBookings: (req, res) => res.json({ message: 'Bookings endpoint - controller not loaded' }),
		updateBookingStatus: (req, res) => res.json({ message: 'Update booking endpoint - controller not loaded' }),
		getSchoolProfile: (req, res) => res.json({ message: 'School profile endpoint - controller not loaded' }),
		updateSchoolProfile: (req, res) => res.json({ message: 'Update school endpoint - controller not loaded' }),
		getAnalytics: (req, res) => res.json({ message: 'Analytics endpoint - controller not loaded' })
	};
}

// Apply middleware if available
if (authMiddleware && typeof authMiddleware === 'function') {
	router.use(authMiddleware);
	console.log('✅ Auth middleware applied');
} else {
	console.log('⚠️ Auth middleware not available');
}

if (requireRole && typeof requireRole === 'function') {
	router.use(requireRole(['school_admin']));
	console.log('✅ Role middleware applied');
} else {
	console.log('⚠️ Role middleware not available');
}

// Dashboard
router.get('/dashboard', controllers.getDashboard);

// Tours Management
router.get('/tours', controllers.getTours);
router.post('/tours', controllers.createTour);
router.put('/tours/:tourId', controllers.updateTour);
router.delete('/tours/:tourId', controllers.deleteTour);

// Bookings Management
router.get('/bookings', controllers.getBookings);
router.put('/bookings/:bookingId/status', controllers.updateBookingStatus);

// School Profile
router.get('/school', controllers.getSchoolProfile);
router.put('/school', controllers.updateSchoolProfile);

// Analytics
router.get('/analytics', controllers.getAnalytics);

// Health check for school admin
router.get('/health', (req, res) => {
	res.json({ 
		message: 'School Admin API is healthy (debug mode)',
		user: req.user ? {
			id: req.user._id || req.user.id,
			name: req.user.name,
			email: req.user.email,
			role: req.user.role
		} : null,
		timestamp: new Date().toISOString()
	});
});

module.exports = router;