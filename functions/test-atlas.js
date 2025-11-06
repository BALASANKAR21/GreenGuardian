// test-atlas.js
// Connects to MongoDB using process.env.MONGODB_URI, lists collections, and inserts a sample doc into plants if empty.
const { MongoClient, ServerApiVersion } = require('mongodb');

(async function main(){
  const uri = process.env.MONGODB_URI;
  if(!uri){
    console.error('MONGODB_URI not set');
    process.exit(1);
  }

  const client = new MongoClient(uri, {
    serverApi: { version: ServerApiVersion.v1 },
    useNewUrlParser: true,
    useUnifiedTopology: true
  });

  try{
    await client.connect();
    console.log('Connected to MongoDB');
    const db = client.db('greenguardian');
    const cols = await db.listCollections().toArray();
    console.log('Collections:', cols.map(c=>c.name));

    const plants = db.collection('plants');
    const count = await plants.countDocuments();
    if(count === 0){
      console.log('Seeding sample plant document');
      await plants.insertOne({ name: 'Test Plant', scientificName: 'Plantae testus', createdAt: new Date() });
    } else {
      console.log('Plants already present, skipping seed');
    }
  }catch(err){
    console.error('Error connecting to MongoDB:', err);
    process.exitCode = 1;
  } finally{
    await client.close();
  }
})();
