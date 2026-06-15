const mongoose = require('mongoose');
const uri = 'mongodb+srv://jency090108_db_user:JWglvVnKrRWNGPiW@clustermockmate.zdgq8u8.mongodb.net/?retryWrites=true&w=majority&appName=ClusterMockmate';

async function testConnection() {
  console.log('Testing SRV connection to MongoDB...');
  try {
    // Add debugging output
    mongoose.set('debug', true);
    await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected successfully!');
    process.exit(0);
  } catch (err) {
    console.error('❌ Connection failed:');
    console.error(err);
    process.exit(1);
  }
}

testConnection();
