const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Transaction = require("../models/Transaction");
const CreditScore = require("../models/CreditScore");

router.get("/:userId", authenticateToken, async (req, res) => {
  if (req.user.userId !== req.params.userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const [summary, latestScore] = await Promise.all([
      Transaction.getSummaryByUserId(req.params.userId),
      CreditScore.getLatestScore(req.params.userId),
    ]);

    res.json({
      totalSales: summary.totalSales,
      totalExpenses: summary.totalExpenses,
      creditScore: latestScore?.score_value || 0,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
