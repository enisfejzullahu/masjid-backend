const admin = require("firebase-admin");
const serviceAccount = require("./xhamia-ime-8e033-firebase-adminsdk-joivd-1e730a6474.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://xhamia-ime-8e033-default-rtdb.europe-west1.firebasedatabase.app",
});

const db = admin.firestore();

module.exports = { db }; // Only export the database
