const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

app.get('/', (req, res) => res.json({ message: 'MegaStore API - v1.0' }));

const productRoutes = require('./src/routes/product.routes');
const analyticsRoutes = require('./src/routes/analytics.routes');
app.use('/api/products', productRoutes);
app.use('/api/analytics', analyticsRoutes);

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || 'Internal Server Error' });
});

app.use((req, res) => res.status(404).json({ error: 'Route not found' }));

module.exports = app;
