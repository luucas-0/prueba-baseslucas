const express = require('express');

const router = express.Router();
const ProductController = require('../controllers/product.controller');

router.get('/', (req, res, next) => ProductController.getAllProducts(req, res, next));
router.get('/csv', (req, res, next) => ProductController.downloadCsv(req, res, next));
router.get('/audit/:id', (req, res, next) => ProductController.getProductAuditLogs(req, res, next));
router.get('/:id', (req, res, next) => ProductController.getProductById(req, res, next));
router.post('/', (req, res, next) => ProductController.createProduct(req, res, next));
router.put('/:id', (req, res, next) => ProductController.updateProduct(req, res, next));
router.delete('/:id', (req, res, next) => ProductController.deleteProduct(req, res, next));

module.exports = router;
