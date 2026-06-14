const Transaction = require("../models/Transaction");
const CreditScore = require("../models/CreditScore");

<<<<<<< Updated upstream
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
=======
class CreditScoreService {
  static async calculateAndSaveCreditScore(userId) {
    const transactions = await Transaction.findByUserId(userId);

    const baseScore = 500;
    let score = baseScore;
    let salesCount = 0;
    let expenseCount = 0;
    let totalSalesAmount = 0;
    let totalExpenseAmount = 0;
    const transactionDays = new Set();

    transactions.forEach(tx => {
      const amount = Number(tx.amount);
      if (tx.type === "sale" || tx.type === "mobile_money_in") {
        salesCount++;
        totalSalesAmount += amount;
      } else if (tx.type === "expense" || tx.type === "mobile_money_out") {
        expenseCount++;
        totalExpenseAmount += amount;
      }
      if (tx.transaction_date) {
        transactionDays.add(new Date(tx.transaction_date).toISOString().slice(0, 10));
      }
    });

    const transactionCount = salesCount + expenseCount;
    const netProfit = totalSalesAmount - totalExpenseAmount;
    const expenseRatio = totalSalesAmount > 0 ? totalExpenseAmount / totalSalesAmount : null;
    const consistencyDays = transactionDays.size;

    const volumePoints = Math.min(transactionCount * 2, 160);
    const consistencyPoints = Math.min(consistencyDays * 4, 80);
    let profitPoints = 0;
    if (netProfit > 0) {
      profitPoints = Math.min(netProfit / 100, 100);
    } else if (netProfit < 0) {
      profitPoints = -Math.min(Math.abs(netProfit) / 50, 80);
    }

    const expenseDisciplinePoints =
      expenseRatio === null ? 0 : Math.max(-60, Math.min(60, (0.75 - expenseRatio) * 120));

    score += volumePoints + consistencyPoints + profitPoints + expenseDisciplinePoints;
    score = Math.max(300, Math.min(score, 850));

    const factors = {
      baseScore,
      salesCount,
      expenseCount,
      transactionCount,
      consistencyDays,
      totalSalesAmount,
      totalExpenseAmount,
      netProfit,
      expenseRatio,
      components: [
        {
          key: "transactionVolume",
          label: "Transaction volume",
          points: Math.round(volumePoints),
          description: `${transactionCount} recorded transactions show business activity.`,
        },
        {
          key: "recordConsistency",
          label: "Record consistency",
          points: Math.round(consistencyPoints),
          description: `Entries were recorded across ${consistencyDays} day${consistencyDays === 1 ? "" : "s"}.`,
        },
        {
          key: "netProfit",
          label: "Net profit",
          points: Math.round(profitPoints),
          description:
            netProfit >= 0
              ? "Sales are higher than expenses."
              : "Expenses are higher than sales.",
        },
        {
          key: "expenseDiscipline",
          label: "Expense discipline",
          points: Math.round(expenseDisciplinePoints),
          description:
            expenseRatio === null
              ? "Add sales records so expense discipline can be measured."
              : `${Math.round(expenseRatio * 100)}% of sales is currently going to expenses.`,
        },
      ],
      strengths: this.buildStrengths({ transactionCount, consistencyDays, netProfit, expenseRatio }),
      risks: this.buildRisks({ transactionCount, consistencyDays, netProfit, expenseRatio, totalSalesAmount }),
      nextActions: this.buildNextActions({ transactionCount, consistencyDays, netProfit, expenseRatio, totalSalesAmount }),
    };

    await CreditScore.create({ userId, scoreValue: Math.round(score), factors });
    return Math.round(score);
  }

  static buildStrengths({ transactionCount, consistencyDays, netProfit, expenseRatio }) {
    const strengths = [];

    if (transactionCount >= 10) {
      strengths.push("You have enough recorded entries to start showing a business pattern.");
    }
    if (consistencyDays >= 5) {
      strengths.push("Your records are spread across multiple days, which improves trust.");
    }
    if (netProfit > 0) {
      strengths.push("Your records show positive net profit.");
    }
    if (expenseRatio !== null && expenseRatio <= 0.6) {
      strengths.push("Expenses are controlled compared with sales.");
    }

    return strengths;
  }

  static buildRisks({ transactionCount, consistencyDays, netProfit, expenseRatio, totalSalesAmount }) {
    const risks = [];

    if (transactionCount < 5) {
      risks.push("There are still too few records for a strong credit profile.");
    }
    if (consistencyDays < 3) {
      risks.push("Records are not yet consistent across enough days.");
    }
    if (netProfit < 0) {
      risks.push("Expenses are currently higher than sales.");
    }
    if (totalSalesAmount === 0) {
      risks.push("No sales records have been synced yet.");
    } else if (expenseRatio > 0.8) {
      risks.push("Expenses are using most of your sales.");
    }

    return risks;
  }

  static buildNextActions({ transactionCount, consistencyDays, netProfit, expenseRatio, totalSalesAmount }) {
    const actions = [];

    if (transactionCount < 10) {
      actions.push("Record every sale and expense for the next 7 days.");
    }
    if (consistencyDays < 5) {
      actions.push("Add records on more business days to prove consistency.");
    }
    if (totalSalesAmount === 0) {
      actions.push("Add your first sales records so the app can measure business income.");
    }
    if (netProfit < 0 || expenseRatio > 0.75) {
      actions.push("Review your largest expense category and reduce one avoidable cost.");
    }
    if (actions.length === 0) {
      actions.push("Keep syncing daily records to preserve this score trend.");
    }

    return actions;
  }
}
>>>>>>> Stashed changes

module.exports = CreditScoreService;
