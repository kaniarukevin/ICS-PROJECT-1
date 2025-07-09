// backend/controllers/messageController.js
const Message = require('../models/Message');
const Conversation = require('../models/Conversation');
const User = require('../models/user');
const School = require('../models/School');

// Get all conversations for a user
const getConversations = async (req, res) => {
	try {
		const userId = req.user._id;
		const userRole = req.user.role;

		const conversations = await Conversation.findForUser(userId, userRole)
			.populate({
				path: 'participants.userId',
				select: 'name email role'
			})
			.populate('schoolId', 'name')
			.populate('lastMessage.senderId', 'name');

		// Add unread count for current user
		const conversationsWithUnread = conversations.map(conv => {
			const convObj = conv.toObject();
			convObj.unreadForCurrentUser = userRole === 'parent' 
				? conv.unreadCount.parent 
				: conv.unreadCount.school_admin;
			return convObj;
		});

		res.json(conversationsWithUnread);
	} catch (error) {
		console.error('Error fetching conversations:', error);
		res.status(500).json({ message: 'Failed to fetch conversations', error: error.message });
	}
};

// Get messages in a conversation
const getMessages = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const { page = 1, limit = 50 } = req.query;
		const userId = req.user._id;

		// Check if user is participant in this conversation
		const conversation = await Conversation.findById(conversationId);
		if (!conversation) {
			return res.status(404).json({ message: 'Conversation not found' });
		}

		const isParticipant = conversation.participants.some(p => 
			p.userId.toString() === userId.toString()
		);

		if (!isParticipant) {
			return res.status(403).json({ message: 'Access denied to this conversation' });
		}

		const messages = await Message.find({ conversationId })
			.populate('senderId', 'name email role')
			.populate('recipientId', 'name email role')
			.sort({ createdAt: -1 })
			.limit(limit * 1)
			.skip((page - 1) * limit);

		// Mark messages as read for current user
		await Message.markConversationAsRead(conversationId, userId);
		
		// Reset unread count for current user role
		await conversation.resetUnreadCount(req.user.role);

		res.json({
			messages: messages.reverse(), // Reverse to show oldest first
			conversation,
			pagination: {
				page: parseInt(page),
				limit: parseInt(limit),
				total: await Message.countDocuments({ conversationId })
			}
		});
	} catch (error) {
		console.error('Error fetching messages:', error);
		res.status(500).json({ message: 'Failed to fetch messages', error: error.message });
	}
};

// Send a new message
const sendMessage = async (req, res) => {
	try {
		const { conversationId, content, subject, messageType = 'text', priority = 'normal' } = req.body;
		const senderId = req.user._id;
		const senderRole = req.user.role;

		// Validate required fields
		if (!content || !content.trim()) {
			return res.status(400).json({ message: 'Message content is required' });
		}

		let conversation;
		let recipientId;

		if (conversationId) {
			// Existing conversation
			conversation = await Conversation.findById(conversationId);
			if (!conversation) {
				return res.status(404).json({ message: 'Conversation not found' });
			}

			// Check if sender is participant
			const isParticipant = conversation.participants.some(p => 
				p.userId.toString() === senderId.toString()
			);

			if (!isParticipant) {
				return res.status(403).json({ message: 'Access denied to this conversation' });
			}

			// Find recipient (the other participant)
			const recipient = conversation.participants.find(p => 
				p.userId.toString() !== senderId.toString()
			);
			recipientId = recipient.userId;
		} else {
			// New conversation - need recipient info
			const { recipientId: newRecipientId, schoolId } = req.body;
			
			if (!newRecipientId || !schoolId) {
				return res.status(400).json({ 
					message: 'Recipient ID and School ID required for new conversation' 
				});
			}

			// Check if conversation already exists
			conversation = await Conversation.findBetweenUsers(senderId, newRecipientId, schoolId);
			
			if (!conversation) {
				// Create new conversation
				const recipient = await User.findById(newRecipientId);
				if (!recipient) {
					return res.status(404).json({ message: 'Recipient not found' });
				}

				conversation = await Conversation.createConversation(
					senderRole === 'parent' ? senderId : newRecipientId,
					senderRole === 'school_admin' ? senderId : newRecipientId,
					schoolId,
					subject || 'New conversation',
					messageType === 'booking_inquiry' ? 'booking_inquiry' : 'general'
				);
			}

			recipientId = newRecipientId;
		}

		// Get recipient info
		const recipient = await User.findById(recipientId);
		if (!recipient) {
			return res.status(404).json({ message: 'Recipient not found' });
		}

		// Create the message
		const message = new Message({
			conversationId: conversation._id,
			senderId,
			senderRole,
			recipientId,
			recipientRole: recipient.role,
			content: content.trim(),
			subject,
			messageType,
			priority,
			relatedSchoolId: conversation.schoolId,
			metadata: {
				ipAddress: req.ip,
				userAgent: req.get('User-Agent')
			}
		});

		await message.save();

		// Update conversation
		await conversation.updateLastMessage(content, senderId);
		await conversation.updateUnreadCount(recipient.role, 1);

		// Populate the message for response
		await message.populate('senderId', 'name email role');
		await message.populate('recipientId', 'name email role');

		res.status(201).json({
			message: 'Message sent successfully',
			data: message,
			conversationId: conversation._id
		});

	} catch (error) {
		console.error('Error sending message:', error);
		res.status(500).json({ message: 'Failed to send message', error: error.message });
	}
};

