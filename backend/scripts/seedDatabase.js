// backend/scripts/seedDatabase.js
const mongoose = require('mongoose');
require('dotenv').config();

const User = require('../models/user');
const School = require('../models/School');
const Tour = require('../models/Tour');
const Booking = require('../models/Booking');

// Connect to MongoDB
const connectDB = async () => {
	try {
		const mongoURI = process.env.MONGODB_URI || 'mongodb+srv://cglynnskip:D1hLPAludvPW2SFW@amsdb.1zdlc.mongodb.net/SchoolTouringDatabase';
		await mongoose.connect(mongoURI);
		console.log('✅ Connected to MongoDB');
	} catch (error) {
		console.error('❌ MongoDB connection error:', error);
		process.exit(1);
	}
};

// Sample test users
const createTestUsers = async () => {
	console.log('🔄 Creating test users...');
	
	const users = [
		{
			name: 'System Administrator',
			email: 'systemadmin@test.com',
			password: 'password123',
			role: 'system_admin',
			phone: '+254700000001',
			isActive: true,
			isVerified: true
		},
		{
			name: 'School Admin User',
			email: 'schooladmin@test.com',
			password: 'password123',
			role: 'school_admin',
			phone: '+254700000002',
			isActive: true,
			isVerified: true
		},
		{
			name: 'Parent User',
			email: 'parent@test.com',
			password: 'password123',
			role: 'parent',
			phone: '+254700000003',
			isActive: true,
			isVerified: true,
			children: [
				{
					name: 'John Doe',
					age: 15,
					grade: 'Form 2',
					school: 'Current School'
				}
			]
		},
		{
			name: 'Jane Smith',
			email: 'parent2@test.com',
			password: 'password123',
			role: 'parent',
			phone: '+254700000004',
			isActive: true,
			isVerified: true,
			children: [
				{
					name: 'Alice Smith',
					age: 12,
					grade: 'Class 7',
					school: 'Primary School'
				},
				{
					name: 'Bob Smith',
					age: 16,
					grade: 'Form 3',
					school: 'Secondary School'
				}
			]
		}
	];

	for (const userData of users) {
		try {
			// Check if user already exists
			const existingUser = await User.findOne({ email: userData.email });
			if (existingUser) {
				console.log(`⚠️ User already exists: ${userData.email}`);
				continue;
			}

			const user = new User(userData);
			await user.save();
			console.log(`✅ Created user: ${userData.email} (${userData.role})`);
		} catch (error) {
			console.error(`❌ Error creating user ${userData.email}:`, error.message);
		}
	}
};

