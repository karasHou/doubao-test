const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/second_hands_goods'
});

class ItemModel {
  async getAllItems(filters = {}) {
    let query = `SELECT items.*, categories.name as category_name
                 FROM items
                 LEFT JOIN categories ON items.category_id = categories.id
                 WHERE 1=1`;
    let params = [];
    let paramIndex = 1;

    if (filters.category_id) {
      query += ` AND category_id = $${paramIndex}`;
      params.push(filters.category_id);
      paramIndex++;
    }

    if (filters.status) {
      query += ` AND status = $${paramIndex}`;
      params.push(filters.status);
      paramIndex++;
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    console.log('Query result rows count:', result.rows.length);
    console.log('Query result rows:', result.rows.map(r => ({id: r.id, name: r.name})));
    return result.rows;
  }

  async getItemById(id) {
    const result = await pool.query(
      `SELECT items.*, categories.name as category_name
       FROM items
       LEFT JOIN categories ON items.category_id = categories.id
       WHERE items.id = $1`,
      [id]
    );
    return result.rows[0];
  }

  async createItem(itemData) {
    const result = await pool.query(
      `INSERT INTO items (name, description, category_id, brand, model, original_price, estimated_price, condition, purchase_date)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        itemData.name,
        itemData.description,
        itemData.category_id,
        itemData.brand,
        itemData.model,
        itemData.original_price,
        itemData.estimated_price,
        itemData.condition,
        itemData.purchase_date
      ]
    );

    await this.savePriceHistory(result.rows[0].id, result.rows[0].estimated_price);
    return result.rows[0];
  }

  async updateItem(id, itemData) {
    const result = await pool.query(
      `UPDATE items
       SET name = $1, description = $2, category_id = $3, brand = $4, model = $5,
           original_price = $6, estimated_price = $7, condition = $8, purchase_date = $9,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $10
       RETURNING *`,
      [
        itemData.name,
        itemData.description,
        itemData.category_id,
        itemData.brand,
        itemData.model,
        itemData.original_price,
        itemData.estimated_price,
        itemData.condition,
        itemData.purchase_date,
        id
      ]
    );

    if (result.rows.length > 0) {
      await this.savePriceHistory(id, result.rows[0].estimated_price);
    }
    return result.rows[0];
  }

  async deleteItem(id) {
    const result = await pool.query('DELETE FROM items WHERE id = $1 RETURNING *', [id]);
    return result.rows[0];
  }

  async savePriceHistory(itemId, price) {
    await pool.query(
      'INSERT INTO price_history (item_id, price) VALUES ($1, $2)',
      [itemId, price]
    );
  }

  async getPriceHistory(itemId) {
    const result = await pool.query(
      'SELECT * FROM price_history WHERE item_id = $1 ORDER BY estimated_at',
      [itemId]
    );
    return result.rows;
  }

  async getCategories() {
    const result = await pool.query('SELECT * FROM categories');
    return result.rows;
  }
}

module.exports = new ItemModel();