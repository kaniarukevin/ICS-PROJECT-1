const mongoose = require('mongoose');

const tourSchema = new mongoose.Schema({
	schoolId: { 
		type: mongoose.Schema.Types.ObjectId, 
		ref: 'School', 
		required: true 
	},
	title: { 
		type: String, 
		required: true 
	},
	description: { 
		type: String, 
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
		default: 20
	},
	currentBookings: { 
		type: Number, 
		default: 0 
	},
	isActive: { 
		type: Boolean, 
		default: true 
	}
}, {
	timestamps: true // This adds createdAt and updatedAt
});

module.exports = mongoose.model('Tour', tourSchema);