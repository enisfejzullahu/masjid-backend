const express = require("express");
const router = express.Router();
const firebaseAdmin = require("../firebaseadmin"); // Importing the whole module
const { db, admin } = firebaseAdmin; // Destructure messaging from the imported object
const {
  collection,
  getDocs,
  Timestamp,
  query,
  where,
} = require("firebase/firestore");

// Middleware to verify ID token
async function verifyToken(req, res, next) {
    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("Authorization header missing or malformed:", authHeader);
      return res.status(401).json({ error: "Unauthorized" });
    }
  
    const idToken = authHeader.split("Bearer ")[1];
  
    try {
      const decodedToken = await admin.auth().verifyIdToken(idToken);
      console.log("Decoded token:", decodedToken);
      req.user = decodedToken;
      next();
    } catch (error) {
      console.error("Token verification failed:", error);
      return res.status(403).json({ error: "Forbidden" });
    }
}
  

  // GET /user-info
router.get('/user-info', verifyToken, async (req, res) => {
    try {
      const userId = req.user.uid; // Get Firebase user ID from verified token
  
      // Fetch user details from Firestore
      const userDoc = await admin.firestore().collection('users').doc(userId).get();
      if (!userDoc.exists) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const userData = userDoc.data();
      return res.status(200).json({ user: userData });
    } catch (error) {
      console.error("Error fetching user info:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  module.exports = router;
