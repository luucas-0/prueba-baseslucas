const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analytics.controller');

router.get('/suppliers', (req, res, next) => AnalyticsController.getSupplierAnalysis(req, res, next));
router.get('/customers/:customerId/history', (req, res, next) => AnalyticsController.getCustomerHistory(req, res, next));
router.get('/products/top-by-category/:categoryName', (req, res, next) => AnalyticsController.getTopProductsByCategory(req, res, next));

module.exports = router;
