// backend/controllers/authController.js
const User = require('../models/user'); // Note: lowercase 'user' - adjust if your file is different
const jwt = require('jsonwebtoken');

// Generate JWT token
const generateToken = (userId) => {
	return jwt.sign({ userId }, process.env.JWT_SECRET, {
		expiresIn: '7d'
	});
};

// Register new user
const register = async (req, res) => {
	try {
		const { name, email, password, role = 'parent', phone, schoolId } = req.body;

		console.log('🔐 Registration attempt:', { email, role });

		// Check if user already exists
		const existingUser = await User.findOne({ email: email.toLowerCase() });
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists with this email' });
		}

		// Validate required fields
		if (!name || !email || !password) {
			return res.status(400).json({ message: 'Name, email, and password are required' });
		}

		// Validate password length
		if (password.length < 6) {
			return res.status(400).json({ message: 'Password must be at least 6 characters long' });
		}

		// Validate role
		const validRoles = ['parent', 'school_admin', 'system_admin'];
		if (!validRoles.includes(role)) {
			return res.status(400).json({ message: 'Invalid role specified' });
		}

		// Create user data
		const userData = {
			name: name.trim(),
			email: email.toLowerCase().trim(),
			password,
			role,
			phone: phone?.trim(),
			isActive: true,
			isVerified: role === 'system_admin' // Auto-verify system admins
		};

		// Add schoolId for school admins
		if (role === 'school_admin' && schoolId) {
			userData.schoolId = schoolId;
		}

		// Create new user
		const user = new User(userData);
		await user.save();

		// Update login info
		await user.updateLoginInfo();

		// Generate token
		const token = generateToken(user._id);

		console.log('✅ User registered successfully:', user.email);

		// Send response (password is automatically excluded by toJSON)
		res.status(201).json({
			message: 'User registered successfully',
			token,
			user: user.toJSON()
		});

	} catch (error) {
		console.error('❌ Registration error:', error);
		res.status(500).json({ 
			message: 'Error creating user', 
			error: error.message 
		});
	}
};

// Login user
const login = async (req, res) => {
	try {
		const { email, password } = req.body;

		console.log('🔐 Login attempt:', email);

		// Validate input
		if (!email || !password) {
			return res.status(400).json({ message: 'Email and password are required' });
		}

		// Find user by email
		const user = await User.findOne({ email: email.toLowerCase() })
			.populate('schoolId', 'name schoolType isVerified');

		if (!user) {
			console.log('❌ User not found:', email);
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		// Check if user is active
		if (!user.isActive) {
			console.log('❌ User account disabled:', email);
			return res.status(401).json({ message: 'Account is disabled. Please contact support.' });
		}

		// Check password
		const isPasswordValid = await user.comparePassword(password);
		if (!isPasswordValid) {
			console.log('❌ Invalid password for:', email);
			return res.status(401).json({ message: 'Invalid email or password' });
		}

		// Update login info
		await user.updateLoginInfo();

		// Generate token
		const token = generateToken(user._id);

		console.log('✅ Login successful:', { email: user.email, role: user.role });

		// Send response (password is automatically excluded by toJSON)
		res.json({
			message: 'Login successful',
			token,
			user: user.toJSON()
		});

	} catch (error) {
		console.error('❌ Login error:', error);
		res.status(500).json({ 
			message: 'Error during login', 
			error: error.message 
		});
	}
};

// Get current user profile
const getProfile = async (req, res) => {
	try {
		// req.user is set by the auth middleware
		const user = await User.findById(req.user.id)
			.populate('schoolId', 'name schoolType isVerified location')
			.select('-password');

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		res.json({
			message: 'Profile retrieved successfully',
			user: user.toJSON()
		});

	} catch (error) {
		console.error('❌ Get profile error:', error);
		res.status(500).json({ 
			message: 'Error retrieving profile', 
			error: error.message 
		});
	}
};

// Update user profile
const updateProfile = async (req, res) => {
	try {
		const userId = req.user.id;
		const updates = req.body;

		// Remove sensitive fields that shouldn't be updated via this endpoint
		delete updates.password;
		delete updates.email;
		delete updates.role;
		delete updates.schoolId;
		delete updates.isActive;
		delete updates.isVerified;

		const user = await User.findByIdAndUpdate(
			userId,
			updates,
			{ new: true, runValidators: true }
		).populate('schoolId', 'name schoolType isVerified');

		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		console.log('✅ Profile updated:', user.email);

		res.json({
			message: 'Profile updated successfully',
			user: user.toJSON()
		});

	} catch (error) {
		console.error('❌ Update profile error:', error);
		res.status(500).json({ 
			message: 'Error updating profile', 
			error: error.message 
		});
	}
};

// Change password
const changePassword = async (req, res) => {
	try {
		const { currentPassword, newPassword } = req.body;
		const userId = req.user.id;

		// Validate input
		if (!currentPassword || !newPassword) {
			return res.status(400).json({ message: 'Current password and new password are required' });
		}

		if (newPassword.length < 6) {
			return res.status(400).json({ message: 'New password must be at least 6 characters long' });
		}

		// Find user with password field
		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ message: 'User not found' });
		}

		// Verify current password
		const isCurrentPasswordValid = await user.comparePassword(currentPassword);
		if (!isCurrentPasswordValid) {
			return res.status(400).json({ message: 'Current password is incorrect' });
		}

		// Update password
		user.password = newPassword;
		await user.save(); // This will trigger the pre-save hook to hash the password

		console.log('✅ Password changed for:', user.email);

		res.json({ message: 'Password changed successfully' });

	} catch (error) {
		console.error('❌ Change password error:', error);
		res.status(500).json({ 
			message: 'Error changing password', 
			error: error.message 
		});
	}
};

