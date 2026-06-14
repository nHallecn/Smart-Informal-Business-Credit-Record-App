const express = require("express");
const router = express.Router();

const authenticateToken = require("../middleware/auth");
const User = require("../models/User");

router.get("/:userId", authenticateToken, async (req, res) => {
  if (req.user.userId !== req.params.userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const user = await User.findById(req.params.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { password_hash, ...userData } = user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.put("/:userId/verify", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  const { status } = req.body;
  const allowedStatuses = ["pending", "verified", "rejected"];
  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid verification status" });
  }

  try {
    const success = await User.updateVerificationStatus(req.params.userId, status);

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
