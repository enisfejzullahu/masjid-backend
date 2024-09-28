const { MongoClient } = require("mongodb");
const dotenv = require("dotenv");

const uri =
  "mongodb+srv://enisfejzullahu04:enisqwe04@masjidcluster.r4fesf8.mongodb.net/?retryWrites=true&w=majority&appName=MasjidCluster";

const client = new MongoClient(uri);

const database = client.db("xhamiaime");
const mosque = database.collection("mosque");
const prayerTimes = database.collection("prayerTimes");
const times = database.collection("times");

module.exports = {
  mosque,
  prayerTimes,
  times,
};
