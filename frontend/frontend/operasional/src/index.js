const express = require('express');
const { Pool } = require('pg');
const axios = require('axios');
const cors = require('cors');
const app = express();
const port = 3003;

app.use(cors());
app.use(express.json());

const connectionString = process.env.DATABASE_URL || 'postgresql://minirestoo_user:secretpassword@db:5432/minirestoo_db';
const pool = new Pool({ connectionString });

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://product-management:3002';
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL || 'http://inventory-management:3001';

const connectDB = async (retries = 5) => {
  while (retries) {
    try {
      await pool.query('SELECT NOW()');
      console.log("✅ (Operasional) Terhubung ke Database!");
      await initDB();
      break;
    } catch (err) {
      console.log(`⏳ (Operasional) DB belum siap. Mencoba lagi dalam 5 detik... (${retries} sisa percobaan)`);
      retries -= 1;
      await new Promise(res => setTimeout(res, 5000));
    }
  }
};

const initDB = async () => {
  try {
    await pool.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        total_price DECIMAL(10,2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INTEGER REFERENCES orders(id),
        product_id INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price DECIMAL(10,2) NOT NULL
      );
    `);
    console.log("✅ (Operasional) Tabel siap digunakan!");
  } catch (err) {
    console.error("❌ (Operasional) Gagal bikin tabel:", err.message);
  }
};

connectDB();

app.get('/api/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: 'Internal Server Error' });
  }
});

app.post('/api/orders', async (req, res) => {
  const { items } = req.body; 
  if (!items || items.length === 0) return res.status(400).json({ message: 'Keranjang kosong' });

  const client = await pool.connect();
  try {
    let totalPrice = 0;
    const validatedItems = [];

    for (const item of items) {
        const productRes = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${item.product_id}`);
        totalPrice += productRes.data.price * item.quantity;
        validatedItems.push({ ...item, price_at_purchase: productRes.data.price });
    }

    await client.query('BEGIN');
    const orderRes = await client.query('INSERT INTO orders (total_price, status) VALUES ($1, $2) RETURNING id', [totalPrice, 'pending']);
    const orderId = orderRes.rows[0].id;

    for (const item of validatedItems) {
      await client.query('INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)', [orderId, item.product_id, item.quantity, item.price_at_purchase]);
    }

    try {
        await axios.post(`${INVENTORY_SERVICE_URL}/api/inventory/stock-out`, { order_id: orderId, items: items });
    } catch (e) { console.log("Info: Stok aman (atau resep belum ada)"); }

    await client.query('COMMIT');
    res.status(201).json({ message: 'Order berhasil', order_id: orderId });
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ message: err.message });
  } finally {
    client.release();
  }
});

app.listen(port, () => console.log(`⚙️ Operasional running on port ${port}`));