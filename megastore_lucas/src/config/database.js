const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.PG_HOST || 'localhost',
  port: process.env.PG_PORT || 5432,
  database: process.env.PG_DATABASE || 'db_megastore_exam',
  user: process.env.PG_USER || 'megastore_user',
  password: process.env.PG_PASSWORD || 'megastore_pass',
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

module.exports = pool;
