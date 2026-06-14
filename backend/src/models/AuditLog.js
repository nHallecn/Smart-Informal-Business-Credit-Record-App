const pool = require("../config/db");

class AuditLog {
  static async create({ userId, action, details }) {
    const { rows } = await pool.query(
      "INSERT INTO audit_logs (user_id, action, details) VALUES ($1, $2, $3) RETURNING log_id",
      [userId, action, details]
    );
    return rows[0].log_id;
  }

  static async findByUserId(userId) {
    const { rows } = await pool.query("SELECT * FROM audit_logs WHERE user_id = $1 ORDER BY created_at DESC", [userId]);
    return rows;
  }
}

module.exports = AuditLog;
