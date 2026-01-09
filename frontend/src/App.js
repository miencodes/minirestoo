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

// --- LOGIN COMPONENT (UI CANTIK) ---
const AdminLogin = ({ onLogin }) => {
    const [loginForm, setLoginForm] = useState({ username: '', password: '' });
    const [isLoading, setIsLoading] = useState(false);

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        
        if (loginForm.username === 'admin' && loginForm.password === 'admin123') {
            onLogin();
        } else {
            alert('⚠️ Akses Ditolak! (User: admin, Pass: admin123)');
        }
        setIsLoading(false);
    };

    return (
        <div className="admin-login-container">
            <div className="login-background">
                <div className="login-bg-shape shape-1"></div>
                <div className="login-bg-shape shape-2"></div>
            </div>
            <div className="admin-login-card">
                <div className="login-card-header">
                    <div className="login-logo"><div className="logo-icon">🍽️</div></div>
                    <h1>Minirestoo</h1>
                    <p>Kubernetes POS System</p>
                </div>
                <form onSubmit={handleAdminLogin} className="admin-login-form">
                    <div className="form-group floating-label">
                        <input type="text" name="username" value={loginForm.username} onChange={handleLoginChange} required placeholder="Username" />
                    </div>
                    <div className="form-group floating-label">
                        <input type="password" name="password" value={loginForm.password} onChange={handleLoginChange} required placeholder="Password" />
                    </div>
                    <button type="submit" className="btn-login" disabled={isLoading}>
                        {isLoading ? 'Loading...' : 'Sign In'}
                    </button>
                </form>
                <div className="login-footer">
                    <p>Demo: admin / admin123</p>
                </div>
            </div>
        </div>
    );
};

// --- SIDEBAR COMPONENT ---
const AdminSidebar = ({ activeTab, setActiveTab, handleLogout }) => {
    const [collapsed, setCollapsed] = useState(false);
    const menuItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard' },
        { id: 'cashier', icon: '🛒', label: 'Kasir POS' },
        { id: 'products', icon: '🍔', label: 'Menu & Resep' },
        { id: 'inventory', icon: '📦', label: 'Stok Bahan' },
        { id: 'orders', icon: '📋', label: 'Riwayat Pesanan' },
    ];

    return (
        <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <div className="brand-icon">🍽️</div>
                    {!collapsed && <div className="brand-text"><h1>Minirestoo</h1></div>}
                </div>
                <button className="sidebar-toggle" onClick={() => setCollapsed(!collapsed)}>{collapsed ? '→' : '←'}</button>
            </div>
            <nav className="sidebar-nav">
                {menuItems.map(item => (
                    <div key={item.id} className={`nav-item ${activeTab === item.id ? 'active' : ''}`} onClick={() => setActiveTab(item.id)}>
                        <div className="nav-icon">{item.icon}</div>
                        {!collapsed && <span className="nav-label">{item.label}</span>}
                    </div>
                ))}
            </nav>
            <div className="sidebar-footer">
                <div className="nav-item logout-item" onClick={handleLogout}>
                    <div className="nav-icon">🚪</div>
                    {!collapsed && <span className="nav-label">Logout</span>}
                </div>
            </div>
        </aside>
    );
};

