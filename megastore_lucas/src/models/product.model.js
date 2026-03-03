const pool = require('../config/database');

class ProductModel {
  static async getAll() {
    const q = `SELECT 
      p.id, p.sku, p.name AS product_name, p.unit_price, 
      c.name AS category_name, s.name AS supplier_name 
    FROM products p 
    JOIN categories c ON p.category_id = c.id 
    JOIN suppliers s ON p.supplier_id = s.id 
    ORDER BY p.created_at DESC`;
    
    const res = await pool.query(q);
    return res.rows;
  }

  static async getById(id) {
    const q = `SELECT 
      p.*, c.name AS category_name, s.name AS supplier_name 
    FROM products p 
    JOIN categories c ON p.category_id = c.id 
    JOIN suppliers s ON p.supplier_id = s.id 
    WHERE p.id = $1`;
    
    const res = await pool.query(q, [id]);
    return res.rows[0];
  }

  static async create(data) {
    const { sku, name, unit_price, category_id, supplier_id } = data;
    const q = `INSERT INTO products (sku, name, unit_price, category_id, supplier_id) 
      VALUES ($1, $2, $3, $4, $5) RETURNING *`;
    
    const res = await pool.query(q, [sku, name, unit_price, category_id, supplier_id]);
    return res.rows[0];
  }

  static async update(id, data) {
    const { name, unit_price, category_id, supplier_id } = data;
    const q = `UPDATE products 
      SET name = $1, unit_price = $2, category_id = $3, supplier_id = $4 
      WHERE id = $5 RETURNING *`;
    
    const res = await pool.query(q, [name, unit_price, category_id, supplier_id, id]);
    return res.rows[0];
  }

  static async delete(id) {
    const product = await this.getById(id);
    if (!product) return null;
    
    const q = 'DELETE FROM products WHERE id = $1 RETURNING *';
    const res = await pool.query(q, [id]);
    
    return { deleted: res.rows[0], original: product };
  }
}

module.exports = ProductModel;
