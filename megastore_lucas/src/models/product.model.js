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
    // construct dynamic update so we don't overwrite with undefined/null values
    const allowed = ['name', 'unit_price', 'category_id', 'supplier_id'];
    const sets = [];
    const vals = [];
    let idx = 1;

    for (const key of allowed) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        sets.push(`${key} = $${idx}`);
        vals.push(data[key]);
        idx += 1;
      }
    }

    if (sets.length === 0) {
      // nothing to update
      return null;
    }

    const q = `UPDATE products SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`;
    vals.push(id);

    const res = await pool.query(q, vals);
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
