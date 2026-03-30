const Message = require('../models/Message');
const User = require('../models/User');

// Get all messages (Admin)
const getAllMessages = async (req, res) => {
  try {
    const messages = Message.findAll();

    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get unread messages (Admin)
const getUnreadMessages = async (req, res) => {
  try {
    const messages = Message.findUnread();
    const count = Message.getUnreadCount();

    res.json({
      success: true,
      data: { 
        messages,
        unread_count: count.count
      }
    });
  } catch (error) {
    console.error('Get unread messages error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create message (Public contact form or User Chat)
const createMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;
    let userId = null;
    let senderName = name;
    let senderEmail = email;

    // If user is logged in, look up their real name from DB
    if (req.user) {
      userId = req.user.id;
      const dbUser = User.findById(req.user.id);
      if (dbUser) {
        senderName = dbUser.name;
        senderEmail = dbUser.email;
      }
    }

    // Validation
    if (!senderName || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and message'
      });
    }

    // Email validation only for guests (logged-in users already have verified emails)
    if (!req.user) {
      if (!senderEmail) {
        return res.status(400).json({
          success: false,
          message: 'Please provide an email'
        });
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(senderEmail)) {
        return res.status(400).json({
          success: false,
          message: 'Please provide a valid email'
        });
      }
    }

    const newMessage = Message.create({
      name: senderName,
      email: senderEmail || '',
      message,
      user_id: userId,
      is_admin: 0
    });

    res.status(201).json({
      success: true,
      message: 'Message sent successfully',
      data: { message: newMessage }
    });
  } catch (error) {
    console.error('Create message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Mark message as read (Admin)
const markAsRead = async (req, res) => {
  try {
    const { id } = req.params;

    const success = Message.markAsRead(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message marked as read'
    });
  } catch (error) {
    console.error('Mark as read error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete message (Admin)
const deleteMessage = async (req, res) => {
  try {
    const { id } = req.params;

    const success = Message.delete(id);

    if (!success) {
      return res.status(404).json({
        success: false,
        message: 'Message not found'
      });
    }

    res.json({
      success: true,
      message: 'Message deleted'
    });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get unread count (Admin)
const getUnreadCount = async (req, res) => {
  try {
    const count = Message.getUnreadCount();

    res.json({
      success: true,
      data: { unread_count: count.count }
    });
  } catch (error) {
    console.error('Get unread count error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user chat history
const getUserChat = async (req, res) => {
  try {
    const messages = Message.findByUserId(req.user.id);
    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Get user chat error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Admin reply to specific user
const replyToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a message'
      });
    }

    const user = User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const newMessage = Message.create({
      name: 'Admin',
      email: 'admin@rotilezat.com',
      message,
      user_id: user.id,
      is_admin: 1
    });

    res.status(201).json({
      success: true,
      message: 'Reply sent',
      data: { message: newMessage }
    });
  } catch (error) {
    console.error('Reply to user error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get all conversations for admin (grouped by user)
const getConversations = async (req, res) => {
  try {
    const conversations = Message.getConversations();
    res.json({
      success: true,
      data: { conversations }
    });
  } catch (error) {
    console.error('Get conversations error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get specific conversation thread for admin
const getConversation = async (req, res) => {
  try {
    const { userId } = req.params;
    const messages = Message.findByUserId(parseInt(userId));
    
    // Mark all user messages as read
    messages.forEach(msg => {
      if (!msg.is_admin && !msg.is_read) {
        Message.markAsRead(msg.id);
      }
    });

    res.json({
      success: true,
      data: { messages }
    });
  } catch (error) {
    console.error('Get conversation error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

module.exports = {
  getAllMessages,
  getUnreadMessages,
  createMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount,
  getUserChat,
  replyToUser,
  getConversations,
  getConversation
};
