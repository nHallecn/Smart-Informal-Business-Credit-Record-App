const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

class Transaction {
  static async create({ userId, type, amount, category, description = null, paymentMethod, mobileMoneyRef = null, transactionDate }) {
    const transactionId = uuidv4();
    await pool.query(
      `INSERT INTO transactions
        (transaction_id, user_id, type, amount, category, description, payment_method, mobile_money_ref, transaction_date, is_synced)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)`,
      [transactionId, userId, type, amount, category, description, paymentMethod, mobileMoneyRef, transactionDate]
    );
    return { id: transactionId, transactionId, userId, type, amount, category, description, paymentMethod, mobileMoneyRef, date: transactionDate };
  }

  static async findByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT
        transaction_id,
        transaction_id AS id,
        user_id,
        type,
        amount::float AS amount,
        category,
        description,
        payment_method,
        mobile_money_ref,
        transaction_date,
        transaction_date AS date,
        is_synced,
        created_at,
        updated_at
       FROM transactions
       WHERE user_id = $1
       ORDER BY transaction_date DESC`,
      [userId]
    );
    return rows;
  }

  static async getSummaryByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT
        COALESCE(SUM(CASE WHEN type IN ('sale', 'mobile_money_in') THEN amount ELSE 0 END), 0)::float AS "totalSales",
        COALESCE(SUM(CASE WHEN type IN ('expense', 'mobile_money_out') THEN amount ELSE 0 END), 0)::float AS "totalExpenses"
       FROM transactions
       WHERE user_id = $1`,
      [userId]
    );
    return rows[0];
  }

  static async bulkInsertOrUpdate(transactions, userId) {
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const syncedIds = [];

      for (const tx of transactions) {
        const transactionId = tx.id || tx.transactionId;
        await client.query(
          `INSERT INTO transactions
            (transaction_id, user_id, type, amount, category, description, payment_method, mobile_money_ref, transaction_date, is_synced)
           VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, true)
           ON CONFLICT (transaction_id) DO UPDATE SET
             type = EXCLUDED.type,
             amount = EXCLUDED.amount,
             category = EXCLUDED.category,
             description = EXCLUDED.description,
             payment_method = EXCLUDED.payment_method,
             mobile_money_ref = EXCLUDED.mobile_money_ref,
             transaction_date = EXCLUDED.transaction_date,
             is_synced = true,
             updated_at = NOW()`,
          [
            transactionId,
            userId,
            tx.type,
            tx.amount,
            tx.category,
            tx.description || null,
            tx.paymentMethod,
            tx.mobileMoneyRef || null,
            tx.date || tx.transactionDate,
          ]
        );
        syncedIds.push(transactionId);
      }

      await client.query("COMMIT");
      return syncedIds;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

module.exports = Transaction;
