const ProductModel = require('../models/product.model');
const AuditService = require('../services/audit.service');

class ProductController {
  static async getAllProducts(req, res, next) {
    try {
      const products = await ProductModel.getAll();
      res.json({ success: true, count: products.length, data: products });
    } catch (e) {
      next(e);
    }
  }

  static async getProductById(req, res, next) {
    try {
      const p = await ProductModel.getById(req.params.id);
      if (!p) return res.status(404).json({ success: false, message: 'Not found' });
      res.json({ success: true, data: p });
    } catch (e) {
      next(e);
    }
  }

  static async createProduct(req, res, next) {
    try {
      // basic validation to avoid database NOT NULL violations
      const { sku, name, unit_price, category_id, supplier_id } = req.body;
      if (!name || !sku || !category_id || !supplier_id) {
        return res.status(400).json({
          success: false,
          message: 'sku, name, category_id and supplier_id are required'
        });
      }

      const newP = await ProductModel.create(req.body);
      res.status(201).json({ success: true, data: newP });
    } catch (e) {
      if (e.code === '23505') return res.status(409).json({ success: false, message: 'SKU exists' });
      next(e);
    }
  }

  static async updateProduct(req, res, next) {
    try {
      // validate fields to prevent nulls
      const { name, category_id, supplier_id } = req.body;
      if (name === null) {
        return res.status(400).json({ success: false, message: 'name cannot be null' });
      }
      if (name === undefined && category_id === undefined && supplier_id === undefined &&
          req.body.unit_price === undefined) {
        return res.status(400).json({
          success: false,
          message: 'At least one field (name, unit_price, category_id, supplier_id) must be provided'
        });
      }

      const upd = await ProductModel.update(req.params.id, req.body);
      if (!upd) return res.status(404).json({ success: false });
      res.json({ success: true, data: upd });
    } catch (e) {
      next(e);
    }
  }

  static async deleteProduct(req, res, next) {
    try {
      const result = await ProductModel.delete(req.params.id);
      if (!result) return res.status(404).json({ success: false });
      await AuditService.logDeletion('product', parseInt(req.params.id), result.original);
      res.json({ success: true, data: result.deleted });
    } catch (e) {
      next(e);
    }
  }

  static async getProductAuditLogs(req, res, next) {
    try {
      const logs = await AuditService.getAuditLogs('product', parseInt(req.params.id));
      res.json({ success: true, count: logs.length, data: logs });
    } catch (e) {
      next(e);
    }
  }

  static async downloadCsv(req, res, next) {
    // serve the original CSV file from disk so Postman can fetch it
    const path = require('path');
    const filePath = path.join(__dirname, '../../data/AM-prueba-desempeno-data_m4.csv');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="raw-transactions.csv"');
    const stream = require('fs').createReadStream(filePath);
    stream.on('error', (err) => {
      next(err);
    });
    stream.pipe(res);
  }
}

module.exports = ProductController;
