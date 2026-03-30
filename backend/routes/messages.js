const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate, requireAdmin, optionalAuth } = require('../middleware/auth');

// Public/Optional auth route - Contact form
router.post('/', optionalAuth, messageController.createMessage);

// User routes
router.get('/chat', authenticate, messageController.getUserChat);

// Admin routes
router.get('/', authenticate, requireAdmin, messageController.getAllMessages);
router.get('/conversations', authenticate, requireAdmin, messageController.getConversations);
router.get('/conversations/:userId', authenticate, requireAdmin, messageController.getConversation);
router.post('/reply/:userId', authenticate, requireAdmin, messageController.replyToUser);
router.get('/unread', authenticate, requireAdmin, messageController.getUnreadMessages);
router.get('/unread-count', authenticate, requireAdmin, messageController.getUnreadCount);
router.put('/:id/read', authenticate, requireAdmin, messageController.markAsRead);
router.delete('/:id', authenticate, requireAdmin, messageController.deleteMessage);

module.exports = router;
