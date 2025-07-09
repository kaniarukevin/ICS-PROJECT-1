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
	deleteBooking,
	getToursForSchool,
	getAllSchoolsForDropdown,
	compareSchools,
	rateSchool,
	getAllLocations
} = require('../controllers/parentController');

// Parent-protected routes
router.get('/profile', authMiddleware, requireParent, getParentProfile);
router.get('/bookings', authMiddleware, requireParent, getMyBookings);
router.delete('/bookings/:bookingId', authMiddleware, requireParent, cancelBooking);
router.post('/schools/:schoolId/rate', authMiddleware, requireParent, rateSchool);
router.post('/book', authMiddleware, requireParent, bookTour);
router.get('/compare', authMiddleware, requireParent, compareSchools);
router.get('/delete/:bookingId', authMiddleware, requireParent, deleteBooking);

// Public routes
router.get('/schools', getAllSchools);
router.get('/schools/dropdown', getAllSchoolsForDropdown);
router.get('/schools/:schoolId', getSchoolById);
router.get('/tours', getToursForSchool);
router.get('/locations', getAllLocations); 

module.exports = router;
