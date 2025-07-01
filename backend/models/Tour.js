// backend/models/Tour.js
const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
	title: { 
		type: String, 
		required: true 
	},
	description: { 
		type: String, 
		required: true 
	},
	schoolId: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'schools', 
		required: true 
	},
	date: { 
		type: Date, 
		required: true 
	},
	startTime: { 
		type: String, 
		required: true 
	},
	endTime: { 
		type: String, 
		required: true 
	},
	maxCapacity: { 
		type: Number, 
		required: true,
		min: 1 
	},
	currentBookings: { 
		type: Number, 
		default: 0 
	},
	isActive: { 
		type: Boolean, 
		default: true 
	},
	tourType: {
		type: String,
		enum: ['Virtual', 'Physical', 'Hybrid'],
		default: 'Physical'
	},
	meetingPoint: {
		type: String,
		default: 'Main Reception'
	},
	duration: {
		type: Number, // in minutes
		default: 90
	},
	highlights: [{
		type: String
	}],
	requirements: [{
		type: String
	}],
	notes: {
		type: String
	}
}, {
	timestamps: true
});

// Index for efficient queries
tourSchema.index({ schoolId: 1, date: 1 });
tourSchema.index({ isActive: 1 });

// Virtual for available spots
tourSchema.virtual('availableSpots').get(function() {
	return this.maxCapacity - this.currentBookings;
});

// Method to check if tour is full
tourSchema.methods.isFull = function() {
	return this.currentBookings >= this.maxCapacity;
};

// Method to check if tour is upcoming
tourSchema.methods.isUpcoming = function() {
	return new Date(this.date) > new Date();
};

module.exports = mongoose.model('Tour', tourSchema);