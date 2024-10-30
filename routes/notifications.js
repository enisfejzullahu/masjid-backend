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
// Update the notification preference for a token
router.post("/update-notification-preference", async (req, res) => {
  const { expoPushToken, disabled } = req.body;

  if (!expoPushToken) {
    return res.status(400).json({ message: "Push token is missing." });
  }

  try {
    await db.collection("tokens").doc(expoPushToken).set(
      { notificationsDisabled: disabled },
      { merge: true } // Update only the notificationsDisabled field
    );

    res.status(200).json({
      message: `Notification preference updated to ${
        disabled ? "disabled" : "enabled"
      }.`,
    });
  } catch (error) {
    console.error("Error updating notification preference:", error);
    res.status(500).json({
      message: "Error updating notification preference.",
      error: error.message,
    });
  }
});

// Endpoint to fetch the notification preference
router.get("/get-notification-preference", async (req, res) => {
  const { expoPushToken } = req.query;

  if (!expoPushToken) {
    return res.status(400).json({ message: "Push token is missing." });
  }

  try {
    const tokenDoc = await db.collection("tokens").doc(expoPushToken).get();

    if (!tokenDoc.exists) {
      return res.status(404).json({ message: "Token not found." });
    }

    const data = tokenDoc.data();
    const notificationsDisabled = data.notificationsDisabled ?? false;

    res.status(200).json({ notificationsDisabled });
  } catch (error) {
    console.error("Error fetching notification preference:", error);
    res.status(500).json({
      message: "Error fetching notification preference.",
      error: error.message,
    });
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
    await db.collection("tokens").doc(expoPushToken).set(
      {
        expoPushToken,
        notificationsEnabled: true, // Set to true by default
        createdAt: new Date(),
      },
      { merge: true }
    ); // Use merge to avoid duplicates

    res.status(200).json({ message: "Push token saved successfully." });
  } catch (error) {
    console.error("Error saving push token:", error);
    res
      .status(500)
      .json({ message: "Error saving push token.", error: error.message });
  }
});

module.exports = router;
