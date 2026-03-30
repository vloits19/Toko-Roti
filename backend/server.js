const express = require('express');
const cors = require('cors');
const path = require('path');
const db = require('./database/db'); // Initialize database

const app = express();

app.use((req, res, next) => {
  const initError = db.getError && db.getError();
  if (initError && req.path.startsWith('/api/') && req.path !== '/api/health') {
    return res.status(500).json({
      success: false,
      message: 'Database initialization failed on Vercel: ' + initError.message,
      stack: initError.stack
    });
  }
  next();
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')));
app.use('/images', express.static(path.join(__dirname, '..', 'public', 'images')));

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/products'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/cart', require('./routes/cart'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/midtrans', require('./api/route'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Payment webhook endpoint (for future integration)
app.post('/api/webhook/:provider', async (req, res) => {
  const { provider } = req.params;
  const paymentService = require('./services/paymentService');
  
  try {
    const result = await paymentService.handleWebhook(provider, req.body);
    res.json(result);
  } catch (error) {
    console.error('Webhook error:', error);
    res.status(400).json({ success: false, message: 'Webhook processing failed' });
  }
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 3001;

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
  });
}

module.exports = app;
