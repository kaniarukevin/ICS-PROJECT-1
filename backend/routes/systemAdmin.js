// backend/routes/systemAdmin.js
const express = require('express');
const router = express.Router();

console.log('🔄 Loading System Admin routes...');

// Import middleware with proper error handling
let authMiddleware, requireRole;

try {
	const authModule = require('../middleware/authMiddleware');
	authMiddleware = authModule.authMiddleware;
	console.log('✅ authMiddleware imported successfully');
	
	if (!authMiddleware) {
		throw new Error('authMiddleware is undefined');
	}
} catch (error) {
	console.error('❌ Error importing authMiddleware:', error.message);
	process.exit(1); // Exit if auth middleware can't be loaded
}

try {
	const roleModule = require('../middleware/roleAuth');
	requireRole = roleModule.requireRole;
	console.log('✅ requireRole imported successfully');
	
	if (!requireRole) {
		throw new Error('requireRole is undefined');
	}
} catch (error) {
	console.error('❌ Error importing requireRole:', error.message);
	process.exit(1); // Exit if role middleware can't be loaded
}

// Import controller
let systemAdminController;
try {
	systemAdminController = require('../controllers/systemAdminController');
	console.log('✅ systemAdminController imported successfully');
	console.log('Available methods:', Object.keys(systemAdminController));
} catch (error) {
	console.error('❌ Error importing systemAdminController:', error.message);
	process.exit(1); // Exit if controller can't be loaded
}

// Apply middleware
console.log('🔧 Applying middleware...');
router.use(authMiddleware);
router.use(requireRole(['system_admin']));
console.log('✅ Middleware applied successfully');

// Log all system admin API calls
router.use((req, res, next) => {
	console.log(`🔐 System Admin API: ${req.method} ${req.path} by ${req.user?.name || 'Unknown'} (${req.user?.email || 'No email'})`);
	next();
});

// Test route (for debugging)
router.get('/test', (req, res) => {
	res.json({
		message: 'System Admin routes working',
		timestamp: new Date().toISOString(),
		user: req.user ? {
			id: req.user._id,
			name: req.user.name,
			email: req.user.email,
			role: req.user.role
		} : null
	});
});

// Dashboard routes
router.get('/dashboard', systemAdminController.getDashboard);

// School management routes
router.get('/schools', systemAdminController.getSchools);
router.put('/schools/:schoolId/approve', systemAdminController.updateSchoolApproval);

// User management routes
router.get('/users', systemAdminController.getUsers);
router.put('/users/:userId/status', systemAdminController.updateUserStatus);

// Reports and analytics routes
router.get('/reports', systemAdminController.getReports);
router.get('/analytics', systemAdminController.getAdvancedAnalytics);

// Booking management routes
router.get('/bookings', systemAdminController.getAllBookings);

// Health check
router.get('/health', (req, res) => {
	res.json({
		status: 'System Admin routes fully operational',
		user: req.user ? {
			id: req.user._id,
			name: req.user.name,
			email: req.user.email,
			role: req.user.role
		} : null,
		availableEndpoints: [
			'GET /test',
			'GET /dashboard', 
			'GET /schools',
			'PUT /schools/:schoolId/approve',
			'GET /users',
			'PUT /users/:userId/status', 
			'GET /reports',
			'GET /analytics',
			'GET /bookings',
			'GET /health'
		],
		timestamp: new Date().toISOString()
	});
});

console.log('✅ System Admin routes setup complete');

module.exports = router;