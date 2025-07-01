// backend/models/Booking.js (Enhanced)
const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
	parentId: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'User', 
		required: true 
	},
	tourId: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'Tour', 
		required: true 
	},
	schoolId: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'schools', 
		required: true 
	},
	
	// Student Information
	studentName: { 
		type: String, 
		required: true 
	},
	studentAge: { 
		type: Number, 
		required: true,
		min: 3,
		max: 25
	},
	currentGrade: {
		type: String
	},
	interestedPrograms: [{
		type: String
	}],
	
	// Contact Information
	parentPhone: { 
		type: String, 
		required: true 
	},
	parentEmail: {
		type: String,
		required: true
	},
	
	// Booking Details
	numberOfGuests: { 
		type: Number, 
		default: 1,
		min: 1,
		max: 5
	},
	specialRequests: { 
		type: String 
	},
	
	// Status Management
	status: { 
		type: String, 
		enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'], 
		default: 'pending' 
	},
	
	// Booking Metadata
	bookingDate: { 
		type: Date, 
		default: Date.now 
	},
	confirmedAt: {
		type: Date
	},
	cancelledAt: {
		type: Date
	},
	cancellationReason: {
		type: String
	},
	
	// Communication
	reminderSent: {
		type: Boolean,
		default: false
	},
	feedback: {
		rating: {
			type: Number,
			min: 1,
			max: 5
		},
		comment: {
			type: String
		},
		submittedAt: {
			type: Date
		}
	},
	
	// Admin Notes
	adminNotes: {
		type: String
	}
}, {
	timestamps: true
});

// Indexes for efficient queries
bookingSchema.index({ schoolId: 1, status: 1 });
bookingSchema.index({ tourId: 1 });
bookingSchema.index({ parentId: 1 });
bookingSchema.index({ bookingDate: -1 });

// Method to confirm booking
bookingSchema.methods.confirm = function() {
	this.status = 'confirmed';
	this.confirmedAt = new Date();
	return this.save();
};

// Method to cancel booking
bookingSchema.methods.cancel = function(reason) {
	this.status = 'cancelled';
	this.cancelledAt = new Date();
	this.cancellationReason = reason;
	return this.save();
};

// Virtual for booking reference
bookingSchema.virtual('bookingReference').get(function() {
	return `BK${this._id.toString().slice(-8).toUpperCase()}`;
});

module.exports = mongoose.model('Booking', bookingSchema);