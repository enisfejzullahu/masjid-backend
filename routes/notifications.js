// Example usage in a route handler (e.g., in app.js or a routes file)
const express = require("express");
const router = express.Router();
const firebaseAdmin = require("../firebaseadmin"); // Importing the whole module
const { db } = firebaseAdmin; // Destructure messaging from the imported object

const {
  sendPushNotification,
} = require("../notifications/notificationService"); // Import the service

const app = express();

// Route for updating notification preference
router.post("/update-notification-preference", async (req, res) => {
  const { token, enabled } = req.body;

  try {
    // Assuming the token is the user's ID
    await db.collection("users").doc("anonymous").update({
      // Use the correct ID here
      notificationsEnabled: enabled,
    });
    res.status(200).send({ message: "Notification preference updated." });
  } catch (error) {
    console.error("Error updating notification preference:", error);
    res
      .status(500)
      .send({ message: "Error updating notification preference." });
  }
});

router.post("/send-notification", async (req, res) => {
  const { expoPushToken, title, body } = req.body;

  try {
    await sendPushNotification(expoPushToken, title, body);
    res.status(200).send("Notification sent");
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).send("Error sending notification");
  }
});

// Endpoint to save push token
// router.post("/send-notification-token", async (req, res) => {
//   const { userId, expoPushToken } = req.body;

//   try {
//     // Update or set the user's expoPushToken in the database
//     await db
//       .collection("users")
//       .doc(userId)
//       .set({ expoPushToken }, { merge: true });
//     res.status(200).send("Push token saved successfully.");
//   } catch (error) {
//     console.error("Error saving push token:", error);
//     res.status(500).send("Error saving push token.");
//   }
// });

router.post("/check-token", async (req, res) => {
  const { expoPushToken } = req.body;

  try {
    const snapshot = await db
      .collection("tokens")
      .where("expoPushToken", "==", expoPushToken)
      .get();
    const exists = !snapshot.empty; // If the snapshot is not empty, the token exists

    res.status(200).json({ exists });
  } catch (error) {
    console.error("Error checking token:", error);
    res.status(500).json({ message: "Error checking token." });
  }
});

router.post("/send-notification-token", async (req, res) => {
  const { expoPushToken } = req.body;

  if (!expoPushToken) {
    return res.status(400).json({ message: "Push token is missing." });
  }

  try {
    // Firestore generates a unique document ID automatically
    await db.collection("tokens").doc(expoPushToken).set({
      expoPushToken,
      createdAt: new Date(),
    }, { merge: true }); // Use merge to avoid duplicates

    res.status(200).json({ message: "Push token saved successfully." });
  } catch (error) {
    console.error("Error saving push token:", error);
    res.status(500).json({ message: "Error saving push token.", error: error.message });
  }
});


module.exports = router;
