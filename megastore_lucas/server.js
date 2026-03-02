const app = require('./app');
const { connectMongoDB } = require('./src/config/mongodb');
require('dotenv').config();

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await connectMongoDB();
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error('Failed to start server', err);
    process.exit(1);
  }
}

start();
