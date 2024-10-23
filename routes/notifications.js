// Example usage in a route handler (e.g., in app.js or a routes file)
const express = require("express");
const router = express.Router();
const firebaseAdmin = require("../firebaseadmin"); // Importing the whole module
const { db } = firebaseAdmin; // Destructure messaging from the imported object

const { sendPushNotification } = require("../notificationService"); // Import the service

const app = express();

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
router.post("/send-notification-token", async (req, res) => {
  const { userId, expoPushToken } = req.body;

  try {
    // Update or set the user's expoPushToken in the database
    await db
      .collection("users")
      .doc(userId)
      .set({ expoPushToken }, { merge: true });
    res.status(200).send("Push token saved successfully.");
  } catch (error) {
    console.error("Error saving push token:", error);
    res.status(500).send("Error saving push token.");
  }
});

module.exports = router;
