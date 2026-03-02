const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analytics.controller');

router.get('/suppliers', AnalyticsController.getSupplierAnalysis);
router.get('/customers/:customerId/history', AnalyticsController.getCustomerHistory);
router.get('/products/top-by-category/:categoryName', AnalyticsController.getTopProductsByCategory);

module.exports = router;