// --- DASHBOARD COMPONENT ---
const Dashboard = ({ products, materials, orders }) => {
    // Kalkulasi Real Data
    const totalRevenue = orders.reduce((sum, o) => sum + parseFloat(o.total_price), 0);
    const lowStockItems = materials.filter(m => parseFloat(m.quantity_on_hand) < 10).length;

    return (
        <div className="admin-main-content">
            <div className="content-header">
                <div className="header-left">
                    <h1>Dashboard Overview</h1>
                    <p>Real-time data from Kubernetes Cluster</p>
                </div>
            </div>
            <div className="stats-grid">
                <div className="stat-card revenue">
                    <div className="stat-icon"><div className="icon-bg">💰</div></div>
                    <div className="stat-content">
                        <h3>{formatRupiah(totalRevenue)}</h3>
                        <p>Total Revenue</p>
                    </div>
                </div>
                <div className="stat-card products">
                    <div className="stat-icon"><div className="icon-bg">🍔</div></div>
                    <div className="stat-content">
                        <h3>{products.length}</h3>
                        <p>Active Menu Items</p>
                    </div>
                </div>
                <div className="stat-card inventory">
                    <div className="stat-icon"><div className="icon-bg">📦</div></div>
                    <div className="stat-content">
                        <h3>{materials.length}</h3>
                        <p>Total Ingredients</p>
                    </div>
                </div>
                <div className="stat-card operational">
                    <div className="stat-icon"><div className="icon-bg">⚠️</div></div>
                    <div className="stat-content">
                        <h3>{lowStockItems}</h3>
                        <p>Low Stock Alerts</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- CASHIER COMPONENT (POS) ---
const Cashier = ({ products, addToCart, cart, removeFromCart, submitOrder }) => {
    return (
        <div className="admin-main-content">
            <div className="dashboard-grid">
                {/* Menu Grid */}
                <div className="dashboard-column main">
                    <div className="dashboard-card">
                        <div className="card-header"><h3>Pilih Menu</h3></div>
                        <div className="products-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '15px', padding: '20px'}}>
                            {products.map(p => (
                                <div key={p.id} className="stat-card" onClick={() => addToCart(p)} style={{cursor: 'pointer', border: '1px solid #eee', transition: '0.2s'}}>
                                    <div className="product-avatar" style={{fontSize: '2rem', marginBottom: '10px'}}>{p.name.charAt(0)}</div>
                                    <h4>{p.name}</h4>
                                    <p style={{color: '#28a745', fontWeight: 'bold'}}>{formatRupiah(p.price)}</p>
                                    <button className="btn-primary" style={{marginTop: '10px', width: '100%', fontSize: '0.8rem'}}>+ Add to Cart</button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Cart Sidebar */}
                <div className="dashboard-column sidebar">
                    <div className="dashboard-card">
                        <div className="card-header"><h3>Pesanan Aktif</h3></div>
                        <div style={{padding: '15px'}}>
                            {cart.length === 0 ? <p className="no-data">Keranjang kosong.</p> : (
                                <table style={{width: '100%', marginBottom: '15px'}}>
                                    <tbody>
                                        {cart.map(item => (
                                            <tr key={item.product_id} style={{borderBottom: '1px solid #eee'}}>
                                                <td style={{padding: '10px 0'}}>
                                                    <strong>{item.name}</strong><br/>
                                                    <small>Qty: {item.quantity}</small>
                                                </td>
                                                <td style={{textAlign: 'right'}}>{formatRupiah(item.price * item.quantity)}</td>
                                                <td style={{textAlign: 'right', width: '30px'}}>
                                                    <button onClick={() => removeFromCart(item.product_id)} style={{color: '#ff4d4d', border: 'none', background: 'none', cursor: 'pointer', fontSize: '1.2rem'}}>×</button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            <div style={{borderTop: '2px solid #eee', paddingTop: '15px', marginTop: '10px'}}>
                                <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '15px'}}>
                                    <strong>Total:</strong>
                                    <strong style={{fontSize: '1.2rem', color: '#28a745'}}>{formatRupiah(cart.reduce((a, b) => a + (b.price * b.quantity), 0))}</strong>
                                </div>
                                <button className="quick-action-btn" style={{width: '100%', justifyContent: 'center', backgroundColor: '#28a745', color: 'white'}} onClick={submitOrder}>
                                    ✅ PROSES BAYAR
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- PRODUCT MANAGEMENT (UI BARU + LOGIC RESEP) ---
const ProductManagement = ({ products, materials, onAddProduct, onDeleteProduct }) => {
    const [newProduct, setNewProduct] = useState({ name: '', price: '', description: '', category: 'Makanan Utama' });
    const [recipeItems, setRecipeItems] = useState([]);
    const [selectedMaterial, setSelectedMaterial] = useState('');
    const [qty, setQty] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);

    const handleAddIngredient = () => {
        if(!selectedMaterial || !qty) return;
        const mat = materials.find(m => m.id === parseInt(selectedMaterial));
        setRecipeItems([...recipeItems, { material_id: mat.id, name: mat.name, unit: mat.unit, quantity_needed: parseFloat(qty) }]);
        setSelectedMaterial(''); setQty('');
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddProduct(newProduct, recipeItems);
        setNewProduct({ name: '', price: '', description: '', category: 'Makanan Utama' });
        setRecipeItems([]);
        setIsFormOpen(false);
    };

    return (
        <div className="admin-main-content">
            <div className="content-header">
                <div className="header-left">
                    <h1>Menu Management</h1>
                    <p>Manage products and recipes</p>
                </div>
                <button className="btn-primary" onClick={() => setIsFormOpen(!isFormOpen)}>
                    {isFormOpen ? 'Cancel' : '➕ Add New Menu'}
                </button>
            </div>

            {isFormOpen && (
                <div className="dashboard-card slide-in" style={{marginBottom: '20px'}}>
                    <div className="card-header"><h3>New Menu Item</h3></div>
                    <div style={{padding: '20px'}}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Menu Name</label>
                                <input className="form-input" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} placeholder="Nasi Goreng" />
                            </div>
                            <div className="form-group">
                                <label>Price</label>
                                <input className="form-input" type="number" value={newProduct.price} onChange={e => setNewProduct({...newProduct, price: e.target.value})} placeholder="25000" />
                            </div>
                            <div className="form-group">
                                <label>Category</label>
                                <select className="form-input" value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})}>
                                    <option value="Makanan Utama">Makanan Utama</option>
                                    <option value="Minuman">Minuman</option>
                                    <option value="Dessert">Dessert</option>
                                </select>
                            </div>
                        </div>

                        {/* Recipe Section */}
                        <div style={{background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginTop: '15px', border: '1px solid #eee'}}>
                            <label style={{fontWeight: 'bold', color: '#666'}}>Resep & Bahan Baku (Auto-deduct Stock)</label>
                            <div style={{display: 'flex', gap: '10px', marginTop: '10px'}}>
                                <select className="form-input" value={selectedMaterial} onChange={e => setSelectedMaterial(e.target.value)}>
                                    <option value="">-- Pilih Bahan --</option>
                                    {materials.map(m => <option key={m.id} value={m.id}>{m.name} (Sisa: {m.quantity_on_hand} {m.unit})</option>)}
                                </select>
                                <input className="form-input" type="number" placeholder="Qty" value={qty} onChange={e => setQty(e.target.value)} style={{width: '100px'}} />
                                <button className="btn-secondary" type="button" onClick={handleAddIngredient}>+ Add</button>
                            </div>
                            <div style={{marginTop: '10px'}}>
                                {recipeItems.map((r, i) => (
                                    <span key={i} className="status-badge" style={{marginRight: '5px', display: 'inline-block'}}>
                                        {r.name}: {r.quantity_needed} {r.unit}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <button className="btn-primary" style={{width: '100%', marginTop: '20px'}} onClick={handleSubmit}>💾 SAVE MENU</button>
                    </div>
                </div>
            )}

            <div className="dashboard-card">
                <div className="card-header"><h3>Menu List</h3></div>
                <div className="products-table">
                    <div className="table-header">
                        <div className="table-col">Name</div>
                        <div className="table-col">Category</div>
                        <div className="table-col">Price</div>
                        <div className="table-col">Action</div>
                    </div>
                    <div className="table-body">
                        {products.map(p => (
                            <div key={p.id} className="table-row">
                                <div className="table-col"><strong>{p.name}</strong></div>
                                <div className="table-col"><span className="category-badge">{p.category}</span></div>
                                <div className="table-col">{formatRupiah(p.price)}</div>
                                <div className="table-col">
                                    <button className="btn-action delete" onClick={() => onDeleteProduct(p.id)}>🗑️</button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- INVENTORY COMPONENT ---
const InventoryManagement = ({ materials, onAddMaterial }) => {
    const [newMat, setNewMat] = useState({ name: '', unit: '', quantity_on_hand: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        onAddMaterial(newMat);
        setNewMat({ name: '', unit: '', quantity_on_hand: '' });
    };

    return (
        <div className="admin-main-content">
            <div className="content-header">
                <h1>Inventory</h1>
                <p>Manage Raw Materials</p>
            </div>
            
            <div className="dashboard-grid">
                <div className="dashboard-column sidebar">
                    <div className="dashboard-card">
                        <div className="card-header"><h3>Add Stock</h3></div>
                        <form onSubmit={handleSubmit} style={{padding: '20px'}}>
                            <div className="form-group"><label>Material Name</label><input className="form-input" value={newMat.name} onChange={e => setNewMat({...newMat, name: e.target.value})} placeholder="e.g. Beras" /></div>
                            <div className="form-group"><label>Unit</label><input className="form-input" value={newMat.unit} onChange={e => setNewMat({...newMat, unit: e.target.value})} placeholder="e.g. kg/gram" /></div>
                            <div className="form-group"><label>Initial Stock</label><input className="form-input" type="number" value={newMat.quantity_on_hand} onChange={e => setNewMat({...newMat, quantity_on_hand: e.target.value})} /></div>
                            <button className="btn-primary" style={{width: '100%'}}>Update Stock</button>
                        </form>
                    </div>
                </div>

                <div className="dashboard-column main">
                    <div className="dashboard-card">
                        <div className="card-header"><h3>Stock Levels</h3></div>
                        <div className="products-table">
                            <div className="table-header">
                                <div className="table-col">ID</div>
                                <div className="table-col">Material</div>
                                <div className="table-col">Stock</div>
                                <div className="table-col">Unit</div>
                            </div>
                            <div className="table-body">
                                {materials.map(m => (
                                    <div key={m.id} className="table-row">
                                        <div className="table-col">#{m.id}</div>
                                        <div className="table-col"><strong>{m.name}</strong></div>
                                        <div className="table-col" style={{color: parseFloat(m.quantity_on_hand) < 10 ? 'red' : 'green', fontWeight: 'bold'}}>
                                            {m.quantity_on_hand}
                                        </div>
                                        <div className="table-col">{m.unit}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- ORDER LIST COMPONENT ---
const OrderList = ({ orders }) => {
    return (
        <div className="admin-main-content">
            <div className="content-header"><h1>Transaction History</h1></div>
            <div className="dashboard-card">
                <div className="products-table">
                    <div className="table-header">
                        <div className="table-col">Order ID</div>
                        <div className="table-col">Total Price</div>
                        <div className="table-col">Date</div>
                    </div>
                    <div className="table-body">
                        {orders.map(o => (
                            <div key={o.id} className="table-row">
                                <div className="table-col">#{o.id}</div>
                                <div className="table-col" style={{color: '#28a745', fontWeight: 'bold'}}>{formatRupiah(o.total_price)}</div>
                                <div className="table-col">{new Date(o.created_at).toLocaleString()}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- MAIN APP ---
function App() {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // Data State (Real Backend)
    const [products, setProducts] = useState([]);
    const [materials, setMaterials] = useState([]);
    const [orders, setOrders] = useState([]);
    const [cart, setCart] = useState([]);

    // Fetch Data
    const fetchAll = async () => {
        try {
            const [resProd, resMat, resOrd] = await Promise.all([
                fetch(`${API_BASE}/products/`),
                fetch(`${API_BASE}/inventory/materials`),
                fetch(`${API_BASE}/orders/`)
            ]);
            setProducts(await resProd.json());
            setMaterials(await resMat.json());
            setOrders(await resOrd.json());
        } catch (err) { console.error("API Error:", err); }
    };

    useEffect(() => {
        if(isAdminLoggedIn) fetchAll();
    }, [isAdminLoggedIn]);

    // Logic Kasir
    const addToCart = (p) => {
        setCart(prev => {
            const exist = prev.find(i => i.product_id === p.id);
            return exist 
                ? prev.map(i => i.product_id === p.id ? { ...i, quantity: i.quantity + 1 } : i)
                : [...prev, { product_id: p.id, name: p.name, price: p.price, quantity: 1 }];
        });
    };

    const removeFromCart = (id) => setCart(prev => prev.filter(i => i.product_id !== id));

    const submitOrder = async () => {
        if (cart.length === 0) return alert("Keranjang kosong!");
        try {
            const res = await fetch(`${API_BASE}/orders/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: cart.map(i => ({ product_id: i.product_id, quantity: i.quantity })) })
            });
            if (res.ok) {
                alert("✅ Transaksi Berhasil!");
                setCart([]);
                fetchAll();
            } else {
                alert("❌ Gagal transaksi");
            }
        } catch (e) { alert("Error koneksi"); }
    };

    // Logic Produk & Inventory
    const handleAddProduct = async (product, recipes) => {
        try {
            const res = await fetch(`${API_BASE}/products/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(product)
            });
            const newProd = await res.json();
            
            for (const r of recipes) {
                await fetch(`${API_BASE}/products/${newProd.id}/recipes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ material_id: r.material_id, quantity_needed: r.quantity_needed })
                });
            }
            alert("✅ Menu berhasil dibuat!");
            fetchAll();
        } catch (e) { console.error(e); }
    };

    const handleDeleteProduct = async (id) => {
        if (!window.confirm("Hapus menu ini?")) return;
        await fetch(`${API_BASE}/products/${id}`, { method: 'DELETE' });
        fetchAll();
    };

    const handleAddMaterial = async (mat) => {
        await fetch(`${API_BASE}/inventory/materials`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mat)
        });
        alert("✅ Stok update!");
        fetchAll();
    };

    if (!isAdminLoggedIn) return <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />;

    return (
        <div className="App">
            <AdminSidebar activeTab={activeTab} setActiveTab={setActiveTab} handleLogout={() => setIsAdminLoggedIn(false)} />
            
            {activeTab === 'dashboard' && <Dashboard products={products} materials={materials} orders={orders} />}
            {activeTab === 'cashier' && <Cashier products={products} cart={cart} addToCart={addToCart} removeFromCart={removeFromCart} submitOrder={submitOrder} />}
            {activeTab === 'products' && <ProductManagement products={products} materials={materials} onAddProduct={handleAddProduct} onDeleteProduct={handleDeleteProduct} />}
            {activeTab === 'inventory' && <InventoryManagement materials={materials} onAddMaterial={handleAddMaterial} />}
            {activeTab === 'orders' && <OrderList orders={orders} />}
        </div>
    );
}

export default App;