// Create sample school for testing
const createTestSchool = async () => {
	console.log('🔄 Creating test school...');
	
	try {
		// Check if test school already exists
		const existingSchool = await School.findOne({ name: 'Test Academy' });
		if (existingSchool) {
			console.log('⚠️ Test school already exists');
			return existingSchool;
		}

		// Find the school admin user
		const schoolAdmin = await User.findOne({ email: 'schooladmin@test.com' });
		if (!schoolAdmin) {
			console.log('❌ School admin user not found, skipping school creation');
			return null;
		}

		const schoolData = {
			name: 'Test Academy',
			description: 'A premier educational institution offering quality education from primary to secondary level.',
			schoolType: 'Secondary',
			location: {
				address: '123 Education Drive',
				city: 'Nairobi',
				state: 'Nairobi County',
				country: 'Kenya',
				postalCode: '00100'
			},
			contact: {
				phone: '+254700123456',
				email: 'info@testacademy.co.ke',
				website: 'www.testacademy.co.ke'
			},
			images: [
				{
					url: 'https://picsum.photos/800/600?random=1',
					caption: 'Main School Building',
					isPrimary: true
				},
				{
					url: 'https://picsum.photos/800/600?random=2',
					caption: 'Science Laboratory',
					isPrimary: false
				}
			],
			facilities: [
				{
					name: 'Science Laboratory',
					description: 'Modern science lab with latest equipment',
					category: 'Academic'
				},
				{
					name: 'Sports Field',
					description: 'Multi-purpose sports field for various activities',
					category: 'Sports'
				},
				{
					name: 'Library',
					description: 'Well-stocked library with digital resources',
					category: 'Academic'
				},
				{
					name: 'Computer Lab',
					description: 'Computer lab with high-speed internet',
					category: 'Academic'
				}
			],
			curriculum: ['KCSE', 'Cambridge IGCSE'],
			grades: {
				from: 'Form 1',
				to: 'Form 4'
			},
			fees: {
				currency: 'KES',
				tuition: {
					minAmount: 80000,
					maxAmount: 120000,
					period: 'Termly'
				},
				registration: 15000
			},
			ratings: {
				overall: 4.5,
				academic: 4.6,
				facilities: 4.4,
				teachers: 4.7,
				environment: 4.3
			},
			averageRating: 4.5,
			totalRatings: 127,
			tourSchedule: {
				availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
				timeSlots: [
					{
						startTime: '09:00',
						endTime: '10:30',
						maxVisitors: 20
					},
					{
						startTime: '11:00',
						endTime: '12:30',
						maxVisitors: 20
					},
					{
						startTime: '14:00',
						endTime: '15:30',
						maxVisitors: 15
					}
				],
				duration: 90,
				advanceBooking: 2
			},
			adminId: schoolAdmin._id,
			isActive: true,
			isVerified: true
		};

		const school = new School(schoolData);
		await school.save();

		// Update school admin's schoolId
		schoolAdmin.schoolId = school._id;
		await schoolAdmin.save();

		console.log('✅ Created test school: Test Academy');
		return school;
	} catch (error) {
		console.error('❌ Error creating test school:', error.message);
		return null;
	}
};

// Create sample tours
const createTestTours = async () => {
	console.log('🔄 Creating test tours...');
	
	try {
		const school = await School.findOne({ name: 'Test Academy' });
		if (!school) {
			console.log('❌ Test school not found, skipping tour creation');
			return;
		}

		// Check if tours already exist
		const existingTours = await Tour.find({ schoolId: school._id });
		if (existingTours.length > 0) {
			console.log('⚠️ Test tours already exist');
			return;
		}

		const toursData = [
			{
				title: 'Morning Campus Tour',
				description: 'Comprehensive tour of our campus facilities including classrooms, laboratories, and sports facilities.',
				schoolId: school._id,
				date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
				startTime: '09:00',
				endTime: '10:30',
				maxCapacity: 20,
				currentBookings: 3,
				isActive: true,
				tourType: 'Physical',
				meetingPoint: 'Main Reception',
				duration: 90,
				highlights: [
					'State-of-the-art science laboratories',
					'Modern computer lab',
					'Well-equipped library',
					'Sports facilities tour'
				],
				requirements: [
					'Comfortable walking shoes',
					'Valid identification',
					'Advance booking required'
				]
			},
			{
				title: 'Academic Excellence Showcase',
				description: 'Focus on our academic programs, teaching methodologies, and student achievements.',
				schoolId: school._id,
				date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000), // 10 days from now
				startTime: '14:00',
				endTime: '15:30',
				maxCapacity: 15,
				currentBookings: 8,
				isActive: true,
				tourType: 'Physical',
				meetingPoint: 'Main Reception',
				duration: 90,
				highlights: [
					'Meet with department heads',
					'Sample lesson demonstrations',
					'Student achievement displays',
					'Q&A with current students'
				],
				requirements: [
					'Pre-registration required',
					'Photo ID needed'
				]
			},
			{
				title: 'Virtual School Tour',
				description: 'Online tour showcasing our facilities and programs via video conference.',
				schoolId: school._id,
				date: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
				startTime: '16:00',
				endTime: '17:00',
				maxCapacity: 50,
				currentBookings: 12,
				isActive: true,
				tourType: 'Virtual',
				meetingPoint: 'Online - Zoom Link Provided',
				duration: 60,
				highlights: [
					'Virtual facility walkthrough',
					'Meet our teachers online',
					'Interactive Q&A session',
					'Digital resources demonstration'
				],
				requirements: [
					'Stable internet connection',
					'Computer or smartphone with camera',
					'Advance registration required'
				]
			}
		];

		for (const tourData of toursData) {
			const tour = new Tour(tourData);
			await tour.save();
			console.log(`✅ Created tour: ${tourData.title}`);
		}
	} catch (error) {
		console.error('❌ Error creating test tours:', error.message);
	}
};

