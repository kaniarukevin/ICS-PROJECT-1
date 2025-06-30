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
		ref: 'School', 
		required: true 
	},
	studentName: { 
		type: String, 
		required: true 
	},
	studentAge: { 
		type: Number, 
		required: true 
	},
	parentPhone: { 
		type: String, 
		required: true 
	},
	numberOfGuests: { 
		type: Number, 
		default: 1 
	},
	specialRequests: { 
		type: String 
	},
	status: { 
		type: String, 
		enum: ['pending', 'confirmed', 'cancelled'], 
		default: 'pending' 
	},
	bookingDate: { 
		type: Date, 
		default: Date.now 
	}
}, {
	timestamps: true // This adds createdAt and updatedAt
});

module.exports = mongoose.model('Booking', bookingSchema);