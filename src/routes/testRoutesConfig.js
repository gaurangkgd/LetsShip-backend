const express = require('express');
const orderRoutes = require('./orderRoutes');
const courierRoutes = require('./courierRoutes');

const app = express();

app.use('/api/orders', orderRoutes);
app.use('/api/couriers', courierRoutes);

console.log('Routes configured successfully');

module.exports = app;