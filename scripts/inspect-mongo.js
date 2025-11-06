// scripts/inspect-mongo.js
// Usage:
//   export MONGODB_URI="mongodb+srv://user:PASS@cluster..."
//   node scripts/inspect-mongo.js

const { MongoClient } = require('mongodb');

async function inspect() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('Set MONGODB_URI as an env var (do not paste secrets in chat).');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const admin = client.db().admin();
    const dbs = await admin.listDatabases();
    console.log('Databases:');
    dbs.databases.forEach(d => console.log(` - ${d.name} (sizeBytes: ${d.sizeOnDisk})`));
    console.log('---');

    // Check the greenguardian DB and test DB explicitly
    const namesToCheck = ['greenguardian', 'test'];
    for (const dbName of namesToCheck) {
      const db = client.db(dbName);
      const cols = await db.listCollections().toArray();
      console.log(`DB: ${dbName} - collections: ${cols.map(c => c.name).join(', ') || '(none)'}
`);
      if (cols.length > 0) {
        for (const c of cols) {
          const col = db.collection(c.name);
          const count = await col.countDocuments();
          console.log(`  collection ${c.name} - ${count} document(s)`);
          if (count > 0) {
            const one = await col.findOne();
            console.log('   sample doc:', one);
          }
        }
      }
      console.log('---');
    }

    // Optionally list some app-specific collections
    const appCollections = ['users','plants','gardens','environmental','identifications'];
    for (const cName of appCollections) {
      const db = client.db('greenguardian');
      const exists = (await db.listCollections({ name: cName }).toArray()).length > 0;
      if (exists) {
        const col = db.collection(cName);
        const count = await col.countDocuments();
        console.log(`greenguardian.${cName}: ${count}`);
        if (count > 0) {
          console.log(' sample:', await col.findOne());
        }
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    await client.close();
  }
}

inspect();
