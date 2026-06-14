const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Report = require("../models/Report");
const reportService = require("../services/reportService");

router.post("/generate", authenticateToken, async (req, res) => {
  const { userId, reportType } = req.body;

  if (req.user.userId !== userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  if (!reportType) {
    return res.status(400).json({ message: "Report type is required" });
  }

  try {
    const reportPath = await reportService.generateReport(userId, reportType);
    res.status(201).json({ message: "Report generated successfully", reportUrl: reportPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/user/:userId", authenticateToken, async (req, res) => {
  if (req.user.userId !== req.params.userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }

  try {
    const reports = await Report.findByUserId(req.params.userId);
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
