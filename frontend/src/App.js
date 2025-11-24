import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const PRODUCT_API = 'http://localhost:3002/api';
const INVENTORY_API = 'http://localhost:3001/api';
const OPERATIONAL_API = 'http://localhost:3003/api';

// --- DATA MANUAL (DUMMY) DIPINDAHKAN KE SINI AGAR BISA MENJADI DEFAULT ---
const DUMMY_PRODUCTS = [
    { id: 1, name: 'Nasi Goreng Spesial', description: 'Nasi goreng dengan ayam, udang, dan telur', price: 25000, category: 'Makanan Utama' },
    { id: 2, name: 'Gado-gado', description: 'Salad sayuran dengan bumbu kacang', price: 18000, category: 'Makanan Utama' },
    { id: 3, name: 'Nasi Ayam Betutu', description: 'Ayam panggang dengan bumbu khas bali', price: 35000, category: 'Makanan Utama' },
    { id: 4, name: 'Ayam Bakar', description: 'Ayam bakar bumbu spesial', price: 32000, category: 'Makanan Utama' },
    { id: 5, name: 'Sate Ayam', description: 'Sate ayam dengan bumbu kacang', price: 28000, category: 'Makanan Utama' },
    { id: 6, name: 'Mie Goreng Spesial', description: 'Mie Goreng Spesial dengan ayam suir, telur, dan sosis', price: 12000, category: 'Makanan Utama' }
];

const DUMMY_INVENTORY = [
    { product_id: 1, stock: 50, location: 'Dapur Utama' },
    { product_id: 2, stock: 30, location: 'Dapur Dingin' },
    { product_id: 3, stock: 100, location: 'Bar' },
    { product_id: 4, stock: 25, location: 'Dapur Utama' },
    { product_id: 5, stock: 40, location: 'Dapur Utama' },
    { product_id: 6, stock: 80, location: 'Bar' }
];

const DUMMY_OPERATIONAL = [
    { id: 1, date: '2024-01-15', activity: 'Beli Bahan Mentah', description: 'Pembelian sayuran dan daging segar', cost: 2500000 },
    { id: 2, date: '2024-01-16', activity: 'Maintenance Peralatan', description: 'Servis kompor dan oven', cost: 500000 },
    { id: 3, date: '2024-01-17', activity: 'Gaji Karyawan', description: 'Pembayaran gaji mingguan', cost: 3500000 },
    { id: 4, date: '2024-01-18', activity: 'Beli Gas LPG', description: 'Pengisian gas untuk dapur', cost: 300000 },
    { id: 5, date: '2024-01-19', activity: 'Beli Kemasan', description: 'Pembelian box dan plastik kemasan', cost: 450000 }
];

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

