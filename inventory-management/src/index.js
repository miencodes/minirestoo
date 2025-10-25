const express = require('express');
const { Pool } = require('pg'); // ges, kita butuh 'pg' di sini juga

// --- KONFIGURASI ---
const PORT = process.env.PORT || 3001; 
const HOST = '0.0.0.0';

// --- KONEKSI DATABASE ---
// Ini sama persis, kita pake DATABASE_URL dari docker-compose.yml
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
// ges, ini tugasnya Developer B sesuai ERD
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    // 1. Tabel raw_materials
    // Ini udah kita buat di service product, TAPI kita pastiin lagi di sini.
    // Gak masalah dijalanin 2x, "CREATE TABLE IF NOT EXISTS" itu aman.
    await client.query(`
      CREATE TABLE IF NOT EXISTS raw_materials (
        id SERIAL PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        unit VARCHAR(20) NOT NULL, -- e.g., 'gram', 'ml', 'pcs'
        quantity_on_hand NUMERIC(10, 2) DEFAULT 0
      );
    `);
    
    // 2. Tabel stock_transactions
    // Ini tabel baru buat nyatet semua sejarah keluar masuk stok
    await client.query(`
      CREATE TABLE IF NOT EXISTS stock_transactions (
        id SERIAL PRIMARY KEY,
        material_id INT REFERENCES raw_materials(id) ON DELETE RESTRICT,
        order_id INT, -- Ini opsional, bisa NULL kalo stok masuk / adjustment
        type VARCHAR(20) NOT NULL, -- 'in', 'out', 'adjustment'
        quantity NUMERIC(10, 2) NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Inventory tables (raw_materials, stock_transactions) are ready.');
  } catch (err) {
    console.error('Error initializing inventory tables:', err.stack);
  } finally {
    client.release();
  }
};

// --- APLIKASI EXPRESS ---
const app = express();
app.use(express.json());

// --- ROUTES ---

// Endpoint dasar
app.get('/', (req, res) => {
  res.json({
    service: 'inventory-management',
    status: 'ok',
    message: 'Hello from Inventory Service!'
  });
});

// Endpoint baru buat ngetes koneksi DB
app.get('/api/db-test', async (req, res) => {
  try {
    const client = await pool.connect();
    // Query sederhana, ambil waktu dari server database
    const result = await client.query('SELECT NOW()');
    res.json({
      status: 'success',
      service: 'inventory-management',
      db_time: result.rows[0].now
    });
    client.release();
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Failed to query database.' });
  }
});

// 1. POST (BARU): Menambah bahan baku baru
// ges, ini endpoint buat nambahin master data bahan baku
app.post('/api/inventory/materials', async (req, res) => {
  try {
    const { name, unit, quantity_on_hand } = req.body;

    // Validasi sederhana
    if (!name || !unit) {
      return res.status(400).json({ message: 'Name and unit are required' });
    }
    
    // Kalo quantity_on_hand ga dikasih, default-nya 0
    const initialQuantity = quantity_on_hand || 0;

    const newMaterial = await pool.query(
      'INSERT INTO raw_materials (name, unit, quantity_on_hand) VALUES ($1, $2, $3) RETURNING *',
      [name, unit, initialQuantity]
    );

    res.status(201).json(newMaterial.rows[0]);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 2. GET (BARU): Melihat semua bahan baku
// Ini buat nampilin semua stok bahan baku kita
app.get('/api/inventory/materials', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM raw_materials ORDER BY id ASC');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// ges, ini endpoint penting. kita pake transaksi database di sini.
app.post('/api/inventory/stock-in', async (req, res) => {
  const { material_id, quantity } = req.body;

  if (!material_id || !quantity || quantity <= 0) {
    return res.status(400).json({ message: 'material_id and a positive quantity are required' });
  }

  // Kita 'pinjem' koneksi dari pool buat transaksi
  const client = await pool.connect();

  try {
    // Mulai transaksi
    await client.query('BEGIN');

    // 1. Update jumlah stok di tabel raw_materials
    const updateStockQuery = `
      UPDATE raw_materials
      SET quantity_on_hand = quantity_on_hand + $1
      WHERE id = $2
      RETURNING *;
    `;
    const updatedMaterial = await client.query(updateStockQuery, [quantity, material_id]);

    // Kalo material_id-nya ga ada, 'rows' bakal kosong
    if (updatedMaterial.rows.length === 0) {
      throw new Error(`Material with id ${material_id} not found`);
    }

    // 2. Catat riwayatnya di tabel stock_transactions
    const logTransactionQuery = `
      INSERT INTO stock_transactions (material_id, type, quantity)
      VALUES ($1, 'in', $2)
      RETURNING *;
    `;
    // Kita pake null buat order_id, karena ini stok masuk (bukan dari pesanan)
    await client.query(logTransactionQuery, [material_id, quantity]);

    // Kalo semua sukses, 'commit' transaksinya
    await client.query('COMMIT');

    // Kirim balasan data stok yang udah ke-update
    res.status(200).json(updatedMaterial.rows[0]);

  } catch (err) {
    // Kalo ada satu aja error di dalem 'try', batalin semua
    await client.query('ROLLBACK');
    console.error(err.message);
    res.status(500).json({ status: 'error', message: 'Transaction failed', error: err.message });
  } finally {
    // Balikin 'client' ke 'pool'
    client.release();
  }
});

// 4. GET (BARU): Melihat semua riwayat transaksi stok
// Ini buat nge-debug, biar kita bisa liat buku catatannya
app.get('/api/inventory/transactions', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM stock_transactions ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// 5. POST (BARU): Mengurangi stok (SESUAI API CONTRACT)
// ges, ini endpoint yang bakal "ditembak" sama service operasional
// Logikanya paling kompleks, harus atomik!
app.post('/api/inventory/stock-out', async (req, res) => {
  const { order_id, items } = req.body;

  // Validasi input
  if (typeof order_id !== 'number' || !items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ 
      status: 'error', 
      message: 'order_id and a non-empty items array are required' 
    });
  }

  const client = await pool.connect();

  try {
    // Mulai transaksi
    await client.query('BEGIN');

    // --- TAHAP 1: Pengecekan Stok (PENTING!) ---
    // Kita cek dulu semua item SEBELUM ngurangin satupun
    for (const item of items) {
      if (!item.material_id || !item.quantity || item.quantity <= 0) {
        throw new Error('Invalid item data. material_id and positive quantity are required.');
      }
      
      const stockCheckQuery = 'SELECT name, quantity_on_hand FROM raw_materials WHERE id = $1';
      const stockResult = await client.query(stockCheckQuery, [item.material_id]);

      if (stockResult.rows.length === 0) {
        throw new Error(`Material with id ${item.material_id} not found.`);
      }

      const currentStock = parseFloat(stockResult.rows[0].quantity_on_hand);
      if (currentStock < item.quantity) {
        // Kalo stok kurang, langsung lempar error & batalin semua
        throw new Error(`Insufficient stock for material_id: ${item.material_id} (${stockResult.rows[0].name})`);
      }
    }

    // --- TAHAP 2: Pengurangan Stok ---
    // Kalo lolos tahap 1, berarti semua stok aman. Baru kita eksekusi.
    for (const item of items) {
      // 1. Kurangi stok di raw_materials
      const updateStockQuery = `
        UPDATE raw_materials
        SET quantity_on_hand = quantity_on_hand - $1
        WHERE id = $2;
      `;
      await client.query(updateStockQuery, [item.quantity, item.material_id]);

      // 2. Catat di stock_transactions
      const logTransactionQuery = `
        INSERT INTO stock_transactions (material_id, order_id, type, quantity)
        VALUES ($1, $2, 'out', $3);
      `;
      await client.query(logTransactionQuery, [item.material_id, order_id, item.quantity]);
    }

    // Kalo semua sukses, commit transaksinya
    await client.query('COMMIT');

    // Kirim balasan sukses sesuai kontrak
    res.status(200).json({
      status: 'success',
      message: `Stock for order ${order_id} has been successfully updated.`
    });

  } catch (err) {
    // Kalo ada satu aja error, batalin semua
    await client.query('ROLLBACK');
    console.error(err.message);
    
    // Kirim balasan error sesuai kontrak
    if (err.message.startsWith('Insufficient stock') || err.message.startsWith('Material with id')) {
      res.status(400).json({ status: 'error', message: err.message });
    } else {
      res.status(500).json({ status: 'error', message: 'Transaction failed', error: err.message });
    }
  } finally {
    client.release();
  }
});

// --- START SERVER ---
// Kita ubah ini biar manggil waitForDatabase dulu
app.listen(PORT, HOST, async () => {
  try {
    // 1. Tunggu DB-nya beneran siap
    await waitForDatabase(); 
    
    // 2. Kalo udah siap, baru kita bikin tabel
    await initializeDatabase(); 

    // 3. Baru kita bilang servernya jalan
    console.log(`🚀 Product Management service running on http://${HOST}:${PORT}`);
  
  } catch (err) {
    console.error('Failed to start product service:', err.message);
    process.exit(1); // Kalo gabisa nyambung DB, matiin aja servicenya
  }
});