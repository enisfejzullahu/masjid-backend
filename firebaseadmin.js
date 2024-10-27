const admin = require("firebase-admin");

// Parse the service account key from the environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://xhamia-ime-8e033-default-rtdb.europe-west1.firebasedatabase.app",
});

const db = admin.firestore();

// module.exports = { db }; // Only export the database

// const admin = require("firebase-admin");
// const serviceAccount = require("./xhamia-ime-8e033-firebase-adminsdk-joivd-1e730a6474.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL:
//     "https://xhamia-ime-8e033-default-rtdb.europe-west1.firebasedatabase.app",
// });

// const db = admin.firestore();
const realtimeDatabase = admin.database(); // This initializes the Realtime Database

// Example: Fetch prayer times from Realtime Database
const getTodayPrayerTimes = async () => {
  try {
    // Fetch all prayer times from the root of the Realtime Database
    const snapshot = await realtimeDatabase.ref("/").once("value");

    // Log the snapshot value to inspect the structure
    const prayerTimesArray = snapshot.val();

    // Get today's date
    const today = new Date();
    const muaji = today.getMonth() + 1; // Months are 0-based in JS
    const data = today.getDate();

    // Find prayer times for today by checking Muaji and Data
    const todayPrayerTimes = prayerTimesArray.find(
      (item) => item.Muaji === muaji && item.Data === data
    );

    if (todayPrayerTimes) {
      return todayPrayerTimes;
    } else {
      console.log("No prayer times found for today.");
      return null;
    }
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    return null;
  }
};

// Run the function to test it
// getTodayPrayerTimes();

// const firebaseAdmin = db;

module.exports = { db, getTodayPrayerTimes };
