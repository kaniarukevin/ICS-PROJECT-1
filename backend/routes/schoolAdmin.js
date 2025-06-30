const express = require('express');
const router = express.Router();
const {
	getDashboard,
	getTours,
	createTour,
	updateTour,
	deleteTour,
	getBookings,
	updateBookingStatus,
	getSchoolInfo,
	updateSchoolInfo
} = require('../controllers/schoolAdminController');

// Middleware (you'll need to import these)
const authMiddleware = require('../middleware/authMiddleware');
const roleAuth = require('../middleware/roleAuth');

// Apply auth middleware to all routes
router.use(authMiddleware);
router.use(roleAuth(['school_admin']));

// Dashboard
router.get('/dashboard', getDashboard);

// Tours
router.get('/tours', getTours);
router.post('/tours', createTour);
router.put('/tours/:tourId', updateTour);
router.delete('/tours/:tourId', deleteTour);

// Bookings
router.get('/bookings', getBookings);
router.put('/bookings/:bookingId/status', updateBookingStatus);

// School info
router.get('/school', getSchoolInfo);
router.put('/school', updateSchoolInfo);

module.exports = router;