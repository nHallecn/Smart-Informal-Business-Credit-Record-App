const pool = require("../config/db");

class ScoringRule {
  static async create({ ruleName, weight, criteria }) {
    const [result] = await pool.query(
      "INSERT INTO scoring_rules (rule_name, weight, criteria) VALUES (?, ?, ?)",
      [ruleName, weight, JSON.stringify(criteria)]
    );
    return result.insertId;
  }

  static async findAllActive() {
    const [rows] = await pool.query("SELECT * FROM scoring_rules WHERE is_active = TRUE");
    return rows.map(row => ({
      ...row,
      criteria: JSON.parse(row.criteria)
    }));
  }

  static async update(ruleId, { ruleName, weight, criteria, isActive }) {
    const [result] = await pool.query(
      "UPDATE scoring_rules SET rule_name = ?, weight = ?, criteria = ?, is_active = ? WHERE rule_id = ?",
      [ruleName, weight, JSON.stringify(criteria), isActive, ruleId]
    );
    return result.affectedRows > 0;
  }
}

module.exports = ScoringRule;
