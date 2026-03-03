const pool = require('../config/database');
const { getDB } = require('../config/mongodb');

class AnalyticsController {
  static async getSupplierAnalysis(req, res, next) {
    try {
      const suppliersQ = `SELECT s.id,s.name,s.contact,COUNT(p.id) AS product_count,SUM(p.unit_price) AS total_product_value 
        FROM suppliers s 
        LEFT JOIN products p ON s.id=p.supplier_id 
        GROUP BY s.id,s.name,s.contact 
        ORDER BY total_product_value DESC`;
      
      const supRes = await pool.query(suppliersQ);
      const db = getDB();
      const orders = db.collection('orders');

      const data = await Promise.all(
        supRes.rows.map(async (s) => {
          const prodRes = await pool.query('SELECT id FROM products WHERE supplier_id=$1', [s.id]);
          const ids = prodRes.rows.map((r) => r.id);
          const stats = ids.length
            ? await orders
                .aggregate([
                  { $unwind: '$items' },
                  { $match: { 'items.product_id': { $in: ids } } },
                  {
                    $group: {
                      _id: null,
                      total_quantity: { $sum: '$items.quantity' },
                      total_value: { $sum: '$items.subtotal' }
                    }
                  }
                ])
                .toArray()
            : [];
          
          return {
            supplier_id: s.id,
            supplier_name: s.name,
            products_in_catalog: parseInt(s.product_count),
            total_items_sold: stats[0]?.total_quantity || 0,
            total_sales_value: stats[0]?.total_value || 0
          };
        })
      );
      
      res.json({ success: true, data });
    } catch (e) {
      next(e);
    }
  }

  static async getCustomerHistory(req, res, next) {
    try {
      const { customerId } = req.params;
      const cust = await pool.query('SELECT * FROM customers WHERE id=$1', [customerId]);
      
      if (!cust.rows.length) {
        return res.status(404).json({ success: false, message: 'Customer not found' });
      }
      
      const db = getDB();
      const orders = await db
        .collection('orders')
        .find({ customer_id: parseInt(customerId) })
        .sort({ order_date: -1 })
        .toArray();
      
      const totalSpent = orders.reduce((s, o) => s + (o.total_amount || 0), 0);
      
      res.json({
        success: true,
        data: {
          customer: cust.rows[0],
          total_orders: orders.length,
          total_spent: totalSpent,
          orders
        }
      });
    } catch (e) {
      next(e);
    }
  }

  static async getTopProductsByCategory(req, res, next) {
    try {
      const { categoryName } = req.params;
      const prods = await pool.query(
        'SELECT p.id,p.sku,p.name,p.unit_price FROM products p JOIN categories c ON p.category_id=c.id WHERE LOWER(c.name)=LOWER($1)',
        [categoryName]
      );
      
      if (!prods.rows.length) {
        return res.status(404).json({ success: false, message: 'No products found in this category' });
      }
      
      const ids = prods.rows.map((p) => p.id);
      const db = getDB();
      const sales = await db
        .collection('orders')
        .aggregate([
          { $unwind: '$items' },
          { $match: { 'items.product_id': { $in: ids } } },
          {
            $group: {
              _id: '$items.product_id',
              sku: { $first: '$items.sku' },
              product_name: { $first: '$items.product_name' },
              total_quantity_sold: { $sum: '$items.quantity' },
              total_revenue: { $sum: '$items.subtotal' }
            }
          },
          { $sort: { total_revenue: -1 } }
        ])
        .toArray();
      
      const result = sales.map((s) => ({
        product_id: s._id,
        sku: s.sku,
        product_name: s.product_name,
        quantity_sold: s.total_quantity_sold,
        total_revenue: s.total_revenue
      }));
      
      res.json({
        success: true,
        category: categoryName,
        total_products: result.length,
        data: result
      });
    } catch (e) {
      next(e);
    }
  }
}

module.exports = AnalyticsController;
