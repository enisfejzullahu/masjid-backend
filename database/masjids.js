const { ObjectId } = require("mongodb");
const db = require("./db");
const PrayerTimes = require("../models/prayerTimes");

const getAllMasjids = async () => {
  const mosque = await db.mosque.find().toArray();
  return mosque;
};

const getTimes = async () => {
  const times = await db.times.find().toArray();
  return times;
};

const getAllMosques = async () => {
  try {
    const times = await PrayerTimes.find().populate("mosqueId").exec();
    return times;
  } catch (error) {
    console.error("Error fetching prayer times:", error);
    throw error;
  }
};

const getPrayerTimes = async () => {
  const prayerTimes = await db.prayerTimes.find().toArray();
  return prayerTimes;
};

module.exports = {
  getAllMasjids,
  getPrayerTimes,
  getTimes,
  getAllMosques,
};
