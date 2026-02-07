const pool = require("../config/db");

class AuditLog {
  static async create({ userId, action, details }) {
    const [result] = await pool.query(
      "INSERT INTO audit_logs (user_id, action, details) VALUES (?, ?, ?)",
      [userId, action, JSON.stringify(details)]
    );
    return result.insertId;
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query("SELECT * FROM audit_logs WHERE user_id = ? ORDER BY created_at DESC", [userId]);
    return rows;
  }
}

module.exports = AuditLog;
