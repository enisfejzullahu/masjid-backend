const { verifyToken } = require("../firebaseadmin");

// Middleware to check the role of the user
const checkRole = (role) => {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split("Bearer ")[1];

    if (!token) {
      return res.status(403).json({ message: "Unauthorized" });
    }

    try {
      const decodedToken = await verifyToken(token); // Verifies and decodes the token
      if (decodedToken.role !== role) {
        return res.status(403).json({ message: "Forbidden" });
      }
      req.user = decodedToken; // Attach user data to request object
      next();
    } catch (error) {
      res.status(401).json({ message: error.message });
    }
  };
};

module.exports = { checkRole };
