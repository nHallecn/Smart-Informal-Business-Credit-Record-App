const pool = require("../config/db");
const bcrypt = require("bcryptjs");
const { v4: uuidv4 } = require("uuid");

class User {
  static async create({ username, phoneNumber, password, role = "business_owner" }) {
    const userId = uuidv4();
    const hashedPassword = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      "INSERT INTO users (user_id, username, phone_number, password_hash, role) VALUES (?, ?, ?, ?, ?)",
      [userId, username, phoneNumber, hashedPassword, role]
    );
    return { userId, username, phoneNumber, role };
  }

  static async findByPhoneNumber(phoneNumber) {
    const [rows] = await pool.query("SELECT * FROM users WHERE phone_number = ?", [phoneNumber]);
    return rows[0];
  }

  static async findById(userId) {
    const [rows] = await pool.query("SELECT * FROM users WHERE user_id = ?", [userId]);
    return rows[0];
  }

  static async updateVerificationStatus(userId, status) {
    const [result] = await pool.query(
      "UPDATE users SET verification_status = ? WHERE user_id = ?",
      [status, userId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = User;