const { Expo } = require("expo-server-sdk");
const expo = new Expo();
const { getTodayPrayerTimes } = require("../firebaseadmin");
const firebaseAdmin = require("../firebaseadmin");
const { db } = firebaseAdmin;

const customMessages = {
  Imsaku: {
    title: "Koha e Imsakut",
    description: "Filloni ditën tuaj me lutje!",
    beforePrayerTime: (offset) => ({
      title: `Imsaku pas ${offset} minutash.`,
      description: `Koha e Imsakut hyn pas ${offset} minutash.`, // Dynamic message with offset
    }),
  },
  Agimi: {
    title: "Është koha e Agimit!",
    description:
      "Pejgamberi a.s. tha: 'O Allah, bekoje umetin tim në mëngjeset e tyre.'",
    beforePrayerTime: (offset) => ({
      title: `Lindja e Diellit pas ${offset} minutash.`,
      description: `Edhe ${offset} minuta ke kohë për të falur namazin e Sabahut.`, // Dynamic message with offset
    }),
  },
  Dreka: {
    title: "Koha për namazin e Drekës",
    description: "Mos e lër namazin për më vonë!",
    beforePrayerTime: (offset) => ({
      title: `Dreka pas ${offset} minutash.`,
      description: `Ezani i Drekës therret edhe ${offset} minuta.`, // Dynamic message with offset
    }),
  },
  Ikindia: {
    title: "Koha për namazin e Ikindisë",
    description: "Përgatitu për t'u falur!",
    beforePrayerTime: (offset) => ({
      title: `Ikindia pas ${offset} minutash.`,
      description: `Ezani i Ikindisë therret edhe ${offset} minuta.`, // Dynamic message with offset
    }),
  },
  Akshami: {
    title: "Koha për namazin e Akshamit",
    description: "Falu për të gjetur qetësi!",
    beforePrayerTime: (offset) => ({
      title: `Akshami pas ${offset} minutash.`,
      description: `Ezani i Akshamit therret edhe ${offset} minuta.`, // Dynamic message with offset
    }),
  },
  Jacia: {
    title: "Koha për namazin e Jacisë",
    description: "Plotësoni këtë natë me adhurim dhe lutje!",
    beforePrayerTime: (offset) => ({
      title: `Jacia pas ${offset} minutash.`,
      description: `Ezani i Jacisë therret edhe ${offset} minuta.`, // Dynamic message with offset
    }),
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
    const usersSnapshot = await db
      .collection("tokens")
      .where("notificationsDisabled", "==", false)
      .get(); // Check for notifications enabled

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

const getUserPrayerPreferences = async (expoPushToken, mosqueId) => {
  try {
    const mosqueRef = db
      .collection("tokens")
      .doc(expoPushToken)
      .collection("favoriteMosques")
      .doc(mosqueId);
    const doc = await mosqueRef.get();

    if (!doc.exists) {
      console.log("No preferences found for this user at this mosque.");
      return null; // Return null if no document found
    }

    return doc.data(); // Return the preferences data
  } catch (error) {
    console.error("Error fetching user preferences:", error);
    return null; // Return null in case of error
  }
};

// Function to schedule notifications for each prayer time
// const schedulePrayerTimeNotifications = async () => {
//   const todayPrayerTimes = await getTodayPrayerTimes(); // Fetch today's prayer times

//   if (!todayPrayerTimes) {
//     console.log("No prayer times available for today.");
//     return;
//   }

//   const userTokens = await getUserTokens(); // Fetch user tokens
//   if (userTokens.length === 0) {
//     console.log("No users have notifications enabled.");
//     return; // Exit if no users are available
//   }

//   const prayerTimes = [
//     { name: "Imsaku", time: todayPrayerTimes.Imsaku },
//     { name: "Agimi", time: todayPrayerTimes.Agimi },
//     { name: "Dreka", time: todayPrayerTimes.Dreka },
//     { name: "Ikindia", time: todayPrayerTimes.Ikindia },
//     { name: "Akshami", time: todayPrayerTimes.Akshami },
//     { name: "Jacia", time: todayPrayerTimes.Jacia },
//   ];

//   const now = new Date(); // Get the current date and time

//   prayerTimes.forEach((prayer) => {
//     // Extract hours and minutes from the prayer time string
//     const [hours, minutes] = prayer.time.split(":").map(Number);

//     // Create a Date object using today's date and the prayer time
//     const prayerTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), hours, minutes);

//     if (prayerTime > now) {
//       const delay = prayerTime - now; // Calculate the time difference in milliseconds

//       // Get the custom title and description for the prayer
//       const { title, description } = customMessages[prayer.name];

//       // Schedule the notification for the calculated time
//       setTimeout(() => {
//         scheduleNotifications(userTokens, title, description);
//       }, delay);

//       // Optional: Log the scheduling for debugging
//       // console.log(`Scheduled notification for ${prayer.name} in ${Math.round(delay / 60000)} minutes.`);
//     } else {
//       // console.log(`${prayer.name} has already passed for today.`);
//     }
//   });
// };

const schedulePrayerTimeNotifications = async () => {
  const todayPrayerTimes = await getTodayPrayerTimes(); // Fetch today's prayer times

  if (!todayPrayerTimes) {
    console.log("No prayer times available for today.");
    return;
  }

  const userTokens = await getUserTokens(); // Fetch user tokens
  if (userTokens.length === 0) {
    console.log("No users have notifications enabled.");
    return;
  }

  const now = new Date();

  for (const token of userTokens) {
    const userSnapshot = await db
      .collection("tokens")
      .doc(token)
      .collection("favoriteMosques")
      .get();

    if (userSnapshot.empty) {
      console.log(`No favorite mosques found for user token ${token}`);
      continue;
    }

    const favoriteMosques = userSnapshot.docs.map((doc) => doc.id); // List of mosque IDs

    for (const mosqueId of favoriteMosques) {
      // console.log(
      //   `Scheduling notifications for user ${token} at mosque ${mosqueId}`
      // );

      const preferences = await getUserPrayerPreferences(token, mosqueId);

      if (!preferences || !preferences.receivePrayerTimeReminders) {
        // console.log(
        //   `User ${token} has disabled all prayer time notifications for mosque ${mosqueId}.`
        // );
        continue;
      }

      for (const [prayerName, prayerData] of Object.entries(todayPrayerTimes)) {
        if (prayerName === "Muaji" || prayerName === "Data") continue;

        const normalizedPrayerName = prayerName.toLowerCase();

        if (!prayerData || typeof prayerData !== "string") {
          console.log(
            `No valid time found for ${prayerName} at mosque ${mosqueId}. Skipping notification scheduling.`
          );
          continue;
        }

        const prayerPreferences =
          preferences.prayerTimesOffsets[normalizedPrayerName] || {};
        const { offset = 0, receive } = prayerPreferences;

        if (!receive) {
          // console.log(
          //   `User ${token} has disabled notifications for ${prayerName} at mosque ${mosqueId}.`
          // );
          continue;
        }

        const [hours, minutes] = prayerData.split(":").map(Number);
        if (isNaN(hours) || isNaN(minutes)) {
          console.log(
            `Invalid time format for ${prayerName} at mosque ${mosqueId}. Skipping notification scheduling.`
          );
          continue;
        }

        const prayerTime = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate(),
          hours,
          minutes
        );

        if (offset > 0) {
          const prayerTimeBeforeOffset = new Date(prayerTime.getTime());
          prayerTimeBeforeOffset.setMinutes(
            prayerTimeBeforeOffset.getMinutes() - offset
          );
          const delayBeforeOffset = prayerTimeBeforeOffset - now;

          if (delayBeforeOffset > 0) {
            const { title: beforeTitle, description: beforeDescription } =
              customMessages[prayerName].beforePrayerTime(offset);
            setTimeout(() => {
              scheduleNotifications([token], beforeTitle, beforeDescription);
            }, delayBeforeOffset);

            // console.log(
            //   `Scheduled notification for ${prayerName} (before offset) for user ${token} at mosque ${mosqueId} in ${Math.round(
            //     delayBeforeOffset / 60000
            //   )} minutes.`
            // );
          } else {
            // console.log(
            //   `Skipped scheduling for ${prayerName} (before offset) for user ${token} at mosque ${mosqueId} as the time has already passed.`
            // );
          }
        }

        const delayAtPrayerTime = prayerTime - now;
        if (delayAtPrayerTime > 0) {
          const { title, description } = customMessages[prayerName];
          setTimeout(() => {
            scheduleNotifications([token], title, description);
          }, delayAtPrayerTime);
        } else {
        }
      }
    }
  }
};

const sendNotifications = async (message) => {
  try {
    // Query tokens where notifications are not disabled
    const tokensSnapshot = await db
      .collection("tokens")
      .where("notificationsDisabled", "==", false)
      .get();

    // Get the expo push tokens from the documents
    const tokens = tokensSnapshot.docs.map((doc) => doc.data().expoPushToken);

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

const saveNotificationPreferences = async (req, res) => {
  const { expoPushToken, mosqueId, settings } = req.body;

  // console.log("Received preferences data:", JSON.stringify(req.body, null, 2));

  if (!expoPushToken || !mosqueId || !settings) {
    return res.status(400).send({ error: "Missing required fields" });
  }

  try {
    const userRef = db.collection("tokens").doc(expoPushToken);
    const mosqueRef = userRef.collection("favoriteMosques").doc(mosqueId);

    await mosqueRef.set(
      {
        receivePrayerTimeReminders: settings.receivePrayerTimeReminders ?? true,
        prayerTimesOffsets: settings.prayerTimesOffsets || {
          imsaku: { offsetMinutes: 0, receiveNotifications: false },
          agimi: { offsetMinutes: 0, receiveNotifications: false },
          dreka: { offsetMinutes: 0, receiveNotifications: false },
          ikindia: { offsetMinutes: 0, receiveNotifications: false },
          akshami: { offsetMinutes: 0, receiveNotifications: false },
          jacia: { offsetMinutes: 0, receiveNotifications: false },
        },
        receiveAnnouncements: settings.receiveMosqueAnnouncements ?? false, // Default to false if undefined
        receiveEvents: settings.receiveMosqueEvents ?? false, // Default to false if undefined
      },
      { merge: true }
    );

    res.status(200).send({ message: "Preferences updated successfully" });
  } catch (error) {
    console.error("Error updating preferences in Firestore:", error);
    res.status(500).send({ error: "Error updating preferences in Firestore" });
  }
};

module.exports = {
  scheduleNotifications,
  sendPushNotification,
  schedulePrayerTimeNotifications,
  sendNotifications,
  saveNotificationPreferences,
  getUserPrayerPreferences,
};
