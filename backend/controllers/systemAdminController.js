// backend/controllers/systemAdminController.js
console.log('🔄 Loading System Admin Controller...');

// Import models with error handling
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');
const School = require('../models/School');
const User = require('../models/user'); // lowercase to match your pattern
const mongoose = require('mongoose');

console.log('✅ All models imported successfully');

// Dashboard - Get system overview
const getDashboard = async (req, res) => {
	try {
		console.log('📊 System Admin Dashboard requested by user:', req.user.id);

		// Get school statistics
		const totalSchools = await School.countDocuments();
		const verifiedSchools = await School.countDocuments({ isVerified: true });
		const pendingSchools = await School.countDocuments({ isVerified: false });

		// Get user statistics
		const totalUsers = await User.countDocuments();

		// Get tour statistics
		const totalTours = await Tour.countDocuments();

		// Get booking statistics
		const totalBookings = await Booking.countDocuments();

		// Get school types distribution
		const schoolTypes = await School.aggregate([
			{
				$group: {
					_id: '$schoolType',
					count: { $sum: 1 }
				}
			},
			{ $sort: { count: -1 } }
		]);

		// Get top rated schools
		const topRatedSchools = await School.find({
			averageRating: { $exists: true, $gt: 0 }
		})
		.sort({ averageRating: -1 })
		.limit(5)
		.select('name location averageRating ratings');

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

		console.log('✅ System Dashboard data prepared:', {
			totalSchools,
			verifiedSchools,
			totalUsers,
			totalTours,
			totalBookings
		});
		
		res.json(dashboardData);

	} catch (error) {
		console.error('❌ System Dashboard error:', error);
		res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
	}
};

// Get all schools with management info
const getSchools = async (req, res) => {
	try {
		console.log('🏫 Getting all schools for system admin');

		const schools = await School.find({})
			.populate('adminId', 'name email phone isActive')
			.sort({ createdAt: -1 });

		// Add booking counts for each school
		const schoolsWithStats = await Promise.all(
			schools.map(async (school) => {
				const bookingCount = await Booking.countDocuments({ schoolId: school._id });
				const tourCount = await Tour.countDocuments({ schoolId: school._id });
				
				return {
					...school.toObject(),
					statistics: {
						totalBookings: bookingCount,
						totalTours: tourCount
					}
				};
			})
		);

		console.log(`✅ Retrieved ${schools.length} schools with statistics`);
		res.json(schoolsWithStats);

	} catch (error) {
		console.error('❌ Get schools error:', error);
		res.status(500).json({ message: 'Error fetching schools', error: error.message });
	}
};

// Update school approval status
const updateSchoolApproval = async (req, res) => {
	try {
		const { schoolId } = req.params;
		const { isVerified, isActive } = req.body;

		console.log(`🔄 Updating school approval for ID: ${schoolId}`);

		const school = await School.findById(schoolId);
		if (!school) {
			return res.status(404).json({ message: 'School not found' });
		}

		// Update fields
		if (typeof isVerified === 'boolean') {
			school.isVerified = isVerified;
		}
		if (typeof isActive === 'boolean') {
			school.isActive = isActive;
		}

		school.updatedAt = new Date();
		await school.save();

		console.log(`✅ School approval updated: ${school.name}`);
		res.json(school);

	} catch (error) {
		console.error('❌ Update school approval error:', error);
		res.status(500).json({ message: 'Error updating school approval', error: error.message });
	}
};

// Get all users with role info
const getUsers = async (req, res) => {
	try {
		console.log('👥 Getting all users for system admin');

		const users = await User.find({})
			.select('-password') // Exclude password
			.populate('schoolId', 'name schoolType')
			.sort({ createdAt: -1 });

		// Add activity stats for each user
		const usersWithStats = await Promise.all(
			users.map(async (user) => {
				let additionalStats = {};

				if (user.role === 'parent') {
					const bookingCount = await Booking.countDocuments({ parentId: user._id });
					additionalStats.totalBookings = bookingCount;
				} else if (user.role === 'school_admin') {
					const school = await School.findOne({ adminId: user._id });
					if (school) {
						const tourCount = await Tour.countDocuments({ schoolId: school._id });
						const bookingCount = await Booking.countDocuments({ schoolId: school._id });
						additionalStats.schoolName = school.name;
						additionalStats.totalTours = tourCount;
						additionalStats.totalBookings = bookingCount;
					}
				}

				return {
					...user.toObject(),
					statistics: additionalStats
				};
			})
		);

		console.log(`✅ Retrieved ${users.length} users with statistics`);
		res.json(usersWithStats);

	} catch (error) {
		console.error('❌ Get users error:', error);
		res.status(500).json({ message: 'Error fetching users', error: error.message });
	}
};

