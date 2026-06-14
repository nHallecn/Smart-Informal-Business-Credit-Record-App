<<<<<<< Updated upstream
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
=======
const pool = require("../config/db");
const { v4: uuidv4 } = require("uuid");
const crypto = require("crypto");

class Report {
  static async create({ userId, type, filePath }) {
    const reportId = uuidv4();
    const shareToken = crypto.randomBytes(24).toString("hex");
    const shareExpiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    await pool.query(
      `INSERT INTO reports (report_id, user_id, type, file_path, share_token, share_expires_at)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [reportId, userId, type, filePath, shareToken, shareExpiresAt]
    );
    return { reportId, userId, type, filePath, shareToken, shareExpiresAt };
  }

  static async findByUserId(userId) {
    const { rows } = await pool.query(
      `SELECT
        report_id AS id,
        report_id,
        type,
        file_path AS url,
        share_token AS "shareToken",
        share_expires_at AS "shareExpiresAt",
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

  static async findByShareToken(shareToken) {
    const { rows } = await pool.query(
      `SELECT
        r.report_id,
        r.user_id,
        r.type,
        r.file_path,
        r.share_expires_at,
        r.generated_at,
        u.username,
        u.phone_number,
        u.verification_status
       FROM reports r
       JOIN users u ON u.user_id = r.user_id
       WHERE r.share_token = $1
         AND (r.share_expires_at IS NULL OR r.share_expires_at > NOW())`,
      [shareToken]
    );
    return rows[0];
  }
}
>>>>>>> Stashed changes

module.exports = Report;