// Start a new conversation (for parents contacting schools)
const startConversation = async (req, res) => {
	try {
		const { schoolId, subject, content, messageType = 'general' } = req.body;
		const parentId = req.user._id;

		// Validate required fields
		if (!schoolId || !content || !content.trim()) {
			return res.status(400).json({ 
				message: 'School ID and message content are required' 
			});
		}

		// Find the school and its admin
		const school = await School.findById(schoolId).populate('adminId');
		if (!school) {
			return res.status(404).json({ message: 'School not found' });
		}

		if (!school.adminId) {
			return res.status(400).json({ message: 'School has no assigned administrator' });
		}

		const schoolAdminId = school.adminId._id;

		// Check if conversation already exists
		let conversation = await Conversation.findBetweenUsers(parentId, schoolAdminId, schoolId);

		if (!conversation) {
			// Create new conversation
			conversation = await Conversation.createConversation(
				parentId,
				schoolAdminId,
				schoolId,
				subject || `Inquiry about ${school.name}`,
				messageType
			);
		}

		// Create the first message
		const message = new Message({
			conversationId: conversation._id,
			senderId: parentId,
			senderRole: 'parent',
			recipientId: schoolAdminId,
			recipientRole: 'school_admin',
			content: content.trim(),
			subject,
			messageType,
			relatedSchoolId: schoolId,
			metadata: {
				ipAddress: req.ip,
				userAgent: req.get('User-Agent')
			}
		});

		await message.save();

		// Update conversation
		await conversation.updateLastMessage(content, parentId);
		await conversation.updateUnreadCount('school_admin', 1);

		// Populate for response
		await conversation.populate('participants.userId', 'name email');
		await conversation.populate('schoolId', 'name');
		await message.populate('senderId', 'name email role');

		res.status(201).json({
			message: 'Conversation started successfully',
			conversation,
			firstMessage: message
		});

	} catch (error) {
		console.error('Error starting conversation:', error);
		res.status(500).json({ message: 'Failed to start conversation', error: error.message });
	}
};

// Mark conversation as read
const markConversationAsRead = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const userId = req.user._id;
		const userRole = req.user.role;

		const conversation = await Conversation.findById(conversationId);
		if (!conversation) {
			return res.status(404).json({ message: 'Conversation not found' });
		}

		// Check if user is participant
		const isParticipant = conversation.participants.some(p => 
			p.userId.toString() === userId.toString()
		);

		if (!isParticipant) {
			return res.status(403).json({ message: 'Access denied to this conversation' });
		}

		// Mark all messages as read
		await Message.markConversationAsRead(conversationId, userId);
		
		// Reset unread count
		await conversation.resetUnreadCount(userRole);

		res.json({ message: 'Conversation marked as read' });

	} catch (error) {
		console.error('Error marking conversation as read:', error);
		res.status(500).json({ message: 'Failed to mark conversation as read', error: error.message });
	}
};

// Get unread message count
const getUnreadCount = async (req, res) => {
	try {
		const userId = req.user._id;
		const unreadCount = await Message.getUnreadCount(userId);
		
		res.json({ unreadCount });
	} catch (error) {
		console.error('Error getting unread count:', error);
		res.status(500).json({ message: 'Failed to get unread count', error: error.message });
	}
};

// Archive conversation (soft delete)
const archiveConversation = async (req, res) => {
	try {
		const { conversationId } = req.params;
		const userId = req.user._id;

		const conversation = await Conversation.findById(conversationId);
		if (!conversation) {
			return res.status(404).json({ message: 'Conversation not found' });
		}

		// Check if user is participant
		const isParticipant = conversation.participants.some(p => 
			p.userId.toString() === userId.toString()
		);

		if (!isParticipant) {
			return res.status(403).json({ message: 'Access denied to this conversation' });
		}

		conversation.status = 'archived';
		await conversation.save();

		res.json({ message: 'Conversation archived successfully' });

	} catch (error) {
		console.error('Error archiving conversation:', error);
		res.status(500).json({ message: 'Failed to archive conversation', error: error.message });
	}
};

module.exports = {
	getConversations,
	getMessages,
	sendMessage,
	startConversation,
	markConversationAsRead,
	getUnreadCount,
	archiveConversation
};