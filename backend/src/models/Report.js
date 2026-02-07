const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

class Report {
  static async create({ userId, type, filePath }) {
    const reportId = uuidv4();
    const [result] = await pool.query(
      "INSERT INTO reports (report_id, user_id, type, file_path) VALUES (?, ?, ?, ?)",
      [reportId, userId, type, filePath]
    );
    return { reportId, userId, type, filePath };
  }

  static async findByUserId(userId) {
    const [rows] = await pool.query("SELECT * FROM reports WHERE user_id = ? ORDER BY generated_at DESC", [userId]);
    return rows;
  }

  static async findById(reportId) {
    const [rows] = await pool.query("SELECT * FROM reports WHERE report_id = ?", [reportId]);
    return rows[0];
  }
}

module.exports = Report;
