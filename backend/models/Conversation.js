// backend/models/Conversation.js
const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
	participants: [{
		userId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users',
			required: true
		},
		role: {
			type: String,
			enum: ['parent', 'school_admin'],
			required: true
		},
		joinedAt: {
			type: Date,
			default: Date.now
		},
		lastReadAt: {
			type: Date,
			default: Date.now
		}
	}],
	schoolId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'schools',
		required: true
	},
	subject: {
		type: String,
		trim: true,
		maxlength: 200
	},
	status: {
		type: String,
		enum: ['active', 'archived', 'closed'],
		default: 'active'
	},
	lastMessage: {
		content: String,
		senderId: {
			type: mongoose.Schema.Types.ObjectId,
			ref: 'users'
		},
		sentAt: Date
	},
	messageCount: {
		type: Number,
		default: 0
	},
	unreadCount: {
		parent: { type: Number, default: 0 },
		school_admin: { type: Number, default: 0 }
	},
	tags: [String],
	priority: {
		type: String,
		enum: ['low', 'normal', 'high', 'urgent'],
		default: 'normal'
	},
	// Context information
	relatedBookingId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'bookings'
	},
	relatedTourId: {
		type: mongoose.Schema.Types.ObjectId,
		ref: 'tours'
	},
	conversationType: {
		type: String,
		enum: ['general', 'booking_inquiry', 'tour_request', 'complaint', 'feedback'],
		default: 'general'
	}
}, {
	timestamps: true
});

// Indexes for performance
conversationSchema.index({ 'participants.userId': 1 });
conversationSchema.index({ schoolId: 1, status: 1 });
conversationSchema.index({ status: 1, updatedAt: -1 });

// Virtual to get parent participant
conversationSchema.virtual('parentParticipant').get(function() {
	return this.participants.find(p => p.role === 'parent');
});

// Virtual to get school admin participant
conversationSchema.virtual('schoolAdminParticipant').get(function() {
	return this.participants.find(p => p.role === 'school_admin');
});

// Method to add participant
conversationSchema.methods.addParticipant = function(userId, role) {
	const existingParticipant = this.participants.find(p => 
		p.userId.toString() === userId.toString()
	);
	
	if (!existingParticipant) {
		this.participants.push({
			userId,
			role,
			joinedAt: new Date(),
			lastReadAt: new Date()
		});
	}
	
	return this.save();
};

// Method to update last message
conversationSchema.methods.updateLastMessage = function(content, senderId) {
	this.lastMessage = {
		content: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
		senderId,
		sentAt: new Date()
	};
	this.messageCount += 1;
	this.updatedAt = new Date();
	return this.save();
};

// Method to update unread count
conversationSchema.methods.updateUnreadCount = function(recipientRole, increment = 1) {
	if (recipientRole === 'parent') {
		this.unreadCount.parent += increment;
	} else if (recipientRole === 'school_admin') {
		this.unreadCount.school_admin += increment;
	}
	return this.save();
};

// Method to reset unread count for a role
conversationSchema.methods.resetUnreadCount = function(role) {
	if (role === 'parent') {
		this.unreadCount.parent = 0;
	} else if (role === 'school_admin') {
		this.unreadCount.school_admin = 0;
	}
	return this.save();
};

// Static method to find conversations for a user
conversationSchema.statics.findForUser = function(userId, role) {
	return this.find({
		'participants.userId': userId,
		'participants.role': role,
		status: { $ne: 'archived' }
	})
	.populate('participants.userId', 'name email')
	.populate('schoolId', 'name')
	.sort({ updatedAt: -1 });
};

// Static method to find conversation between two users
conversationSchema.statics.findBetweenUsers = function(user1Id, user2Id, schoolId) {
	return this.findOne({
		'participants.userId': { $all: [user1Id, user2Id] },
		schoolId: schoolId,
		status: 'active'
	});
};

// Static method to create new conversation
conversationSchema.statics.createConversation = function(parentId, schoolAdminId, schoolId, subject, conversationType = 'general') {
	return this.create({
		participants: [
			{
				userId: parentId,
				role: 'parent',
				joinedAt: new Date(),
				lastReadAt: new Date()
			},
			{
				userId: schoolAdminId,
				role: 'school_admin',
				joinedAt: new Date(),
				lastReadAt: new Date()
			}
		],
		schoolId,
		subject,
		conversationType,
		status: 'active'
	});
};

module.exports = mongoose.model('conversations', conversationSchema);