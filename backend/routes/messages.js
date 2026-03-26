const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// Public route - Contact form
router.post('/', messageController.createMessage);

// Admin routes
router.get('/', authenticate, requireAdmin, messageController.getAllMessages);
router.get('/unread', authenticate, requireAdmin, messageController.getUnreadMessages);
router.get('/unread-count', authenticate, requireAdmin, messageController.getUnreadCount);
router.put('/:id/read', authenticate, requireAdmin, messageController.markAsRead);
router.delete('/:id', authenticate, requireAdmin, messageController.deleteMessage);

module.exports = router;
