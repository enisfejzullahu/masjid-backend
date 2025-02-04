const admin = require("firebase-admin");

// Constants for roles
const ROLES = {
  SUPER_ADMIN: "super-admin",
  MOSQUE_ADMIN: "mosque-admin",
};

// Middleware to verify the Firebase token
const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract the token from "Bearer <token>"

  if (!token) {
    return res.status(401).send("Unauthorized to view this page");
  }

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    // console.log("Decoded Token:", decodedToken); // Log the entire decoded token
    req.user = decodedToken; // Attach the user's details to the request
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).send("Unauthorized to view this page");
  }
};

// Middleware to authorize the user based on their role
const authorize = (req, res, next) => {
  const { role, mosqueId, fullName } = req.user; // Extract user details from the request
  const requestedMosqueId = req.params.id; // Get the mosqueId from the request parameters

  // console.log("User role:", role);
  // console.log("User mosqueId:", mosqueId);
  // console.log("Requested mosqueId:", requestedMosqueId);
  // console.log("Requested Full Name:", fullName);

  // Allow super-admins to edit any mosque
  if (role === "super-admin") {
    return next();
  }

  // Ensure mosque-admins have an assigned mosqueId
  if (role === "mosque-admin") {
    if (!mosqueId) {
      return res
        .status(403)
        .send("Forbidden: mosque-admin must have a mosqueId assigned");
    }

    // Ensure the mosque-admin can only edit their assigned mosque
    if (mosqueId !== requestedMosqueId) {
      return res.status(403).send("Forbidden: Cannot edit this mosque");
    }

    return next();
  }

  // If the user is neither a super-admin nor a valid mosque-admin
  return res.status(403).send("Forbidden: Insufficient permissions");
};

// Middleware to authorize only super-admin to delete mosque
const authorizeSuperAdmin = (req, res, next) => {
  const { role } = req.user; // Get user role from the request

  // Allow only super-admin to delete a mosque
  if (role === "super-admin") {
    return next(); // Proceed to the next middleware (route handler)
  }

  // If the user is not a super-admin, deny access
  return res
    .status(403)
    .send("Forbidden: Only super-admins can delete a mosque");
};

module.exports = { authenticate, authorize, authorizeSuperAdmin };