// Refresh token
const refreshToken = async (req, res) => {
	try {
		const userId = req.user.id;
		
		// Find user to ensure they still exist and are active
		const user = await User.findById(userId).select('-password');
		if (!user || !user.isActive) {
			return res.status(401).json({ message: 'User not found or inactive' });
		}

		// Generate new token
		const token = generateToken(user._id);

		res.json({
			message: 'Token refreshed successfully',
			token,
			user: user.toJSON()
		});

	} catch (error) {
		console.error('❌ Refresh token error:', error);
		res.status(500).json({ 
			message: 'Error refreshing token', 
			error: error.message 
		});
	}
};

// Logout (optional - mainly for logging)
const logout = async (req, res) => {
	try {
		const user = req.user;
		console.log('🔓 User logged out:', user.email);
		
		res.json({ message: 'Logged out successfully' });
	} catch (error) {
		console.error('❌ Logout error:', error);
		res.status(500).json({ 
			message: 'Error during logout', 
			error: error.message 
		});
	}
};

// Get user statistics (for admin)
const getUserStats = async (req, res) => {
	try {
		const stats = await User.aggregate([
			{
				$group: {
					_id: '$role',
					count: { $sum: 1 },
					active: { $sum: { $cond: ['$isActive', 1, 0] } },
					verified: { $sum: { $cond: ['$isVerified', 1, 0] } }
				}
			}
		]);

		const totalUsers = await User.countDocuments();
		const recentUsers = await User.find()
			.sort({ createdAt: -1 })
			.limit(5)
			.select('name email role createdAt')
			.lean();

		res.json({
			message: 'User statistics retrieved successfully',
			stats: {
				total: totalUsers,
				byRole: stats,
				recent: recentUsers
			}
		});

	} catch (error) {
		console.error('❌ Get user stats error:', error);
		res.status(500).json({ 
			message: 'Error retrieving user statistics', 
			error: error.message 
		});
	}
};

module.exports = {
	register,
	login,
	getProfile,
	updateProfile,
	changePassword,
	refreshToken,
	logout,
	getUserStats
};