// backend/models/Message.js
const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
	conversationId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'conversations',
		required: true
	},
	senderId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users',
		required: true
	},
	senderRole: {
		type: String,
		enum: ['parent', 'school_admin'],
		required: true
	},
	recipientId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'users',
		required: true
	},
	recipientRole: {
		type: String,
		enum: ['parent', 'school_admin'],
		required: true
	},
	subject: {
		type: String,
		trim: true,
		maxlength: 200
	},
	content: {
		type: String,
		required: true,
		trim: true,
		maxlength: 2000
	},
	messageType: {
		type: String,
		enum: ['text', 'booking_inquiry', 'tour_request', 'general', 'system'],
		default: 'text'
	},
	relatedBookingId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'bookings'
	},
	relatedTourId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'tours'
	},
	relatedSchoolId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'schools'
	},
	isRead: {
		type: Boolean,
		default: false
	},
	readAt: {
		type: Date
	},
	priority: {
		type: String,
		enum: ['low', 'normal', 'high', 'urgent'],
		default: 'normal'
	},
	attachments: [{
		filename: String,
		originalName: String,
		url: String,
		size: Number,
		mimetype: String
	}],
	metadata: {
		ipAddress: String,
		userAgent: String,
		platform: String
	}
}, {
	timestamps: true
});

// Indexes for performance
messageSchema.index({ conversationId: 1, createdAt: -1 });
messageSchema.index({ senderId: 1, createdAt: -1 });
messageSchema.index({ recipientId: 1, isRead: 1 });
messageSchema.index({ relatedBookingId: 1 });
messageSchema.index({ relatedSchoolId: 1 });

// Mark message as read
messageSchema.methods.markAsRead = function() {
	this.isRead = true;
	this.readAt = new Date();
	return this.save();
};

// Static method to mark multiple messages as read
messageSchema.statics.markConversationAsRead = function(conversationId, userId) {
	return this.updateMany(
		{ 
			conversationId: conversationId, 
			recipientId: userId, 
			isRead: false 
		},
		{ 
			isRead: true, 
			readAt: new Date() 
		}
	);
};

// Static method to get unread count
messageSchema.statics.getUnreadCount = function(userId) {
	return this.countDocuments({ recipientId: userId, isRead: false });
};

module.exports = mongoose.model('messages', messageSchema);