// Update user status
const updateUserStatus = async (req, res) => {
	try {
		const { userId } = req.params;
		const { isActive, isVerified } = req.body;

		console.log(`🔄 Updating user status for ID: ${userId}`);

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Update fields
		if (typeof isActive === 'boolean') {
			user.isActive = isActive;
		}
		if (typeof isVerified === 'boolean') {
			user.isVerified = isVerified;
		}

		user.updatedAt = new Date();
		await user.save();

		console.log(`✅ User status updated: ${user.name}`);
		res.json({ ...user.toObject(), password: undefined }); // Exclude password

	} catch (error) {
		console.error('❌ Update user status error:', error);
		res.status(500).json({ message: 'Error updating user status', error: error.message });
	}
};

// Get comprehensive reports - THIS IS THE MAIN REPORTS FUNCTION
const getReports = async (req, res) => {
	try {
		console.log('📈 Generating comprehensive system reports');

		// 1. Bookings by Month (last 12 months)
		const twelveMonthsAgo = new Date();
		twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

		const bookingsByMonth = await Booking.aggregate([
			{
				$match: {
					createdAt: { $gte: twelveMonthsAgo }
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

		// 2. Schools by Verification Status
		const schoolsByStatus = await School.aggregate([
			{
				$group: {
					_id: { $cond: [{ $eq: ['$isVerified', true] }, 'Verified', 'Pending'] },
					count: { $sum: 1 }
				}
			}
		]);

		// 3. Schools by Type
		const schoolsByType = await School.aggregate([
			{
				$group: {
					_id: '$schoolType',
					count: { $sum: 1 }
				}
			},
			{ $sort: { count: -1 } }
		]);

		// 4. Users by Role
		const usersByRole = await User.aggregate([
			{
				$group: {
					_id: '$role',
					count: { $sum: 1 }
				}
			},
			{ $sort: { count: -1 } }
		]);

		// 5. Rating Statistics
		const ratingStats = await School.aggregate([
			{
				$match: {
					averageRating: { $exists: true, $gt: 0 }
				}
			},
			{
				$group: {
					_id: null,
					avgOverall: { $avg: '$averageRating' },
					avgAcademic: { $avg: '$ratings.academic' },
					avgFacilities: { $avg: '$ratings.facilities' },
					avgTeachers: { $avg: '$ratings.teachers' },
					avgEnvironment: { $avg: '$ratings.environment' },
					totalRated: { $sum: 1 },
					maxRating: { $max: '$averageRating' },
					minRating: { $min: '$averageRating' }
				}
			}
		]);

		// 6. Geographic Distribution
		const geographicDistribution = await School.aggregate([
			{
				$group: {
					_id: '$location.city',
					count: { $sum: 1 }
				}
			},
			{ $sort: { count: -1 } },
			{ $limit: 20 }
		]);

		// 7. Tour Performance
		const tourPerformance = await Tour.aggregate([
			{
				$lookup: {
					from: 'bookings',
					localField: '_id',
					foreignField: 'tourId',
					as: 'bookings'
				}
			},
			{
				$group: {
					_id: null,
					totalTours: { $sum: 1 },
					toursWithBookings: {
						$sum: { $cond: [{ $gt: [{ $size: '$bookings' }, 0] }, 1, 0] }
					},
					avgBookingsPerTour: { $avg: { $size: '$bookings' } }
				}
			}
		]);

		// 8. Booking Status Distribution
		const bookingStatusDistribution = await Booking.aggregate([
			{
				$group: {
					_id: '$status',
					count: { $sum: 1 }
				}
			}
		]);

		// 9. School Fee Statistics
		const feeStats = await School.aggregate([
			{
				$match: {
					'fees.tuition.minAmount': { $exists: true, $gt: 0 }
				}
			},
			{
				$group: {
					_id: '$fees.currency',
					avgMinFee: { $avg: '$fees.tuition.minAmount' },
					avgMaxFee: { $avg: '$fees.tuition.maxAmount' },
					minFee: { $min: '$fees.tuition.minAmount' },
					maxFee: { $max: '$fees.tuition.maxAmount' },
					schoolCount: { $sum: 1 }
				}
			}
		]);

		// 10. Recent Activity Summary (last 30 days)
		const thirtyDaysAgo = new Date();
		thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

		const recentActivity = {
			newSchools: await School.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
			newUsers: await User.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
			newBookings: await Booking.countDocuments({ createdAt: { $gte: thirtyDaysAgo } }),
			newTours: await Tour.countDocuments({ createdAt: { $gte: thirtyDaysAgo } })
		};

		// 11. Summary totals
		const summary = {
			totalSchools: await School.countDocuments(),
			totalUsers: await User.countDocuments(),
			totalTours: await Tour.countDocuments(),
			totalBookings: await Booking.countDocuments()
		};

		const reportsData = {
			bookingsByMonth,
			schoolsByStatus,
			schoolsByType,
			usersByRole,
			ratingStats: ratingStats[0] || {},
			geographicDistribution,
			tourPerformance: tourPerformance[0] || {},
			bookingStatusDistribution,
			feeStats,
			recentActivity,
			summary,
			generatedAt: new Date()
		};

		console.log('✅ Comprehensive reports generated successfully');
		console.log('📊 Report summary:', {
			schoolsByType: schoolsByType.length,
			usersByRole: usersByRole.length,
			bookingsByMonth: bookingsByMonth.length,
			geographicDistribution: geographicDistribution.length
		});
		
		res.json(reportsData);

	} catch (error) {
		console.error('❌ Get reports error:', error);
		res.status(500).json({ message: 'Error generating reports', error: error.message });
	}
};

// Get all bookings across the platform
const getAllBookings = async (req, res) => {
	try {
		console.log('📅 Getting all bookings for system admin');

		const { status, schoolId, limit = 50, page = 1 } = req.query;
		
		// Build query
		let query = {};
		if (status && status !== 'all') {
			query.status = status;
		}
		if (schoolId) {
			query.schoolId = schoolId;
		}

		const skip = (parseInt(page) - 1) * parseInt(limit);

		const bookings = await Booking.find(query)
			.populate('tourId', 'title date startTime endTime')
			.populate('parentId', 'name email phone')
			.populate('schoolId', 'name location')
			.sort({ createdAt: -1 })
			.limit(parseInt(limit))
			.skip(skip);

		const totalBookings = await Booking.countDocuments(query);

		console.log(`✅ Retrieved ${bookings.length} bookings (page ${page})`);
		res.json({
			bookings,
			pagination: {
				currentPage: parseInt(page),
				totalPages: Math.ceil(totalBookings / parseInt(limit)),
				totalBookings,
				hasMore: skip + bookings.length < totalBookings
			}
		});

	} catch (error) {
		console.error('❌ Get all bookings error:', error);
		res.status(500).json({ message: 'Error fetching bookings', error: error.message });
	}
};

// Advanced Analytics (additional endpoint)
const getAdvancedAnalytics = async (req, res) => {
	try {
		console.log('📊 Generating advanced analytics');

		// Platform Growth Metrics
		const growthMetrics = await User.aggregate([
			{
				$group: {
					_id: {
						year: { $year: '$createdAt' },
						month: { $month: '$createdAt' },
						role: '$role'
					},
					count: { $sum: 1 }
				}
			},
			{ $sort: { '_id.year': 1, '_id.month': 1 } }
		]);

		// School Performance Rankings
		const schoolPerformance = await School.aggregate([
			{
				$lookup: {
					from: 'bookings',
					localField: '_id',
					foreignField: 'schoolId',
					as: 'bookings'
				}
			},
			{
				$lookup: {
					from: 'tours',
					localField: '_id',
					foreignField: 'schoolId',
					as: 'tours'
				}
			},
			{
				$project: {
					name: 1,
					schoolType: 1,
					averageRating: 1,
					bookingCount: { $size: '$bookings' },
					tourCount: { $size: '$tours' },
					conversionRate: {
						$cond: [
							{ $gt: [{ $size: '$tours' }, 0] },
							{ $divide: [{ $size: '$bookings' }, { $size: '$tours' }] },
							0
						]
					}
				}
			},
			{ $sort: { bookingCount: -1 } },
			{ $limit: 20 }
		]);

		// Revenue Potential Analysis (based on fee structures)
		const revenueAnalysis = await School.aggregate([
			{
				$match: {
					'fees.tuition.minAmount': { $exists: true, $gt: 0 }
				}
			},
			{
				$lookup: {
					from: 'bookings',
					localField: '_id',
					foreignField: 'schoolId',
					as: 'bookings'
				}
			},
			{
				$project: {
					name: 1,
					minFee: '$fees.tuition.minAmount',
					maxFee: '$fees.tuition.maxAmount',
					currency: '$fees.currency',
					bookingCount: { $size: '$bookings' },
					potentialMinRevenue: {
						$multiply: ['$fees.tuition.minAmount', { $size: '$bookings' }]
					},
					potentialMaxRevenue: {
						$multiply: ['$fees.tuition.maxAmount', { $size: '$bookings' }]
					}
				}
			},
			{ $sort: { potentialMaxRevenue: -1 } }
		]);

		res.json({
			growthMetrics,
			schoolPerformance,
			revenueAnalysis,
			generatedAt: new Date()
		});

	} catch (error) {
		console.error('❌ Advanced analytics error:', error);
		res.status(500).json({ message: 'Error generating advanced analytics', error: error.message });
	}
};

console.log('✅ System Admin Controller loaded successfully');

module.exports = {
	getDashboard,
	getSchools,
	updateSchoolApproval,
	getUsers,
	updateUserStatus,
	getReports,
	getAllBookings,
	getAdvancedAnalytics
};