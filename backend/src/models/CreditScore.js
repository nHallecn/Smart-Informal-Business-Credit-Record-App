const pool = require("../config/db");

class CreditScore {
  static async create({ userId, scoreValue, factors }) {
    const [result] = await pool.query(
      "INSERT INTO credit_scores (user_id, score_value, factors) VALUES (?, ?, ?)",
      [userId, scoreValue, JSON.stringify(factors)]
    );
    return result.insertId;
  }

  static async getLatestScore(userId) {
    const [rows] = await pool.query(
      "SELECT score_value, factors, calculated_at FROM credit_scores WHERE user_id = ? ORDER BY calculated_at DESC LIMIT 1",
      [userId]
    );
    if (rows[0]) {
      rows[0].factors = JSON.parse(rows[0].factors);
    }
    return rows[0];
  }
}

module.exports = CreditScore;