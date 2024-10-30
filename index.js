const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cron = require("node-cron");
const {
  schedulePrayerTimeNotifications,
  sendNotifications
} = require("./notifications/notificationService");

const app = express();
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

const mosqueRoutes = require("./routes/masjids");
const prayerTimesRoutes = require("./routes/prayerTimes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notifications");
const userRoutes = require("./routes/users");

app.use("/mosques", mosqueRoutes);
app.use("/prayerTimes", prayerTimesRoutes);
app.use("/payments", paymentRoutes);
app.use("/", notificationRoutes);
app.use("/users", userRoutes);


// app.get('/test-notifications', async (req, res) => {
//   await schedulePrayerTimeNotifications();
//   res.send('Triggered notification scheduling.');
// });


// Cron job to schedule prayer time notifications every day at 00:01
cron.schedule("1 0 * * *", async () => {
  console.log(
    "Cron job started: Scheduling prayer notifications for the day..."
  );

  try {
    await schedulePrayerTimeNotifications();
    console.log("Prayer notifications scheduled successfully.");
  } catch (error) {
    console.error("Error scheduling prayer notifications:", error);
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
