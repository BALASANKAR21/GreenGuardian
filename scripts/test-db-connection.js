// Quick script to test MongoDB connection
// Usage: MONGODB_URI="your-uri" node scripts/test-db-connection.js

const { MongoClient } = require('mongodb');

async function main() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Please set MONGODB_URI in your environment');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000, // fail fast
  });

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db();
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));

    // Try a simple read from users collection if present
    if (collections.find(c => c.name === 'users')) {
      const users = await db.collection('users').find({}).limit(3).toArray();
      console.log('Sample users:', users);
    } else {
      console.log('No `users` collection found (yet)');
    }
  } catch (err) {
    console.error('Connection failed:', err.message);
    process.exit(2);
  } finally {
    await client.close();
  }
}

main();
