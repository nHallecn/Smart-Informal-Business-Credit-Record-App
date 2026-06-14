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

    await Report.create({ userId, type: reportType, filePath });

    return filePath;
  }
}

module.exports = ReportService;
