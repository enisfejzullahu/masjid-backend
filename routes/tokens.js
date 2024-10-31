// Example usage in a route handler (e.g., in app.js or a routes file)
const express = require("express");
const router = express.Router();
const firebaseAdmin = require("../firebaseadmin"); // Importing the whole module
const { db } = firebaseAdmin; // Destructure messaging from the imported object

const {
  sendPushNotification,
} = require("../notifications/notificationService"); // Import the service

const app = express();

// Endpoint to add a mosque to favorites
router.post("/addFavorite", async (req, res) => {
  const { expoPushToken, mosqueId } = req.body;

  if (!expoPushToken || !mosqueId) {
    return res.status(400).json({ error: "Missing expoPushToken or mosqueId" });
  }

  try {
    // Reference to the user's document in Firestore
    const userRef = db.collection("tokens").doc(expoPushToken);

    // Add the mosque to the user's favoriteMosques subcollection
    await userRef.collection("favoriteMosques").doc(mosqueId).set({
      receiveAnnouncements: true, // Default setting
      receiveEvents: true, // Default setting
      receivePrayerTimeReminders: true, // Default setting
    });

    res
      .status(200)
      .json({ message: "Mosque added to favorites successfully." });
  } catch (error) {
    console.error("Error adding favorite mosque:", error);
    res.status(500).json({ error: "Failed to add mosque to favorites." });
  }
});

router.delete("/removeFavorite", async (req, res) => {
  try {
    const { expoPushToken, mosqueId } = req.body;

    // Find the user's token document
    const userDoc = await db.collection("tokens").doc(expoPushToken).get();

    if (!userDoc.exists) {
      return res.status(404).send({ error: "User not found" });
    }

    // Now, remove the mosqueId from the favoriteMosques subcollection
    await db
      .collection("tokens")
      .doc(expoPushToken)
      .collection("favoriteMosques")
      .doc(mosqueId)
      .delete();

    res.status(200).send({ message: "Favorite mosque removed successfully" });
  } catch (error) {
    console.error("Error removing favorite mosque:", error);
    res.status(500).send({ error: "Internal Server Error" });
  }
});

module.exports = router;
