const User = require('../models/user');
const School = require('../models/School');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');

// Get system admin dashboard data
const getDashboard = async (req, res) => {
	try {
		console.log('📊 Dashboard API called by user:', req.user.name);
		
		// Get basic counts
		const totalSchools = await School.countDocuments();
		console.log(`🏫 Total schools: ${totalSchools}`);
		
		const verifiedSchools = await School.countDocuments({
			$or: [{ isVerified: true }, { isApproved: true }]
		});
		console.log(`✅ Verified schools: ${verifiedSchools}`);
		
		const pendingSchools = totalSchools - verifiedSchools;
		console.log(`⏳ Pending schools: ${pendingSchools}`);
		
		const totalUsers = await User.countDocuments();
		console.log(`👥 Total users: ${totalUsers}`);
		
		let totalTours = 0;
		let totalBookings = 0;
		
		try {
			totalTours = await Tour.countDocuments();
			console.log(`🎯 Total tours: ${totalTours}`);
		} catch (error) {
			console.log('⚠️ Tour model not found, setting to 0');
		}
		
		try {
			totalBookings = await Booking.countDocuments();
			console.log(`📅 Total bookings: ${totalBookings}`);
		} catch (error) {
			console.log('⚠️ Booking model not found, setting to 0');
		}

		// School types breakdown
		const schoolTypes = await School.aggregate([
			{
				$group: {
					_id: '$schoolType',
					count: { $sum: 1 }
				}
			}
		]);
		console.log('🏷️ School types:', schoolTypes);

		// Top rated schools
		const topRatedSchools = await School.find({
			$or: [
				{ averageRating: { $exists: true, $ne: null } }, 
				{ 'ratings.overall': { $exists: true, $ne: null } }
			]
		})
		.sort({ averageRating: -1, 'ratings.overall': -1 })
		.limit(5)
		.select('name averageRating ratings.overall location.city city');
		
		console.log(`⭐ Top rated schools found: ${topRatedSchools.length}`);

		const dashboardData = {
			totalSchools,
			verifiedSchools,
			pendingSchools,
			totalUsers,
			totalTours,
			totalBookings,
			schoolTypes,
			topRatedSchools
		};
		
		console.log('📤 Sending dashboard data:', dashboardData);
		res.json(dashboardData);
		
	} catch (error) {
		console.error('❌ Dashboard error:', error);
		res.status(500).json({ 
			message: 'Server error', 
			error: error.message,
			stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
		});
	}
};

// Get all schools
const getSchools = async (req, res) => {
	try {
		console.log('🏫 Get schools API called by user:', req.user.name);
		
		const schools = await School.find()
			.populate('adminId', 'name email')
			.sort({ createdAt: -1 });
		
		console.log(`📊 Found ${schools.length} schools`);
		res.json(schools);
		
	} catch (error) {
		console.error('❌ Get schools error:', error);
		res.status(500).json({ 
			message: 'Server error', 
			error: error.message 
		});
	}
};

// Get all users
const getUsers = async (req, res) => {
	try {
		console.log('👥 Get users API called by user:', req.user.name);
		
		const users = await User.find()
			.populate('schoolId', 'name location.city city')
			.select('-password')
			.sort({ createdAt: -1 });
		
		console.log(`📊 Found ${users.length} users`);
		res.json(users);
		
	} catch (error) {
		console.error('❌ Get users error:', error);
		res.status(500).json({ 
			message: 'Server error', 
			error: error.message 
		});
	}
};

// Update school verification status
const updateSchoolApproval = async (req, res) => {
	try {
		const { schoolId } = req.params;
		const { isApproved, isVerified } = req.body;
		
		console.log(`🏫 Updating school ${schoolId} approval:`, { isApproved, isVerified });

		// Update both fields for backward compatibility
		const updateData = {};
		if (isApproved !== undefined) updateData.isApproved = isApproved;
		if (isVerified !== undefined) updateData.isVerified = isVerified;
		
		// If only one is provided, set both to the same value
		if (isApproved !== undefined && isVerified === undefined) {
			updateData.isVerified = isApproved;
		}
		if (isVerified !== undefined && isApproved === undefined) {
			updateData.isApproved = isVerified;
		}

		const school = await School.findByIdAndUpdate(
			schoolId,
			updateData,
			{ new: true }
		);

		if (!school) {
			return res.status(404).json({ message: 'School not found' });
		}

		console.log(`✅ School ${schoolId} updated successfully`);
		res.json(school);
		
	} catch (error) {
		console.error('❌ Update school approval error:', error);
		res.status(500).json({ 
			message: 'Server error', 
			error: error.message 
		});
	}
};

