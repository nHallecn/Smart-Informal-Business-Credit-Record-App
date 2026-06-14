const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

class User {
  static async create({ username, email = null, phoneNumber, password, role = "business_owner" }) {
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    await pool.query(
      "INSERT INTO users (user_id, username, email, phone_number, password_hash, role) VALUES ($1, $2, $3, $4, $5, $6)",
      [userId, username, email, phoneNumber, hashedPassword, role]
    );
    return { userId, username, email, phoneNumber, role };
  }

  static async findByPhoneNumber(phoneNumber) {
    const { rows } = await pool.query("SELECT * FROM users WHERE phone_number = $1", [phoneNumber]);
    return rows[0];
  }

  static async findById(userId) {
    const { rows } = await pool.query("SELECT * FROM users WHERE user_id = $1", [userId]);
    return rows[0];
  }

  static async updateVerificationStatus(userId, status) {
    const result = await pool.query(
      "UPDATE users SET verification_status = $1, updated_at = NOW() WHERE user_id = $2",
      [status, userId]
    );
    return result.rowCount > 0;
  }
}

module.exports = User;
