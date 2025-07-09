// backend/routes/messages.js
const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleAuth');

const {
	getConversations,
	getMessages,
	sendMessage,
	startConversation,
	markConversationAsRead,
	getUnreadCount,
	archiveConversation
} = require('../controllers/messageController');

// All messaging routes require authentication
router.use(authMiddleware);

// Get all conversations for the current user
router.get('/conversations', getConversations);

// Get messages in a specific conversation
router.get('/conversations/:conversationId/messages', getMessages);

// Send a message (to existing conversation or new)
router.post('/send', sendMessage);

// Start a new conversation (primarily for parents contacting schools)
router.post('/conversations/start', startConversation);

// Mark conversation as read
router.put('/conversations/:conversationId/read', markConversationAsRead);

// Get unread message count
router.get('/unread-count', getUnreadCount);

// Archive a conversation
router.put('/conversations/:conversationId/archive', archiveConversation);

// Parent-specific routes
router.post('/contact-school', requireRole(['parent']), startConversation);

// Health check
router.get('/health', (req, res) => {
	res.json({ 
		message: 'Messages API is healthy',
		user: req.user ? {
			id: req.user._id,
			name: req.user.name,
			role: req.user.role
		} : null,
		timestamp: new Date().toISOString()
	});
});

module.exports = router;