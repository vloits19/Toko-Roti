const Message = require('../models/Message');

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

// Create message (Public contact form)
const createMessage = async (req, res) => {
  try {
    const { name, email, message } = req.body;

    // Validation
    if (!name || !email || !message) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and message'
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email'
      });
    }

    const newMessage = Message.create({
      name,
      email,
      message
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

module.exports = {
  getAllMessages,
  getUnreadMessages,
  createMessage,
  markAsRead,
  deleteMessage,
  getUnreadCount
};
