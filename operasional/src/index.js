const express = require('express');
const { Pool } = require('pg'); // Kita butuh 'pg' buat ke database
const axios = require('axios'); // Kita butuh 'axios' buat nembak service lain

// --- KONFIGURASI ---
const PORT = process.env.PORT || 3003;
const HOST = '0.0.0.0';

// Ambil URL service lain dari environment variables
const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL;
const INVENTORY_SERVICE_URL = process.env.INVENTORY_SERVICE_URL;

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
// ges, ini tugasnya Developer C sesuai ERD
const initializeDatabase = async () => {
  const client = await pool.connect();
  try {
    // 1. Tabel orders
    // Ini buat nyimpen data header pesanan
    await client.query(`
      CREATE TABLE IF NOT EXISTS orders (
        id SERIAL PRIMARY KEY,
        total_price NUMERIC(10, 2) NOT NULL,
        status VARCHAR(50) DEFAULT 'pending', -- e.g., pending, completed, cancelled
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    // 2. Tabel order_items
    // Ini buat nyimpen detail item apa aja yg dipesen
    await client.query(`
      CREATE TABLE IF NOT EXISTS order_items (
        id SERIAL PRIMARY KEY,
        order_id INT REFERENCES orders(id) ON DELETE CASCADE,
        product_id INT NOT NULL, -- Kita ga pake FK di sini biar ga ribet kalo produk dihapus
        quantity INT NOT NULL,
        price_per_item NUMERIC(10, 2) NOT NULL
      );
    `);

    console.log('✅ Operasional tables (orders, order_items) are ready.');
  } catch (err) {
    console.error('Error initializing operasional tables:', err.stack);
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
    service: 'operasional',
    status: 'ok',
    message: 'Hello from Operasional Service!'
  });
});

// Endpoint tes database (opsional)
app.get('/api/db-test', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT NOW()');
    res.json({
      status: 'success',
      service: 'operasional',
      db_time: rows[0].now
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
});

// ... (tepat di atas '// --- START SERVER ---')

// --- API LOGIKA BISNIS UTAMA ---

// POST (BARU): Membuat Pesanan Baru (SESUAI API CONTRACT)
// ges, ini alur kerja utama kita. dia bakal ngobrol sama 2 service lain.
app.post('/api/orders', async (req, res) => {
  const { items } = req.body; // e.g., [{ "product_id": 1, "quantity": 2 }]

  // Validasi input
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: 'A non-empty "items" array is required' });
  }

  // Kita pake transaksi database di service ini juga
  const client = await pool.connect();
  let finalTotalPrice = 0;
  const stockOutItems = []; // Ini buat nampung data yg mau dikirim ke service inventory
  const orderItemsData = []; // Ini buat nampung data yg mau disimpen ke DB kita

  try {
    // Mulai transaksi lokal
    await client.query('BEGIN');

    // --- TAHAP 1: Ambil data produk & resep dari Service Product ---
    for (const item of items) {
      const productId = item.product_id;
      const quantity = item.quantity;
      
      console.log(`(Operasional) Fetching product data for id: ${productId}...`);
      
      // Nembak ke service product pake axios (sesuai kontrak)
      const productResponse = await axios.get(`${PRODUCT_SERVICE_URL}/api/products/${productId}`);
      const product = productResponse.data;

      // Kalo produknya ada, kita proses
      const itemPrice = parseFloat(product.price);
      finalTotalPrice += itemPrice * quantity;

      // Simpen data ini buat disimpen ke tabel 'order_items' nanti
      orderItemsData.push({
        product_id: productId,
        quantity: quantity,
        price_per_item: itemPrice
      });

      // Siapin data buat dikirim ke service inventory
      for (const recipeItem of product.recipes) {
        stockOutItems.push({
          material_id: recipeItem.material_id,
          quantity: parseFloat(recipeItem.quantity_needed) * quantity
        });
      }
    }

    // --- TAHAP 2: Kurangi stok di Service Inventory ---
    console.log('(Operasional) Sending stock-out request to Inventory Service...');
    
    // Nembak ke service inventory (sesuai kontrak)
    // Kita belum punya order_id, jadi kita pake 'pending' atau 0
    await axios.post(`${INVENTORY_SERVICE_URL}/api/inventory/stock-out`, {
      order_id: 0, // Nanti kita update setelah dapet order_id asli
      items: stockOutItems
    });

    console.log('(Operasional) Stock-out successful.');

    // --- TAHAP 3: Simpan pesanan ke database kita ---
    // Kalo 2 tahap di atas sukses, baru kita simpen
    
    // 1. Simpen ke tabel 'orders'
    const orderQuery = `
      INSERT INTO orders (total_price, status) VALUES ($1, 'pending') RETURNING id;
    `;
    const orderResult = await client.query(orderQuery, [finalTotalPrice]);
    const newOrderId = orderResult.rows[0].id;

    // 2. Simpen ke tabel 'order_items'
    for (const itemData of orderItemsData) {
      const itemQuery = `
        INSERT INTO order_items (order_id, product_id, quantity, price_per_item)
        VALUES ($1, $2, $3, $4);
      `;
      await client.query(itemQuery, [
        newOrderId,
        itemData.product_id,
        itemData.quantity,
        itemData.price_per_item
      ]);
    }
    
    // (Opsional tapi bagus) Update order_id di service inventory
    // Ini bisa dibikin async, ga perlu ditungguin
    // axios.post(`${INVENTORY_SERVICE_URL}/api/inventory/update-order-id`, { temp_order_id: 0, final_order_id: newOrderId });

    // Kalo semua sukses, commit transaksi lokal
    await client.query('COMMIT');

    res.status(201).json({ 
      message: 'Order created successfully!',
      order_id: newOrderId,
      total_price: finalTotalPrice
    });

  } catch (err) {
    // Kalo ada satu aja error (misal: produk ga ada, stok kurang, db mati)
    // Batalin transaksi lokal kita
    await client.query('ROLLBACK');
    
    console.error('--- (Operasional) ALUR ORDER GAGAL ---');
    
    // Cek errornya dari axios atau bukan
    if (err.response) {
      // Ini error dari service lain (Product atau Inventory)
      console.error('Error from downstream service:', err.response.data);
      // Kita kirim ulang errornya ke client
      res.status(err.response.status).json(err.response.data);
    } else {
      // Ini error internal (misal DB kita sendiri)
      console.error('Internal server error:', err.message);
      res.status(500).json({ status: 'error', message: 'Internal server error', error: err.message });
    }
  } finally {
    client.release(); // Balikin koneksi ke pool
  }
});

// ... (tepat di atas '// --- START SERVER ---')

// GET (BARU): Melihat semua riwayat pesanan
// ges, ini buat nampilin semua orderan yg udah masuk
app.get('/api/orders', async (req, res) => {
  try {
    const { rows } = await pool.query('SELECT * FROM orders ORDER BY created_at DESC');
    res.status(200).json(rows);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// GET (BARU): Melihat detail satu pesanan
// Ini bakal kita JOIN biar item-item pesanannya juga keliatan
app.get('/api/orders/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Kita pake query JOIN buat ngambil data order sekaligus order_items-nya
    const query = `
      SELECT
        o.id AS order_id, o.total_price, o.status, o.created_at,
        oi.id AS item_id, oi.product_id, oi.quantity, oi.price_per_item
      FROM orders o
      LEFT JOIN order_items oi ON o.id = oi.order_id
      WHERE o.id = $1;
    `;
    const { rows } = await pool.query(query, [id]);

    // Kalo order-nya ga ada
    if (rows.length === 0) {
      return res.status(404).json({ message: `Order with id ${id} not found` });
    }

    // Ini trik yg sama kayak di 'product-service'
    // Kita ubah data "flat" dari SQL jadi JSON yg rapi
    const orderData = {
      order_id: rows[0].order_id,
      total_price: rows[0].total_price,
      status: rows[0].status,
      created_at: rows[0].created_at,
      items: []
    };

    rows.forEach(row => {
      if (row.item_id) {
        orderData.items.push({
          item_id: row.item_id,
          product_id: row.product_id,
          quantity: row.quantity,
          price_per_item: row.price_per_item
        });
      }
    });

    res.status(200).json(orderData);

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
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