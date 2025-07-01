// backend/controllers/schoolAdminController.js
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const School = require('../models/School');
// Use your existing User model - adjust path if needed
const User = require('../models/user'); // Note: lowercase 'user' to match your existing files

// Dashboard - Get overview statistics
const getDashboard = async (req, res) => {
	try {
		console.log('📊 School Admin Dashboard requested by user:', req.user.id);
		
		// Find the school associated with this admin
		const school = await School.findOne({ adminId: req.user.id });
		if (!school) {
			return res.status(404).json({ message: 'School not found for this admin' });
		}

		const schoolId = school._id;

		// Get tour statistics
		const totalTours = await Tour.countDocuments({ schoolId });
		const activeTours = await Tour.countDocuments({ schoolId, isActive: true });
		const upcomingTours = await Tour.countDocuments({ 
			schoolId, 
			isActive: true, 
			date: { $gte: new Date() } 
		});

		// Get booking statistics
		const totalBookings = await Booking.countDocuments({ schoolId });
		const pendingBookings = await Booking.countDocuments({ schoolId, status: 'pending' });
		const confirmedBookings = await Booking.countDocuments({ schoolId, status: 'confirmed' });
		const todaysBookings = await Booking.countDocuments({ 
			schoolId, 
			createdAt: { 
				$gte: new Date(new Date().setHours(0, 0, 0, 0)) 
			} 
		});

		// Get recent bookings
		const recentBookings = await Booking.find({ schoolId })
			.populate('tourId', 'title date startTime')
			.populate('parentId', 'name email')
			.sort({ createdAt: -1 })
			.limit(5);

		// Get upcoming tours
		const upcomingToursList = await Tour.find({ 
			schoolId, 
			isActive: true, 
			date: { $gte: new Date() } 
		})
		.sort({ date: 1 })
		.limit(5);

		const dashboardData = {
			school: {
				name: school.name,
				type: school.schoolType,
				isVerified: school.isVerified
			},
			statistics: {
				totalTours,
				activeTours,
				upcomingTours,
				totalBookings,
				pendingBookings,
				confirmedBookings,
				todaysBookings
			},
			recentBookings,
			upcomingTours: upcomingToursList
		};

		console.log('✅ Dashboard data prepared for school:', school.name);
		res.json(dashboardData);

	} catch (error) {
		console.error('❌ Dashboard error:', error);
		res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
	}
};

// Tours Management
const getTours = async (req, res) => {
	try {
		const school = await School.findOne({ adminId: req.user.id });
		if (!school) {
			return res.status(404).json({ message: 'School not found' });
		}

		const tours = await Tour.find({ schoolId: school._id })
			.sort({ date: -1 });

		res.json(tours);
	} catch (error) {
		console.error('❌ Get tours error:', error);
		res.status(500).json({ message: 'Error fetching tours', error: error.message });
	}
};

const createTour = async (req, res) => {
	try {
		const school = await School.findOne({ adminId: req.user.id });
		if (!school) {
			return res.status(404).json({ message: 'School not found' });
		}

		const {
			title,
			description,
			date,
			startTime,
			endTime,
			maxCapacity,
			tourType,
			meetingPoint,
			duration,
			highlights,
			requirements,
			notes
		} = req.body;

		const tour = new Tour({
			title,
			description,
			schoolId: school._id,
			date,
			startTime,
			endTime,
			maxCapacity,
			tourType,
			meetingPoint,
			duration,
			highlights: highlights || [],
			requirements: requirements || [],
			notes
		});

		await tour.save();
		console.log('✅ Tour created:', tour.title);
		res.status(201).json(tour);

	} catch (error) {
		console.error('❌ Create tour error:', error);
		res.status(500).json({ message: 'Error creating tour', error: error.message });
	}
};

const updateTour = async (req, res) => {
	try {
		const school = await School.findOne({ adminId: req.user.id });
		if (!school) {
			return res.status(404).json({ message: 'School not found' });
		}

		const { tourId } = req.params;
		const tour = await Tour.findOne({ _id: tourId, schoolId: school._id });

		if (!tour) {
			return res.status(404).json({ message: 'Tour not found' });
		}

		Object.assign(tour, req.body);
		await tour.save();

		console.log('✅ Tour updated:', tour.title);
		res.json(tour);

	} catch (error) {
		console.error('❌ Update tour error:', error);
		res.status(500).json({ message: 'Error updating tour', error: error.message });
	}
};

const deleteTour = async (req, res) => {
	try {
		const school = await School.findOne({ adminId: req.user.id });
		if (!school) {
			return res.status(404).json({ message: 'School not found' });
		}

		const { tourId } = req.params;
		
		// Check if tour has bookings
		const bookingCount = await Booking.countDocuments({ tourId });
		if (bookingCount > 0) {
			return res.status(400).json({ 
				message: 'Cannot delete tour with existing bookings. Please cancel all bookings first.' 
			});
		}

		const tour = await Tour.findOneAndDelete({ _id: tourId, schoolId: school._id });
		if (!tour) {
			return res.status(404).json({ message: 'Tour not found' });
		}

		console.log('✅ Tour deleted:', tour.title);
		res.json({ message: 'Tour deleted successfully' });

	} catch (error) {
		console.error('❌ Delete tour error:', error);
		res.status(500).json({ message: 'Error deleting tour', error: error.message });
	}
};

