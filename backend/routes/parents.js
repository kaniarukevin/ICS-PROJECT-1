const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireParent } = require('../middleware/roleAuth');

const {
	getParentProfile,
	getAllTours,
	getMyBookings,
	bookTour,
	cancelBooking,
	getAllSchools,
	getSchoolById,
	rateSchool
} = require('../controllers/parentController');

//Parent-protected routes
router.get('/profile', authMiddleware, requireParent, getParentProfile);
router.get('/tours', authMiddleware, requireParent, getAllTours);
router.get('/bookings', authMiddleware, requireParent, getMyBookings);
router.post('/bookings', authMiddleware, requireParent, bookTour);
router.delete('/bookings/:bookingId', authMiddleware, requireParent, cancelBooking);
router.post('/schools/:schoolId/rate', authMiddleware, requireParent, rateSchool);

//Public routes
router.get('/schools', getAllSchools);
router.get('/schools/:schoolId', getSchoolById);

module.exports = router;
