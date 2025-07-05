// backend/controllers/schoolAdminRegistrationController.js
const User = require('../models/user');
const School = require('../models/School');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Generate JWT token
const generateToken = (userId) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: '7d'
	});
};

// Create School Admin Account
const createSchoolAdmin = async (req, res) => {
	try {
		const {
			// Personal Information
			name,
			email,
			password,
			phone,
			
			// School Information
			schoolName,
			schoolType, // This is now an array
			description,
			
			// Location
			address,
			city,
			state,
			zipCode,
			country = 'Kenya',
			
			// Contact Info
			schoolPhone,
			schoolEmail,
			website,
			
			// Additional Info
			curriculum = [],
			grades,
			
			// Agreement
			agreeToTerms
		} = req.body;

		console.log('🏫 School Admin Registration attempt:', { 
			email, 
			schoolName, 
			schoolType 
		});

		// Validation
		if (!name || !email || !password || !schoolName || !schoolType) {
			return res.status(400).json({ 
				message: 'Name, email, password, school name, and school type are required' 
			});
		}

		// Validate school types
		if (!Array.isArray(schoolType) || schoolType.length === 0) {
			return res.status(400).json({ 
				message: 'Please select at least one school type' 
			});
		}

		// Validate each school type
		const validTypes = ['Primary', 'Secondary', 'College', 'University', 'TVET'];
		const invalidTypes = schoolType.filter(type => !validTypes.includes(type));
		if (invalidTypes.length > 0) {
			return res.status(400).json({ 
				message: `Invalid school types: ${invalidTypes.join(', ')}` 
			});
		}

		if (!agreeToTerms) {
			return res.status(400).json({ 
				message: 'You must agree to the terms and conditions' 
			});
		}

		if (password.length < 6) {
			return res.status(400).json({ 
				message: 'Password must be at least 6 characters long' 
			});
		}

		// Email format validation
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		if (!emailRegex.test(email)) {
			return res.status(400).json({ 
				message: 'Please enter a valid email address' 
			});
		}

		// Check if user already exists
		const existingUser = await User.findOne({ 
			email: email.toLowerCase() 
		});
		if (existingUser) {
			return res.status(400).json({ 
				message: 'An account with this email already exists' 
			});
		}

		// Check if school already exists
		const existingSchool = await School.findOne({ 
			name: { $regex: new RegExp('^' + schoolName + '$', 'i') }
		});
		if (existingSchool) {
			return res.status(400).json({ 
				message: 'A school with this name already exists' 
			});
		}

		// Create school first
		const schoolData = {
			name: schoolName.trim(),
			description: description?.trim() || `${schoolName} - A quality educational institution`,
			schoolType, // Array of selected types
			
			// Location
			location: {
				address: address?.trim() || '',
				city: city?.trim() || '',
				state: state?.trim() || '',
				country,
				postalCode: zipCode?.trim() || ''
			},
			
			// Contact
			contact: {
				phone: schoolPhone?.trim() || phone?.trim() || '',
				email: schoolEmail?.trim() || email.toLowerCase(),
				website: website?.trim() || ''
			},
			
			// Academic Info
			curriculum: Array.isArray(curriculum) ? curriculum : [],
			grades: grades ? {
				from: grades.from || '',
				to: grades.to || ''
			} : {},
			
			// Default settings
			isActive: true,
			isVerified: false, // Will be verified by system admin
			
			// Default tour schedule
			tourSchedule: {
				availableDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
				timeSlots: [
					{
						startTime: '09:00',
						endTime: '10:30',
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
			
			// Default images
			images: [
				{
					url: 'https://picsum.photos/800/600?random=school',
					caption: 'School Campus',
					isPrimary: true
				}
			]
		};

		const school = new School(schoolData);
		await school.save();

		// Create user account
		const userData = {
			name: name.trim(),
			email: email.toLowerCase().trim(),
			password, // Will be hashed by the User model pre-save hook
			role: 'school_admin',
			phone: phone?.trim() || '',
			schoolId: school._id,
			isActive: true,
			isVerified: false, // Will be verified by system admin
			
			// Address information
			address: {
				street: address?.trim() || '',
				city: city?.trim() || '',
				state: state?.trim() || '',
				zipCode: zipCode?.trim() || '',
				country
			}
		};

		const user = new User(userData);
		await user.save();

		// Update school with admin ID
		school.adminId = user._id;
		await school.save();

		// Update login info
		await user.updateLoginInfo();

		// Generate token
		const token = generateToken(user._id);

		console.log('✅ School Admin created successfully:', {
			user: user.email,
			school: school.name,
			schoolTypes: school.schoolType
		});

		// Send response (password is automatically excluded by toJSON)
		res.status(201).json({
			message: 'School admin account created successfully! Your account is pending verification.',
			token,
			user: user.toJSON(),
			school: {
				id: school._id,
				name: school.name,
				type: school.schoolType, // Array of types
				typeFormatted: school.schoolType.join(', '), // Human-readable format
				isVerified: school.isVerified
			}
		});

	} catch (error) {
		console.error('❌ School Admin registration error:', error);
		res.status(500).json({ 
			message: 'Error creating school admin account', 
			error: error.message 
		});
	}
};

// Get registration statistics (for system admin)
const getRegistrationStats = async (req, res) => {
	try {
		const stats = {
			totalSchoolAdmins: await User.countDocuments({ role: 'school_admin' }),
			verifiedSchoolAdmins: await User.countDocuments({ 
				role: 'school_admin', 
				isVerified: true 
			}),
			pendingSchoolAdmins: await User.countDocuments({ 
				role: 'school_admin', 
				isVerified: false 
			}),
			totalSchools: await School.countDocuments(),
			verifiedSchools: await School.countDocuments({ isVerified: true }),
			pendingSchools: await School.countDocuments({ isVerified: false })
		};

		res.json(stats);
	} catch (error) {
		console.error('❌ Get registration stats error:', error);
		res.status(500).json({ 
			message: 'Error fetching registration statistics', 
			error: error.message 
		});
	}
};

// Verify school admin account (system admin only)
const verifySchoolAdmin = async (req, res) => {
	try {
		const { userId } = req.params;
		const { isVerified, notes } = req.body;

		// Find user and associated school
		const user = await User.findById(userId).populate('schoolId');
		if (!user) {
			return res.status(404).json({ message: 'School admin not found' });
		}

		if (user.role !== 'school_admin') {
			return res.status(400).json({ message: 'User is not a school admin' });
		}

		// Update user verification status
		user.isVerified = isVerified;
		await user.save();

		// Update school verification status
		if (user.schoolId) {
			user.schoolId.isVerified = isVerified;
			await user.schoolId.save();
		}

		console.log(`✅ School admin ${isVerified ? 'verified' : 'unverified'}:`, {
			user: user.email,
			school: user.schoolId?.name
		});

		res.json({
			message: `School admin ${isVerified ? 'verified' : 'unverified'} successfully`,
			user: user.toJSON(),
			school: user.schoolId
		});

	} catch (error) {
		console.error('❌ Verify school admin error:', error);
		res.status(500).json({ 
			message: 'Error verifying school admin', 
			error: error.message 
		});
	}
};

// Get pending school admins (system admin only)
const getPendingSchoolAdmins = async (req, res) => {
	try {
		const pendingAdmins = await User.find({ 
			role: 'school_admin',
			isVerified: false 
		})
		.populate('schoolId', 'name schoolType location contact')
		.select('-password')
		.sort({ createdAt: -1 });

		res.json(pendingAdmins);

	} catch (error) {
		console.error('❌ Get pending school admins error:', error);
		res.status(500).json({ 
			message: 'Error fetching pending school admins', 
			error: error.message 
		});
	}
};

// Validate school name availability
const validateSchoolName = async (req, res) => {
	try {
		const { schoolName } = req.query;
		
		if (!schoolName) {
			return res.status(400).json({ message: 'School name is required' });
		}

		const existingSchool = await School.findOne({ 
			name: { $regex: new RegExp('^' + schoolName + '$', 'i') }
		});

		res.json({
			available: !existingSchool,
			message: existingSchool ? 'A school with this name already exists' : 'School name is available'
		});

	} catch (error) {
		console.error('❌ Validate school name error:', error);
		res.status(500).json({ 
			message: 'Error validating school name', 
			error: error.message 
		});
	}
};

// Validate email availability
const validateEmail = async (req, res) => {
	try {
		const { email } = req.query;
		
		if (!email) {
			return res.status(400).json({ message: 'Email is required' });
		}

		const existingUser = await User.findOne({ 
			email: email.toLowerCase() 
		});

		res.json({
			available: !existingUser,
			message: existingUser ? 'An account with this email already exists' : 'Email is available'
		});

	} catch (error) {
		console.error('❌ Validate email error:', error);
		res.status(500).json({ 
			message: 'Error validating email', 
			error: error.message 
		});
	}
};

module.exports = {
	createSchoolAdmin,
	getRegistrationStats,
	verifySchoolAdmin,
	getPendingSchoolAdmins,
	validateSchoolName,
	validateEmail
};