let app;
try {
  require('../backend/package.json');
  app = require('../backend/server.js');
} catch (e) {
  console.error("FATAL VERCEL STARTUP ERROR:", e);
  const express = require('express');
  app = express();
  app.all('*', (req, res) => {
    res.status(500).json({
      success: false,
      message: `Fatal Vercel Startup Error: ${e.message}`,
      stack: e.stack
    });
  });
}
module.exports = app;