// Update user status
const updateUserStatus = async (req, res) => {
	try {
		const { userId } = req.params;
		const { isActive } = req.body;
		
		console.log(`👥 Updating user ${userId} status:`, { isActive });

		const user = await User.findByIdAndUpdate(
			userId,
			{ isActive },
			{ new: true }
		).select('-password');

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		console.log(`✅ User ${userId} updated successfully`);
		res.json(user);
		
	} catch (error) {
		console.error('❌ Update user status error:', error);
		res.status(500).json({ 
			message: 'Server error', 
			error: error.message 
		});
	}
};

// Get system reports
const getReports = async (req, res) => {
	try {
		console.log('📊 Get reports API called by user:', req.user.name);
		
		// Initialize empty data
		let bookingsByMonth = [];
		let schoolsByStatus = [];
		let schoolsByType = [];
		let usersByRole = [];
		let ratingStats = {};
		let geographicDistribution = [];

		// Get schools by verification status
		try {
			schoolsByStatus = await School.aggregate([
				{
					$group: {
						_id: {
							$cond: [
								{ $or: [{ $eq: ['$isVerified', true] }, { $eq: ['$isApproved', true] }] },
								'Verified',
								'Unverified'
							]
						},
						count: { $sum: 1 }
					}
				}
			]);
		} catch (error) {
			console.log('⚠️ Error getting schools by status:', error.message);
		}

		// Get schools by type
		try {
			schoolsByType = await School.aggregate([
				{
					$group: {
						_id: '$schoolType',
						count: { $sum: 1 }
					}
				}
			]);
		} catch (error) {
			console.log('⚠️ Error getting schools by type:', error.message);
		}

		// Get users by role
		try {
			usersByRole = await User.aggregate([
				{
					$group: {
						_id: '$role',
						count: { $sum: 1 }
					}
				}
			]);
		} catch (error) {
			console.log('⚠️ Error getting users by role:', error.message);
		}

		// Get average ratings
		try {
			const ratingResults = await School.aggregate([
				{
					$match: {
						$or: [
							{ averageRating: { $exists: true, $ne: null } },
							{ 'ratings.overall': { $exists: true, $ne: null } }
						]
					}
				},
				{
					$group: {
						_id: null,
						avgOverall: { 
							$avg: { 
								$ifNull: ['$averageRating', '$ratings.overall'] 
							} 
						},
						avgAcademic: { $avg: '$ratings.academic' },
						avgFacilities: { $avg: '$ratings.facilities' },
						avgTeachers: { $avg: '$ratings.teachers' },
						avgEnvironment: { $avg: '$ratings.environment' },
						totalRated: { $sum: 1 }
					}
				}
			]);
			ratingStats = ratingResults[0] || {};
		} catch (error) {
			console.log('⚠️ Error getting rating stats:', error.message);
		}

		// Get geographic distribution
		try {
			geographicDistribution = await School.aggregate([
				{
					$group: {
						_id: {
							$ifNull: ['$location.state', '$state']
						},
						count: { $sum: 1 }
					}
				},
				{ $sort: { count: -1 } }
			]);
		} catch (error) {
			console.log('⚠️ Error getting geographic distribution:', error.message);
		}

		// Try to get booking data if Booking model exists
		try {
			bookingsByMonth = await Booking.aggregate([
				{
					$group: {
						_id: {
							year: { $year: '$createdAt' },
							month: { $month: '$createdAt' }
						},
						count: { $sum: 1 }
					}
				},
				{ $sort: { '_id.year': -1, '_id.month': -1 } },
				{ $limit: 12 }
			]);
		} catch (error) {
			console.log('⚠️ Booking model not available, skipping booking stats');
		}

		const reportsData = {
			bookingsByMonth,
			schoolsByStatus,
			schoolsByType,
			usersByRole,
			ratingStats,
			geographicDistribution
		};

		console.log('📊 Reports data generated successfully');
		res.json(reportsData);
		
	} catch (error) {
		console.error('❌ Get reports error:', error);
		res.status(500).json({ 
			message: 'Server error', 
			error: error.message 
		});
	}
};

// Get all bookings (placeholder)
const getAllBookings = async (req, res) => {
	try {
		console.log('📅 Get all bookings API called by user:', req.user.name);
		
		// Try to get bookings if model exists
		try {
			const bookings = await Booking.find()
				.populate('parentId', 'name email')
				.populate('schoolId', 'name location.city city location.state state')
				.populate('tourId', 'title date')
				.sort({ createdAt: -1 });
			
			console.log(`📊 Found ${bookings.length} bookings`);
			res.json(bookings);
		} catch (error) {
			console.log('⚠️ Booking model not available, returning empty array');
			res.json([]);
		}
		
	} catch (error) {
		console.error('❌ Get all bookings error:', error);
		res.status(500).json({ 
			message: 'Server error', 
			error: error.message 
		});
	}
};

module.exports = {
	getDashboard,
	getSchools,
	updateSchoolApproval,
	getUsers,
	updateUserStatus,
	getReports,
	getAllBookings
};