const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const app = express();
const port = 3001;

app.use(cors());
app.use(express.json());

const connectionString = process.env.DATABASE_URL || 'postgresql://minirestoo_user:secretpassword@db:5432/minirestoo_db';

const pool = new Pool({
  connectionString: connectionString,
});

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS raw_materials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        quantity_on_hand DECIMAL(10, 2) DEFAULT 0
      );
    `);

    await pool.query(`
      CREATE TABLE IF NOT EXISTS stock_transactions (
        id SERIAL PRIMARY KEY,
        material_id INTEGER REFERENCES raw_materials(id),
        transaction_type VARCHAR(10) NOT NULL,
        quantity DECIMAL(10, 2) NOT NULL,
        related_order_id INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log("✅ (Inventory) Semua tabel database siap!");
  } catch (err) {
    console.error("❌ (Inventory) Gagal inisialisasi tabel:", err.message);
  }
};

initDB();

app.get('/api/inventory/materials', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM raw_materials ORDER BY id ASC');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/inventory/materials', async (req, res) => {
  const { name, unit, quantity_on_hand } = req.body;

  if (!name || !quantity_on_hand) {
    return res.status(400).json({ error: 'Nama bahan dan jumlah wajib diisi' });
  }

  try {
    const checkQuery = 'SELECT * FROM raw_materials WHERE LOWER(name) = LOWER($1)';
    const existingItem = await pool.query(checkQuery, [name]);

    if (existingItem.rows.length > 0) {
      const item = existingItem.rows[0];
      const newQuantity = parseFloat(item.quantity_on_hand) + parseFloat(quantity_on_hand);
      
      const updateQuery = 'UPDATE raw_materials SET quantity_on_hand = $1 WHERE id = $2 RETURNING *';
      const updatedItem = await pool.query(updateQuery, [newQuantity, item.id]);

      await pool.query(
        "INSERT INTO stock_transactions (material_id, transaction_type, quantity) VALUES ($1, 'IN', $2)",
        [item.id, quantity_on_hand]
      );

      console.log(`📦 Stok '${name}' bertambah: ${item.quantity_on_hand} -> ${newQuantity}`);
      res.status(200).json(updatedItem.rows[0]);

    } else {
      const insertQuery = 'INSERT INTO raw_materials (name, unit, quantity_on_hand) VALUES ($1, $2, $3) RETURNING *';
      const newItem = await pool.query(insertQuery, [name, unit, quantity_on_hand]);

      await pool.query(
        "INSERT INTO stock_transactions (material_id, transaction_type, quantity) VALUES ($1, 'IN', $2)",
        [newItem.rows[0].id, quantity_on_hand]
      );

      console.log(`✨ Barang baru: ${name}`);
      res.status(201).json(newItem.rows[0]);
    }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Gagal update stok inventory' });
  }
});

app.post('/api/inventory/stock-out', async (req, res) => {
  const { order_id, items } = req.body; 
  
  if (!items || !Array.isArray(items) || items.length === 0) {
     return res.status(400).json({ error: 'Items array is required' });
  }

  const client = await pool.connect();

  try {
    await client.query('BEGIN');

    for (const item of items) {
      const recipeRes = await client.query(
        'SELECT material_id, quantity_needed FROM recipes WHERE product_id = $1',
        [item.product_id]
      );

      for (const recipe of recipeRes.rows) {
        const totalNeeded = recipe.quantity_needed * item.quantity;

        await client.query(
          'UPDATE raw_materials SET quantity_on_hand = quantity_on_hand - $1 WHERE id = $2',
          [totalNeeded, recipe.material_id]
        );

        await client.query(
          `INSERT INTO stock_transactions (material_id, transaction_type, quantity, related_order_id)
           VALUES ($1, 'OUT', $2, $3)`,
          [recipe.material_id, totalNeeded, order_id]
        );
      }
    }

    await client.query('COMMIT');
    res.json({ message: 'Stock deducted successfully' });

  } catch (err) {
    await client.query('ROLLBACK');
    console.error("❌ Stock Out Error:", err.message);
    res.status(500).json({ error: 'Transaction failed' });
  } finally {
    client.release();
  }
});

app.listen(port, () => {
  console.log(`📦 Inventory Management service running on port ${port}`);
});