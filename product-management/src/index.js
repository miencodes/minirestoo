const express = require('express');
const { Pool } = require('pg');

// --- KONFIGURASI ---
const PORT = process.env.PORT || 3002;
const HOST = '0.0.0.0';

// --- KONEKSI DATABASE ---
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// ges, ini fungsi biar service-nya sabar nungguin DB-nya panas
const waitForDatabase = async () => {
  let retries = 5;
  while (retries > 0) {
    try {
      await pool.query('SELECT 1'); // Query simpel buat ngetes koneksi
      console.log('✅ (Product) Database connection successful.');
      return; // Kalo sukses, keluar dari loop
    } catch (err) {
      console.log(`⏳ (Product) DB connection failed (Code: ${err.code}). Retrying in 5 seconds... (${retries} attempts left)`);
      retries--;
      await new Promise(resolve => setTimeout(resolve, 5000)); // Nunggu 5 detik
    }
  }
  // Kalo 5x masih gagal, kita nyerah
  throw new Error('Database connection failed after multiple attempts.');
};

// --- FUNGSI INISIALISASI DATABASE ---
// ges, ini kita update buat nambahin tabel raw_materials dan recipes
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    // 1. Tabel products (Udah ada sih, tapi kita pastikan lagi)
    await client.query(`
      CREATE TABLE IF NOT EXISTS products (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        price NUMERIC(10, 2) NOT NULL,
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 2. Tabel raw_materials
    // Ini buat nyimpen data bahan baku kita, misal Beras, Telur, dll.
    await client.query(`
      CREATE TABLE IF NOT EXISTS raw_materials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        unit VARCHAR(20) NOT NULL, -- e.g., 'gram', 'ml', 'pcs'
        quantity_on_hand NUMERIC(10, 2) DEFAULT 0
      );
    `);

    // 3. Tabel recipes
    // Ini 'jembatan' antara products dan raw_materials.
    // PK-nya gabungan (product_id, material_id) biar 1 produk gabisa punya 2 bahan yg sama
    await client.query(`
      CREATE TABLE IF NOT EXISTS recipes (
        product_id INT REFERENCES products(id) ON DELETE CASCADE,
        material_id INT REFERENCES raw_materials(id) ON DELETE RESTRICT,
        quantity_needed NUMERIC(10, 2) NOT NULL,
        PRIMARY KEY (product_id, material_id)
      );
    `);

    console.log('✅ All tables (products, raw_materials, recipes) are ready.');
  } catch (err) {
    console.error('Error initializing database tables:', err.stack);
  } finally {
    client.release();
  }
};

// --- APLIKASI EXPRESS ---
const app = express();
app.use(express.json()); // Middlewarenya wajib buat baca body JSON

// --- ROUTES ---

// Endpoint dasar
app.get('/', (req, res) => {
  res.json({
    service: 'product-management',
    status: 'ok',
  });
});

// 1. GET: Mendapatkan semua produk
app.get('/api/products', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM products ORDER BY id ASC');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. POST: Membuat produk baru
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

// 3. GET: Mendapatkan detail produk + resepnya (SESUAI KONTRAK API KITA)
// Ini yang bakal dipake sama Developer Operasional tar
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Ini query buat kita JOIN 3 tabel sekaligus
    // buat ngambil data produk, resepnya, dan nama bahan bakunya
    const query = `
      SELECT
        p.id, p.name, p.price, p.description,
        r.material_id,
        rm.name AS material_name,
        rm.unit AS material_unit,
        r.quantity_needed
      FROM products p
      LEFT JOIN recipes r ON p.id = r.product_id
      LEFT JOIN raw_materials rm ON r.material_id = rm.id
      WHERE p.id = $1;
    `;
    
    const { rows } = await pool.query(query, [id]);

    // Kalo produknya ga ada, kirim 404
    if (rows.length === 0) {
      return res.status(404).json({ message: `Product with id ${id} not found` });
    }

    // Oke, ges. Di sini kita perlu "ngubah" data dari database
    // SQL ngasih kita data "flat", misal 2 baris kalo resepnya ada 2
    // Kita mau ubah jadi 1 objek JSON yg punya array 'recipes' di dalemnya
    
    // Ambil info produk dari baris pertama
    const productData = {
      id: rows[0].id,
      name: rows[0].name,
      price: rows[0].price,
      description: rows[0].description,
      recipes: [] // ini array sengaja dibuat kosong buat resep tar
    };

    // Loop semua baris hasil query buat ngisi array resep
    rows.forEach(row => {
      // Cek kalo emg ada resepnya (kalo ga ada, material_id nya bakal null)
      if (row.material_id) {
        productData.recipes.push({
          material_id: row.material_id,
          name: row.material_name,
          quantity_needed: row.quantity_needed,
          unit: row.material_unit
        });
      }
    });

    // Kirim data sesuai format di API Kontrak kita
    res.status(200).json(productData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 4. POST: Menambahkan resep ke produk
// Ini kita butuhin buat ngetes endpoint GET di atas
app.post('/api/products/:id/recipes', async (req, res) => {
  const { id: product_id } = req.params;
  const { material_id, quantity_needed } = req.body;

  if (!material_id || !quantity_needed) {
    return res.status(400).json({ message: 'material_id and quantity_needed are required' });
  }

  try {
    // Kita pake "ON CONFLICT" buat UPDATE kalo resepnya udah ada (UPSERT)
    // Jadi kalo mau ganti takaran resep, pake endpoint ini lagi aja
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
    // Kalo error, ada kemungkinan material_id atau product_id nya ga ada (foreign key violation)
    res.status(500).json({ message: 'Error adding recipe. Check if product and material exist.'});
  }
});

app.post('/api/temp/materials', async (req, res) => {
  try {
    const { name, unit } = req.body;
    if (!name || !unit) {
      return res.status(400).json({ message: 'Name and unit are required' });
    }
    const { rows } = await pool.query(
      'INSERT INTO raw_materials (name, unit) VALUES ($1, $2) RETURNING *',
      [name, unit]
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ges, ini buat kalo mau ganti nama, harga, atau deskripsi produk
app.put('/api/products/:id', async (req, res) => {
  const { id } = req.params;
  const { name, price, description } = req.body;

  // Validasi minimal, harus ada salah satu yg di-supply
  if (!name && !price && !description) {
    return res.status(400).json({ message: 'At least one field (name, price, description) is required to update' });
  }

  try {
    // Kita akan update field-field yang dikasih aja
    // COALESCE(NULL, p.name) -> kalo NULL, pake nilai p.name (nilai lama)
    // COALESCE('Nasi Goreng Baru', p.name) -> kalo 'Nasi Goreng Baru', ya pake itu
    const query = `
      UPDATE products
      SET
        name = COALESCE($1, name),
        price = COALESCE($2, price),
        description = COALESCE($3, description)
      WHERE id = $4
      RETURNING *;
    `;
    
    // Kirim [name, price, description, id]
    // Kalo salah satu (misal: name) ga disupply sama user, nilainya bakal 'undefined'
    // Postgres bakal ngubah 'undefined' jadi NULL, makanya COALESCE-nya jalan
    const { rows } = await pool.query(query, [name, price, description, id]);

    if (rows.length === 0) {
      return res.status(404).json({ message: `Product with id ${id} not found` });
    }

    res.status(200).json(rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ges, ini buat ngehapus produk. Hati-hati ya, ini beneran kehapus :v
app.delete('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const query = 'DELETE FROM products WHERE id = $1 RETURNING *';
    
    // Kirim [id]
    const { rows } = await pool.query(query, [id]);

    // Kalo rows.length === 0, berarti datanya emg ga ada
    if (rows.length === 0) {
      return res.status(404).json({ message: `Product with id ${id} not found` });
    }

    // Kalo berhasil, kita kirim status 204 (No Content)
    // Ini standar REST API buat delete, artinya "sukses, tapi ga ada body balasan"
    // Tapi kalo mau, kirim 200 (OK) plus data yg kehapus jg gpp, kyk gini:
    res.status(200).json({ 
      message: `Product '${rows[0].name}' successfully deleted`,
      deleted_product: rows[0] 
    });
    
    // Atau kalo mau pake 204:
    // res.status(204).send();

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// --- START SERVER ---
// tabrakan, jdi buat "waitForDatabase" dulu
app.listen(PORT, HOST, async () => {
  try {
    await waitForDatabase(); 
    await initializeDatabase(); 
    console.log(`🚀 Product Management service running on http://${HOST}:${PORT}`);
  
  } catch (err) {
    console.error('Failed to start product service:', err.message);
    process.exit(1); // klo gabisa nyambung DB, matiin aja servicenya
  }
});