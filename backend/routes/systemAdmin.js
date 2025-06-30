const express = require('express');
const router = express.Router();

// Import controllers
const {
	getDashboard,
	getSchools,
	updateSchoolApproval,
	getUsers,
	updateUserStatus,
	getReports,
	getAllBookings
} = require('../controllers/systemAdminController');

// Import middleware
const authMiddleware = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleAuth');

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Apply role-based authorization (only system admins can access these routes)
router.use(roleAuth(['system_admin']));

// Log all system admin API calls
router.use((req, res, next) => {
	console.log(`🔐 System Admin API: ${req.method} ${req.path} by ${req.user?.name || 'Unknown'}`);
	next();
});

// Dashboard routes
router.get('/dashboard', getDashboard);

// School management routes
router.get('/schools', getSchools);
router.put('/schools/:schoolId/approve', updateSchoolApproval);

// User management routes
router.get('/users', getUsers);
router.put('/users/:userId/status', updateUserStatus);

// Reports and analytics routes
router.get('/reports', getReports);

// Booking management routes
router.get('/bookings', getAllBookings);

// Health check for system admin routes
router.get('/health', (req, res) => {
	res.json({
		status: 'System Admin routes are working',
		user: req.user.name,
		role: req.user.role,
		timestamp: new Date().toISOString()
	});
});

module.exports = router;