const ProductManagement = ({ products, productForm, handleProductChange, addProduct, editProduct, deleteProduct, isEditing, setIsEditing, cancelEdit }) => (
    <div className="management-section">
        <h2>📦 Menu Management</h2>
        
        <div className="form-section">
            <h3>{isEditing ? '✏️ Edit Menu' : '➕ Tambah Menu Baru'}</h3>
            <form onSubmit={isEditing ? editProduct : addProduct}>
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
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                        {isEditing ? '💾 Update Menu' : '➕ Tambah Menu'}
                    </button>
                    {isEditing && (
                        <button type="button" className="btn btn-secondary" onClick={cancelEdit}>
                            ❌ Batal Edit
                        </button>
                    )}
                </div>
            </form>
        </div>

        <div className="table-section">
            <h3>📋 Daftar Menu</h3>
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
                                    <div className="action-buttons">
                                        <button 
                                            className="btn btn-warning"
                                            onClick={() => setIsEditing(product)}
                                        >
                                            ✏️ Edit
                                        </button>
                                        <button 
                                            className="btn btn-danger"
                                            onClick={() => deleteProduct(product.id)}
                                        >
                                            🗑️ Hapus
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const InventoryManagement = ({ products, inventory, inventoryForm, handleInventoryChange, updateStock, editInventory, deleteInventory, isEditingInventory, setIsEditingInventory, cancelEditInventory }) => (
    <div className="management-section">
        <h2>📊 Inventory Management</h2>
        
        <div className="form-section">
            <h3>{isEditingInventory ? '✏️ Edit Stok Bahan' : '📦 Update Stok Bahan'}</h3>
            <form onSubmit={isEditingInventory ? editInventory : updateStock}>
                <div className="form-group">
                    <div className="form-input">
                        <label>Pilih Menu</label>
                        <select
                            name="product_id" 
                            value={inventoryForm.product_id}
                            onChange={handleInventoryChange} 
                            required
                            disabled={isEditingInventory}
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
                <div className="form-actions">
                    <button type="submit" className="btn btn-primary">
                        {isEditingInventory ? '💾 Update Stok' : '📦 Tambah/Update Stok'}
                    </button>
                    {isEditingInventory && (
                        <button type="button" className="btn btn-secondary" onClick={cancelEditInventory}>
                            ❌ Batal Edit
                        </button>
                    )}
                </div>
            </form>
        </div>

        <div className="table-section">
            <h3>📋 Stok Bahan Saat Ini</h3>
            <div className="table-container">
                <table>
                    <thead>
                        <tr>
                            <th>Menu</th>
                            <th>Stok</th>
                            <th>Lokasi</th>
                            <th>Aksi</th>
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
                                    <td>
                                        <div className="action-buttons">
                                            <button 
                                                className="btn btn-warning"
                                                onClick={() => setIsEditingInventory(item)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                className="btn btn-danger"
                                                onClick={() => deleteInventory(item.product_id)}
                                            >
                                                🗑️ Hapus
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    </div>
);

const OperationalManagement = ({ operational, operationalForm, handleOperationalChange, addOperational, editOperational, deleteOperational, isEditingOperational, setIsEditingOperational, cancelEditOperational }) => {
    const totalOperationalCost = operational.reduce((sum, op) => sum + op.cost, 0);

    return (
        <div className="management-section">
            <h2>⚙️ Operational Management</h2>
            
            <div className="form-section">
                <h3>{isEditingOperational ? '✏️ Edit Aktivitas Operasional' : '➕ Tambah Aktivitas Operasional'}</h3>
                <form onSubmit={isEditingOperational ? editOperational : addOperational}>
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
                    <div className="form-actions">
                        <button type="submit" className="btn btn-primary">
                            {isEditingOperational ? '💾 Update Aktivitas' : '➕ Tambah Aktivitas'}
                        </button>
                        {isEditingOperational && (
                            <button type="button" className="btn btn-secondary" onClick={cancelEditOperational}>
                                ❌ Batal Edit
                            </button>
                        )}
                    </div>
                </form>
            </div>

            <div className="table-section">
                <h3>📋 Catatan Operasional</h3>
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
                                        <div className="action-buttons">
                                            <button 
                                                className="btn btn-warning"
                                                onClick={() => setIsEditingOperational(op)}
                                            >
                                                ✏️ Edit
                                            </button>
                                            <button 
                                                className="btn btn-danger"
                                                onClick={() => deleteOperational(op.id)}
                                            >
                                                🗑️ Hapus
                                            </button>
                                        </div>
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

const Dashboard = ({ stats, products, inventory, operational }) => {
    const totalOperationalCost = operational.reduce((sum, op) => sum + op.cost, 0);
    
    // Hitung total stok dari semua inventory
    const totalStock = inventory.reduce((sum, item) => sum + item.stock, 0);
    
    // Hitung estimasi penjualan berdasarkan stok yang tersedia
    const estimatedSales = inventory.reduce((sum, item) => {
        const product = products.find(p => p.id === item.product_id);
        return product ? sum + (product.price * item.stock) : sum;
    }, 0);
    
    const estimatedRevenue = estimatedSales - totalOperationalCost;

    return (
        <div className="dashboard">
            <h2>📈 Dashboard Overview</h2>
            
            <div className="financial-overview">
                <div className="financial-card revenue-card">
                    <div className="financial-icon">📊</div>
                    <div className="financial-info">
                        <h4>Estimasi Penjualan</h4>
                        <p className="financial-amount">{formatRupiah(estimatedSales)}</p>
                        <span>Berdasarkan stok yang tersedia</span>
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

            <div className="stats-grid">
                <div className="stat-card">
                    <h3>Total Menu</h3>
                    <p className="stat-number">{stats.totalProducts}</p>
                    <span className="stat-desc">Jumlah menu</span>
                </div>
                <div className="stat-card">
                    <h3>Total Stok</h3>
                    <p className="stat-number">{totalStock}</p>
                    <span className="stat-desc">Total porsi yang tersedia</span>
                </div>
                {/* Kartu "Item Stok" DIHAPUS sesuai permintaan 
                   karena sudah ada total stok dan dianggap redundan 
                */}
                <div className="stat-card">
                    <h3>Aktivitas Operasional</h3>
                    <p className="stat-number">{stats.totalOperational}</p>
                    <span className="stat-desc">Catatan operasional bulan ini</span>
                </div>
            </div>

            <div className="revenue-calculation">
                <h4>🧮 Detail Perhitungan Estimasi Pendapatan</h4>
                <div className="calculation-steps">
                    <div className="calculation-step">
                        <span className="step-label">Estimasi Penjualan Maksimal:</span>
                        <span className="step-value">{formatRupiah(estimatedSales)}</span>
                        <span className="step-desc">(Berdasarkan stok yang tersedia)</span>
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
                    <h3>📋 Biaya Operasional Terbaru</h3>
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
                    <h3>🏆 Menu dengan Stok Terbanyak</h3>
                    <div className="activity-list">
                        {inventory
                            .sort((a, b) => b.stock - a.stock)
                            .slice(0, 5)
                            .map(item => {
                                const product = products.find(p => p.id === item.product_id);
                                return product ? (
                                    <div key={item.product_id} className="activity-item">
                                        <div className="activity-info">
                                            <strong>{product.name}</strong>
                                            <span>{formatRupiah(product.price)}</span>
                                        </div>
                                        <span className="cost-badge" style={{background: '#28a745'}}>
                                            {item.stock} porsi
                                        </span>
                                    </div>
                                ) : null;
                            })}
                        {inventory.length === 0 && (
                            <div className="activity-item">
                                <span>Tidak ada data stok</span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

function App() {
    const [currentView, setCurrentView] = useState('register');
    const [activeTab, setActiveTab] = useState('dashboard');
    
    // PERBAIKAN: Initialize state dengan DUMMY data agar langsung muncul
    const [products, setProducts] = useState(DUMMY_PRODUCTS);
    const [inventory, setInventory] = useState(DUMMY_INVENTORY);
    const [operational, setOperational] = useState(DUMMY_OPERATIONAL);
    
    const [stats, setStats] = useState({
        totalProducts: 0,
        totalInventory: 0,
        totalOperational: 0,
        totalOperationalCost: 0,
        totalRevenue: 0
    });

    const [productForm, setProductForm] = useState({
        id: '',
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
        id: '',
        date: new Date().toISOString().split('T')[0],
        activity: '',
        description: '',
        cost: ''
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isEditingInventory, setIsEditingInventory] = useState(false);
    const [isEditingOperational, setIsEditingOperational] = useState(false);

    const switchToLogin = () => setCurrentView('login');
    const switchToRegister = () => setCurrentView('register');
    const handleLogin = () => {
        loadProducts();
        loadInventory();
        loadOperational();
        setCurrentView('main');
    };
    const handleLogout = () => {
        setCurrentView('register');
        cancelEdit();
        cancelEditInventory();
        cancelEditOperational();
    };

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

    // PERBAIKAN: Gunakan useEffect ini untuk selalu menghitung stats ketika data berubah
    // Ini menjamin Total Menu tidak 0 ketika data manual dimuat
    useEffect(() => {
        calculateStats(products, inventory, operational);
    }, [products, inventory, operational]);

    useEffect(() => {
        if (currentView === 'main') {
            loadProducts();
            loadInventory();
            loadOperational();
        }
    }, [currentView]);

    const calculateStats = (currentProducts, currentInventory, currentOperational) => {
        const totalOperationalCost = currentOperational.reduce((sum, op) => sum + op.cost, 0);
        
        const estimatedSales = currentInventory.reduce((sum, item) => {
            const product = currentProducts.find(p => p.id === item.product_id);
            return product ? sum + (product.price * item.stock) : sum;
        }, 0);
        
        const estimatedRevenue = estimatedSales - totalOperationalCost;

        setStats({
            totalProducts: currentProducts.length,
            totalInventory: currentInventory.length,
            totalOperational: currentOperational.length,
            totalOperationalCost: totalOperationalCost,
            totalRevenue: estimatedRevenue > 0 ? estimatedRevenue : 0
        });
    };

    const loadProducts = async () => {
        try {
            const response = await axios.get(`${PRODUCT_API}/products`);
            if(response.data && response.data.length > 0) {
                setProducts(response.data);
            }
        } catch (error) {
            console.error('Error loading products (using dummy data):', error);
            // Fallback is already handled by initial state, but we can enforce it here if needed
            // setProducts(DUMMY_PRODUCTS); 
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
            setProducts(prev => [...prev, newProduct]);
            setProductForm({ id: '', name: '', description: '', price: '', category: 'Makanan Utama' });
            alert('✅ Produk berhasil ditambahkan!');
        } catch (error) {
            console.error('Error adding product:', error);
            alert('❌ Gagal menambahkan produk');
        }
    };

    const editProduct = async (e) => {
        e.preventDefault();
        if (!productForm.name || !productForm.price) {
            alert('Nama produk dan harga harus diisi!');
            return;
        }
        try {
            setProducts(prev => prev.map(product => 
                product.id === productForm.id 
                    ? { ...productForm, price: parseInt(productForm.price) }
                    : product
            ));
            setProductForm({ id: '', name: '', description: '', price: '', category: 'Makanan Utama' });
            setIsEditing(false);
            alert('✅ Produk berhasil diupdate!');
        } catch (error) {
            console.error('Error editing product:', error);
            alert('❌ Gagal mengupdate produk');
        }
    };

    const deleteProduct = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus produk ini?')) {
            try {
                setProducts(prev => prev.filter(product => product.id !== id));
                alert('✅ Produk berhasil dihapus!');
            } catch (error) {
                console.error('Error deleting product:', error);
                alert('❌ Gagal menghapus produk');
            }
        }
    };

    const cancelEdit = () => {
        setProductForm({ id: '', name: '', description: '', price: '', category: 'Makanan Utama' });
        setIsEditing(false);
    };

    const loadInventory = async () => {
        try {
            const response = await axios.get(`${INVENTORY_API}/inventory`);
            if(response.data && response.data.length > 0) {
                setInventory(response.data);
            }
        } catch (error) {
            console.error('Error loading inventory (using dummy data):', error);
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
                if (existingIndex >= 0) {
                    return prev.map((item, index) => 
                        index === existingIndex ? newInventoryItem : item
                    );
                } else {
                    return [...prev, newInventoryItem];
                }
            });
            setInventoryForm({ product_id: '', stock: '', location: 'Dapur Utama' });
            alert('✅ Stok berhasil diperbarui!');
        } catch (error) {
            console.error('Error updating stock:', error);
            alert('❌ Gagal memperbarui stok');
        }
    };

    const editInventory = async (e) => {
        e.preventDefault();
        if (!inventoryForm.stock) {
            alert('Jumlah stok harus diisi!');
            return;
        }
        try {
            setInventory(prev => prev.map(item => 
                item.product_id === parseInt(inventoryForm.product_id)
                    ? { ...item, stock: parseInt(inventoryForm.stock), location: inventoryForm.location }
                    : item
            ));
            setInventoryForm({ product_id: '', stock: '', location: 'Dapur Utama' });
            setIsEditingInventory(false);
            alert('✅ Stok berhasil diupdate!');
        } catch (error) {
            console.error('Error editing inventory:', error);
            alert('❌ Gagal mengupdate stok');
        }
    };

    const deleteInventory = async (product_id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus data stok ini?')) {
            try {
                setInventory(prev => prev.filter(item => item.product_id !== product_id));
                alert('✅ Data stok berhasil dihapus!');
            } catch (error) {
                console.error('Error deleting inventory:', error);
                alert('❌ Gagal menghapus data stok');
            }
        }
    };

    const cancelEditInventory = () => {
        setInventoryForm({ product_id: '', stock: '', location: 'Dapur Utama' });
        setIsEditingInventory(false);
    };

    const loadOperational = async () => {
        try {
            const response = await axios.get(`${OPERATIONAL_API}/operasional`);
            if(response.data && response.data.length > 0) {
                setOperational(response.data);
            }
        } catch (error) {
            console.error('Error loading operational (using dummy data):', error);
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
            setOperational(prev => [...prev, newOperational]);
            setOperationalForm({ id: '', date: new Date().toISOString().split('T')[0], activity: '', description: '', cost: '' });
            alert('✅ Aktivitas operasional berhasil ditambahkan!');
        } catch (error) {
            console.error('Error adding operational:', error);
            alert('❌ Gagal menambahkan aktivitas operasional');
        }
    };

    const editOperational = async (e) => {
        e.preventDefault();
        if (!operationalForm.activity || !operationalForm.cost) {
            alert('Aktivitas dan biaya harus diisi!');
            return;
        }
        try {
            setOperational(prev => prev.map(op => 
                op.id === operationalForm.id
                    ? { ...operationalForm, cost: parseInt(operationalForm.cost) }
                    : op
            ));
            setOperationalForm({ id: '', date: new Date().toISOString().split('T')[0], activity: '', description: '', cost: '' });
            setIsEditingOperational(false);
            alert('✅ Aktivitas operasional berhasil diupdate!');
        } catch (error) {
            console.error('Error editing operational:', error);
            alert('❌ Gagal mengupdate aktivitas operasional');
        }
    };

    const deleteOperational = async (id) => {
        if (window.confirm('Apakah Anda yakin ingin menghapus aktivitas operasional ini?')) {
            try {
                setOperational(prev => prev.filter(op => op.id !== id));
                alert('✅ Aktivitas operasional berhasil dihapus!');
            } catch (error) {
                console.error('Error deleting operational:', error);
                alert('❌ Gagal menghapus aktivitas operasional');
            }
        }
    };

    const cancelEditOperational = () => {
        setOperationalForm({ id: '', date: new Date().toISOString().split('T')[0], activity: '', description: '', cost: '' });
        setIsEditingOperational(false);
    };

    const handleSetEditing = (product) => {
        setProductForm({
            id: product.id,
            name: product.name,
            description: product.description,
            price: product.price,
            category: product.category
        });
        setIsEditing(true);
    };

    const handleSetEditingInventory = (item) => {
        setInventoryForm({
            product_id: item.product_id,
            stock: item.stock,
            location: item.location
        });
        setIsEditingInventory(true);
    };

    const handleSetEditingOperational = (op) => {
        setOperationalForm({
            id: op.id,
            date: op.date,
            activity: op.activity,
            description: op.description,
            cost: op.cost
        });
        setIsEditingOperational(true);
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
                        editProduct={editProduct}
                        deleteProduct={deleteProduct}
                        isEditing={isEditing}
                        setIsEditing={handleSetEditing}
                        cancelEdit={cancelEdit}
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
                        editInventory={editInventory}
                        deleteInventory={deleteInventory}
                        isEditingInventory={isEditingInventory}
                        setIsEditingInventory={handleSetEditingInventory}
                        cancelEditInventory={cancelEditInventory}
                    />
                );
            case 'operational':
                return (
                    <OperationalManagement
                        operational={operational}
                        operationalForm={operationalForm}
                        handleOperationalChange={handleOperationalChange}
                        addOperational={addOperational}
                        editOperational={editOperational}
                        deleteOperational={deleteOperational}
                        isEditingOperational={isEditingOperational}
                        setIsEditingOperational={handleSetEditingOperational}
                        cancelEditOperational={cancelEditOperational}
                    />
                );
            case 'dashboard':
                return <Dashboard stats={stats} products={products} inventory={inventory} operational={operational} />;
            default:
                return <Dashboard stats={stats} products={products} inventory={inventory} operational={operational} />;
        }
    };

    if (currentView === 'register') {
        return <Register switchToLogin={switchToLogin} />;
    }

    if (currentView === 'login') {
        return <Login switchToRegister={switchToRegister} onLogin={handleLogin} />;
    }

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