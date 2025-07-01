// backend/models/User.js
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
		trim: true
	},
	email: {
		type: String,
		required: true,
		unique: true,
		lowercase: true,
		trim: true
	},
	password: {
		type: String,
		required: true,
		minlength: 6
	},
	role: {
		type: String,
		enum: ['parent', 'school_admin', 'system_admin'],
		default: 'parent'
	},
	
	// Profile Information
	phone: {
		type: String,
		trim: true
	},
	address: {
		street: String,
		city: String,
		state: String,
		zipCode: String,
		country: { type: String, default: 'Kenya' }
	},
	
	// Parent-specific fields
	children: [{
		name: String,
		age: Number,
		grade: String,
		school: String
	}],
	
	// School Admin specific fields
	schoolId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'schools'
	},
	
	// Account status
	isActive: {
		type: Boolean,
		default: true
	},
	isVerified: {
		type: Boolean,
		default: false
	},
	verificationToken: String,
	
	// Login tracking
	lastLogin: Date,
	loginCount: {
		type: Number,
		default: 0
	},
	
	// Password reset
	resetPasswordToken: String,
	resetPasswordExpires: Date,
	
	// Preferences
	preferences: {
		notifications: {
			email: { type: Boolean, default: true },
			sms: { type: Boolean, default: false },
			push: { type: Boolean, default: true }
		},
		language: { type: String, default: 'en' },
		timezone: { type: String, default: 'Africa/Nairobi' }
	}
}, {
	timestamps: true
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ schoolId: 1 });
userSchema.index({ isActive: 1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
	// Only hash the password if it has been modified (or is new)
	if (!this.isModified('password')) return next();
	
	try {
		// Hash password with cost of 12
		const hashedPassword = await bcrypt.hash(this.password, 12);
		this.password = hashedPassword;
		next();
	} catch (error) {
		next(error);
	}
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
	return bcrypt.compare(candidatePassword, this.password);
};

// Instance method to update login tracking
userSchema.methods.updateLoginInfo = async function() {
	this.lastLogin = new Date();
	this.loginCount += 1;
	return this.save();
};

// Static method to find active users
userSchema.statics.findActive = function() {
	return this.find({ isActive: true });
};

// Static method to find by role
userSchema.statics.findByRole = function(role) {
	return this.find({ role: role, isActive: true });
};

// Virtual for full name (if needed)
userSchema.virtual('initials').get(function() {
	return this.name
		.split(' ')
		.map(word => word.charAt(0).toUpperCase())
		.join('');
});

// Virtual for user display info
userSchema.virtual('displayInfo').get(function() {
	return {
		id: this._id,
		name: this.name,
		email: this.email,
		role: this.role,
		isActive: this.isActive,
		lastLogin: this.lastLogin,
		initials: this.initials
	};
});

// Remove password from JSON output
userSchema.methods.toJSON = function() {
	const userObject = this.toObject();
	delete userObject.password;
	delete userObject.verificationToken;
	delete userObject.resetPasswordToken;
	delete userObject.resetPasswordExpires;
	return userObject;
};

module.exports = mongoose.model('users', userSchema);