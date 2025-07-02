const User = require('../models/user');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const School = require('../models/School');

// 🔐 Get parent profile
const getParentProfile = async (req, res) => {
	try {
		const parent = await User.findById(req.user._id).select('-password');
		if (!parent) return res.status(404).json({ message: 'Parent not found' });
		res.json(parent);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// 📆 Get all available tours
const getAllTours = async (req, res) => {
	try {
		const tours = await Tour.find()
			.populate('schoolId', 'name location.city location.state')
			.sort({ date: 1 });
		res.json(tours);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// 🧾 Get parent’s bookings
const getMyBookings = async (req, res) => {
	try {
		const bookings = await Booking.find({ parentId: req.user._id })
			.populate('tourId', 'title date')
			.populate('schoolId', 'name location.city')
			.sort({ createdAt: -1 });
		res.json(bookings);
	} catch (error) {
		res.status(500).json({ message: 'Server error', error: error.message });
	}
};

// 🏫 Book a tour
const bookTour = async (req, res) => {
	try {
		const { tourId, schoolId } = req.body;

		const booking = new Booking({
			tourId,
			schoolId,
			parentId: req.user._id
		});
		await booking.save();
		res.status(201).json(booking);
	} catch (error) {
		res.status(500).json({ message: 'Booking failed', error: error.message });
	}
};

// ❌ Cancel a booking
const cancelBooking = async (req, res) => {
	try {
		const { bookingId } = req.params;

		const booking = await Booking.findOneAndDelete({
			_id: bookingId,
			parentId: req.user._id
		});

		if (!booking) return res.status(404).json({ message: 'Booking not found or already cancelled' });

		res.json({ message: 'Booking cancelled', booking });
	} catch (error) {
		res.status(500).json({ message: 'Cancel failed', error: error.message });
	}
};

// 🌍 Public: Get all verified schools (with filters)
const getAllSchools = async (req, res) => {
	try {
		const { name, schoolType, location, minFee, maxFee, facilities } = req.query;

		const filter = { isVerified: true };

		if (name) {
			filter.name = { $regex: name, $options: 'i' }; // partial name search
		}

		if (schoolType) {
			filter.schoolType = schoolType;
		}

		if (location) {
			filter['location.city'] = { $regex: location, $options: 'i' }; // partial match for flexibility
		}

		if (minFee || maxFee) {
			filter['fees.tuition.minAmount'] = {};
			if (minFee) filter['fees.tuition.minAmount'].$gte = parseFloat(minFee);
			if (maxFee) filter['fees.tuition.minAmount'].$lte = parseFloat(maxFee);
		}

		if (facilities) {
			filter['facilities.name'] = { $regex: facilities, $options: 'i' }; // optional facility filter
		}

		const schools = await School.find(filter)
			.select('name schoolType location description contact averageRating fees ratings')
			.sort({ createdAt: -1 });

		res.json(schools);
	} catch (error) {
		res.status(500).json({ message: 'Failed to fetch schools', error: error.message });
	}
};

// 🌍 Public: Get school by ID
const getSchoolById = async (req, res) => {
	try {
		const { schoolId } = req.params;

		const school = await School.findById(schoolId).select('-adminId -__v');
		if (!school) return res.status(404).json({ message: 'School not found' });

		res.json(school);
	} catch (error) {
		res.status(500).json({ message: 'Failed to fetch school details', error: error.message });
	}
};

// 🌟 Parent rates a school
const rateSchool = async (req, res) => {
	try {
		const { schoolId } = req.params;
		const { overall, academic, facilities, teachers, environment, comment } = req.body;

		const school = await School.findById(schoolId);
		if (!school) return res.status(404).json({ message: 'School not found' });

		const existingRating = school.ratingsList.find(
			r => r.parentId.toString() === req.user._id.toString()
		);
		if (existingRating) return res.status(400).json({ message: 'You’ve already rated this school.' });

		school.ratingsList.push({
			parentId: req.user._id,
			overall,
			academic,
			facilities,
			teachers,
			environment,
			comment
		});

		const total = school.ratingsList.length;
		const avg = field =>
			school.ratingsList.reduce((sum, rating) => sum + (rating[field] || 0), 0) / total;

		school.ratings = {
			overall: avg('overall'),
			academic: avg('academic'),
			facilities: avg('facilities'),
			teachers: avg('teachers'),
			environment: avg('environment')
		};
		school.averageRating = avg('overall');
		school.totalRatings = total;

		await school.save();
		res.json({ message: 'Rating submitted successfully', school });
	} catch (error) {
		res.status(500).json({ message: 'Failed to submit rating', error: error.message });
	}
};

module.exports = {
	getParentProfile,
	getAllTours,
	getMyBookings,
	bookTour,
	cancelBooking,
	getAllSchools,
	getSchoolById,
	rateSchool
};
