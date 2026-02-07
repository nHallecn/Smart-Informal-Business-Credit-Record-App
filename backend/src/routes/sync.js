const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Transaction = require("../models/Transaction");
const creditScoreService = require("../services/creditScoreService");

router.post("/", authenticateToken, async (req, res) => {
  const { transactions } = req.body;
  const userId = req.user.userId;

  if (!transactions || !Array.isArray(transactions)) {
    return res.status(400).json({ message: "Invalid transactions data" });
  }

  try {
    const syncedIds = await Transaction.bulkInsertOrUpdate(transactions, userId);
    // After successful sync, recalculate credit score
    await creditScoreService.calculateAndSaveCreditScore(userId);
    res.json({ success: true, syncedIds });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
