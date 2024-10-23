const admin = require("firebase-admin");

// Parse the service account key from the environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://xhamia-ime-8e033-default-rtdb.europe-west1.firebasedatabase.app",
});

const db = admin.firestore();

module.exports = { db }; // Only export the database
