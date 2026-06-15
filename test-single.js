const { MongoClient } = require('mongodb');

const uri = "mongodb://jency090108_db_user:JWglvVnKrRWNGPiW@ac-wspqrub-shard-00-00.zdgq8u8.mongodb.net:27017/mockmate?ssl=true&authSource=admin";

async function run() {
  console.log("Connecting to single node...");
  const client = new MongoClient(uri, { serverSelectionTimeoutMS: 5000 });
  try {
    await client.connect();
    console.log("✅ Connected successfully to server");
    const db = client.db("mockmate");
    const collections = await db.listCollections().toArray();
    console.log("Collections:", collections.map(c => c.name));
  } catch (err) {
    console.error("❌ Connection failed:");
    console.error(err);
  } finally {
    await client.close();
  }
}

run();
