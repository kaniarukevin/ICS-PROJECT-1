const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const router = express.Router();

// Register route
router.post('/register', async (req, res) => {
	try {
		const { name, email, password, role, schoolId } = req.body;

		// Check if user exists
		const existingUser = await User.findOne({ email });
		if (existingUser) {
			return res.status(400).json({ message: 'User already exists' });
		}

		// Hash password
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// Create user
		const user = new User({
			name,
			email,
			password: hashedPassword,
			role,
			schoolId: role === 'school_admin' ? schoolId : undefined
		});

		await user.save();

		// Generate token
		const token = jwt.sign(
			{ userId: user._id },
			process.env.JWT_SECRET || 'your-secret-key',
			{ expiresIn: '24h' }
		);

		res.status(201).json({
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				schoolId: user.schoolId
			}
		});

	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
});

// Login route
router.post('/login', async (req, res) => {
	try {
		const { email, password } = req.body;

		// Check if user exists
		const user = await User.findOne({ email });
		if (!user) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		// Check if user is active
		if (!user.isActive) {
			return res.status(400).json({ message: 'Account is deactivated' });
		}

		// Validate password
		const isMatch = await bcrypt.compare(password, user.password);
		if (!isMatch) {
			return res.status(400).json({ message: 'Invalid credentials' });
		}

		// Generate token
		const token = jwt.sign(
			{ userId: user._id },
			process.env.JWT_SECRET || 'your-secret-key',
			{ expiresIn: '24h' }
		);

		res.json({
			token,
			user: {
				id: user._id,
				name: user.name,
				email: user.email,
				role: user.role,
				schoolId: user.schoolId
			}
		});

	} catch (error) {
		console.error(error);
		res.status(500).json({ message: 'Server error' });
	}
});

module.exports = router;