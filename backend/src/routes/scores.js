const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const CreditScore = require("../models/CreditScore");
const creditScoreService = require("../services/creditScoreService");

// Get latest credit score for a user
router.get("/user/:userId", authenticateToken, async (req, res) => {
  if (req.user.userId !== req.params.userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const score = await CreditScore.getLatestScore(req.params.userId);
    if (!score) {
      return res.status(404).json({ message: "Credit score not found for this user" });
    }
    res.json(score);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manually trigger credit score recalculation (for testing/admin)
router.post("/recalculate/:userId", authenticateToken, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    await creditScoreService.calculateAndSaveCreditScore(req.params.userId);
    res.json({ message: "Credit score recalculation initiated" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
