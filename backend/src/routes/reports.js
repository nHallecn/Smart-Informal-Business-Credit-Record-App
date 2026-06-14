<<<<<<< Updated upstream
const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/auth");
const Report = require("../models/Report"); // Assuming a Report model will be created

// Placeholder for report generation logic
router.post("/generate", authenticateToken, async (req, res) => {
  const { userId, reportType } = req.body;
  // In a real application, this would trigger a report generation service
  // and return a URL to the generated report.
  try {
    // Example: const reportPath = await reportService.generateReport(userId, reportType);
    const reportPath = `/generated_reports/${userId}-${reportType}-${Date.now()}.pdf`; // Mock path
    // await Report.create({ userId, type: reportType, file_path: reportPath });
    res.status(200).json({ message: "Report generation initiated", reportUrl: reportPath });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Placeholder for getting user reports
router.get("/user/:userId", authenticateToken, async (req, res) => {
  if (req.user.userId !== req.params.userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  try {
    // Example: const reports = await Report.findByUserId(req.params.userId);
    const reports = [
      { id: "report1", type: "monthly", url: "/reports/user1-monthly.pdf", generatedAt: "2024-01-01" },
      { id: "report2", type: "weekly", url: "/reports/user1-weekly.pdf", generatedAt: "2024-01-08" },
    ]; // Mock data
    res.json(reports);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
=======
const express = require("express");
const router = express.Router();
const fs = require("fs/promises");
const path = require("path");
const authenticateToken = require("../middleware/auth");
const Report = require("../models/Report");
const reportService = require("../services/reportService");

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

router.get("/share/:token", async (req, res) => {
  try {
    const report = await Report.findByShareToken(req.params.token);
    if (!report) {
      return res.status(404).send("Report link not found or expired.");
    }

    const reportsDir = path.join(__dirname, "..", "..", "generated_reports");
    const fileName = path.basename(report.file_path);
    const reportContent = await fs.readFile(path.join(reportsDir, fileName), "utf8");

    res.type("html").send(`
      <!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <meta name="viewport" content="width=device-width, initial-scale=1" />
          <title>${escapeHtml(report.type)} financial report</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 860px; margin: 32px auto; padding: 0 16px; color: #1f2937; line-height: 1.5; }
            .header { border-bottom: 1px solid #e5e7eb; margin-bottom: 20px; padding-bottom: 16px; }
            .meta { color: #64748b; font-size: 14px; }
            pre { white-space: pre-wrap; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; overflow-x: auto; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>${escapeHtml(report.type).toUpperCase()} Financial Report</h1>
            <p class="meta">Business owner: ${escapeHtml(report.username)} | Verification: ${escapeHtml(report.verification_status)}</p>
            <p class="meta">Generated: ${new Date(report.generated_at).toLocaleDateString()}</p>
          </div>
          <pre>${escapeHtml(reportContent)}</pre>
        </body>
      </html>
    `);
  } catch (error) {
    res.status(500).send("Could not open shared report.");
  }
});

router.post("/generate", authenticateToken, async (req, res) => {
  const { userId, reportType } = req.body;

  if (req.user.userId !== userId && req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied" });
  }
  if (!reportType) {
    return res.status(400).json({ message: "Report type is required" });
  }

  try {
    const report = await reportService.generateReport(userId, reportType);
    res.status(201).json({
      message: "Report generated successfully",
      reportUrl: report.filePath,
      shareToken: report.shareToken,
      shareExpiresAt: report.shareExpiresAt,
    });
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
>>>>>>> Stashed changes
