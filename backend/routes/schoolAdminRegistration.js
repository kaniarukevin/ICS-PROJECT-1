// backend/routes/schoolAdminRegistration.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleAuth');

const {
	createSchoolAdmin,
	getRegistrationStats,
	verifySchoolAdmin,
	getPendingSchoolAdmins,
	validateSchoolName,
	validateEmail
} = require('../controllers/schoolAdminRegistrationController');

// Public routes (no authentication required)
router.post('/register', createSchoolAdmin);
router.get('/validate-school-name', validateSchoolName);
router.get('/validate-email', validateEmail);

// Protected routes (authentication required)
router.use(authMiddleware);

// System admin only routes
router.get('/stats', requireRole(['system_admin']), getRegistrationStats);
router.get('/pending', requireRole(['system_admin']), getPendingSchoolAdmins);
router.put('/verify/:userId', requireRole(['system_admin']), verifySchoolAdmin);

// Health check
router.get('/health', (req, res) => {
	res.json({ 
		message: 'School Admin Registration API is healthy',
		timestamp: new Date().toISOString()
	});
});

module.exports = router;