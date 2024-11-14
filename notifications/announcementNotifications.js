const functions = require("firebase-functions");
const firebaseAdmin = require("../firebaseadmin");
const { db } = firebaseAdmin;
const { Expo } = require("expo-server-sdk");

const expo = new Expo(); // Initialize Expo SDK

// Fetch user tokens with notifications enabled
const getUserTokens = async () => {
  const tokens = [];
  try {
    console.log("Fetching user tokens with notifications enabled...");
    const usersSnapshot = await db
      .collection("tokens")
      .where("notificationsDisabled", "==", false) // Notifications enabled
      .get();

    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      const token = userData.expoPushToken;
      if (token) {
        console.log(`Found token: ${token}`);
        tokens.push(token);
      }
    });

    console.log(`Fetched ${tokens.length} tokens`);
  } catch (error) {
    console.error("Error fetching user tokens:", error);
  }
  return tokens;
};

// Get users who are eligible for the mosque announcement
const getUsersForAnnouncement = async (mosqueId) => {
  console.log(`Getting users for mosqueId: ${mosqueId}`);
  const userTokens = await getUserTokens();
  const eligibleTokens = [];

  for (const token of userTokens) {
    try {
      console.log(`Checking user ${token} for favorite mosque ${mosqueId}`);
      const userSnapshot = await db
        .collection("tokens")
        .doc(token)
        .collection("favoriteMosques")
        .doc(mosqueId)
        .get();

      const userFavoriteData = userSnapshot.data();

      if (userFavoriteData && userFavoriteData.receiveAnnouncements) {
        console.log(`User ${token} is eligible for notifications`);
        eligibleTokens.push(token);
      } else {
        console.log(`User ${token} is not eligible`);
      }
    } catch (error) {
      console.error(
        `Error checking user ${token} for favorite mosque ${mosqueId}:`,
        error
      );
    }
  }

  console.log(
    `Found ${eligibleTokens.length} eligible users for mosque ${mosqueId}`
  );
  return eligibleTokens;
};

// Firestore trigger for new announcement creation
exports.onNewAnnouncement = functions.firestore
  .document("mosques/{mosqueId}/njoftimet/{announcementId}")
  .onCreate(async (snapshot, context) => {
    const mosqueId = context.params.mosqueId;
    const announcementId = context.params.announcementId;
    const announcementData = snapshot.data();

    console.log(
      `New announcement created for mosque ${mosqueId}: ${announcementId}`
    );
    const announcementText = announcementData.Text;
    const announcementTitle = `${mosqueId} has made an announcement`;

    // Get the tokens of users who have the mosque favorited and enabled notifications
    const userTokens = await getUsersForAnnouncement(mosqueId);

    if (userTokens.length === 0) {
      console.log(
        `No eligible users to notify for announcement ${announcementId}`
      );
      return;
    }

    console.log(`Sending notifications to ${userTokens.length} users`);

    const message = {
      title: announcementTitle,
      body: `${announcementText.substring(0, 100)}...`, // Truncated text
      data: {
        mosqueId,
        announcementId,
        announcementText,
        announcementDate: announcementData.Date.toDate().toISOString(),
        announcementImage: announcementData.Image || "",
      },
    };

    console.log("Message prepared:", message);

    // Send notifications
    await sendNotifications(userTokens, message);
  });

// Function to send notifications in batches
const sendNotifications = async (tokens, message) => {
  const messages = tokens.map((token) => ({
    to: token,
    sound: "default",
    title: message.title,
    body: message.body,
    data: message.data,
  }));

  try {
    console.log("Chunking notifications into smaller batches");
    const chunks = expo.chunkPushNotifications(messages);

    console.log("Sending notifications in chunks...");
    const receipts = await Promise.all(
      chunks.map((chunk) => expo.sendPushNotificationsAsync(chunk))
    );

    console.log("Notifications sent successfully:", receipts);
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
};
