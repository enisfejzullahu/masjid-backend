const { Expo } = require("expo-server-sdk");
const expo = new Expo();
const { getTodayPrayerTimes } = require("../firebaseadmin");
const firebaseAdmin = require("../firebaseadmin");
const { db } = firebaseAdmin;

const customMessages = {
  Imsaku: {
    title: "Koha e Imsakut",
    description: "Filloni ditën tuaj me lutje!",
  },
  Agimi: {
    title: "Është koha e Agimit!",
    description:
      "Pejgamberi a.s. tha: 'O Allah, bekoje umetin tim në mëngjeset e tyre.'",
  },
  Dreka: {
    title: "Koha për namazin e Drekës",
    description: "Mos e lër namazin për më vonë!",
  },
  Ikindia: {
    title: "Koha për namazin e Ikindisë",
    description: "Përgatitu për t'u falur!",
  },
  Akshami: {
    title: "Koha për namazin e Akshamit",
    description: "Falu për të gjetur qetësi!",
  },
  Jacia: {
    title: "Koha për namazin e Jacisë",
    description: "Plotësoni këtë natë me adhurim dhe lutje!",
  },
};



// Function to send push notifications
const sendPushNotification = async (expoPushToken, title, body) => {
  // console.log(`Preparing to send notification to token: ${expoPushToken}`); // Log token being used

  if (!expoPushToken || !expoPushToken.startsWith("ExponentPushToken")) {
    console.error("Invalid push token:", expoPushToken);
    return;
  }

  const message = {
    to: expoPushToken,
    sound: "default",
    title: title,
    body: body,
    data: { withSome: "data" },
  };

  try {
    // console.log(
    //   `Sending notification with title: "${title}" and body: "${body}" to ${expoPushToken}`
    // );
    const tickets = await expo.sendPushNotificationsAsync([message]);

    // Log the ticket response
    tickets.forEach((ticket) => {
      if (ticket.status === "error") {
        console.error(`Error sending notification: ${ticket.message}`);
      } else {
        console.log(
          `Notification sent successfully with ticket ID: ${ticket.id}`
        );
      }
    });
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};


const getUserTokens = async () => {
  const tokens = [];

  try {
    // Fetch all user documents from the "tokens" collection
    const usersSnapshot = await db.collection("tokens").where("notificationsDisabled", "==", false).get(); // Check for notifications enabled
    
    // Loop through each user document
    usersSnapshot.forEach((doc) => {
      const userData = doc.data();
      
      // Access the 'expoPushToken' directly, assuming it's stored as a string
      const token = userData.expoPushToken; 
      
      // Push the token into the array if it exists
      if (token) tokens.push(token);
    });

    console.log(`Fetched user tokens: ${tokens.length} tokens found`);
  } catch (error) {
    console.error("Error fetching user tokens from Firestore:", error);
  }

  return tokens;
};



// Function to schedule notifications for each prayer time
const schedulePrayerTimeNotifications = async () => {
  const todayPrayerTimes = await getTodayPrayerTimes(); // Fetch today's prayer times

  if (!todayPrayerTimes) {
    console.log("No prayer times available for today.");
    return;
  }

  const userTokens = await getUserTokens(); // Fetch user tokens
  if (userTokens.length === 0) {
    console.log("No users have notifications enabled.");
    return; // Exit if no users are available
  }

  const prayerTimes = [
    { name: "Imsaku", time: todayPrayerTimes.Imsaku },
    { name: "Agimi", time: todayPrayerTimes.Agimi },
    { name: "Dreka", time: todayPrayerTimes.Dreka },
    { name: "Ikindia", time: todayPrayerTimes.Ikindia },
    { name: "Akshami", time: todayPrayerTimes.Akshami },
    { name: "Jacia", time: todayPrayerTimes.Jacia },
  ];

  const now = new Date(); // Get the current date and time

  prayerTimes.forEach((prayer) => {
    // Extract hours and minutes from the prayer time string
    const [hours, minutes] = prayer.time.split(":").map(Number);

    // Create a Date object using today's date and the prayer time
    const prayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

    if (prayerTime > now) {
      const delay = prayerTime - now; // Calculate the time difference in milliseconds
      
      // Get the custom title and description for the prayer
      const { title, description } = customMessages[prayer.name];

      // Schedule the notification for the calculated time
      setTimeout(() => {
        scheduleNotifications(userTokens, title, description);
      }, delay);

      // Optional: Log the scheduling for debugging
      // console.log(`Scheduled notification for ${prayer.name} in ${Math.round(delay / 60000)} minutes.`);
    } else {
      // console.log(`${prayer.name} has already passed for today.`);
    }
  });
};


const sendNotifications = async (message) => {
  try {
    // Query tokens where notifications are not disabled
    const tokensSnapshot = await db.collection("tokens").where("notificationsDisabled", "==", false).get();

    // Get the expo push tokens from the documents
    const tokens = tokensSnapshot.docs.map(doc => doc.data().expoPushToken);

    // Send the message to each token
    for (let expoPushToken of tokens) {
      await sendPushNotification(expoPushToken, message.title, message.body); 
    }

    console.log("Notifications sent successfully.");
  } catch (error) {
    console.error("Error sending notifications:", error);
  }
};

// Function to send notifications to user tokens
const scheduleNotifications = async (userTokens, title, body) => {
  // console.log(`Preparing to send notifications: ${title}`);

  if (userTokens.length === 0) {
    console.log("No user tokens available for notifications.");
    return;
  }

  // console.log(`Sending notifications to ${userTokens.length} users...`);

  for (const token of userTokens) {
    try {
      const response = await sendPushNotification(token, title, body);
      // console.log(`Notification sent to ${token}: ${response}`);
    } catch (error) {
      console.error(`Error sending notification to ${token}:`, error);
    }
  }
};

module.exports = {
  scheduleNotifications,
  sendPushNotification,
  schedulePrayerTimeNotifications, 
  sendNotifications,
};
