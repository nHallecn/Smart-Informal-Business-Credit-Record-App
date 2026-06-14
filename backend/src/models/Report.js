const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");

class Report {
  static async create({ userId, type, filePath }) {
    const reportId = uuidv4();
    await pool.query(
      "INSERT INTO reports (report_id, user_id, type, file_path) VALUES ($1, $2, $3, $4)",
      [reportId, userId, type, filePath]
    );
    return { reportId, userId, type, filePath };
  }

  static async findByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT
        report_id AS id,
        report_id,
        type,
        file_path AS url,
        generated_at AS "generatedAt"
       FROM reports
       WHERE user_id = $1
       ORDER BY generated_at DESC`,
      [userId]
    );
    return rows;
  }

  static async findById(reportId) {
    const { rows } = await pool.query("SELECT * FROM reports WHERE report_id = $1", [reportId]);
    return rows[0];
  }
}

module.exports = Report;
