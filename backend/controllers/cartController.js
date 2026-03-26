const Cart = require('../models/Cart');
const Product = require('../models/Product');

// Get cart items
const getCart = async (req, res) => {
  try {
    const userId = req.user.id;
    const cartItems = Cart.findByUserId(userId);
    const total = Cart.getCartTotal(userId);

    res.json({
      success: true,
      data: {
        items: cartItems,
        total
      }
    });
  } catch (error) {
    console.error('Get cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Add item to cart
const addToCart = async (req, res) => {
  try {
    const { product_id, quantity = 1 } = req.body;
    const userId = req.user.id;

    // Validate product
    const product = Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Check stock
    if (product.stock < quantity) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}`
      });
    }

    // Add to cart
    Cart.addItem(userId, product_id, quantity);
    const cartItems = Cart.findByUserId(userId);
    const total = Cart.getCartTotal(userId);

    res.json({
      success: true,
      message: 'Item added to cart',
      data: {
        items: cartItems,
        total
      }
    });
  } catch (error) {
    console.error('Add to cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update cart item quantity
const updateQuantity = async (req, res) => {
  try {
    const { product_id, quantity } = req.body;
    const userId = req.user.id;

    if (quantity < 0) {
      return res.status(400).json({
        success: false,
        message: 'Invalid quantity'
      });
    }

    // Check product stock
    const product = Product.findById(product_id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    if (quantity > product.stock) {
      return res.status(400).json({
        success: false,
        message: `Insufficient stock. Available: ${product.stock}`
      });
    }

    // Update cart
    Cart.updateQuantity(userId, product_id, quantity);
    const cartItems = Cart.findByUserId(userId);
    const total = Cart.getCartTotal(userId);

    res.json({
      success: true,
      message: 'Cart updated',
      data: {
        items: cartItems,
        total
      }
    });
  } catch (error) {
    console.error('Update cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Remove item from cart
const removeFromCart = async (req, res) => {
  try {
    const { product_id } = req.body;
    const userId = req.user.id;

    Cart.removeItem(userId, product_id);
    const cartItems = Cart.findByUserId(userId);
    const total = Cart.getCartTotal(userId);

    res.json({
      success: true,
      message: 'Item removed from cart',
      data: {
        items: cartItems,
        total
      }
    });
  } catch (error) {
    console.error('Remove from cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Clear cart
const clearCart = async (req, res) => {
  try {
    const userId = req.user.id;
    Cart.clearCart(userId);

    res.json({
      success: true,
      message: 'Cart cleared',
      data: {
        items: [],
        total: 0
      }
    });
  } catch (error) {
    console.error('Clear cart error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getCart,
  addToCart,
  updateQuantity,
  removeFromCart,
  clearCart
};
