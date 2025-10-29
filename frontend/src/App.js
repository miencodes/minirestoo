import React, { useState, useEffect } from 'react';
import './App.css';

// ges, ini base URL API kita. Mulai sekarang, semua tembakan API pake ini
const API_URL = 'http://localhost'; // Ini adalah Nginx

function App() {
  // === STATE ===
  const [products, setProducts] = useState([]); // Buat nampung daftar produk
  const [cart, setCart] = useState([]); // Buat nampung keranjang
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // === EFEK (Pas halaman dibuka) ===
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await fetch(`${API_URL}/api/products`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setProducts(data);
      } catch (e) {
        setError(e.message);
        console.error("Error fetching products:", e);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // === FUNGSI-FUNGSI (Aksi User) ===

  // 1. Fungsi buat nambahin produk ke keranjang
  const addToCart = (product) => {
    setCart(currentCart => {
      // Cek dulu produknya udah ada di keranjang apa belum
      const existingItem = currentCart.find(item => item.id === product.id);

      if (existingItem) {
        // Kalo udah ada, tambahin quantity-nya +1
        return currentCart.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      } else {
        // Kalo belum ada, tambahin item baru ke keranjang
        return [...currentCart, { ...product, quantity: 1 }];
      }
    });
  };

  // 2. Fungsi buat ngitung total harga
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0).toFixed(2);
  };

  // 3. Fungsi buat nembak API 'Buat Pesanan'
  const submitOrder = async () => {
    if (cart.length === 0) {
      alert("Keranjang masih kosong!");
      return;
    }

    // Ubah format keranjang kita jadi format yg diminta API Kontrak
    const orderData = {
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.quantity
      }))
    };

    try {
      setLoading(true); // Mulai loading
      const response = await fetch(`${API_URL}/api/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      });

      const result = await response.json();

      if (!response.ok) {
        // Kalo error dari backend (misal: stok kurang)
        throw new Error(result.message || 'Gagal membuat pesanan');
      }

      // Kalo sukses!
      alert(`Pesanan berhasil dibuat! Order ID: ${result.order_id}`);
      setCart([]); // Kosongin keranjang

    } catch (e) {
      setError(e.message);
      alert(`Error: ${e.message}`); // Tampilin error ke kasir
      console.error("Error submitting order:", e);
    } finally {
      setLoading(false); // Selesai loading
    }
  };

  // === TAMPILAN (JSX) ===

  // Kalo error pas loading awal, tampilin ini
  if (error && products.length === 0) {
    return (
      <div className="App">
        <header className="App-header">
          <h1>Minirestoo Dashboard</h1>
          <div style={{ color: 'red' }}>
            <h2>Gagal mengambil data produk!</h2>
            <p>Error: {error}</p>
            <p>(Pastikan semua service backend & Nginx jalan)</p>
          </div>
        </header>
      </div>
    );
  }

  // Kalo semua aman, tampilin layout kasir
  return (
    <div className="App">
      <header className="App-header">
        <h1>Minirestoo Dashboard</h1>
      </header>
      
      {/* nen, ini layout 2 kolom kita */}
      <div className="pos-container">

        {/* --- KOLOM KIRI (DAFTAR MENU) --- */}
        <div className="product-list">
          <h2>Daftar Menu</h2>
          {loading && <p>Loading...</p>}
          <div className="product-grid">
            {products.map(product => (
              <div className="product-card" key={product.id}>
                <h3>{product.name}</h3>
                <p>Rp {parseFloat(product.price).toFixed(2)}</p>
                <button onClick={() => addToCart(product)}>
                  + Tambah
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* --- KOLOM KANAN (KERANJANG) --- */}
        <div className="cart">
          <h2>Keranjang</h2>
          {cart.length === 0 ? (
            <p>Keranjang masih kosong</p>
          ) : (
            <ul>
              {cart.map(item => (
                <li key={item.id}>
                  {item.name} (x{item.quantity})
                  <span>Rp {(item.price * item.quantity).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
          
          <hr />
          <div className="cart-total">
            <h3>Total: Rp {calculateTotal()}</h3>
          </div>
          <button 
            className="order-button" 
            onClick={submitOrder} 
            disabled={cart.length === 0 || loading}
          >
            {loading ? 'Memproses...' : 'Buat Pesanan'}
          </button>
        </div>

      </div>
    </div>
  );
}

export default App;