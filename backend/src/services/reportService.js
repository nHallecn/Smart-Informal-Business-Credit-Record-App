<<<<<<< Updated upstream
const Transaction = require("../models/Transaction");
const Report = require("../models/Report");
// In a real application, you would use a PDF generation library like `pdfkit` or `html-pdf`
// For simplicity, this is a placeholder.

class ReportService {
  static async generateReport(userId, reportType) {
    // Fetch user\'s transactions
    const transactions = await Transaction.findByUserId(userId);

    // Basic report content generation (can be expanded significantly)
    let reportContent = `Report Type: ${reportType}\n\n`;
    reportContent += `Transactions for User ID: ${userId}\n`;
    transactions.forEach(tx => {
      reportContent += `- ${tx.transaction_date}: ${tx.type.toUpperCase()} of $${tx.amount} (${tx.category})\n`;
    });

    // In a real scenario, save this content to a file (e.g., PDF) and upload to storage (S3, etc.)
    // For now, we\'ll just return a mock file path.
    const filePath = `/generated_reports/${userId}_${reportType}_${Date.now()}.txt`;

    // Save report metadata to the database
    await Report.create({ userId, type: reportType, filePath });

    return filePath;
  }
}
=======
const Transaction = require("../models/Transaction");
const Report = require("../models/Report");
const fs = require("fs/promises");
const path = require("path");

class ReportService {
  static async generateReport(userId, reportType) {
    const transactions = await Transaction.findByUserId(userId);

    const totalSales = transactions
      .filter((tx) => tx.type === "sale" || tx.type === "mobile_money_in")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);
    const totalExpenses = transactions
      .filter((tx) => tx.type === "expense" || tx.type === "mobile_money_out")
      .reduce((sum, tx) => sum + Number(tx.amount), 0);

    let reportContent = `Report Type: ${reportType}\n\n`;
    reportContent += `Transactions for User ID: ${userId}\n`;
    reportContent += `Total Sales: ${totalSales.toFixed(2)}\n`;
    reportContent += `Total Expenses: ${totalExpenses.toFixed(2)}\n`;
    reportContent += `Net Profit: ${(totalSales - totalExpenses).toFixed(2)}\n\n`;
    transactions.forEach(tx => {
      reportContent += `- ${tx.transaction_date}: ${tx.type.toUpperCase()} of ${Number(tx.amount).toFixed(2)} (${tx.category})\n`;
    });

    const reportsDir = path.join(__dirname, "..", "..", "generated_reports");
    await fs.mkdir(reportsDir, { recursive: true });

    const fileName = `${userId}_${reportType}_${Date.now()}.txt`;
    await fs.writeFile(path.join(reportsDir, fileName), reportContent, "utf8");

    const filePath = `/generated_reports/${fileName}`;

    const report = await Report.create({ userId, type: reportType, filePath });

    return report;
  }
}
>>>>>>> Stashed changes

module.exports = ReportService;
