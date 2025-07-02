// backend/models/School.js
const mongoose = require('mongoose');

const schoolSchema = new mongoose.Schema({
	name: { type: String, required: true },
	description: { type: String, required: true },
	schoolType: { 
		type: String, 
		enum: ['Primary', 'Secondary', 'College', 'University', 'TVET'],
		required: true 
	},
	
	// Location information
	location: {
		address: { type: String, required: true },
		city: { type: String, required: true },
		state: { type: String, required: true },
		country: { type: String, default: 'Kenya' },
		postalCode: { type: String },
		coordinates: {
			latitude: { type: Number },
			longitude: { type: Number }
		}
	},
	
	// Contact information
	contact: {
		phone: { type: String, required: true },
		email: { type: String, required: true },
		website: { type: String }
	},
	
	// Images
	images: [{
		url: { type: String, required: true },
		caption: { type: String },
		isPrimary: { type: Boolean, default: false }
	}],
	
	// Facilities
	facilities: [{
		name: { type: String, required: true },
		description: { type: String },
		category: { 
			type: String, 
			enum: ['Academic', 'Sports', 'Other'],
			default: 'Other'
		}
	}],
	
	// Curriculum
	curriculum: [{ type: String }],
	
	// Grade levels
	grades: {
		from: { type: String },
		to: { type: String }
	},
	
	// Fee structure
	fees: {
		currency: { type: String, default: 'KES' },
		tuition: {
			minAmount: { type: Number },
			maxAmount: { type: Number },
			baseFee: { type: Number },
			period: { 
				type: String, 
				enum: ['Termly', 'Annually', 'Monthly'],
				default: 'Termly'
			},
			gradeStructure: [{
				grade: { type: String },
				amount: { type: Number },
				description: { type: String }
			}]
		},
		registration: { type: Number },
		other: [{
			name: { type: String },
			amount: { type: Number },
			description: { type: String }
		}]
	},
	
	// Performance and ratings
	performance: { type: Number, min: 0, max: 10 },
	ratings: {
		overall: { type: Number, min: 0, max: 5 },
		academic: { type: Number, min: 0, max: 5 },
		facilities: { type: Number, min: 0, max: 5 },
		teachers: { type: Number, min: 0, max: 5 },
		environment: { type: Number, min: 0, max: 5 }
	},
	averageRating: { type: Number, min: 0, max: 5 },
	totalRatings: { type: Number, default: 0 },
	
	// Fixed: Added missing comma and proper structure
	ratingsList: [{
		parentId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
		overall: { type: Number, min: 0, max: 5 },
		academic: { type: Number, min: 0, max: 5 },
		facilities: { type: Number, min: 0, max: 5 },
		teachers: { type: Number, min: 0, max: 5 },
		environment: { type: Number, min: 0, max: 5 },
		comment: { type: String },
		ratedAt: { type: Date, default: Date.now }
	}],

	// Tour scheduling - Fixed: Added missing comma
	tourSchedule: {
		availableDays: [{ 
			type: String, 
			enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
		}],
		timeSlots: [{
			startTime: { type: String },
			endTime: { type: String },
			maxVisitors: { type: Number, default: 20 }
		}],
		duration: { type: Number, default: 90 },
		advanceBooking: { type: Number, default: 2 }
	},
	
	// Admin and verification
	adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'users' },
	isActive: { type: Boolean, default: true },
	isVerified: { type: Boolean, default: false },
	verificationDocuments: [{
		type: { type: String },
		url: { type: String },
		status: { 
			type: String, 
			enum: ['Pending', 'Approved', 'Rejected'],
			default: 'Pending'
		}
	}],
	
	// Legacy fields for backward compatibility
	address: { type: String },
	city: { type: String },
	state: { type: String },
	zipCode: { type: String },
	phone: { type: String },
	email: { type: String },
	website: { type: String },
	isApproved: { type: Boolean, default: false },
	
	createdAt: { type: Date, default: Date.now },
	updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field on save
schoolSchema.pre('save', function(next) {
	this.updatedAt = Date.now();
	next();
});

// Fixed: Proper model export with correct naming convention
// Use 'School' as model name (singular, capitalized) and let Mongoose pluralize to 'schools'
module.exports = mongoose.model('schools', schoolSchema);