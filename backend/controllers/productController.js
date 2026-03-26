const Product = require('../models/Product');
const path = require('path');
const fs = require('fs');

// Get all products
const getAllProducts = async (req, res) => {
  try {
    const { category, featured } = req.query;
    let products;

    if (featured === 'true') {
      products = Product.findFeatured();
    } else if (category) {
      products = Product.findByCategory(category);
    } else {
      products = Product.findAll();
    }

    res.json({
      success: true,
      data: { products }
    });
  } catch (error) {
    console.error('Get products error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get single product
const getProductById = async (req, res) => {
  try {
    const { id } = req.params;
    const product = Product.findById(id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: { product }
    });
  } catch (error) {
    console.error('Get product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Create product (Admin only)
const createProduct = async (req, res) => {
  try {
    const { name, price, description, category, stock, is_featured, image_url } = req.body;

    // Validation
    if (!name || !price) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name and price'
      });
    }

    let finalImageUrl = image_url || '/images/default-product.jpg';

    // If file uploaded, use that
    if (req.file) {
      finalImageUrl = `/uploads/${req.file.filename}`;
    }

    const product = Product.create({
      name,
      price: parseInt(price),
      description: description || '',
      image_url: finalImageUrl,
      category: category || 'roti',
      stock: parseInt(stock) || 0,
      is_featured: is_featured === 'true' || is_featured === true ? 1 : 0
    });

    res.status(201).json({
      success: true,
      message: 'Product created successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Create product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Update product (Admin only)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, price, description, category, stock, is_featured, image_url } = req.body;

    // Check if product exists
    const existingProduct = Product.findById(id);
    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    let finalImageUrl = existingProduct.image_url;

    // If new file uploaded
    if (req.file) {
      // Delete old image if it's an uploaded file
      if (existingProduct.image_url && existingProduct.image_url.startsWith('/uploads/')) {
        const oldImagePath = path.join(__dirname, '..', '..', existingProduct.image_url);
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }
      finalImageUrl = `/uploads/${req.file.filename}`;
    } else if (image_url) {
      // If URL provided
      finalImageUrl = image_url;
    }

    const product = Product.update(id, {
      name: name || existingProduct.name,
      price: parseInt(price) || existingProduct.price,
      description: description !== undefined ? description : existingProduct.description,
      image_url: finalImageUrl,
      category: category || existingProduct.category,
      stock: parseInt(stock) !== undefined ? parseInt(stock) : existingProduct.stock,
      is_featured: is_featured !== undefined ? (is_featured === 'true' || is_featured === true ? 1 : 0) : existingProduct.is_featured
    });

    res.json({
      success: true,
      message: 'Product updated successfully',
      data: { product }
    });
  } catch (error) {
    console.error('Update product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Delete product (Admin only)
const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const product = Product.findById(id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    // Delete image file if exists
    if (product.image_url && product.image_url.startsWith('/uploads/')) {
      const imagePath = path.join(__dirname, '..', '..', product.image_url);
      if (fs.existsSync(imagePath)) {
        fs.unlinkSync(imagePath);
      }
    }

    Product.delete(id);

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });
  } catch (error) {
    console.error('Delete product error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Get product categories
const getCategories = async (req, res) => {
  try {
    const products = Product.findAll();
    const categories = [...new Set(products.map(p => p.category))];

    res.json({
      success: true,
      data: { categories }
    });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

module.exports = {
  getAllProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getCategories
};
