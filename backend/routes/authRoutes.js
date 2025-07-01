// backend/routes/authRoutes.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireSystemAdmin } = require('../middleware/roleAuth');
const {
	register,
	login,
	getProfile,
	updateProfile,
	changePassword,
	refreshToken,
	logout,
	getUserStats
} = require('../controllers/authController');

// Public routes (no authentication required)
router.post('/register', register);
router.post('/login', login);

// Protected routes (authentication required)
router.use(authMiddleware); // Apply auth middleware to all routes below

router.get('/profile', getProfile);
router.put('/profile', updateProfile);
router.post('/change-password', changePassword);
router.post('/refresh', refreshToken);
router.post('/logout', logout);

// Admin-only routes
router.get('/user-stats', requireSystemAdmin, getUserStats);

// Health check for auth routes
router.get('/health', (req, res) => {
	res.json({ 
		message: 'Auth API is healthy',
		user: req.user ? {
			id: req.user._id,
			name: req.user.name,
			email: req.user.email,
			role: req.user.role
		} : null,
		timestamp: new Date().toISOString()
	});
});

module.exports = router;