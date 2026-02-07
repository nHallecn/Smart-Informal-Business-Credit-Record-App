const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/auth");
const User = require("../models/User");

// Get user profile
router.get("/:userId", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).lean(); // 👈 important

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Exclude sensitive info
    const { password_hash, ...userData } = user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update user verification status (Admin only)
router.put("/:userId/verify", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { status } = req.body; // 'verified', 'pending', 'rejected'

  try {
    const success = await User.updateVerificationStatus(
      req.params.userId,
      status
    );

    if (success) {
      res.json({
        message: `User ${req.params.userId} verification status updated to ${status}`,
      });
    } else {
      res.status(404).json({
        message: "User not found or status not changed",
      });
    }
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
