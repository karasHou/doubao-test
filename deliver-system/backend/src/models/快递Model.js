const { pool } = require('../config/database');

class 快递Model {
  static async 创建快递(单号, 快递公司) {
    const result = await pool.query(
      'INSERT INTO 快递 (单号, 快递公司) VALUES ($1, $2) RETURNING *',
      [单号, 快递公司]
    );
    return result.rows[0];
  }

  static async 获取所有快递() {
    const result = await pool.query('SELECT * FROM 快递 ORDER BY 更新时间 DESC');
    return result.rows;
  }

  static async 根据单号获取快递(单号) {
    const result = await pool.query('SELECT * FROM 快递 WHERE 单号 = $1', [单号]);
    return result.rows[0];
  }

  static async 更新快递状态(单号, 状态, 物流信息, 异常状态 = false) {
    const result = await pool.query(
      `UPDATE 快递
       SET 当前状态 = $1, 物流信息 = $2, 异常状态 = $3, 更新时间 = CURRENT_TIMESTAMP
       WHERE 单号 = $4
       RETURNING *`,
      [状态, 物流信息, 异常状态, 单号]
    );
    return result.rows[0];
  }

  static async 删除快递(id) {
    await pool.query('DELETE FROM 快递 WHERE id = $1', [id]);
  }
}

module.exports = 快递Model;
