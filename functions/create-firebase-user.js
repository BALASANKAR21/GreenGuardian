// create-firebase-user.js
// Requires GOOGLE_APPLICATION_CREDENTIALS env var to point to a service account JSON with proper IAM
// Usage: node create-firebase-user.js <PROJECT_ID>

const admin = require('firebase-admin');
const fs = require('fs');

const projectId = process.argv[2] || process.env.FIREBASE_PROJECT_ID;
if(!projectId){
  console.error('Provide a project id as the first arg or set FIREBASE_PROJECT_ID');
  process.exit(1);
}

if(!process.env.GOOGLE_APPLICATION_CREDENTIALS){
  console.error('Set GOOGLE_APPLICATION_CREDENTIALS env var to your service account json path');
  process.exit(1);
}

const serviceAccount = require(process.env.GOOGLE_APPLICATION_CREDENTIALS);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  projectId
});

(async function(){
  try{
    const email = `test.user+${Date.now()}@example.com`;
    const user = await admin.auth().createUser({
      email,
      emailVerified: false,
      password: 'Test1234!',
      displayName: 'Test User',
      disabled: false
    });
    console.log('Created Firebase user:', user.uid, email);
  }catch(err){
    console.error('Failed to create user:', err);
    process.exitCode = 1;
  }
})();
