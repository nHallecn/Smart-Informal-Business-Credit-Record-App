const pool = require("../config/db");

class CreditScore {
  static async create({ userId, scoreValue, factors }) {
    const { rows } = await pool.query(
      "INSERT INTO credit_scores (user_id, score_value, factors) VALUES ($1, $2, $3) RETURNING score_id",
      [userId, scoreValue, factors]
    );
    return rows[0].score_id;
  }

  static async getLatestScore(userId) {
    const { rows } = await pool.query(
      "SELECT score_value, factors, calculated_at FROM credit_scores WHERE user_id = $1 ORDER BY calculated_at DESC LIMIT 1",
      [userId]
    );
    return rows[0];
  }
}

module.exports = CreditScore;