// Create sample bookings
const createTestBookings = async () => {
	console.log('🔄 Creating test bookings...');
	
	try {
		const school = await School.findOne({ name: 'Test Academy' });
		const tours = await Tour.find({ schoolId: school._id });
		const parents = await User.find({ role: 'parent' });
		
		if (!school || tours.length === 0 || parents.length === 0) {
			console.log('❌ Required data not found, skipping booking creation');
			return;
		}

		// Check if bookings already exist
		const existingBookings = await Booking.find({ schoolId: school._id });
		if (existingBookings.length > 0) {
			console.log('⚠️ Test bookings already exist');
			return;
		}

		const bookingsData = [
			{
				parentId: parents[0]._id,
				tourId: tours[0]._id,
				schoolId: school._id,
				studentName: 'John Doe',
				studentAge: 15,
				currentGrade: 'Form 2',
				parentPhone: '+254700000003',
				parentEmail: 'parent@test.com',
				numberOfGuests: 2,
				specialRequests: 'Please arrange wheelchair accessibility',
				status: 'confirmed',
				confirmedAt: new Date()
			},
			{
				parentId: parents[1]._id,
				tourId: tours[0]._id,
				schoolId: school._id,
				studentName: 'Alice Smith',
				studentAge: 12,
				currentGrade: 'Class 7',
				parentPhone: '+254700000004',
				parentEmail: 'parent2@test.com',
				numberOfGuests: 3,
				specialRequests: 'Interested in science programs',
				status: 'pending'
			},
			{
				parentId: parents[1]._id,
				tourId: tours[1]._id,
				schoolId: school._id,
				studentName: 'Bob Smith',
				studentAge: 16,
				currentGrade: 'Form 3',
				parentPhone: '+254700000004',
				parentEmail: 'parent2@test.com',
				numberOfGuests: 2,
				status: 'confirmed',
				confirmedAt: new Date()
			}
		];

		for (const bookingData of bookingsData) {
			const booking = new Booking(bookingData);
			await booking.save();
			console.log(`✅ Created booking for: ${bookingData.studentName}`);
		}
	} catch (error) {
		console.error('❌ Error creating test bookings:', error.message);
	}
};

// Main seeding function
const seedDatabase = async () => {
	try {
		console.log('🌱 Starting database seeding...');
		
		await connectDB();
		
		await createTestUsers();
		await createTestSchool();
		await createTestTours();
		await createTestBookings();
		
		console.log('✅ Database seeding completed successfully!');
		console.log('');
		console.log('🔐 Test Login Credentials:');
		console.log('System Admin: systemadmin@test.com / password123');
		console.log('School Admin: schooladmin@test.com / password123');
		console.log('Parent 1: parent@test.com / password123');
		console.log('Parent 2: parent2@test.com / password123');
		console.log('');
		
	} catch (error) {
		console.error('❌ Database seeding failed:', error);
	} finally {
		mongoose.disconnect();
		console.log('🔌 Disconnected from MongoDB');
	}
};

// Run seeding if this script is executed directly
if (require.main === module) {
	seedDatabase();
}

module.exports = {
	seedDatabase,
	createTestUsers,
	createTestSchool,
	createTestTours,
	createTestBookings
};