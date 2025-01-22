// --------------------------------------
// HEROKU RUN
// const admin = require("firebase-admin");

// // // Parse the service account key from the environment variable
const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL:
    "https://xhamia-ime-8e033-default-rtdb.europe-west1.firebasedatabase.app",
});
// // -----------------------------------

// ------------------------------------
// LOCAL HOST RUN
// const admin = require("firebase-admin");
// const serviceAccount = require("./xhamia-ime-8e033-firebase-adminsdk-joivd-b2278d75d1.json");

// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount),
//   databaseURL:
//     "https://xhamia-ime-8e033-default-rtdb.europe-west1.firebasedatabase.app",
// });
// ---------------------------------------

const db = admin.firestore();
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

// Function to set custom roles
// Function to set custom role claims for a user
const setRole = async (userId, role) => {
  try {
    await admin.auth().setCustomUserClaims(userId, { role });
    console.log(`Role '${role}' assigned to user: ${userId}`);
  } catch (error) {
    console.error("Error setting role:", error);
    throw new Error("Error setting role");
  }
};

async function assignRoles() {
  const superAdminUid = "Kcgvz10JB5Pf2aCPdnqryHOs0Xm1"; // Replace with UID of super-admin
  const mosqueAdminUid = "6KwGdXJdhmV5whwNa5jbuta1fmE2"; // Replace with UID of mosque-admin

  // Assign super-admin role
  await setRole(superAdminUid, "super-admin");

  // Assign mosque-admin role (without mosqueId for now)
  await setRole(mosqueAdminUid, "mosque-admin");

  console.log("Roles assigned successfully.");
}

// const setCustomClaims = async (userId, mosqueId, fullName, role) => {
//   try {
//     // Set custom claims for the user
//     await admin.auth().setCustomUserClaims(userId, {
//       mosqueId: mosqueId,
//       fullName: fullName,
//       role: role,
//     });
//     console.log("Custom claims set successfully.");
//   } catch (error) {
//     console.error("Error setting custom claims:", error);
//   }
// };

// setCustomClaims('6KwGdXJdhmV5whwNa5jbuta1fmE2', 'xhamia-test', 'Moll', 'mosque-admin');


// Run the function to assign roles
// assignRoles();

async function getUserRole(uid) {
  try {
    const user = await admin.auth().getUser(uid);
    console.log(`User role for ${uid}:`, user.customClaims);
  } catch (error) {
    console.error("Error fetching user claims:", error.message);
  }
}

// Test it with the assigned UIDs
getUserRole("Kcgvz10JB5Pf2aCPdnqryHOs0Xm1"); // Super-admin
getUserRole("6KwGdXJdhmV5whwNa5jbuta1fmE2"); // Mosque-admin



// Run the function to test it
// getTodayPrayerTimes();

const firebaseAdmin = db;

module.exports = { db, getTodayPrayerTimes, admin };
