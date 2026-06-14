const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Transaction = require("../models/Transaction");

// Add a new transaction
<<<<<<< Updated upstream
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
=======
router.post("/", authenticateToken, async (req, res) => {
  const { type, amount, category, description, paymentMethod, mobileMoneyRef, transactionDate } = req.body;

  const allowedTypes = ["sale", "expense", "mobile_money_in", "mobile_money_out"];
  const allowedPaymentMethods = ["cash", "mtn_momo", "orange_money", "bank_transfer", "mobile_money"];

  if (!allowedTypes.includes(type)) {
    return res.status(400).json({ message: "Invalid transaction type" });
  }
  if (!amount || Number.isNaN(Number(amount)) || Number(amount) < 0) {
    return res.status(400).json({ message: "Amount must be a positive number" });
  }
  if (!category) {
    return res.status(400).json({ message: "Category is required" });
  }
  if (paymentMethod && !allowedPaymentMethods.includes(paymentMethod)) {
    return res.status(400).json({ message: "Invalid payment method" });
  }

  try {
    const newTransaction = await Transaction.create({
      userId: req.user.userId,
      type,
      amount: Number(amount),
      category,
      description,
      paymentMethod: paymentMethod || "cash",
      mobileMoneyRef,
      transactionDate: transactionDate || new Date().toISOString(),
    });
    res.status(201).json(newTransaction);
  } catch (error) {
>>>>>>> Stashed changes
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