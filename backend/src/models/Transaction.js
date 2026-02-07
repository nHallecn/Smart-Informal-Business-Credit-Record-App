const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

class Transaction {
  static async create({ userId, type, amount, category, paymentMethod, transactionDate }) {
    const transactionId = uuidv4();
    const [result] = await pool.query(
      "INSERT INTO transactions (transaction_id, user_id, type, amount, category, payment_method, transaction_date) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [transactionId, userId, type, amount, category, paymentMethod, transactionDate]
    );
    return { transactionId, userId, type, amount };
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query("SELECT * FROM transactions WHERE user_id = ? ORDER BY transaction_date DESC", [userId]);
    return rows;
  }

  static async getSummaryByUserId(userId) {
    const [sales] = await pool.query(
      "SELECT SUM(amount) as totalSales FROM transactions WHERE user_id = ? AND type = \'sale\'",
      [userId]
    );
    const [expenses] = await pool.query(
      "SELECT SUM(amount) as totalExpenses FROM transactions WHERE user_id = ? AND type = \'expense\'",
      [userId]
    );
    return { totalSales: sales[0].totalSales || 0, totalExpenses: expenses[0].totalExpenses || 0 };
  }

  static async bulkInsertOrUpdate(transactions, userId) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const syncedIds = [];

      for (const tx of transactions) {
        await connection.query(
          `INSERT INTO transactions (transaction_id, user_id, type, amount, category, payment_method, transaction_date, is_synced) 
           VALUES (?, ?, ?, ?, ?, ?, ?, true)
           ON DUPLICATE KEY UPDATE is_synced = true`,
          [tx.id, userId, tx.type, tx.amount, tx.category, tx.paymentMethod, tx.date]
        );
        syncedIds.push(tx.id);
      }

      await connection.commit();
      return syncedIds;
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = Transaction;