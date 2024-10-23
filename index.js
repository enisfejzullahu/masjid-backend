const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { sendPushNotification } = require("./notificationService");
const loadPrayerTimes = require("./database/loadPrayerTimes");

// require("./src/scheduleNotifications");

const app = express();
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

const mosqueRoutes = require("./routes/masjids");
const prayerTimesRoutes = require("./routes/prayerTimes");
const paymentRoutes = require("./routes/paymentRoutes"); // Import the payment routes
const notificationRoutes = require("./routes/notifications");
const userRoutes = require("./routes/users");

app.use("/mosques", mosqueRoutes);
app.use("/prayerTimes", prayerTimesRoutes);
app.use("/payments", paymentRoutes);
app.use("/", notificationRoutes);
app.use("/users", userRoutes);

// app.post('/send-notification', async (req, res) => {
//   const { expoPushToken, title, body } = req.body; // Assume push token, title, and body are passed in the request

//   try {
//     await sendPushNotification(expoPushToken, title, body);
//     res.status(200).send('Notification sent');
//   } catch (error) {
//     console.error('Error sending notification:', error);
//     res.status(500).send('Error sending notification');
//   }
// });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
