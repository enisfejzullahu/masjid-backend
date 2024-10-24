const admin = require('firebase-admin');
const serviceAccount = require('./xhamia-ime-8e033-firebase-adminsdk-joivd-1e730a6474.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://xhamia-ime-8e033-default-rtdb.europe-west1.firebasedatabase.app',
});

const db = admin.firestore();
const messaging = admin.messaging();
// console.log('Messaging object:', messaging); // Add this line for debugging


// Grouping exports in one object for clarity and maintainability
const firebaseAdmin = { db, messaging };

module.exports = firebaseAdmin; 

// const admin = require("firebase-admin");

// // Parse the service account key from the environment variable
// const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL:
//     "https://xhamia-ime-8e033-default-rtdb.europe-west1.firebasedatabase.app",
// });

// const db = admin.firestore();

// module.exports = { db }; // Only export the database
