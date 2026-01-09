const express = require('express');
const { Pool } = require('pg');
const cors = require('cors'); // <--- 1. IMPORT CORS

// --- KONFIGURASI ---
const PORT = process.env.PORT || 3002;
const HOST = '0.0.0.0';

// --- KONEKSI DATABASE ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Fungsi biar service sabar nunggu DB
const waitForDatabase = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1');
      console.log('✅ (Product) Database connection successful.');
      return;
    } catch (err) {
      console.log(`⏳ (Product) DB connection failed. Retrying... (${retries} left)`);
      retries--;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  throw new Error('Database connection failed after multiple attempts.');
};

// Fungsi Inisialisasi Tabel
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    await client.query(`
      CREATE TABLE IF NOT EXISTS raw_materials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        unit VARCHAR(20) NOT NULL,
        quantity_on_hand NUMERIC(10, 2) DEFAULT 0
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        material_id INT REFERENCES raw_materials(id) ON DELETE RESTRICT,
        quantity_needed NUMERIC(10, 2) NOT NULL,
        PRIMARY KEY (product_id, material_id)
      );
    `);

    console.log('✅ All tables are ready.');
  } catch (err) {
    console.error('Error initializing database tables:', err.stack);
  } finally {
    client.release();
  }
};

// --- APLIKASI EXPRESS ---
const app = express();

// --- 2. PASANG MIDDLEWARE CORS DI SINI ---
app.use(cors()); 
app.use(express.json());

// --- ROUTES ---

app.get('/', (req, res) => {
  res.json({ service: 'product-management', status: 'ok' });
});

// GET Semua Produk
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST Produk Baru
app.post('/api/products', async (req, res) => {
  try {
    const { name, price, description } = req.body;
    if (!name || !price) {
      return res.status(400).json({ message: 'Name and price are required' });
    }
    const newProduct = await pool.query(
      'INSERT INTO products (name, price, description) VALUES ($1, $2, $3) RETURNING *',
      [name, price, description]
    );
    res.status(201).json(newProduct.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET Detail Produk + Resep
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const query = `
      SELECT
        p.id, p.name, p.price, p.description,
        r.material_id, rm.name AS material_name, rm.unit AS material_unit, r.quantity_needed
      FROM products p
      LEFT JOIN recipes r ON p.id = r.product_id
      LEFT JOIN raw_materials rm ON r.material_id = rm.id
      WHERE p.id = $1;
    `;
    
    const { rows } = await pool.query(query, [id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: `Product with id ${id} not found` });
    }

    const productData = {
      id: rows[0].id,
      name: rows[0].name,
      price: rows[0].price,
      description: rows[0].description,
      recipes: []
    };

    rows.forEach(row => {
      if (row.material_id) {
        productData.recipes.push({
          material_id: row.material_id,
          name: row.material_name,
          quantity_needed: row.quantity_needed,
          unit: row.material_unit
        });
      }
    });

    res.status(200).json(productData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// POST Resep
app.post('/api/products/:id/recipes', async (req, res) => {
  const { id: product_id } = req.params;
  const { material_id, quantity_needed } = req.body;

  if (!material_id || !quantity_needed) {
    return res.status(400).json({ message: 'material_id and quantity_needed are required' });
  }

  try {
    const query = `
      INSERT INTO recipes (product_id, material_id, quantity_needed)
      VALUES ($1, $2, $3)
      ON CONFLICT (product_id, material_id)
      DO UPDATE SET quantity_needed = $3
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [product_id, material_id, quantity_needed]);
    res.status(201).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).json({ message: 'Error adding recipe.'});
  }
});

// POST Bahan Baku (Temp)
app.post('/api/temp/materials', async (req, res) => {
  try {
    const { name, unit } = req.body;
    const { rows } = await pool.query(
      'INSERT INTO raw_materials (name, unit) VALUES ($1, $2) RETURNING *',
      [name, unit]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// PUT Update Produk
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, description } = req.body;

  try {
    const query = `
      UPDATE products
      SET
        name = COALESCE($1, name),
        price = COALESCE($2, price),
        description = COALESCE($3, description)
      WHERE id = $4
      RETURNING *;
    `;
    const { rows } = await pool.query(query, [name, price, description, id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: `Product not found` });
    }
    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- 3. DELETE ROUTE (YANG SUDAH DIPERBAIKI) ---
// (Route delete yang lama sudah dihapus biar gak bentrok)
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query('DELETE FROM products WHERE id = $1 RETURNING *', [id]);
    
    if (result.rowCount === 0) {
      return res.status(404).json({ error: 'Menu tidak ditemukan' });
    }

    res.json({ message: 'Menu berhasil dihapus', deletedItem: result.rows[0] });
  } catch (err) {
    console.error(err);
    // Error handling khusus kalau menu ini sudah pernah dipesan
    res.status(500).json({ error: 'Gagal menghapus (Mungkin menu ini sudah ada di riwayat pesanan)' });
  }
});

// --- START SERVER ---
app.listen(PORT, HOST, async () => {
  try {
    await waitForDatabase(); 
    await initializeDatabase(); 
    console.log(`🚀 Product Management service running on http://${HOST}:${PORT}`);
  } catch (err) {
    console.error('Failed to start product service:', err.message);
    process.exit(1);
  }
});