const express = require('express');
const { initializeDatabase } = require('./utils/database');
const requestLogger = require('./middleware/requestLogger');
const errorHandler = require('./middleware/errorHandler');
const notFoundHandler = require('./middleware/notFoundHandler');
const orderRoutes = require('./routes/orderRoutes');
const courierRoutes = require('./routes/courierRoutes');

const app = express();
const PORT = 3000;

// Initialize database
initializeDatabase();

// Middleware setup
app.use(express.json());
app.use(requestLogger);

// Root route
app.get('/', (req, res) => {
  res.json({ 
    message: "Let's Shyp Backend API", 
    version: "1.0" 
  });
});

// Routes
app.use('/api/orders', orderRoutes);
app.use('/api/couriers', courierRoutes);

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

// Start server
const server = app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('📚 API Endpoints:');
  console.log('   POST   /api/orders');
  console.log('   GET    /api/orders');
  console.log('   GET    /api/orders/:id');
  console.log('   PATCH  /api/orders/:id/state');
  console.log('   GET    /api/couriers');
  console.log('   GET    /api/couriers/:id');
  console.log('   PATCH  /api/couriers/:id/location');
});

// Handle server errors
server.on('error', (error) => {
  console.error('Server error:', error);
  process.exit(1);
});
