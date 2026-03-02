const fs = require('fs');
const csv = require('csv-parser');
const pool = require('../src/config/database');
const { connectMongoDB, getDB } = require('../src/config/mongodb');

async function getOrCreateCustomer(name, email, address, phone) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id FROM customers WHERE email = $1', [email]);
    if (res.rows.length) return res.rows[0].id;
    const insert = await client.query(
      'INSERT INTO customers (full_name, email, address, phone) VALUES ($1,$2,$3,$4) RETURNING id',
      [name, email, address, phone]
    );
    return insert.rows[0].id;
  } finally {
    client.release();
  }
}

async function getOrCreateCategory(name) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id FROM categories WHERE name = $1', [name]);
    if (res.rows.length) return res.rows[0].id;
    const insert = await client.query('INSERT INTO categories (name) VALUES ($1) RETURNING id', [name]);
    return insert.rows[0].id;
  } finally { client.release(); }
}

async function getOrCreateSupplier(name, email) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id FROM suppliers WHERE name = $1', [name]);
    if (res.rows.length) return res.rows[0].id;
    const insert = await client.query('INSERT INTO suppliers (name, email) VALUES ($1,$2) RETURNING id', [name, email]);
    return insert.rows[0].id;
  } finally { client.release(); }
}

async function getOrCreateProduct(sku, name, price, categoryId, supplierId) {
  const client = await pool.connect();
  try {
    const res = await client.query('SELECT id FROM products WHERE sku = $1', [sku]);
    if (res.rows.length) return res.rows[0].id;
    const insert = await client.query(
      'INSERT INTO products (sku, name, unit_price, category_id, supplier_id) VALUES ($1,$2,$3,$4,$5) RETURNING id',
      [sku, name, price, categoryId, supplierId]
    );
    return insert.rows[0].id;
  } finally { client.release(); }
}

async function createOrder(db, transactionId, orderDate, customerId, items, total) {
  const orders = db.collection('orders');
  const exists = await orders.findOne({ transaction_id: transactionId });
  if (exists) return false;
  await orders.insertOne({ transaction_id: transactionId, order_date: new Date(orderDate), customer_id: customerId, items, total_amount: total, created_at: new Date() });
  return true;
}

async function migrate() {
  await connectMongoDB();
  const db = getDB();
  const records = [];
  await new Promise((resolve, reject) => {
    fs.createReadStream('./data/raw-transactions.csv')
      .pipe(csv())
      .on('data', (d) => records.push(d))
      .on('end', resolve)
      .on('error', reject);
  });

  let success = 0;
  for (const r of records) {
    try {
      const customerId = await getOrCreateCustomer(r.customer_name, r.customer_email, r.customer_address, r.customer_phone);
      const categoryId = await getOrCreateCategory(r.product_category || 'Uncategorized');
      const supplierId = await getOrCreateSupplier(r.supplier_name || r.supplier, r.supplier_email || '');
      const productId = await getOrCreateProduct(r.product_sku, r.product_name, parseFloat(r.unit_price), categoryId, supplierId);

      const item = {
        product_id: productId,
        sku: r.product_sku,
        product_name: r.product_name,
        unit_price: parseFloat(r.unit_price),
        quantity: parseInt(r.quantity || '1'),
        subtotal: parseFloat(r.total_line_value || (r.unit_price * r.quantity))
      };

      const created = await createOrder(db, r.transaction_id, r.date, customerId, [item], parseFloat(item.subtotal));
      if (created) success++;
    } catch (err) {
      console.error('Error migrating record', r.transaction_id, err.message);
    }
  }

  console.log(`Migration completed. Orders created: ${success}`);
  await pool.end();
  process.exit(0);
}

migrate();
