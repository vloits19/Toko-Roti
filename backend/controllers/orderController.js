const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const paymentService = require('../services/paymentService');

// Get all orders (Admin)
const getAllOrders = async (req, res) => {
  try {
    const orders = Order.findAll();
    
    // Get items for each order
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: Order.getOrderItems(order.id)
    }));

    res.json({
      success: true,
      data: { orders: ordersWithItems }
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get user orders
const getUserOrders = async (req, res) => {
  try {
    const orders = Order.findByUserId(req.user.id);
    
    // Get items for each order
    const ordersWithItems = orders.map(order => ({
      ...order,
      items: Order.getOrderItems(order.id)
    }));

    res.json({
      success: true,
      data: { orders: ordersWithItems }
    });
  } catch (error) {
    console.error('Get user orders error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get single order
const getOrderById = async (req, res) => {
  try {
    const { id } = req.params;
    const order = Order.findById(id);

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns this order or is admin
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const items = Order.getOrderItems(id);

    res.json({
      success: true,
      data: { 
        order: {
          ...order,
          items
        }
      }
    });
  } catch (error) {
    console.error('Get order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create order from cart
const createOrder = async (req, res) => {
  try {
    const { payment_method, shipping_phone, shipping_address } = req.body;
    const userId = req.user.id;

    // Get cart items
    const cartItems = Cart.findByUserId(userId);

    if (cartItems.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Cart is empty'
      });
    }

    // Calculate total
    const totalPrice = cartItems.reduce((sum, item) => {
      return sum + (item.price * item.quantity);
    }, 0);

    // Check stock availability
    for (const item of cartItems) {
      if (item.quantity > item.stock) {
        return res.status(400).json({
          success: false,
          message: `Insufficient stock for ${item.name}. Available: ${item.stock}`
        });
      }
    }

    // Create order
    const order = Order.create({
      user_id: userId,
      total_price: totalPrice,
      payment_method: payment_method || 'bank_transfer',
      shipping_phone,
      shipping_address
    });

    // Add order items
    for (const item of cartItems) {
      Order.addOrderItem(order.id, item.product_id, item.quantity, item.price);
      // Update stock
      Product.updateStock(item.product_id, item.quantity);
    }

    // Clear cart
    Cart.clearCart(userId);

    // Process payment
    const paymentResult = await paymentService.createTransaction({
      order_id: order.id,
      amount: totalPrice,
      customer_name: req.user.name,
      customer_email: req.user.email,
      payment_method: payment_method || 'bank_transfer'
    });

    // Get order with items
    const orderWithItems = {
      ...Order.findById(order.id),
      items: Order.getOrderItems(order.id)
    };

    res.status(201).json({
      success: true,
      message: 'Order created successfully',
      data: {
        order: orderWithItems,
        payment: paymentResult
      }
    });
  } catch (error) {
    console.error('Create order error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update order status (Admin)
const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, order_status } = req.body;

    const order = Order.updateStatus(id, { payment_status, order_status });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    res.json({
      success: true,
      message: 'Order status updated',
      data: { order }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Verify payment
const verifyPayment = async (req, res) => {
  try {
    const { transaction_id } = req.body;

    const result = await paymentService.verifyPayment(transaction_id);

    // Update order status if payment successful
    if (result.success && result.status === 'paid') {
      // Extract order ID from transaction or get from request
      // This is simplified - in real implementation, you'd map transaction to order
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('Verify payment error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Mock payment success for local testing environment
const markAsPaid = async (req, res) => {
  try {
    const { id } = req.params;
    const order = Order.findById(id);

    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Check ownership
    if (order.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    const updated = Order.updateStatus(id, { payment_status: 'paid', order_status: 'processing' });
    
    res.json({
      success: true,
      message: 'Order marked as paid successfully',
      data: { order: updated }
    });
  } catch (error) {
    console.error('Mark as paid error:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Get order statistics (Admin)
const getStatistics = async (req, res) => {
  try {
    const stats = Order.getStatistics();

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    console.error('Get statistics error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllOrders,
  getUserOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  verifyPayment,
  getStatistics,
  markAsPaid
};
