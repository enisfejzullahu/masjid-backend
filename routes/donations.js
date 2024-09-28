const express = require("express");
const router = express.Router();
const db = require("../firebaseadmin"); // Adjust the path as needed
const {
  collection,
  getDocs,
  Timestamp,
  query,
  where,
} = require("firebase/firestore");



module.exports = router;
