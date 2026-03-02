const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
const client = new MongoClient(uri);
let db = null;

async function connectMongoDB() {
  try {
    await client.connect();
    db = client.db('db_megastore_exam');
    console.log('Connected to MongoDB');
    return db;
  } catch (err) {
    console.error('MongoDB connection error', err);
    process.exit(1);
  }
}

function getDB() {
  if (!db) throw new Error('MongoDB not connected');
  return db;
}

module.exports = { connectMongoDB, getDB, client };
