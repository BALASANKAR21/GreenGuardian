// scripts/migrate-to-atlas.js
// Copies collections from local MongoDB to Atlas MongoDB (greenguardian DB)
// Usage:
//   export LOCAL_MONGODB_URI="mongodb://127.0.0.1:27017"
//   export ATLAS_MONGODB_URI="mongodb+srv://user:pass@..."
//   node scripts/migrate-to-atlas.js

const { MongoClient } = require('mongodb');

async function main() {
  const localUri = process.env.LOCAL_MONGODB_URI || process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017';
  const atlasUri = process.env.ATLAS_MONGODB_URI || process.env.ATLAS_URI || process.env.MONGODB_URI_ATLAS;

  if (!atlasUri) {
    console.error('ATLAS_MONGODB_URI not set. Export ATLAS_MONGODB_URI env var and retry.');
    process.exit(1);
  }

  const localClient = new MongoClient(localUri);
  const atlasClient = new MongoClient(atlasUri);

  try {
    console.log('Connecting to local MongoDB...');
    await localClient.connect();
    console.log('Connected to local');

    console.log('Connecting to Atlas MongoDB...');
    await atlasClient.connect();
    console.log('Connected to Atlas');

    const localDb = localClient.db('greenguardian');
    const atlasDb = atlasClient.db('greenguardian');

    const collections = await localDb.listCollections().toArray();
    const names = collections.map(c => c.name);
    console.log('Local collections found:', names);

    const targetCollections = ['users','plants','gardens','environmental','identifications'];

    for (const colName of targetCollections) {
      if (!names.includes(colName)) {
        console.log(`Skipping ${colName} — not present locally`);
        continue;
      }

      const localCol = localDb.collection(colName);
      const atlasCol = atlasDb.collection(colName);

      const docs = await localCol.find().toArray();
      console.log(`Migrating ${docs.length} documents from ${colName}...`);

      let migrated = 0;
      for (const doc of docs) {
        try {
          await atlasCol.replaceOne({ _id: doc._id }, doc, { upsert: true });
          migrated++;
        } catch (err) {
          console.error('Error migrating doc', doc._id, err.message);
        }
      }

      console.log(`Migrated ${migrated}/${docs.length} documents for ${colName}`);
    }

    console.log('Migration complete.');
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(2);
  } finally {
    await localClient.close().catch(()=>{});
    await atlasClient.close().catch(()=>{});
  }
}

main();
