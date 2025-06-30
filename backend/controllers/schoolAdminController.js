const Tour = require('../models/Tour');
const School = require('../models/School');
const Booking = require('../models/Booking'); // Kevin will create this

// Get school admin dashboard data
const getDashboard = async (req, res) => {
	try {
		const schoolId = req.user.schoolId;
		
		const totalTours = await Tour.countDocuments({ schoolId });
		const activeTours = await Tour.countDocuments({ schoolId, isActive: true });
		const totalBookings = await Booking.countDocuments({ schoolId });
		const pendingBookings = await Booking.countDocuments({ schoolId, status: 'pending' });

		res.json({
			totalTours,
			activeTours,
			totalBookings,
			pendingBookings
		});
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get all tours for the school
const getTours = async (req, res) => {
	try {
		const schoolId = req.user.schoolId;
		const tours = await Tour.find({ schoolId }).sort({ date: -1 });
		res.json(tours);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Create new tour
const createTour = async (req, res) => {
	try {
		const { title, description, date, startTime, endTime, maxCapacity } = req.body;
		const schoolId = req.user.schoolId;

		const tour = new Tour({
			schoolId,
			title,
			description,
			date,
			startTime,
			endTime,
			maxCapacity
		});

		await tour.save();
		res.status(201).json(tour);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Update tour
const updateTour = async (req, res) => {
	try {
		const { tourId } = req.params;
		const schoolId = req.user.schoolId;
		
		const tour = await Tour.findOneAndUpdate(
			{ _id: tourId, schoolId },
			req.body,
			{ new: true }
		);

		if (!tour) {
			return res.status(404).json({ message: 'Tour not found' });
		}

		res.json(tour);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Delete tour
const deleteTour = async (req, res) => {
	try {
		const { tourId } = req.params;
		const schoolId = req.user.schoolId;
		
		const tour = await Tour.findOneAndDelete({ _id: tourId, schoolId });

		if (!tour) {
			return res.status(404).json({ message: 'Tour not found' });
		}

		res.json({ message: 'Tour deleted successfully' });
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get school bookings
const getBookings = async (req, res) => {
	try {
		const schoolId = req.user.schoolId;
		const bookings = await Booking.find({ schoolId })
			.populate('parentId', 'name email')
			.populate('tourId', 'title date startTime')
			.sort({ createdAt: -1 });

		res.json(bookings);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Update booking status
const updateBookingStatus = async (req, res) => {
	try {
		const { bookingId } = req.params;
		const { status } = req.body;
		const schoolId = req.user.schoolId;

		const booking = await Booking.findOneAndUpdate(
			{ _id: bookingId, schoolId },
			{ status },
			{ new: true }
		);

		if (!booking) {
			return res.status(404).json({ message: 'Booking not found' });
		}

		res.json(booking);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Get school info
const getSchoolInfo = async (req, res) => {
	try {
		const schoolId = req.user.schoolId;
		const school = await School.findById(schoolId);

		if (!school) {
			return res.status(404).json({ message: 'School not found' });
		}

		res.json(school);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// Update school info
const updateSchoolInfo = async (req, res) => {
	try {
		const schoolId = req.user.schoolId;
		const school = await School.findByIdAndUpdate(schoolId, req.body, { new: true });

		if (!school) {
			return res.status(404).json({ message: 'School not found' });
		}

		res.json(school);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

module.exports = {
	getDashboard,
	getTours,
	createTour,
	updateTour,
	deleteTour,
	getBookings,
	updateBookingStatus,
	getSchoolInfo,
	updateSchoolInfo
};