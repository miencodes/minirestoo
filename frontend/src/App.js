import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';


const PRODUCT_API = 'http://localhost:3002/api';
const INVENTORY_API = 'http://localhost:3001/api';
const OPERATIONAL_API = 'http://localhost:3003/api';

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};


const Register = ({ switchToLogin }) => {
    const [registerForm, setRegisterForm] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: ''
    });

    const handleRegisterChange = (e) => {
        const { name, value } = e.target;
        setRegisterForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleRegister = (e) => {
        e.preventDefault();
        if (registerForm.password !== registerForm.confirmPassword) {
            alert('Password dan Konfirmasi Password tidak cocok!');
            return;
        }
        alert('✅ Pendaftaran berhasil! Silakan login.');
        switchToLogin();
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>🍽️ Daftar Minirestoo</h1>
                    <p>Buat akun baru untuk memulai</p>
                </div>
                
                <form onSubmit={handleRegister} className="auth-form">
                    <div className="form-group">
                        <div className="form-input">
                            <label>Nama Lengkap</label>
                            <input
                                type="text"
                                name="name"
                                value={registerForm.name}
                                onChange={handleRegisterChange}
                                placeholder="Masukkan nama lengkap"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="form-input">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={registerForm.email}
                                onChange={handleRegisterChange}
                                placeholder="contoh@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="form-input">
                            <label>Nomor Telepon</label>
                            <input
                                type="tel"
                                name="phone"
                                value={registerForm.phone}
                                onChange={handleRegisterChange}
                                placeholder="08xxxxxxxxxx"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="form-input">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={registerForm.password}
                                onChange={handleRegisterChange}
                                placeholder="Minimal 6 karakter"
                                required
                                minLength="6"
                            />
                        </div>
                        <div className="form-input">
                            <label>Konfirmasi Password</label>
                            <input
                                type="password"
                                name="confirmPassword"
                                value={registerForm.confirmPassword}
                                onChange={handleRegisterChange}
                                placeholder="Ulangi password"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full">
                        Daftar Sekarang
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Sudah punya akun? 
                        <span className="auth-link" onClick={switchToLogin}>
                            Masuk di sini
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

const Login = ({ switchToRegister, onLogin }) => {
    const [loginForm, setLoginForm] = useState({
        email: '',
        password: ''
    });

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLogin = (e) => {
        e.preventDefault();
        // Simulasi login - dalam aplikasi real akan panggil API
        if (loginForm.email && loginForm.password) {
            onLogin();
        } else {
            alert('Harap isi email dan password!');
        }
    };

    return (
        <div className="auth-container">
            <div className="auth-card">
                <div className="auth-header">
                    <h1>🍽️ Masuk Minirestoo</h1>
                    <p>Selamat datang kembali!</p>
                </div>
                
                <form onSubmit={handleLogin} className="auth-form">
                    <div className="form-group">
                        <div className="form-input">
                            <label>Email</label>
                            <input
                                type="email"
                                name="email"
                                value={loginForm.email}
                                onChange={handleLoginChange}
                                placeholder="contoh@email.com"
                                required
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <div className="form-input">
                            <label>Password</label>
                            <input
                                type="password"
                                name="password"
                                value={loginForm.password}
                                onChange={handleLoginChange}
                                placeholder="Masukkan password"
                                required
                            />
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full">
                        Masuk ke Dashboard
                    </button>
                </form>

                <div className="auth-footer">
                    <p>Belum punya akun? 
                        <span className="auth-link" onClick={switchToRegister}>
                            Daftar di sini
                        </span>
                    </p>
                </div>
            </div>
        </div>
    );
};

// ==========================================================
// 🏠 KOMPONEN UTAMA APLIKASI
// ==========================================================

const ProductManagement = ({ products, productForm, handleProductChange, addProduct, deleteProduct }) => (
    <div className="management-section">
        <h2>📦 Menu Management</h2>
        
        <div className="form-section">
            <h3>Tambah Menu Baru</h3>
            <form onSubmit={addProduct}>
                <div className="form-group">
                    <div className="form-input">
                        <label>Nama Menu</label>
                        <input
                            type="text"
                            placeholder="Nama Menu"
                            name="name" 
                            value={productForm.name}
                            onChange={handleProductChange} 
                            required
                        />
                    </div>
                    <div className="form-input">
                        <label>Harga (Rp)</label>
                        <input
                            type="number"
                            placeholder="Harga"
                            name="price" 
                            value={productForm.price}
                            onChange={handleProductChange} 
                            required
                            min="0"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <div className="form-input">
                        <label>Kategori</label>
                        <select
                            name="category" 
                            value={productForm.category}
                            onChange={handleProductChange} 
                            required
                        >
                            <option value="Makanan Utama">Makanan Utama</option>
                            <option value="Appetizer">Appetizer</option>
                            <option value="Dessert">Dessert</option>
                            <option value="Minuman">Minuman</option>
                            <option value="Paket">Paket</option>
                        </select>
                    </div>
                    <div className="form-input full-width">
                        <label>Deskripsi Menu</label>
                        <textarea
                            placeholder="Deskripsi Menu"
                            name="description" 
                            value={productForm.description}
                            onChange={handleProductChange} 
                            required
                            rows="3"
                        />
                    </div>
                </div>
                <button type="submit" className="btn btn-primary">Tambah Menu</button>
            </form>
        </div>

        <div className="table-section">
            <h3>Daftar Menu</h3>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Nama Menu</th>
                            <th>Deskripsi</th>
                            <th>Kategori</th>
                            <th>Harga</th>
                            <th>Aksi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {products.map(product => (
                            <tr key={product.id}>
                                <td><strong>{product.name}</strong></td>
                                <td>{product.description}</td>
                                <td>{product.category}</td>
                                <td>{formatRupiah(product.price)}</td>
                                <td>
                                    <button 
                                        className="btn btn-danger"
                                        onClick={() => deleteProduct(product.id)}
                                    >
                                        Hapus
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const InventoryManagement = ({ products, inventory, inventoryForm, handleInventoryChange, updateStock }) => (
    <div className="management-section">
        <h2>📊 Inventory Management</h2>
        
        <div className="form-section">
            <h3>Update Stok Bahan</h3>
            <form onSubmit={updateStock}>
                <div className="form-group">
                    <div className="form-input">
                        <label>Pilih Menu</label>
                        <select
                            name="product_id" 
                            value={inventoryForm.product_id}
                            onChange={handleInventoryChange} 
                            required
                        >
                            <option value="">Pilih Menu</option>
                            {products.map(product => (
                                <option key={product.id} value={product.id}>
                                    {product.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-input">
                        <label>Jumlah Stok</label>
                        <input
                            type="number"
                            placeholder="Jumlah Stok"
                            name="stock" 
                            value={inventoryForm.stock}
                            onChange={handleInventoryChange} 
                            required
                            min="0"
                        />
                    </div>
                </div>
                <div className="form-group">
                    <div className="form-input">
                        <label>Lokasi Penyimpanan</label>
                        <select
                            name="location" 
                            value={inventoryForm.location}
                            onChange={handleInventoryChange} 
                            required
                        >
                            <option value="Dapur Utama">Dapur Utama</option>
                            <option value="Dapur Dingin">Dapur Dingin</option>
                            <option value="Bar">Bar</option>
                            <option value="Gudang">Gudang</option>
                            <option value="Freezer">Freezer</option>
                        </select>
                    </div>
                </div>
                <button type="submit" className="btn btn-primary">Update Stok</button>
            </form>
        </div>

        <div className="table-section">
            <h3>Stok Bahan Saat Ini</h3>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Menu</th>
                            <th>Stok</th>
                            <th>Lokasi</th>
                        </tr>
                    </thead>
                    <tbody>
                        {inventory.map(item => {
                            const product = products.find(p => p.id === item.product_id);
                            return (
                                <tr key={item.product_id}>
                                    <td>{product ? product.name : 'Menu Tidak Ditemukan'}</td>
                                    <td>{item.stock} porsi</td>
                                    <td>{item.location}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const OperationalManagement = ({ operational, operationalForm, handleOperationalChange, addOperational, deleteOperational }) => {
    const totalOperationalCost = operational.reduce((sum, op) => sum + op.cost, 0);

    return (
        <div className="management-section">
            <h2>⚙️ Operational Management</h2>
            
            <div className="form-section">
                <h3>Tambah Aktivitas Operasional</h3>
                <form onSubmit={addOperational}>
                    <div className="form-group">
                        <div className="form-input">
                            <label>Tanggal</label>
                            <input
                                type="date"
                                name="date" 
                                value={operationalForm.date}
                                onChange={handleOperationalChange} 
                                required
                            />
                        </div>
                        <div className="form-input">
                            <label>Nama Aktivitas</label>
                            <input
                                type="text"
                                placeholder="Contoh: Beli Bahan, Gaji Karyawan"
                                name="activity" 
                                value={operationalForm.activity}
                                onChange={handleOperationalChange} 
                                required
                            />
                        </div>
                    </div>
                    <div className="form-group">
                        <div className="form-input">
                            <label>Biaya (Rp)</label>
                            <input
                                type="number"
                                placeholder="0"
                                name="cost" 
                                value={operationalForm.cost}
                                onChange={handleOperationalChange} 
                                required
                                min="0"
                            />
                        </div>
                        <div className="form-input full-width">
                            <label>Deskripsi Aktivitas</label>
                            <textarea
                                placeholder="Deskripsi detail aktivitas..."
                                name="description" 
                                value={operationalForm.description}
                                onChange={handleOperationalChange} 
                                required
                                rows="3"
                            />
                        </div>
                    </div>
                    <button type="submit" className="btn btn-primary">Tambah Aktivitas</button>
                </form>
            </div>

            <div className="table-section">
                <h3>Catatan Operasional</h3>
                <div className="financial-summary">
                    <div className="financial-card total-cost">
                        <div className="financial-icon">💰</div>
                        <div className="financial-info">
                            <h4>Total Biaya Operasional</h4>
                            <p className="financial-amount">{formatRupiah(totalOperationalCost)}</p>
                            <span>Total pengeluaran operasional</span>
                        </div>
                    </div>
                </div>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Tanggal</th>
                                <th>Aktivitas</th>
                                <th>Deskripsi</th>
                                <th>Biaya</th>
                                <th>Aksi</th>
                            </tr>
                        </thead>
                        <tbody>
                            {operational.map(op => (
                                <tr key={op.id}>
                                    <td>{op.date}</td>
                                    <td><strong>{op.activity}</strong></td>
                                    <td>{op.description}</td>
                                    <td className="cost-cell">{formatRupiah(op.cost)}</td>
                                    <td>
                                        <button 
                                            className="btn btn-danger"
                                            onClick={() => deleteOperational(op.id)}
                                        >
                                            Hapus
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

const Dashboard = ({ stats, products, operational }) => {
    const totalOperationalCost = operational.reduce((sum, op) => sum + op.cost, 0);
    const estimatedSales = products.reduce((sum, product) => sum + (product.price * 10), 0);
    const estimatedRevenue = estimatedSales - totalOperationalCost;

    return (
        <div className="dashboard">
            <h2>📈 Dashboard Overview</h2>
            
            {/* Financial Summary */}
            <div className="financial-overview">
                <div className="financial-card revenue-card">
                    <div className="financial-icon">📊</div>
                    <div className="financial-info">
                        <h4>Estimasi Penjualan</h4>
                        <p className="financial-amount">{formatRupiah(estimatedSales)}</p>
                        <span>Total harga menu × 10 porsi</span>
                    </div>
                </div>
                
                <div className="financial-card cost-card">
                    <div className="financial-icon">💰</div>
                    <div className="financial-info">
                        <h4>Total Biaya Operasional</h4>
                        <p className="financial-amount">{formatRupiah(totalOperationalCost)}</p>
                        <span>Total pengeluaran operasional</span>
                    </div>
                </div>
                
                <div className={`financial-card ${estimatedRevenue >= 0 ? 'profit-card' : 'loss-card'}`}>
                    <div className="financial-icon">{estimatedRevenue >= 0 ? '💚' : '❌'}</div>
                    <div className="financial-info">
                        <h4>Estimasi Pendapatan Bersih</h4>
                        <p className="financial-amount">{formatRupiah(estimatedRevenue)}</p>
                        <span>{estimatedRevenue >= 0 ? 'Bulan ini (Untung)' : 'Bulan ini (Rugi)'}</span>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Menu</h3>
                    <p className="stat-number">{stats.totalProducts}</p>
                    <span className="stat-desc">Jumlah menu makanan & minuman</span>
                </div>
                <div className="stat-card">
                    <h3>Stok Bahan</h3>
                    <p className="stat-number">{stats.totalInventory}</p>
                    <span className="stat-desc">Item bahan makanan tersedia</span>
                </div>
                <div className="stat-card">
                    <h3>Aktivitas Operasional</h3>
                    <p className="stat-number">{stats.totalOperational}</p>
                    <span className="stat-desc">Catatan operasional bulan ini</span>
                </div>
            </div>

            {/* Revenue Calculation Explanation */}
            <div className="revenue-calculation">
                <h4>🧮 Detail Perhitungan Estimasi Pendapatan</h4>
                <div className="calculation-steps">
                    <div className="calculation-step">
                        <span className="step-label">Estimasi Penjualan:</span>
                        <span className="step-value">{formatRupiah(estimatedSales)}</span>
                        <span className="step-desc">(Total {products.length} menu × 10 porsi)</span>
                    </div>
                    <div className="calculation-step">
                        <span className="step-label">Total Biaya Operasional:</span>
                        <span className="step-value">- {formatRupiah(totalOperationalCost)}</span>
                        <span className="step-desc">({operational.length} aktivitas operasional)</span>
                    </div>
                    <div className="calculation-step total">
                        <span className="step-label">Estimasi Pendapatan Bersih:</span>
                        <span className={`step-value ${estimatedRevenue >= 0 ? 'profit' : 'loss'}`}>
                            = {formatRupiah(estimatedRevenue)}
                        </span>
                        <span className="step-desc">{estimatedRevenue >= 0 ? '💚 Untung' : '❌ Rugi'}</span>
                    </div>
                </div>
            </div>

            <div className="dashboard-grid">
                <div className="recent-activities">
                    <h3>Biaya Operasional Terbaru</h3>
                    <div className="activity-list">
                        {operational.slice(0, 5).map(op => (
                            <div key={op.id} className="activity-item">
                                <div className="activity-info">
                                    <strong>{op.activity}</strong>
                                    <span>{op.date}</span>
                                </div>
                                <span className="cost-badge">{formatRupiah(op.cost)}</span>
                            </div>
                        ))}
                        {operational.length === 0 && (
                            <div className="activity-item">
                                <span>Tidak ada data operasional</span>
                            </div>
                        )}
                    </div>
                </div>

                <div className="recent-activities">
                    <h3>Menu Terpopuler</h3>
                    <div className="activity-list">
                        {products.slice(0, 4).map(product => (
                            <div key={product.id} className="activity-item">
                                <span>{product.name}</span>
                                <span>{formatRupiah(product.price)}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// ==========================================================
// 🎯 KOMPONEN UTAMA APP
// ==========================================================

function App() {
    const [currentView, setCurrentView] = useState('register'); // 'register', 'login', 'main'
    const [activeTab, setActiveTab] = useState('dashboard');
    const [products, setProducts] = useState([]);
    const [inventory, setInventory] = useState([]);
    const [operational, setOperational] = useState([]);
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalInventory: 0,
        totalOperational: 0,
        totalOperationalCost: 0,
        totalRevenue: 0
    });

    // Form states
    const [productForm, setProductForm] = useState({
        name: '',
        description: '',
        price: '',
        category: 'Makanan Utama'
    });
    const [inventoryForm, setInventoryForm] = useState({
        product_id: '',
        stock: '',
        location: 'Dapur Utama'
    });
    const [operationalForm, setOperationalForm] = useState({
        date: new Date().toISOString().split('T')[0],
        activity: '',
        description: '',
        cost: ''
    });

    // Auth Handlers
    const switchToLogin = () => setCurrentView('login');
    const switchToRegister = () => setCurrentView('register');
    const handleLogin = () => {
        loadProducts();
        loadInventory();
        loadOperational();
        setCurrentView('main');
    };
    const handleLogout = () => setCurrentView('register');

    // Form Handlers
    const handleProductChange = (e) => {
        const { name, value } = e.target;
        setProductForm(prevForm => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleInventoryChange = (e) => {
        const { name, value } = e.target;
        setInventoryForm(prevForm => ({
            ...prevForm,
            [name]: value,
        }));
    };

    const handleOperationalChange = (e) => {
        const { name, value } = e.target;
        setOperationalForm(prevForm => ({
            ...prevForm,
            [name]: value,
        }));
    };

    // Load data on component mount
    useEffect(() => {
        if (currentView === 'main') {
            loadProducts();
            loadInventory();
            loadOperational();
        }
    }, [currentView]);

    const calculateStats = (products, inventory, operational) => {
        // Hitung total biaya operasional
        const totalOperationalCost = operational.reduce((sum, op) => sum + op.cost, 0);
        
        // Hitung estimasi pendapatan (total harga produk × 10) dikurangi biaya operasional
        const estimatedRevenue = products.reduce((sum, product) => sum + (product.price * 10), 0) - totalOperationalCost;

        setStats({
            totalProducts: products.length,
            totalInventory: inventory.length,
            totalOperational: operational.length,
            totalOperationalCost: totalOperationalCost,
            totalRevenue: estimatedRevenue > 0 ? estimatedRevenue : 0
        });
    };

    const loadProducts = async () => {
        try {
            const response = await axios.get(`${PRODUCT_API}/products`);
            setProducts(response.data);
            calculateStats(response.data, inventory, operational);
        } catch (error) {
            console.error('Error loading products:', error);
            const dummyProducts = [
                { id: 1, name: 'Nasi Goreng Spesial', description: 'Nasi goreng dengan ayam, udang, dan telur', price: 25000, category: 'Makanan Utama' },
                { id: 2, name: 'Gado-gado', description: 'Salad sayuran dengan bumbu kacang', price: 18000, category: 'Makanan Utama' },
                { id: 3, name: 'Es Teh Manis', description: 'Es teh dengan gula aren', price: 8000, category: 'Minuman' },
                { id: 4, name: 'Ayam Bakar', description: 'Ayam bakar bumbu spesial', price: 32000, category: 'Makanan Utama' }
            ];
            setProducts(dummyProducts);
            calculateStats(dummyProducts, inventory, operational);
        }
    };

    const addProduct = async (e) => {
        e.preventDefault(); 
        if (!productForm.name || !productForm.price) {
            alert('Nama produk dan harga harus diisi!');
            return;
        }
        try {
            const newProduct = {
                id: Date.now(),
                name: productForm.name,
                description: productForm.description,
                price: parseInt(productForm.price),
                category: productForm.category
            };
            setProducts(prev => {
                const newProducts = [...prev, newProduct];
                calculateStats(newProducts, inventory, operational);
                return newProducts;
            });
            setProductForm({ name: '', description: '', price: '', category: 'Makanan Utama' });
            alert('✅ Produk berhasil ditambahkan!');
        } catch (error) {
            console.error('Error adding product:', error);
            alert('❌ Gagal menambahkan produk');
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            try {
                setProducts(prev => {
                    const newProducts = prev.filter(product => product.id !== id);
                    calculateStats(newProducts, inventory, operational);
                    return newProducts;
                });
                alert('✅ Produk berhasil dihapus!');
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('❌ Gagal menghapus produk');
            }
        }
    };

    const loadInventory = async () => {
        try {
            const response = await axios.get(`${INVENTORY_API}/inventory`);
            setInventory(response.data);
            calculateStats(products, response.data, operational);
        } catch (error) {
            console.error('Error loading inventory:', error);
            const dummyInventory = [
                { product_id: 1, stock: 50, location: 'Dapur Utama' },
                { product_id: 2, stock: 30, location: 'Dapur Dingin' },
                { product_id: 3, stock: 100, location: 'Bar' },
                { product_id: 4, stock: 25, location: 'Dapur Utama' }
            ];
            setInventory(dummyInventory);
            calculateStats(products, dummyInventory, operational);
        }
    };

    const updateStock = async (e) => {
        e.preventDefault();
        if (!inventoryForm.product_id || !inventoryForm.stock) {
            alert('Produk dan jumlah stok harus diisi!');
            return;
        }
        try {
            const newInventoryItem = {
                product_id: parseInt(inventoryForm.product_id),
                stock: parseInt(inventoryForm.stock),
                location: inventoryForm.location
            };
            setInventory(prev => {
                const existingIndex = prev.findIndex(item => item.product_id === newInventoryItem.product_id);
                let newInventory;
                if (existingIndex >= 0) {
                    newInventory = prev.map((item, index) => 
                        index === existingIndex ? newInventoryItem : item
                    );
                } else {
                    newInventory = [...prev, newInventoryItem];
                }
                calculateStats(products, newInventory, operational);
                return newInventory;
            });
            setInventoryForm({ product_id: '', stock: '', location: 'Dapur Utama' });
            alert('✅ Stok berhasil diperbarui!');
        } catch (error) {
            console.error('Error updating stock:', error);
            alert('❌ Gagal memperbarui stok');
        }
    };

    const loadOperational = async () => {
        try {
            const response = await axios.get(`${OPERATIONAL_API}/operasional`);
            setOperational(response.data);
            calculateStats(products, inventory, response.data);
        } catch (error) {
            console.error('Error loading operational:', error);
            const dummyOperational = [
                { id: 1, date: '2024-01-15', activity: 'Beli Bahan Mentah', description: 'Pembelian sayuran dan daging segar', cost: 2500000 },
                { id: 2, date: '2024-01-16', activity: 'Maintenance Peralatan', description: 'Servis kompor dan oven', cost: 500000 },
                { id: 3, date: '2024-01-17', activity: 'Gaji Karyawan', description: 'Pembayaran gaji mingguan', cost: 3500000 }
            ];
            setOperational(dummyOperational);
            calculateStats(products, inventory, dummyOperational);
        }
    };

    const addOperational = async (e) => {
        e.preventDefault();
        if (!operationalForm.activity || !operationalForm.cost) {
            alert('Aktivitas dan biaya harus diisi!');
            return;
        }
        try {
            const newOperational = {
                id: Date.now(),
                date: operationalForm.date,
                activity: operationalForm.activity,
                description: operationalForm.description,
                cost: parseInt(operationalForm.cost)
            };
            setOperational(prev => {
                const newOperationals = [...prev, newOperational];
                calculateStats(products, inventory, newOperationals);
                return newOperationals;
            });
            setOperationalForm({ date: new Date().toISOString().split('T')[0], activity: '', description: '', cost: '' });
            alert('✅ Aktivitas operasional berhasil ditambahkan!');
        } catch (error) {
            console.error('Error adding operational:', error);
            alert('❌ Gagal menambahkan aktivitas operasional');
        }
    };

    const deleteOperational = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus aktivitas operasional ini?')) {
            try {
                setOperational(prev => {
                    const newOperationals = prev.filter(op => op.id !== id);
                    calculateStats(products, inventory, newOperationals);
                    return newOperationals;
                });
                alert('✅ Aktivitas operasional berhasil dihapus!');
            } catch (error) {
                console.error('Error deleting operational:', error);
                alert('❌ Gagal menghapus aktivitas operasional');
            }
        }
    };

    const renderTabContent = () => {
        switch (activeTab) {
            case 'products':
                return (
                    <ProductManagement 
                        products={products}
                        productForm={productForm}
                        handleProductChange={handleProductChange}
                        addProduct={addProduct}
                        deleteProduct={deleteProduct}
                    />
                );
            case 'inventory':
                return (
                    <InventoryManagement
                        products={products}
                        inventory={inventory}
                        inventoryForm={inventoryForm}
                        handleInventoryChange={handleInventoryChange}
                        updateStock={updateStock}
                    />
                );
            case 'operational':
                return (
                    <OperationalManagement
                        operational={operational}
                        operationalForm={operationalForm}
                        handleOperationalChange={handleOperationalChange}
                        addOperational={addOperational}
                        deleteOperational={deleteOperational}
                    />
                );
            case 'dashboard':
                return <Dashboard stats={stats} products={products} operational={operational} />;
            default:
                return <Dashboard stats={stats} products={products} operational={operational} />;
        }
    };

    // Render berdasarkan current view
    if (currentView === 'register') {
        return <Register switchToLogin={switchToLogin} />;
    }

    if (currentView === 'login') {
        return <Login switchToRegister={switchToRegister} onLogin={handleLogin} />;
    }

    // Main Application
    return (
        <div className="App">
            <header className="header">
                <div className="header-content">
                    <h1>🍽️ Minirestoo</h1>
                    <p>Sistem Manajemen Restoran</p>
                    <button className="btn btn-logout" onClick={handleLogout}>
                        🚪 Keluar
                    </button>
                </div>
            </header>
            
            <div className="tabs">
                <button 
                    className={`tab-button ${activeTab === 'dashboard' ? 'active' : ''}`}
                    onClick={() => setActiveTab('dashboard')}
                >
                    📈 Dashboard
                </button>
                <button 
                    className={`tab-button ${activeTab === 'products' ? 'active' : ''}`}
                    onClick={() => setActiveTab('products')}
                >
                    📦 Menu Management
                </button>
                <button 
                    className={`tab-button ${activeTab === 'inventory' ? 'active' : ''}`}
                    onClick={() => setActiveTab('inventory')}
                >
                    📊 Inventory Management
                </button>
                <button 
                    className={`tab-button ${activeTab === 'operational' ? 'active' : ''}`}
                    onClick={() => setActiveTab('operational')}
                >
                    ⚙️ Operational Management
                </button>
            </div>

            <div className="tab-content">
                {renderTabContent()}
            </div>
        </div>
    );
}

export default App;