const pool = require("../config/db");

class ScoringRule {
  static async create({ ruleName, weight, criteria }) {
    const { rows } = await pool.query(
      "INSERT INTO scoring_rules (rule_name, weight, criteria) VALUES ($1, $2, $3) RETURNING rule_id",
      [ruleName, weight, criteria]
    );
    return rows[0].rule_id;
  }

  static async findAllActive() {
    const { rows } = await pool.query("SELECT * FROM scoring_rules WHERE is_active = TRUE");
    return rows;
  }

  static async update(ruleId, { ruleName, weight, criteria, isActive }) {
    const result = await pool.query(
      "UPDATE scoring_rules SET rule_name = $1, weight = $2, criteria = $3, is_active = $4, updated_at = NOW() WHERE rule_id = $5",
      [ruleName, weight, criteria, isActive, ruleId]
    );
    return result.rowCount > 0;
  }
}

module.exports = ScoringRule;
