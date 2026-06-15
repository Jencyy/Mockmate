const { MongoClient } = require('mongodb');

const uri = "mongodb://jency090108_db_user:JWglvVnKrRWNGPiW@ac-wspqrub-shard-00-00.zdgq8u8.mongodb.net:27017,ac-wspqrub-shard-00-01.zdgq8u8.mongodb.net:27017,ac-wspqrub-shard-00-02.zdgq8u8.mongodb.net:27017/mockmate?ssl=true&replicaSet=atlas-wspqrub-shard-0&authSource=admin&retryWrites=true&w=majority";

async function run() {
  console.log("Connecting using native MongoDB driver with IPv4 ONLY...");
  const client = new MongoClient(uri, { 
    serverSelectionTimeoutMS: 5000,
    family: 4 // Force IPv4
  });
  try {
    await client.connect();
    console.log("✅ Connected successfully to server");
    await client.db("admin").command({ ping: 1 });
    console.log("✅ Ping successful");
  } catch (err) {
    console.error("❌ Connection failed with exact error:");
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
