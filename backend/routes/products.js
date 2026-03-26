const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { upload, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/', productController.getAllProducts);
router.get('/categories', productController.getCategories);
router.get('/:id', productController.getProductById);

// Admin routes
router.post('/', 
  authenticate, 
  requireAdmin, 
  upload.single('image'), 
  handleUploadError,
  productController.createProduct
);

router.put('/:id', 
  authenticate, 
  requireAdmin, 
  upload.single('image'), 
  handleUploadError,
  productController.updateProduct
);

router.delete('/:id', authenticate, requireAdmin, productController.deleteProduct);

module.exports = router;
