const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");

const app = express();
app.use(bodyParser.json());

// Enable CORS for all routes
app.use(cors());

const mosqueRoutes = require("./routes/masjids");
const prayerTimesRoutes = require("./routes/prayerTimes");
const paymentRoutes = require("./routes/paymentRoutes"); // Import the payment routes

app.use("/mosques", mosqueRoutes);
app.use("/prayerTimes", prayerTimesRoutes);
app.use("/payments", paymentRoutes); // Use the payment routes

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
