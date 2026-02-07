const Transaction = require("../models/Transaction");
const creditScoreService = require("./creditScoreService");

class SyncService {
  static async processIncomingTransactions(transactions, userId) {
    if (!transactions || !Array.isArray(transactions) || transactions.length === 0) {
      return { message: "No transactions to sync" };
    }

    try {
      const syncedIds = await Transaction.bulkInsertOrUpdate(transactions, userId);
      // After successful sync, recalculate credit score
      await creditScoreService.calculateAndSaveCreditScore(userId);
      return { success: true, syncedIds };
    } catch (error) {
      console.error("Error during sync process:", error);
      throw new Error("Failed to process incoming transactions");
    }
  }
}

module.exports = SyncService;
