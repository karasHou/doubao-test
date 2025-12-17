import { query } from '../utils/database.js';

class Asset {
  // 获取资产列表
  static async getAll(params = {}) {
    const { page = 1, pageSize = 10, search = '', status = '' } = params;
    const offset = (page - 1) * pageSize;

    let sql = `
      SELECT * FROM assets
      WHERE 1=1
    `;
    const values = [];

    if (search) {
      sql += ` AND (name ILIKE $${values.length + 1} OR asset_number ILIKE $${values.length + 1} OR "user" ILIKE $${values.length + 1})`;
      values.push(`%${search}%`);
    }

    if (status) {
      sql += ` AND status = $${values.length + 1}`;
      values.push(status);
    }

    sql += ` ORDER BY created_at DESC`;

    // 添加分页
    if (pageSize > 0) {
      sql += ` LIMIT $${values.length + 1} OFFSET $${values.length + 2}`;
      values.push(pageSize);
      values.push(offset);
    }

    const result = await query(sql, values);

    // 获取总数
    let countSql = `SELECT COUNT(*) FROM assets WHERE 1=1`;
    const countValues = [];

    if (search) {
      countSql += ` AND (name ILIKE $${countValues.length + 1} OR asset_number ILIKE $${countValues.length + 1} OR "user" ILIKE $${countValues.length + 1})`;
      countValues.push(`%${search}%`);
    }

    if (status) {
      countSql += ` AND status = $${countValues.length + 1}`;
      countValues.push(status);
    }

    const countResult = await query(countSql, countValues);

    return {
      data: result.rows,
      total: parseInt(countResult.rows[0].count)
    };
  }

  // 获取单个资产
  static async getById(id) {
    const result = await query(`
      SELECT * FROM assets WHERE id = $1
    `, [id]);

    return result.rows[0];
  }

  // 创建资产
  static async create(assetData) {
    const {
      asset_number,
      name,
      category,
      purchase_date,
      price,
      supplier,
      description
    } = assetData;

    const result = await query(`
      INSERT INTO assets (
        asset_number,
        name,
        category,
        purchase_date,
        price,
        supplier,
        description
      ) VALUES (
        $1, $2, $3, $4, $5, $6, $7
      ) RETURNING *
    `, [asset_number, name, category, purchase_date, price, supplier, description]);

    return result.rows[0];
  }

  // 更新资产
  static async update(id, assetData) {
    const {
      asset_number,
      name,
      category,
      status,
      user,
      department,
      purchase_date,
      price,
      supplier,
      description
    } = assetData;

    const result = await query(`
      UPDATE assets SET
        asset_number = COALESCE($1, asset_number),
        name = COALESCE($2, name),
        category = COALESCE($3, category),
        status = COALESCE($4, status),
        "user" = COALESCE($5, "user"),
        department = COALESCE($6, department),
        purchase_date = COALESCE($7, purchase_date),
        price = COALESCE($8, price),
        supplier = COALESCE($9, supplier),
        description = COALESCE($10, description),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $11
      RETURNING *
    `, [asset_number, name, category, status, user, department, purchase_date, price, supplier, description, id]);

    return result.rows[0];
  }

  // 删除资产
  static async delete(id) {
    const result = await query(`
      DELETE FROM assets WHERE id = $1 RETURNING *
    `, [id]);

    return result.rows[0];
  }

  // 领用资产
  static async transfer(id, transferData) {
    const { user, department, transfer_date, reason } = transferData;

    // 开始事务
    await query('BEGIN');

    try {
      // 更新资产状态为使用中
      const assetResult = await query(`
        UPDATE assets SET
          status = 'in_use',
          "user" = $1,
          department = $2,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $3 RETURNING *
      `, [user, department, id]);

      // 记录领用历史
      await query(`
        INSERT INTO asset_transfers (
          asset_id,
          "user",
          department,
          transfer_date,
          reason
        ) VALUES (
          $1, $2, $3, $4, $5
        )
      `, [id, user, department, transfer_date, reason]);

      await query('COMMIT');

      return assetResult.rows[0];
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  // 归还资产
  static async returnAsset(id, returnData) {
    const { return_date, condition, notes } = returnData;

    // 获取当前使用人信息
    const asset = await this.getById(id);

    // 开始事务
    await query('BEGIN');

    try {
      // 更新资产状态为库存中
      const assetResult = await query(`
        UPDATE assets SET
          status = 'in_stock',
          "user" = NULL,
          department = NULL,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $1 RETURNING *
      `, [id]);

      // 记录归还历史
      await query(`
        INSERT INTO asset_returns (
          asset_id,
          "user",
          return_date,
          "condition",
          notes
        ) VALUES (
          $1, $2, $3, $4, $5
        )
      `, [id, asset.user, return_date, condition, notes]);

      await query('COMMIT');

      return assetResult.rows[0];
    } catch (error) {
      await query('ROLLBACK');
      throw error;
    }
  }

  // 获取资产统计信息
  static async getStats() {
    const result = await query(`
      SELECT
        COUNT(*) as total_assets,
        COUNT(*) FILTER (WHERE status = 'in_use') as in_use_assets,
        COUNT(*) FILTER (WHERE status = 'in_stock') as in_stock_assets,
        SUM(price) as total_value
      FROM assets
    `);

    return result.rows[0];
  }

  // 获取资产报表数据
  static async getReportData(params = {}) {
    const { type = 'asset_overview', start_date = null, end_date = null } = params;

    switch (type) {
      case 'asset_overview':
        return this.getAll({ pageSize: -1 }).then(result => result.data);

      case 'in_use_assets':
        return this.getAll({ status: 'in_use', pageSize: -1 }).then(result => result.data);

      case 'in_stock_assets':
        return this.getAll({ status: 'in_stock', pageSize: -1 }).then(result => result.data);

      case 'transfer_records':
        let transferSql = `
          SELECT t.*, a.name as asset_name, a.asset_number
          FROM asset_transfers t
          JOIN assets a ON t.asset_id = a.id
        `;
        const transferValues = [];

        if (start_date && end_date) {
          transferSql += ` WHERE t.transfer_date BETWEEN $${transferValues.length + 1} AND $${transferValues.length + 2}`;
          transferValues.push(start_date, end_date);
        }

        transferSql += ` ORDER BY t.transfer_date DESC`;

        const transferResult = await query(transferSql, transferValues);
        return transferResult.rows;

      case 'return_records':
        let returnSql = `
          SELECT r.*, a.name as asset_name, a.asset_number
          FROM asset_returns r
          JOIN assets a ON r.asset_id = a.id
        `;
        const returnValues = [];

        if (start_date && end_date) {
          returnSql += ` WHERE r.return_date BETWEEN $${returnValues.length + 1} AND $${returnValues.length + 2}`;
          returnValues.push(start_date, end_date);
        }

        returnSql += ` ORDER BY r.return_date DESC`;

        const returnResult = await query(returnSql, returnValues);
        return returnResult.rows;

      default:
        return [];
    }
  }
}

export default Asset;