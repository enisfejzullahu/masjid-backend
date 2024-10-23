const { Expo } = require("expo-server-sdk");
const expo = new Expo();

const sendPushNotification = async (expoPushToken, title, body) => {
  if (!expoPushToken || !expoPushToken.startsWith("ExponentPushToken")) {
    console.error("Invalid push token:", expoPushToken);
    return;
  }

  const message = {
    to: expoPushToken,
    sound: "default",
    title: title,
    body: body,
    data: { someData: "goes here" }, // Customize as needed
  };

  try {
    const tickets = await expo.sendPushNotificationsAsync([message]);

    // Check for errors in the response tickets
    tickets.forEach((ticket) => {
      if (ticket.status === "error") {
        console.error(`Error sending notification: ${ticket.message}`);
      }
    });

    console.log("Notification sent successfully:", tickets);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};

module.exports = { sendPushNotification };
