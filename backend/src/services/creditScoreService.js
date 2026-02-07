const Transaction = require("../models/Transaction");
const CreditScore = require("../models/CreditScore");

class CreditScoreService {
  static async calculateAndSaveCreditScore(userId) {
    // Fetch all transactions for the user
    const transactions = await Transaction.findByUserId(userId);

    // Implement your credit scoring logic here
    // This is a simplified example. Real-world scoring would be much more complex.
    let score = 500; // Base score
    let salesCount = 0;
    let expenseCount = 0;
    let totalSalesAmount = 0;
    let totalExpenseAmount = 0;

    transactions.forEach(tx => {
      if (tx.type === "sale") {
        salesCount++;
        totalSalesAmount += tx.amount;
      } else if (tx.type === "expense") {
        expenseCount++;
        totalExpenseAmount += tx.amount;
      }
    });

    // Factors influencing the score (example logic):
    // 1. Transaction volume: More transactions generally mean more activity.
    score += Math.min(salesCount + expenseCount, 200); // Max +200 for volume

    // 2. Net profit: Higher net profit indicates better financial health.
    const netProfit = totalSalesAmount - totalExpenseAmount;
    if (netProfit > 0) {
      score += Math.min(netProfit / 100, 100); // Max +100 for profit
    } else if (netProfit < 0) {
      score -= Math.min(Math.abs(netProfit) / 50, 50); // Max -50 for loss
    }

    // Ensure score is within a reasonable range (e.g., 300-850)
    score = Math.max(300, Math.min(score, 850));

    const factors = {
      salesCount,
      expenseCount,
      totalSalesAmount,
      totalExpenseAmount,
      netProfit,
    };

    await CreditScore.create({ userId, scoreValue: Math.round(score), factors });
    return Math.round(score);
  }
}

module.exports = CreditScoreService;
