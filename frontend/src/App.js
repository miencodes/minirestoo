import React, { useState, useEffect } from 'react';
import './App.css';

const API_BASE = 'http://localhost/api';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

function App() {
    const [activeTab, setActiveTab] = useState('cashier'); 
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]); 
    const [orders, setOrders] = useState([]); 
    const [cart, setCart] = useState([]); 

    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '' });
    
    const [recipeItems, setRecipeItems] = useState([]); 
    const [selectedMaterialId, setSelectedMaterialId] = useState('');
    const [neededQty, setNeededQty] = useState('');

    const [newMaterial, setNewMaterial] = useState({ name: '', unit: '', quantity_on_hand: '' });

    useEffect(() => {
        fetchProducts();
        fetchMaterials();
        fetchOrders();
    }, []);

    const fetchProducts = async () => {
        try {
            const res = await fetch(`${API_BASE}/products/`);
            const data = await res.json();
            if (Array.isArray(data)) setProducts(data);
        } catch (err) { console.error(err); }
    };

    const fetchMaterials = async () => {
        try {
            const res = await fetch(`${API_BASE}/inventory/materials`);
            const data = await res.json();
            if (Array.isArray(data)) setMaterials(data);
        } catch (err) { console.error(err); }
    };

    const fetchOrders = async () => {
        try {
            const res = await fetch(`${API_BASE}/orders/`); 
            const data = await res.json();
            if (Array.isArray(data)) setOrders(data);
        } catch (err) { console.error(err); }
    };

    const addToCart = (product) => {
        setCart(prev => {
            const exist = prev.find(item => item.product_id === product.id);
            if (exist) {
                return prev.map(item => 
                    item.product_id === product.id ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, { product_id: product.id, name: product.name, price: product.price, quantity: 1 }];
        });
    };

    const removeFromCart = (productId) => {
        setCart(prev => prev.filter(item => item.product_id !== productId));
    };

    const submitOrder = async () => {
        if (cart.length === 0) return alert("Keranjang kosong!");

        const payload = {
            items: cart.map(item => ({
                product_id: item.product_id,
                quantity: item.quantity
            }))
        };

        try {
            const res = await fetch(`${API_BASE}/orders/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await res.json();

            if (res.ok) {
                const orderId = result.id || result.orderId || result.order_id || '???';
                alert(`✅ Pesanan Berhasil! ID: ${orderId}\n(Stok bahan otomatis berkurang sesuai resep)`);
                setCart([]); 
                fetchOrders(); 
                fetchMaterials(); 
            } else {
                alert(`❌ Gagal: ${result.message || JSON.stringify(result)}`);
            }
        } catch (err) {
            alert("Error koneksi ke server");
            console.error(err);
        }
    };

    const addIngredientToRecipe = (e) => {
        e.preventDefault();
        if (!selectedMaterialId || !neededQty) return alert("Pilih bahan dan isi takaran!");

        const material = materials.find(m => m.id === parseInt(selectedMaterialId));
        if (!material) return;

        const newItem = {
            material_id: material.id,
            name: material.name,
            unit: material.unit,
            quantity_needed: parseFloat(neededQty)
        };

        setRecipeItems([...recipeItems, newItem]);
        setSelectedMaterialId('');
        setNeededQty('');
    };

    const removeIngredient = (index) => {
        const newList = [...recipeItems];
        newList.splice(index, 1);
        setRecipeItems(newList);
    };

    const handleAddProduct = async (e) => {
        e.preventDefault();
        if (!newProduct.name || !newProduct.price) return alert("Nama dan Harga wajib diisi");

        try {
            const resProduct = await fetch(`${API_BASE}/products/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newProduct)
            });
            
            if (!resProduct.ok) throw new Error("Gagal simpan produk");
            const savedProduct = await resProduct.json();

            if (recipeItems.length > 0) {
                for (const item of recipeItems) {
                    await fetch(`${API_BASE}/products/${savedProduct.id}/recipes`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            material_id: item.material_id,
                            quantity_needed: item.quantity_needed
                        })
                    });
                }
            }

            setNewProduct({ name: '', price: '', description: '' });
            setRecipeItems([]);
            fetchProducts();
            alert("✅ Menu & Resep berhasil disimpan!");

        } catch (err) {
            console.error(err);
            alert("Error menyimpan menu/resep.");
        }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Yakin mau hapus menu ini?")) return;
        try {
            const res = await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
            if (res.ok) {
                setProducts(products.filter(p => p.id !== id));
                alert("✅ Menu dihapus!");
            } else {
                alert("Gagal hapus.");
            }
        } catch (err) { alert("Error koneksi."); }
    };

    const handleAddMaterial = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch(`${API_BASE}/inventory/materials`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMaterial)
            });
            if (res.ok) {
                setNewMaterial({ name: '', unit: '', quantity_on_hand: '' });
                fetchMaterials();
                alert("✅ Stok berhasil ditambah!");
            } else {
                alert("Gagal update stok.");
            }
        } catch (err) { alert("Error jaringan."); }
    };

    return (
        <div className="App">
            <header className="header">
                <div className="header-content">
                    <h1>🍽️ Minirestoo POS</h1>
                    <p>Sistem Kasir Pintar (Kubernetes Connected)</p>
                </div>
            </header>
            
            <div className="tabs">
                <button className={`tab-button ${activeTab === 'cashier' ? 'active' : ''}`} onClick={() => setActiveTab('cashier')}>🛒 Kasir</button>
                <button className={`tab-button ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>📋 List Pesanan</button>
                <button className={`tab-button ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>🍔 Manajemen Menu</button>
                <button className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => setActiveTab('inventory')}>📦 Stok Bahan</button>
            </div>

            <div className="tab-content">
                
                {activeTab === 'cashier' && (
                    <div className="dashboard-grid">
                        <div className="management-section">
                            <h3>Pilih Menu</h3>
                            <div className="stats-grid">
                                {products.map(p => (
                                    <div key={p.id} className="stat-card" style={{cursor: 'pointer'}} onClick={() => addToCart(p)}>
                                        <h3>{p.name}</h3>
                                        <p className="stat-number" style={{fontSize: '1.2rem'}}>{formatRupiah(p.price)}</p>
                                        <span className="btn btn-primary" style={{marginTop: '10px', display: 'block'}}>+ Keranjang</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="management-section">
                            <h3>Pesanan Saat Ini</h3>
                            {cart.length === 0 ? <p>Belum ada item.</p> : (
                                <table style={{width: '100%'}}>
                                    <tbody>
                                        {cart.map(item => (
                                            <tr key={item.product_id}>
                                                <td>{item.name} x{item.quantity}</td>
                                                <td>{formatRupiah(item.price * item.quantity)}</td>
                                                <td><button className="btn btn-danger" onClick={() => removeFromCart(item.product_id)}>X</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            <div style={{marginTop: '20px', borderTop: '2px solid #eee', paddingTop: '10px'}}>
                                <h4>Total: {formatRupiah(cart.reduce((a, b) => a + (b.price * b.quantity), 0))}</h4>
                                <button className="btn btn-primary" style={{width: '100%', marginTop: '10px', background: '#28a745'}} onClick={submitOrder}>
                                    ✅ PROSES BAYAR
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="management-section">
                        <h3>Riwayat Transaksi</h3>
                        <div className="table-container">
                            <table>
                                <thead><tr><th>ID</th><th>Total</th><th>Waktu</th></tr></thead>
                                <tbody>
                                    {orders.map(o => (
                                        <tr key={o.id}>
                                            <td>#{o.id}</td>
                                            <td>{formatRupiah(o.total_price)}</td>
                                            <td>{o.created_at}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {activeTab === 'products' && (
                    <div className="management-section">
                        <h3>Buat Menu & Resep</h3>
                        <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '8px', border: '1px solid #ddd'}}>
                            
                            <h4>1. Info Menu</h4>
                            <div className="form-group">
                                <input className="form-input" placeholder="Nama Makanan (ex: Nasi Goreng)" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} />
                                <input className="form-input" type="number" placeholder="Harga Jual" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} />
                            </div>

                            <h4>2. Komposisi Bahan (Resep)</h4>
                            <div className="form-group" style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                                <select 
                                    className="form-input" 
                                    value={selectedMaterialId} 
                                    onChange={e => setSelectedMaterialId(e.target.value)}
                                >
                                    <option value="">-- Pilih Bahan Baku --</option>
                                    {materials.map(m => (
                                        <option key={m.id} value={m.id}>
                                            {m.name} (Stok: {m.quantity_on_hand} {m.unit})
                                        </option>
                                    ))}
                                </select>
                                <input 
                                    className="form-input" 
                                    type="number" 
                                    placeholder="Takaran" 
                                    value={neededQty} 
                                    onChange={e => setNeededQty(e.target.value)}
                                    style={{width: '100px'}} 
                                />
                                <button className="btn btn-secondary" onClick={addIngredientToRecipe} type="button">Tambah Bahan</button>
                            </div>

                            {recipeItems.length > 0 && (
                                <ul style={{marginBottom: '15px', background: 'white', padding: '10px', borderRadius: '5px'}}>
                                    {recipeItems.map((item, idx) => (
                                        <li key={idx} style={{display: 'flex', justifyContent: 'space-between', marginBottom: '5px'}}>
                                            <span>🧂 {item.name} - {item.quantity_needed} {item.unit}</span>
                                            <button onClick={() => removeIngredient(idx)} style={{color: 'red', border: 'none', background: 'none', cursor: 'pointer'}}>Hapus</button>
                                        </li>
                                    ))}
                                </ul>
                            )}

                            <button className="btn btn-primary" onClick={handleAddProduct} style={{width: '100%'}}>💾 SIMPAN MENU & RESEP</button>
                        </div>
                        
                        <h3 style={{marginTop: '30px'}}>Daftar Menu</h3>
                        <ul style={{ listStyle: 'none', padding: 0 }}>
                            {products.map(p => (
                                <li key={p.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px', borderBottom: '1px solid #eee' }}>
                                    <span><strong>{p.name}</strong> - {formatRupiah(p.price)}</span>
                                    <button onClick={() => handleDeleteProduct(p.id)} style={{backgroundColor: '#ff4d4d', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px', cursor: 'pointer'}}>Hapus 🗑️</button>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {activeTab === 'inventory' && (
                    <div className="management-section">
                        <h3>Gudang Bahan Baku</h3>
                        <form onSubmit={handleAddMaterial} className="form-group">
                            <input className="form-input" placeholder="Nama Bahan (ex: Beras)" value={newMaterial.name} onChange={e => setNewMaterial({...newMaterial, name: e.target.value})} />
                            <input className="form-input" placeholder="Satuan (ex: gram)" value={newMaterial.unit} onChange={e => setNewMaterial({...newMaterial, unit: e.target.value})} />
                            <input className="form-input" type="number" placeholder="Jumlah Masuk" value={newMaterial.quantity_on_hand} onChange={e => setNewMaterial({...newMaterial, quantity_on_hand: e.target.value})} />
                            <button className="btn btn-primary">Update Stok</button>
                        </form>

                        <div className="table-container">
                            <table>
                                <thead><tr><th>ID</th><th>Bahan</th><th>Stok</th><th>Satuan</th></tr></thead>
                                <tbody>
                                    {materials.map(m => (
                                        <tr key={m.id}>
                                            <td>{m.id}</td>
                                            <td>{m.name}</td>
                                            <td style={{fontWeight: 'bold', color: m.quantity_on_hand < 10 ? 'red' : 'green'}}>{m.quantity_on_hand}</td>
                                            <td>{m.unit}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

            </div>
        </div>
    );
}

export default App;