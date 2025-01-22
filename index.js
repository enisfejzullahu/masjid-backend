const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const cron = require("node-cron");
const {
  schedulePrayerTimeNotifications,
} = require("./notifications/notificationService");

const app = express();
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

const mosqueRoutes = require("./routes/masjids");
const prayerTimesRoutes = require("./routes/prayerTimes");
const paymentRoutes = require("./routes/paymentRoutes");
const notificationRoutes = require("./routes/notifications");
const tokenRoutes = require("./routes/tokens");
const roleRoutes = require("./routes/roles");

const { checkRole } = require("./routes/roles");
const assignRolesRoutes = require("./routes/assignRoles"); // The route for assigning roles

app.use("/mosques", mosqueRoutes);
app.use("/prayerTimes", prayerTimesRoutes);
app.use("/payments", paymentRoutes);
app.use("/", notificationRoutes);
app.use("/tokens", tokenRoutes);
// Use the routes for assigning roles
app.use("/roles", assignRolesRoutes);

// Example route accessible only by super-admins
app.post("/assign-mosque", checkRole("super-admin"), (req, res) => {
  // Logic to assign mosques to mosque-admins
  res.json({ message: "Mosque assigned successfully" });
});

// Example route accessible only by mosque-admins
app.put("/edit-mosque/:mosqueId", checkRole("mosque-admin"), (req, res) => {
  // Logic to edit mosque details
  res.json({ message: `Mosque ${req.params.mosqueId} updated successfully` });
});

app.get("/test-notifications", async (req, res) => {
  await schedulePrayerTimeNotifications();
  res.send("Triggered notification scheduling.");
});

// Cron job to schedule prayer time notifications every day at 00:01
cron.schedule(
  "1 0 * * *",
  async () => {
    console.log(
      "Cron job started: Scheduling prayer notifications for the day..."
    );
    try {
      await schedulePrayerTimeNotifications();
      console.log("Prayer notifications scheduled successfully.");
    } catch (error) {
      console.error("Error scheduling prayer notifications:", error);
    }
  },
  {
    scheduled: true,
    timezone: "Europe/Brussels", // Set the timezone explicitly
  }
);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