// Bookings Management
const getBookings = async (req, res) => {
	try {
		const school = await School.findOne({ adminId: req.user.id });
		if (!school) {
			return res.status(404).json({ message: 'School not found' });
		}

		const { status, tourId } = req.query;
		let query = { schoolId: school._id };

		if (status && status !== 'all') {
			query.status = status;
		}
		if (tourId) {
			query.tourId = tourId;
		}

		const bookings = await Booking.find(query)
			.populate('tourId', 'title date startTime endTime')
			.populate('parentId', 'name email phone')
			.sort({ createdAt: -1 });

		res.json(bookings);

	} catch (error) {
		console.error('❌ Get bookings error:', error);
		res.status(500).json({ message: 'Error fetching bookings', error: error.message });
	}
};

const updateBookingStatus = async (req, res) => {
	try {
		const school = await School.findOne({ adminId: req.user.id });
		if (!school) {
			return res.status(404).json({ message: 'School not found' });
		}

		const { bookingId } = req.params;
		const { status, adminNotes } = req.body;

		const booking = await Booking.findOne({ _id: bookingId, schoolId: school._id });
		if (!booking) {
			return res.status(404).json({ message: 'Booking not found' });
		}

		// Update tour capacity when confirming/cancelling
		if (status === 'confirmed' && booking.status !== 'confirmed') {
			await Tour.findByIdAndUpdate(booking.tourId, { 
				$inc: { currentBookings: booking.numberOfGuests } 
			});
		} else if (status === 'cancelled' && booking.status === 'confirmed') {
			await Tour.findByIdAndUpdate(booking.tourId, { 
				$inc: { currentBookings: -booking.numberOfGuests } 
			});
		}

		booking.status = status;
		if (adminNotes) booking.adminNotes = adminNotes;
		if (status === 'confirmed') booking.confirmedAt = new Date();
		if (status === 'cancelled') booking.cancelledAt = new Date();

		await booking.save();

		console.log('✅ Booking status updated:', booking.bookingReference, 'to', status);
		res.json(booking);

	} catch (error) {
		console.error('❌ Update booking status error:', error);
		res.status(500).json({ message: 'Error updating booking status', error: error.message });
	}
};

// School Profile Management
const getSchoolProfile = async (req, res) => {
	try {
		const school = await School.findOne({ adminId: req.user.id });
		if (!school) {
			return res.status(404).json({ message: 'School not found' });
		}

		res.json(school);

	} catch (error) {
		console.error('❌ Get school profile error:', error);
		res.status(500).json({ message: 'Error fetching school profile', error: error.message });
	}
};

const updateSchoolProfile = async (req, res) => {
	try {
		const school = await School.findOne({ adminId: req.user.id });
		if (!school) {
			return res.status(404).json({ message: 'School not found' });
		}

		// Allow updating specific fields
		const allowedUpdates = [
			'description', 'contact', 'facilities', 'curriculum', 
			'fees', 'tourSchedule', 'images'
		];

		allowedUpdates.forEach(field => {
			if (req.body[field] !== undefined) {
				school[field] = req.body[field];
			}
		});

		school.updatedAt = new Date();
		await school.save();

		console.log('✅ School profile updated:', school.name);
		res.json(school);

	} catch (error) {
		console.error('❌ Update school profile error:', error);
		res.status(500).json({ message: 'Error updating school profile', error: error.message });
	}
};

// Analytics for school admin
const getAnalytics = async (req, res) => {
	try {
		const school = await School.findOne({ adminId: req.user.id });
		if (!school) {
			return res.status(404).json({ message: 'School not found' });
		}

		const schoolId = school._id;

		// Booking trends (last 6 months)
		const sixMonthsAgo = new Date();
		sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

		const bookingTrends = await Booking.aggregate([
			{
				$match: {
					schoolId: schoolId,
					createdAt: { $gte: sixMonthsAgo }
				}
			},
			{
				$group: {
					_id: {
						year: { $year: '$createdAt' },
						month: { $month: '$createdAt' }
					},
					count: { $sum: 1 }
				}
			},
			{
				$sort: { '_id.year': 1, '_id.month': 1 }
			}
		]);

		// Status distribution
		const statusDistribution = await Booking.aggregate([
			{ $match: { schoolId: schoolId } },
			{ $group: { _id: '$status', count: { $sum: 1 } } }
		]);

		// Tour performance
		const tourPerformance = await Booking.aggregate([
			{ $match: { schoolId: schoolId } },
			{
				$group: {
					_id: '$tourId',
					bookings: { $sum: 1 },
					confirmed: { 
						$sum: { $cond: [{ $eq: ['$status', 'confirmed'] }, 1, 0] } 
					}
				}
			},
			{
				$lookup: {
					from: 'tours',
					localField: '_id',
					foreignField: '_id',
					as: 'tour'
				}
			},
			{ $unwind: '$tour' },
			{
				$project: {
					tourTitle: '$tour.title',
					bookings: 1,
					confirmed: 1,
					conversionRate: { 
						$cond: [
							{ $gt: ['$bookings', 0] },
							{ $multiply: [{ $divide: ['$confirmed', '$bookings'] }, 100] },
							0
						]
					}
				}
			}
		]);

		res.json({
			bookingTrends,
			statusDistribution,
			tourPerformance
		});

	} catch (error) {
		console.error('❌ Get analytics error:', error);
		res.status(500).json({ message: 'Error fetching analytics', error: error.message });
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
	getSchoolProfile,
	updateSchoolProfile,
	getAnalytics
};