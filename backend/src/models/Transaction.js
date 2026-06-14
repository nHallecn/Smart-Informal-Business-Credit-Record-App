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

  static async getDashboardInsights(userId) {
    const [summaryResult, topCategoryResult, recentTrendResult] = await Promise.all([
      pool.query(
        `SELECT
          COUNT(*)::int AS "transactionCount",
          COALESCE(SUM(CASE WHEN type IN ('sale', 'mobile_money_in') THEN amount ELSE 0 END), 0)::float AS "totalSales",
          COALESCE(SUM(CASE WHEN type IN ('expense', 'mobile_money_out') THEN amount ELSE 0 END), 0)::float AS "totalExpenses",
          COALESCE(AVG(amount), 0)::float AS "averageTransaction"
         FROM transactions
         WHERE user_id = $1`,
        [userId]
      ),
      pool.query(
        `SELECT
          category,
          COUNT(*)::int AS "transactionCount",
          COALESCE(SUM(amount), 0)::float AS total
         FROM transactions
         WHERE user_id = $1
         GROUP BY category
         ORDER BY total DESC
         LIMIT 1`,
        [userId]
      ),
      pool.query(
        `SELECT
          COALESCE(SUM(CASE
            WHEN transaction_date >= NOW() - INTERVAL '30 days'
             AND type IN ('sale', 'mobile_money_in')
            THEN amount ELSE 0 END), 0)::float AS "recentSales",
          COALESCE(SUM(CASE
            WHEN transaction_date >= NOW() - INTERVAL '30 days'
             AND type IN ('expense', 'mobile_money_out')
            THEN amount ELSE 0 END), 0)::float AS "recentExpenses"
         FROM transactions
         WHERE user_id = $1`,
        [userId]
      ),
    ]);

    const summary = summaryResult.rows[0];
    const topCategory = topCategoryResult.rows[0] || null;
    const recentTrend = recentTrendResult.rows[0];
    const netProfit = summary.totalSales - summary.totalExpenses;
    const recentNetProfit = recentTrend.recentSales - recentTrend.recentExpenses;

    return {
      ...summary,
      netProfit,
      averageTransaction: summary.averageTransaction,
      topCategory,
      recentTrend: {
        ...recentTrend,
        recentNetProfit,
      },
      insight: this.buildDashboardInsight({
        transactionCount: summary.transactionCount,
        netProfit,
        recentNetProfit,
        totalSales: summary.totalSales,
        totalExpenses: summary.totalExpenses,
      }),
    };
  }

  static buildDashboardInsight({ transactionCount, netProfit, recentNetProfit, totalSales, totalExpenses }) {
    if (transactionCount === 0) {
      return "Start by recording today's sales and expenses so your business history can grow.";
    }

    if (netProfit < 0) {
      return "Expenses are higher than sales. Review your largest cost categories before adding new stock.";
    }

    if (recentNetProfit > 0 && transactionCount >= 5) {
      return "Your recent records show positive cash flow. Keep logging daily to strengthen your credit profile.";
    }

    if (totalSales > 0 && totalExpenses / totalSales > 0.75) {
      return "Expenses are using most of your sales. Look for one cost you can reduce this week.";
    }

    return "You have a useful record trail started. More consistent entries will make your score more reliable.";
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
