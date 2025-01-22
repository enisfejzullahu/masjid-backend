const express = require("express");
const { setRole, admin } = require("../firebaseadmin");
const router = express.Router();

// Route to assign role to a user
router.post("/assign-role", async (req, res) => {
  const { userId, role } = req.body;

  if (!userId || !role) {
    return res.status(400).json({ message: "User ID and role are required" });
  }

  try {
    await setRole(userId, role);
    res.json({ message: `Role '${role}' assigned to user: ${userId}` });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Route to get the role of a user by UID
router.get("/get-role/:uid", async (req, res) => {
  const { uid } = req.params;

  try {
    const user = await admin.auth().getUser(uid); // Get user from Firebase Auth
    const role = user.customClaims?.role; // Check if the user has a custom role

    if (role) {
      res.json({ role: role });
    } else {
      res.status(404).json({ message: "Role not found for this user" });
    }
  } catch (error) {
    console.error("Error fetching user role:", error);
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
