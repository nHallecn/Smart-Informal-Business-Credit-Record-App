const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Transaction = require("../models/Transaction");

// Add a new transaction
router.post("/", authenticateToken, async (req, res) => {
  const { type, amount, category, paymentMethod, transactionDate } = req.body;
  try {
    const newTransaction = await Transaction.create({
      userId: req.user.userId,
      type,
      amount,
      category,
      paymentMethod,
      transactionDate,
    });
    res.status(201).json(newTransaction);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all transactions for a user
router.get("/user/:userId", authenticateToken, async (req, res) => {
  if (req.user.userId !== req.params.userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const transactions = await Transaction.findByUserId(req.params.userId);
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get transaction summary for a user
router.get("/summary/:userId", authenticateToken, async (req, res) => {
  if (req.user.userId !== req.params.userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    const summary = await Transaction.getSummaryByUserId(req.params.userId);
    res.json(summary);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;