import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './App.css';

const PRODUCT_API = 'http://localhost:3002/api';
const INVENTORY_API = 'http://localhost:3001/api';
const OPERATIONAL_API = 'http://localhost:3003/api';

const DUMMY_PRODUCTS = [
    { id: 1, name: 'Nasi Goreng Spesial', description: 'Nasi goreng dengan ayam, udang, dan telur', price: 25000, category: 'Makanan Utama', sales: 125, rating: 4.5 },
    { id: 2, name: 'Gado-gado', description: 'Salad sayuran dengan bumbu kacang', price: 18000, category: 'Makanan Utama', sales: 89, rating: 4.2 },
    { id: 3, name: 'Nasi Ayam Betutu', description: 'Ayam panggang dengan bumbu khas bali', price: 35000, category: 'Makanan Utama', sales: 67, rating: 4.8 },
    { id: 4, name: 'Ayam Bakar', description: 'Ayam bakar bumbu spesial', price: 32000, category: 'Makanan Utama', sales: 142, rating: 4.6 },
    { id: 5, name: 'Sate Ayam', description: 'Sate ayam dengan bumbu kacang', price: 28000, category: 'Makanan Utama', sales: 98, rating: 4.3 },
    { id: 6, name: 'Mie Goreng Spesial', description: 'Mie Goreng Spesial dengan ayam suir, telur, dan sosis', price: 12000, category: 'Makanan Utama', sales: 156, rating: 4.1 }
];

const DUMMY_INVENTORY = [
    { id: 1, product_id: 1, stock: 50, location: 'Dapur Utama', min_stock: 10, status: 'Aman' },
    { id: 2, product_id: 2, stock: 30, location: 'Dapur Dingin', min_stock: 15, status: 'Aman' },
    { id: 3, product_id: 3, stock: 100, location: 'Bar', min_stock: 20, status: 'Aman' },
    { id: 4, product_id: 4, stock: 25, location: 'Dapur Utama', min_stock: 10, status: 'Aman' },
    { id: 5, product_id: 5, stock: 40, location: 'Dapur Utama', min_stock: 15, status: 'Aman' },
    { id: 6, product_id: 6, stock: 80, location: 'Bar', min_stock: 25, status: 'Aman' }
];

const DUMMY_OPERATIONAL = [
    { id: 1, date: '2024-01-15', activity: 'Beli Bahan Mentah', description: 'Pembelian sayuran dan daging segar', cost: 2500000, type: 'Bahan Baku', status: 'Completed' },
    { id: 2, date: '2024-01-16', activity: 'Maintenance Peralatan', description: 'Servis kompor dan oven', cost: 500000, type: 'Maintenance', status: 'Completed' },
    { id: 3, date: '2024-01-17', activity: 'Gaji Karyawan', description: 'Pembayaran gaji mingguan', cost: 3500000, type: 'Gaji', status: 'Pending' },
    { id: 4, date: '2024-01-18', activity: 'Beli Gas LPG', description: 'Pengisian gas untuk dapur', cost: 300000, type: 'Bahan Baku', status: 'Completed' },
    { id: 5, date: '2024-01-19', activity: 'Beli Kemasan', description: 'Pembelian box dan plastik kemasan', cost: 450000, type: 'Bahan Baku', status: 'Completed' }
];

const formatRupiah = (number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(number);
};

// Admin Login Component (sama seperti sebelumnya)
const AdminLogin = ({ onLogin }) => {
    const [loginForm, setLoginForm] = useState({
        username: '',
        password: ''
    });
    const [isLoading, setIsLoading] = useState(false);

    const handleLoginChange = (e) => {
        const { name, value } = e.target;
        setLoginForm(prev => ({ ...prev, [name]: value }));
    };

    const handleAdminLogin = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        
        // Simulate API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Default admin credentials for demo
        const defaultAdmin = {
            username: 'admin',
            password: 'admin123'
        };

        if (loginForm.username === defaultAdmin.username && loginForm.password === defaultAdmin.password) {
            onLogin();
        } else {
            alert('⚠️ Akses Ditolak! Username atau password salah.\n\nDefault credentials:\nUsername: admin\nPassword: admin123');
        }
        
        setIsLoading(false);
    };

    return (
        <div className="admin-login-container">
            <div className="login-background">
                <div className="login-bg-shape shape-1"></div>
                <div className="login-bg-shape shape-2"></div>
                <div className="login-bg-shape shape-3"></div>
            </div>
            
            <div className="admin-login-card">
                <div className="login-card-header">
                    <div className="login-logo">
                        <div className="logo-icon">
                            🍽️
                        </div>
                        <div className="logo-text">
                            <h1>Minirestoo</h1>
                            <p>Restaurant Management System</p>
                        </div>
                    </div>
                    <div className="login-welcome">
                        <h2>Welcome Back</h2>
                        <p>Sign in to access your admin dashboard</p>
                    </div>
                </div>
                
                <form onSubmit={handleAdminLogin} className="admin-login-form">
                    <div className="form-group floating-label">
                        <input
                            type="text"
                            name="username"
                            value={loginForm.username}
                            onChange={handleLoginChange}
                            required
                            autoComplete="off"
                        />
                        <label>Username</label>
                        <div className="input-icon">👤</div>
                    </div>
                    
                    <div className="form-group floating-label">
                        <input
                            type="password"
                            name="password"
                            value={loginForm.password}
                            onChange={handleLoginChange}
                            required
                            autoComplete="off"
                        />
                        <label>Password</label>
                        <div className="input-icon">🔒</div>
                    </div>
                    
                    <div className="form-options">
                        <label className="checkbox-container">
                            <input type="checkbox" />
                            <span className="checkmark"></span>
                            Remember me
                        </label>
                        <a href="#" className="forgot-password">Forgot Password?</a>
                    </div>
                    
                    <button type="submit" className="btn-login" disabled={isLoading}>
                        {isLoading ? (
                            <span className="loading-spinner"></span>
                        ) : (
                            <>
                                <span>Sign In</span>
                                <span className="btn-icon">→</span>
                            </>
                        )}
                    </button>
                    
                    <div className="login-footer">
                        <div className="divider">
                            <span>or</span>
                        </div>
                        <div className="demo-credentials">
                            <p className="demo-title">Demo Credentials:</p>
                            <div className="credentials-grid">
                                <div className="credential-item">
                                    <span className="cred-label">Username:</span>
                                    <code>admin</code>
                                </div>
                                <div className="credential-item">
                                    <span className="cred-label">Password:</span>
                                    <code>admin123</code>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            
            <div className="login-footer-note">
                <div className="security-note">
                    <span className="security-icon">🔒</span>
                    <span>Enterprise-grade security & encryption</span>
                </div>
                <p>© 2024 Minirestoo Admin. All rights reserved.</p>
            </div>
        </div>
    );
};

// Admin Sidebar Component
const AdminSidebar = ({ activeTab, setActiveTab, handleLogout }) => {
    const [collapsed, setCollapsed] = useState(false);

    const menuItems = [
        { id: 'dashboard', icon: '📊', label: 'Dashboard', badge: null },
        { id: 'products', icon: '🍽️', label: 'Menu Management', badge: '6' },
        { id: 'inventory', icon: '📦', label: 'Inventory', badge: '3' },
        { id: 'operational', icon: '💰', label: 'Operational', badge: '5' },
        { id: 'reports', icon: '📈', label: 'Reports', badge: 'New' },
        { id: 'customers', icon: '👥', label: 'Customers', badge: null },
        { id: 'settings', icon: '⚙️', label: 'Settings', badge: null },
    ];

    return (
        <aside className={`admin-sidebar ${collapsed ? 'collapsed' : ''}`}>
            <div className="sidebar-header">
                <div className="sidebar-brand">
                    <div className="brand-icon">
                        🍽️
                    </div>
                    {!collapsed && (
                        <div className="brand-text">
                            <h1>Minirestoo</h1>
                            <p>Admin Panel</p>
                        </div>
                    )}
                </div>
                <button 
                    className="sidebar-toggle"
                    onClick={() => setCollapsed(!collapsed)}
                >
                    {collapsed ? '→' : '←'}
                </button>
            </div>
            
            <div className="sidebar-user">
                <div className="user-avatar">
                    AD
                    <span className="user-status"></span>
                </div>
                {!collapsed && (
                    <div className="user-info">
                        <h3>Administrator</h3>
                        <p>Super Admin</p>
                    </div>
                )}
            </div>
            
            <nav className="sidebar-nav">
                {menuItems.map(item => (
                    <div
                        key={item.id}
                        className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
                        onClick={() => setActiveTab(item.id)}
                    >
                        <div className="nav-icon">{item.icon}</div>
                        {!collapsed && (
                            <>
                                <span className="nav-label">{item.label}</span>
                                {item.badge && (
                                    <span className={`nav-badge ${item.badge === 'New' ? 'new' : ''}`}>
                                        {item.badge}
                                    </span>
                                )}
                            </>
                        )}
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

// Dashboard Component dengan filter waktu aktif
const Dashboard = ({ stats, products, inventory, operational }) => {
    const [timeFilter, setTimeFilter] = useState('weekly');
    const [filteredOperational, setFilteredOperational] = useState([]);
    const [filteredProducts, setFilteredProducts] = useState([]);
    const [filteredInventory, setFilteredInventory] = useState([]);
    
    useEffect(() => {
        // Filter data berdasarkan timeFilter
        filterDataByTime();
    }, [timeFilter, operational, products, inventory]);
    
    const filterDataByTime = () => {
        const today = new Date();
        let startDate = new Date();
        
        switch (timeFilter) {
            case 'daily':
                // Data hari ini
                const todayStr = today.toISOString().split('T')[0];
                setFilteredOperational(operational.filter(op => op.date === todayStr));
                break;
            case 'weekly':
                // Data 7 hari terakhir
                startDate.setDate(today.getDate() - 7);
                const weekAgoStr = startDate.toISOString().split('T')[0];
                setFilteredOperational(operational.filter(op => op.date >= weekAgoStr));
                break;
            case 'monthly':
                // Data 30 hari terakhir
                startDate.setDate(today.getDate() - 30);
                const monthAgoStr = startDate.toISOString().split('T')[0];
                setFilteredOperational(operational.filter(op => op.date >= monthAgoStr));
                break;
            default:
                setFilteredOperational(operational);
        }
        
        // Untuk demo, kita akan filter products dan inventory secara random
        // sesuai dengan filter waktu untuk menunjukkan perbedaan
        if (timeFilter === 'daily') {
            setFilteredProducts(products.slice(0, 2));
            setFilteredInventory(inventory.slice(0, 2));
        } else if (timeFilter === 'weekly') {
            setFilteredProducts(products.slice(0, 4));
            setFilteredInventory(inventory.slice(0, 4));
        } else {
            setFilteredProducts(products);
            setFilteredInventory(inventory);
        }
    };
    
    const totalOperationalCost = filteredOperational.reduce((sum, op) => sum + op.cost, 0);
    const totalStock = filteredInventory.reduce((sum, item) => sum + item.stock, 0);
    const lowStockItems = filteredInventory.filter(item => item.stock < (item.min_stock * 1.5)).length;
    
    const estimatedSales = filteredInventory.reduce((sum, item) => {
        const product = filteredProducts.find(p => p.id === item.product_id);
        return product ? sum + (product.price * item.stock) : sum;
    }, 0);
    
    const estimatedRevenue = estimatedSales - totalOperationalCost;
    
    const topProducts = [...filteredProducts]
        .sort((a, b) => b.sales - a.sales)
        .slice(0, 3);

    return (
        <div className="admin-main-content">
            <div className="content-header">
                <div className="header-left">
                    <h1>Dashboard Overview</h1>
                    <p>Welcome back! Here's what's happening with your restaurant today.</p>
                </div>
                <div className="header-right">
                    <div className="date-range">
                        <button 
                            className={`time-filter ${timeFilter === 'daily' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('daily')}
                        >
                            Daily
                        </button>
                        <button 
                            className={`time-filter ${timeFilter === 'weekly' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('weekly')}
                        >
                            Weekly
                        </button>
                        <button 
                            className={`time-filter ${timeFilter === 'monthly' ? 'active' : ''}`}
                            onClick={() => setTimeFilter('monthly')}
                        >
                            Monthly
                        </button>
                    </div>
                    <div className="filter-badge">
                        Showing: {timeFilter.charAt(0).toUpperCase() + timeFilter.slice(1)} Data
                    </div>
                </div>
            </div>
            
            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card revenue">
                    <div className="stat-icon">
                        <div className="icon-bg">
                            💰
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3>{formatRupiah(estimatedRevenue)}</h3>
                        <p>Projected Revenue ({timeFilter})</p>
                        <div className="stat-trend positive">
                            <span>↑ 12.5%</span> vs last {timeFilter}
                        </div>
                    </div>
                </div>
                
                <div className="stat-card products">
                    <div className="stat-icon">
                        <div className="icon-bg">
                            🍽️
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3>{filteredProducts.length}</h3>
                        <p>Active Menu Items</p>
                        <div className="stat-trend positive">
                            <span>↑ {timeFilter === 'daily' ? '0' : timeFilter === 'weekly' ? '2' : '3'} new</span> this {timeFilter}
                        </div>
                    </div>
                </div>
                
                <div className="stat-card inventory">
                    <div className="stat-icon">
                        <div className="icon-bg">
                            📦
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3>{totalStock}</h3>
                        <p>Total Stock Items</p>
                        <div className="stat-trend warning">
                            <span>{lowStockItems} low</span> stock alert
                        </div>
                    </div>
                </div>
                
                <div className="stat-card operational">
                    <div className="stat-icon">
                        <div className="icon-bg">
                            📊
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3>{formatRupiah(totalOperationalCost)}</h3>
                        <p>Operational Cost ({timeFilter})</p>
                        <div className="stat-trend negative">
                            <span>↑ 8.2%</span> vs last {timeFilter}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Main Content Grid */}
            <div className="dashboard-grid">
                {/* Left Column */}
                <div className="dashboard-column main">
                    {/* Top Products */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3>🔥 Top Performing Menu ({timeFilter})</h3>
                            <button className="card-action">View All →</button>
                        </div>
                        <div className="products-list">
                            {topProducts.length > 0 ? (
                                topProducts.map((product, index) => (
                                    <div key={product.id} className="product-item">
                                        <div className="product-rank">{index + 1}</div>
                                        <div className="product-info">
                                            <h4>{product.name}</h4>
                                            <p>{product.description}</p>
                                        </div>
                                        <div className="product-stats">
                                            <div className="sales-count">
                                                <span className="stat-label">Sales ({timeFilter}):</span>
                                                <span className="stat-value">
                                                    {Math.floor(product.sales * (timeFilter === 'daily' ? 0.1 : timeFilter === 'weekly' ? 0.3 : 1))}
                                                </span>
                                            </div>
                                            <div className="rating">
                                                <span className="stars">{"★".repeat(Math.floor(product.rating))}</span>
                                                <span className="rating-value">{product.rating}</span>
                                            </div>
                                        </div>
                                        <div className="product-price">
                                            {formatRupiah(product.price)}
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">No data available for selected period</div>
                            )}
                        </div>
                    </div>
                    
                    {/* Recent Activities */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3>📋 Recent Activities ({timeFilter})</h3>
                            <button className="card-action">See All →</button>
                        </div>
                        <div className="activities-list">
                            {filteredOperational.length > 0 ? (
                                filteredOperational.slice(0, 4).map(activity => (
                                    <div key={activity.id} className="activity-item">
                                        <div className={`activity-icon ${activity.status.toLowerCase()}`}>
                                            {activity.type === 'Gaji' ? '💵' : 
                                             activity.type === 'Maintenance' ? '🔧' : '📦'}
                                        </div>
                                        <div className="activity-details">
                                            <div className="activity-header">
                                                <h4>{activity.activity}</h4>
                                                <span className={`status-badge ${activity.status.toLowerCase()}`}>
                                                    {activity.status}
                                                </span>
                                            </div>
                                            <p className="activity-description">{activity.description}</p>
                                            <div className="activity-footer">
                                                <span className="activity-date">{activity.date}</span>
                                                <span className="activity-cost">{formatRupiah(activity.cost)}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="no-data">No operational activities for selected period</div>
                            )}
                        </div>
                    </div>
                </div>
                
                {/* Right Column */}
                <div className="dashboard-column sidebar">
                    {/* Quick Stats */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3>📊 Quick Stats ({timeFilter})</h3>
                        </div>
                        <div className="quick-stats">
                            <div className="quick-stat-item">
                                <div className="stat-label">Avg. Order Value</div>
                                <div className="stat-value">
                                    {formatRupiah(timeFilter === 'daily' ? 45000 : timeFilter === 'weekly' ? 43000 : 42000)}
                                </div>
                            </div>
                            <div className="quick-stat-item">
                                <div className="stat-label">Customer Rating</div>
                                <div className="stat-value">
                                    {timeFilter === 'daily' ? '4.7' : timeFilter === 'weekly' ? '4.6' : '4.5'}/5.0
                                </div>
                            </div>
                            <div className="quick-stat-item">
                                <div className="stat-label">Table Occupancy</div>
                                <div className="stat-value">
                                    {timeFilter === 'daily' ? '82%' : timeFilter === 'weekly' ? '78%' : '75%'}
                                </div>
                            </div>
                            <div className="quick-stat-item">
                                <div className="stat-label">Online Orders</div>
                                <div className="stat-value">
                                    {timeFilter === 'daily' ? '15' : timeFilter === 'weekly' ? '42' : '156'}
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Inventory Alerts */}
                    <div className="dashboard-card alert">
                        <div className="card-header">
                            <h3>⚠️ Inventory Alerts</h3>
                            <span className="alert-count">{lowStockItems}</span>
                        </div>
                        <div className="alerts-list">
                            {filteredInventory
                                .filter(item => item.stock < item.min_stock * 1.5)
                                .slice(0, 3)
                                .map(item => {
                                    const product = filteredProducts.find(p => p.id === item.product_id);
                                    return product ? (
                                        <div key={item.product_id} className="alert-item">
                                            <div className="alert-icon">⚠️</div>
                                            <div className="alert-details">
                                                <h4>{product.name}</h4>
                                                <p>Stock: {item.stock} units</p>
                                            </div>
                                            <button className="btn-alert-action">Order</button>
                                        </div>
                                    ) : null;
                                })}
                            {lowStockItems === 0 && (
                                <div className="no-alerts">✅ All stock levels are good</div>
                            )}
                        </div>
                    </div>
                    
                    {/* Quick Actions */}
                    <div className="dashboard-card">
                        <div className="card-header">
                            <h3>⚡ Quick Actions</h3>
                        </div>
                        <div className="quick-actions">
                            <button className="quick-action-btn">
                                <span className="action-icon">➕</span>
                                <span className="action-text">Add New Menu</span>
                            </button>
                            <button className="quick-action-btn">
                                <span className="action-icon">📦</span>
                                <span className="action-text">Update Stock</span>
                            </button>
                            <button className="quick-action-btn">
                                <span className="action-icon">💰</span>
                                <span className="action-text">Add Expense</span>
                            </button>
                            <button className="quick-action-btn">
                                <span className="action-icon">📄</span>
                                <span className="action-text">Generate Report</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

// Product Management Component (sama seperti sebelumnya)
const ProductManagement = ({ products, productForm, handleProductChange, addProduct, editProduct, deleteProduct, isEditing, setIsEditing, cancelEdit }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');

    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            product.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === 'all' || product.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const categories = ['all', ...new Set(products.map(p => p.category))];

    return (
        <div className="admin-main-content">
            <div className="content-header">
                <div className="header-left">
                    <h1>Menu Management</h1>
                    <p>Manage your restaurant menu items, pricing, and categories</p>
                </div>
                <button className="btn-primary" onClick={() => !isEditing && setIsEditing({})}>
                    <span>➕ Add New Menu</span>
                </button>
            </div>
            
            {/* Add/Edit Form */}
            {isEditing && (
                <div className="form-card slide-in">
                    <div className="form-card-header">
                        <h3>{isEditing.id ? 'Edit Menu Item' : 'Add New Menu Item'}</h3>
                        <button className="btn-close" onClick={cancelEdit}>✕</button>
                    </div>
                    <form onSubmit={isEditing.id ? editProduct : addProduct}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Menu Name *</label>
                                <input
                                    type="text"
                                    placeholder="Enter menu item name"
                                    name="name"
                                    value={productForm.name}
                                    onChange={handleProductChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Price (IDR) *</label>
                                <div className="input-with-icon">
                                    <span className="input-icon">Rp</span>
                                    <input
                                        type="number"
                                        placeholder="25000"
                                        name="price"
                                        value={productForm.price}
                                        onChange={handleProductChange}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Category *</label>
                                <select
                                    name="category"
                                    value={productForm.category}
                                    onChange={handleProductChange}
                                    required
                                >
                                    <option value="Makanan Utama">Main Course</option>
                                    <option value="Appetizer">Appetizer</option>
                                    <option value="Dessert">Dessert</option>
                                    <option value="Minuman">Beverage</option>
                                    <option value="Paket">Package</option>
                                </select>
                            </div>
                            
                            <div className="form-group full-width">
                                <label>Description *</label>
                                <textarea
                                    placeholder="Detailed description of the menu item..."
                                    name="description"
                                    value={productForm.description}
                                    onChange={handleProductChange}
                                    rows="3"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                {isEditing.id ? '💾 Update Menu' : '➕ Add Menu Item'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={cancelEdit}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Products List */}
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>📋 Menu Items ({filteredProducts.length})</h3>
                    <div className="filters">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search menu items..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="category-filter"
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                        >
                            {categories.map(cat => (
                                <option key={cat} value={cat}>
                                    {cat === 'all' ? 'All Categories' : cat}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="products-table">
                    {filteredProducts.length > 0 ? (
                        <>
                            <div className="table-header">
                                <div className="table-col">Menu Item</div>
                                <div className="table-col">Category</div>
                                <div className="table-col">Price</div>
                                <div className="table-col">Sales</div>
                                <div className="table-col">Rating</div>
                                <div className="table-col">Actions</div>
                            </div>
                            
                            <div className="table-body">
                                {filteredProducts.map(product => (
                                    <div key={product.id} className="table-row">
                                        <div className="table-col">
                                            <div className="product-cell">
                                                <div className="product-avatar">
                                                    {product.name.charAt(0)}
                                                </div>
                                                <div className="product-info">
                                                    <h4>{product.name}</h4>
                                                    <p className="product-desc">{product.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-col">
                                            <span className="category-badge">{product.category}</span>
                                        </div>
                                        <div className="table-col">
                                            <span className="price">{formatRupiah(product.price)}</span>
                                        </div>
                                        <div className="table-col">
                                            <div className="sales-cell">
                                                <span className="sales-count">{product.sales}</span>
                                                <span className="sales-label">sales</span>
                                            </div>
                                        </div>
                                        <div className="table-col">
                                            <div className="rating-cell">
                                                <span className="stars">{"★".repeat(Math.floor(product.rating))}</span>
                                                <span className="rating-value">{product.rating}</span>
                                            </div>
                                        </div>
                                        <div className="table-col">
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-action edit"
                                                    onClick={() => setIsEditing(product)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button 
                                                    className="btn-action delete"
                                                    onClick={() => deleteProduct(product.id)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">🍽️</div>
                            <h3>No menu items found</h3>
                            <p>Try adjusting your search or add a new menu item</p>
                            <button className="btn-primary" onClick={() => setIsEditing({})}>
                                Add Your First Menu
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Inventory Management Component
const InventoryManagement = ({ inventory, products, inventoryForm, handleInventoryChange, addInventory, editInventory, deleteInventory, isEditingInventory, setIsEditingInventory, cancelEditInventory }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');

    const filteredInventory = inventory.filter(item => {
        const product = products.find(p => p.id === item.product_id);
        const matchesSearch = product ? 
            product.name.toLowerCase().includes(searchTerm.toLowerCase()) : false;
        const matchesLocation = locationFilter === 'all' || item.location === locationFilter;
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        return matchesSearch && matchesLocation && matchesStatus;
    });

    const locations = ['all', ...new Set(inventory.map(i => i.location))];
    const statuses = ['all', ...new Set(inventory.map(i => i.status))];

    const getProductName = (productId) => {
        const product = products.find(p => p.id === productId);
        return product ? product.name : 'Unknown Product';
    };

    const getStockStatus = (stock, minStock) => {
        if (stock < minStock) return { label: 'Critical', color: 'danger' };
        if (stock < minStock * 1.5) return { label: 'Low', color: 'warning' };
        return { label: 'Aman', color: 'success' };
    };

    return (
        <div className="admin-main-content">
            <div className="content-header">
                <div className="header-left">
                    <h1>Inventory Management</h1>
                    <p>Track and manage your restaurant inventory stock levels</p>
                </div>
                <button className="btn-primary" onClick={() => !isEditingInventory && setIsEditingInventory({})}>
                    <span>➕ Add Stock</span>
                </button>
            </div>
            
            {/* Add/Edit Form */}
            {isEditingInventory && (
                <div className="form-card slide-in">
                    <div className="form-card-header">
                        <h3>{isEditingInventory.id ? 'Edit Inventory Item' : 'Add New Stock'}</h3>
                        <button className="btn-close" onClick={cancelEditInventory}>✕</button>
                    </div>
                    <form onSubmit={isEditingInventory.id ? editInventory : addInventory}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Product *</label>
                                <select
                                    name="product_id"
                                    value={inventoryForm.product_id}
                                    onChange={handleInventoryChange}
                                    required
                                >
                                    <option value="">Select Product</option>
                                    {products.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Stock Quantity *</label>
                                <input
                                    type="number"
                                    placeholder="Enter stock quantity"
                                    name="stock"
                                    value={inventoryForm.stock}
                                    onChange={handleInventoryChange}
                                    required
                                    min="0"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Minimum Stock *</label>
                                <input
                                    type="number"
                                    placeholder="Enter minimum stock level"
                                    name="min_stock"
                                    value={inventoryForm.min_stock}
                                    onChange={handleInventoryChange}
                                    required
                                    min="0"
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Location *</label>
                                <select
                                    name="location"
                                    value={inventoryForm.location}
                                    onChange={handleInventoryChange}
                                    required
                                >
                                    <option value="Dapur Utama">Main Kitchen</option>
                                    <option value="Dapur Dingin">Cold Storage</option>
                                    <option value="Bar">Bar Area</option>
                                    <option value="Gudang">Storage Room</option>
                                </select>
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                {isEditingInventory.id ? '💾 Update Stock' : '➕ Add Stock'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={cancelEditInventory}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Inventory Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <div className="icon-bg" style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' }}>
                            📦
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3>{inventory.reduce((sum, item) => sum + item.stock, 0)}</h3>
                        <p>Total Stock Items</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">
                        <div className="icon-bg" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            ⚠️
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3>{inventory.filter(item => item.stock < item.min_stock).length}</h3>
                        <p>Critical Items</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">
                        <div className="icon-bg" style={{ background: 'rgba(67, 97, 238, 0.1)', color: '#4361ee' }}>
                            📍
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3>{locations.length - 1}</h3>
                        <p>Storage Locations</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">
                        <div className="icon-bg" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                            🔄
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3>{inventory.filter(item => item.stock < item.min_stock * 1.5).length}</h3>
                        <p>Need Restock</p>
                    </div>
                </div>
            </div>
            
            {/* Inventory List */}
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>📋 Inventory Items ({filteredInventory.length})</h3>
                    <div className="filters">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="category-filter"
                            value={locationFilter}
                            onChange={(e) => setLocationFilter(e.target.value)}
                        >
                            {locations.map(loc => (
                                <option key={loc} value={loc}>
                                    {loc === 'all' ? 'All Locations' : loc}
                                </option>
                            ))}
                        </select>
                        <select 
                            className="category-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {statuses.map(status => (
                                <option key={status} value={status}>
                                    {status === 'all' ? 'All Status' : status}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="products-table">
                    {filteredInventory.length > 0 ? (
                        <>
                            <div className="table-header">
                                <div className="table-col">Product</div>
                                <div className="table-col">Current Stock</div>
                                <div className="table-col">Min Stock</div>
                                <div className="table-col">Status</div>
                                <div className="table-col">Location</div>
                                <div className="table-col">Actions</div>
                            </div>
                            
                            <div className="table-body">
                                {filteredInventory.map(item => {
                                    const status = getStockStatus(item.stock, item.min_stock);
                                    return (
                                        <div key={item.id} className="table-row">
                                            <div className="table-col">
                                                <div className="product-cell">
                                                    <div className="product-avatar">
                                                        {getProductName(item.product_id).charAt(0)}
                                                    </div>
                                                    <div className="product-info">
                                                        <h4>{getProductName(item.product_id)}</h4>
                                                        <p className="product-desc">Product ID: {item.product_id}</p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="table-col">
                                                <span className="stock-value">{item.stock}</span>
                                                <span className="stock-unit">units</span>
                                            </div>
                                            <div className="table-col">
                                                <span className="min-stock">{item.min_stock} units</span>
                                            </div>
                                            <div className="table-col">
                                                <span className={`status-badge ${status.color}`}>
                                                    {status.label}
                                                </span>
                                            </div>
                                            <div className="table-col">
                                                <span className="location-badge">{item.location}</span>
                                            </div>
                                            <div className="table-col">
                                                <div className="action-buttons">
                                                    <button 
                                                        className="btn-action edit"
                                                        onClick={() => setIsEditingInventory(item)}
                                                    >
                                                        ✏️ Edit
                                                    </button>
                                                    <button 
                                                        className="btn-action delete"
                                                        onClick={() => deleteInventory(item.id)}
                                                    >
                                                        🗑️ Delete
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">📦</div>
                            <h3>No inventory items found</h3>
                            <p>Try adjusting your search or add a new inventory item</p>
                            <button className="btn-primary" onClick={() => setIsEditingInventory({})}>
                                Add Your First Stock
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Operational Management Component
const OperationalManagement = ({ operational, operationalForm, handleOperationalChange, addOperational, editOperational, deleteOperational, isEditingOperational, setIsEditingOperational, cancelEditOperational }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [typeFilter, setTypeFilter] = useState('all');
    const [statusFilter, setStatusFilter] = useState('all');
    const [dateFilter, setDateFilter] = useState('all');

    const filteredOperational = operational.filter(item => {
        const matchesSearch = item.activity.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            item.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        
        let matchesDate = true;
        if (dateFilter !== 'all') {
            const today = new Date();
            const itemDate = new Date(item.date);
            
            switch (dateFilter) {
                case 'today':
                    matchesDate = itemDate.toDateString() === today.toDateString();
                    break;
                case 'week':
                    const weekAgo = new Date();
                    weekAgo.setDate(today.getDate() - 7);
                    matchesDate = itemDate >= weekAgo;
                    break;
                case 'month':
                    const monthAgo = new Date();
                    monthAgo.setDate(today.getDate() - 30);
                    matchesDate = itemDate >= monthAgo;
                    break;
            }
        }
        
        return matchesSearch && matchesType && matchesStatus && matchesDate;
    });

    const types = ['all', ...new Set(operational.map(o => o.type))];
    const statuses = ['all', ...new Set(operational.map(o => o.status))];
    const dateFilters = ['all', 'today', 'week', 'month'];

    const totalCost = filteredOperational.reduce((sum, item) => sum + item.cost, 0);

    return (
        <div className="admin-main-content">
            <div className="content-header">
                <div className="header-left">
                    <h1>Operational Costs</h1>
                    <p>Manage and track your restaurant operational expenses</p>
                </div>
                <button className="btn-primary" onClick={() => !isEditingOperational && setIsEditingOperational({})}>
                    <span>➕ Add Expense</span>
                </button>
            </div>
            
            {/* Add/Edit Form */}
            {isEditingOperational && (
                <div className="form-card slide-in">
                    <div className="form-card-header">
                        <h3>{isEditingOperational.id ? 'Edit Operational Cost' : 'Add New Expense'}</h3>
                        <button className="btn-close" onClick={cancelEditOperational}>✕</button>
                    </div>
                    <form onSubmit={isEditingOperational.id ? editOperational : addOperational}>
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Activity *</label>
                                <input
                                    type="text"
                                    placeholder="Enter activity name"
                                    name="activity"
                                    value={operationalForm.activity}
                                    onChange={handleOperationalChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Cost (IDR) *</label>
                                <div className="input-with-icon">
                                    <span className="input-icon">Rp</span>
                                    <input
                                        type="number"
                                        placeholder="250000"
                                        name="cost"
                                        value={operationalForm.cost}
                                        onChange={handleOperationalChange}
                                        required
                                        min="0"
                                    />
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label>Type *</label>
                                <select
                                    name="type"
                                    value={operationalForm.type}
                                    onChange={handleOperationalChange}
                                    required
                                >
                                    <option value="Bahan Baku">Raw Materials</option>
                                    <option value="Gaji">Salary</option>
                                    <option value="Maintenance">Maintenance</option>
                                    <option value="Utilities">Utilities</option>
                                    <option value="Marketing">Marketing</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                            
                            <div className="form-group">
                                <label>Date *</label>
                                <input
                                    type="date"
                                    name="date"
                                    value={operationalForm.date}
                                    onChange={handleOperationalChange}
                                    required
                                />
                            </div>
                            
                            <div className="form-group">
                                <label>Status *</label>
                                <select
                                    name="status"
                                    value={operationalForm.status}
                                    onChange={handleOperationalChange}
                                    required
                                >
                                    <option value="Pending">Pending</option>
                                    <option value="Completed">Completed</option>
                                    <option value="Cancelled">Cancelled</option>
                                </select>
                            </div>
                            
                            <div className="form-group full-width">
                                <label>Description *</label>
                                <textarea
                                    placeholder="Detailed description of the expense..."
                                    name="description"
                                    value={operationalForm.description}
                                    onChange={handleOperationalChange}
                                    rows="3"
                                    required
                                />
                            </div>
                        </div>
                        
                        <div className="form-actions">
                            <button type="submit" className="btn-primary">
                                {isEditingOperational.id ? '💾 Update Expense' : '➕ Add Expense'}
                            </button>
                            <button type="button" className="btn-secondary" onClick={cancelEditOperational}>
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}
            
            {/* Operational Stats */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-icon">
                        <div className="icon-bg" style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444' }}>
                            💰
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3>{formatRupiah(totalCost)}</h3>
                        <p>Total Expenses</p>
                        <div className="stat-trend">
                            Filtered total
                        </div>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">
                        <div className="icon-bg" style={{ background: 'rgba(74, 222, 128, 0.1)', color: '#4ade80' }}>
                            ✅
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3>{filteredOperational.filter(o => o.status === 'Completed').length}</h3>
                        <p>Completed Expenses</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">
                        <div className="icon-bg" style={{ background: 'rgba(245, 158, 11, 0.1)', color: '#f59e0b' }}>
                            ⏳
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3>{filteredOperational.filter(o => o.status === 'Pending').length}</h3>
                        <p>Pending Expenses</p>
                    </div>
                </div>
                
                <div className="stat-card">
                    <div className="stat-icon">
                        <div className="icon-bg" style={{ background: 'rgba(67, 97, 238, 0.1)', color: '#4361ee' }}>
                            📊
                        </div>
                    </div>
                    <div className="stat-content">
                        <h3>{filteredOperational.length}</h3>
                        <p>Total Records</p>
                    </div>
                </div>
            </div>
            
            {/* Operational List */}
            <div className="dashboard-card">
                <div className="card-header">
                    <h3>📋 Operational Costs ({filteredOperational.length})</h3>
                    <div className="filters">
                        <div className="search-box">
                            <span className="search-icon">🔍</span>
                            <input
                                type="text"
                                placeholder="Search operational costs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <select 
                            className="category-filter"
                            value={typeFilter}
                            onChange={(e) => setTypeFilter(e.target.value)}
                        >
                            {types.map(type => (
                                <option key={type} value={type}>
                                    {type === 'all' ? 'All Types' : type}
                                </option>
                            ))}
                        </select>
                        <select 
                            className="category-filter"
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            {statuses.map(status => (
                                <option key={status} value={status}>
                                    {status === 'all' ? 'All Status' : status}
                                </option>
                            ))}
                        </select>
                        <select 
                            className="category-filter"
                            value={dateFilter}
                            onChange={(e) => setDateFilter(e.target.value)}
                        >
                            {dateFilters.map(date => (
                                <option key={date} value={date}>
                                    {date === 'all' ? 'All Dates' : 
                                     date === 'today' ? 'Today' :
                                     date === 'week' ? 'This Week' : 'This Month'}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                
                <div className="products-table">
                    {filteredOperational.length > 0 ? (
                        <>
                            <div className="table-header">
                                <div className="table-col">Activity</div>
                                <div className="table-col">Type</div>
                                <div className="table-col">Date</div>
                                <div className="table-col">Status</div>
                                <div className="table-col">Cost</div>
                                <div className="table-col">Actions</div>
                            </div>
                            
                            <div className="table-body">
                                {filteredOperational.map(item => (
                                    <div key={item.id} className="table-row">
                                        <div className="table-col">
                                            <div className="product-cell">
                                                <div className="product-avatar" style={{
                                                    background: item.type === 'Gaji' ? 'linear-gradient(135deg, #4ade80, #16a34a)' :
                                                               item.type === 'Maintenance' ? 'linear-gradient(135deg, #f59e0b, #d97706)' :
                                                               'linear-gradient(135deg, #4361ee, #3a0ca3)'
                                                }}>
                                                    {item.type === 'Gaji' ? '💵' : 
                                                     item.type === 'Maintenance' ? '🔧' : '📦'}
                                                </div>
                                                <div className="product-info">
                                                    <h4>{item.activity}</h4>
                                                    <p className="product-desc">{item.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="table-col">
                                            <span className={`type-badge ${item.type.toLowerCase().replace(' ', '-')}`}>
                                                {item.type}
                                            </span>
                                        </div>
                                        <div className="table-col">
                                            <span className="date-value">{item.date}</span>
                                        </div>
                                        <div className="table-col">
                                            <span className={`status-badge ${item.status.toLowerCase()}`}>
                                                {item.status}
                                            </span>
                                        </div>
                                        <div className="table-col">
                                            <span className="cost-value" style={{ color: '#ef4444' }}>
                                                {formatRupiah(item.cost)}
                                            </span>
                                        </div>
                                        <div className="table-col">
                                            <div className="action-buttons">
                                                <button 
                                                    className="btn-action edit"
                                                    onClick={() => setIsEditingOperational(item)}
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button 
                                                    className="btn-action delete"
                                                    onClick={() => deleteOperational(item.id)}
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="empty-state">
                            <div className="empty-icon">💰</div>
                            <h3>No operational costs found</h3>
                            <p>Try adjusting your search or add a new expense</p>
                            <button className="btn-primary" onClick={() => setIsEditingOperational({})}>
                                Add Your First Expense
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

// Main App Component
function App() {
    const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
    const [activeTab, setActiveTab] = useState('dashboard');
    
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
        id: '',
        product_id: '',
        stock: '',
        min_stock: '',
        location: 'Dapur Utama',
        status: 'Aman'
    });

    const [operationalForm, setOperationalForm] = useState({
        id: '',
        date: new Date().toISOString().split('T')[0],
        activity: '',
        description: '',
        cost: '',
        type: 'Bahan Baku',
        status: 'Pending'
    });

    const [isEditing, setIsEditing] = useState(false);
    const [isEditingInventory, setIsEditingInventory] = useState(false);
    const [isEditingOperational, setIsEditingOperational] = useState(false);

    const handleAdminLogin = () => {
        setIsAdminLoggedIn(true);
    };

    const handleAdminLogout = () => {
        setIsAdminLoggedIn(false);
        setActiveTab('dashboard');
    };

    const handleProductChange = (e) => {
        const { name, value } = e.target;
        setProductForm(prev => ({ ...prev, [name]: value }));
    };

    const handleInventoryChange = (e) => {
        const { name, value } = e.target;
        setInventoryForm(prev => ({ ...prev, [name]: value }));
    };

    const handleOperationalChange = (e) => {
        const { name, value } = e.target;
        setOperationalForm(prev => ({ ...prev, [name]: value }));
    };

    useEffect(() => {
        const totalOperationalCost = operational.reduce((sum, op) => sum + op.cost, 0);
        
        const estimatedSales = inventory.reduce((sum, item) => {
            const product = products.find(p => p.id === item.product_id);
            return product ? sum + (product.price * item.stock) : sum;
        }, 0);
        
        const estimatedRevenue = estimatedSales - totalOperationalCost;

        setStats({
            totalProducts: products.length,
            totalInventory: inventory.length,
            totalOperational: operational.length,
            totalOperationalCost,
            totalRevenue: estimatedRevenue > 0 ? estimatedRevenue : 0
        });
    }, [products, inventory, operational]);

    // Product CRUD operations
    const addProduct = (e) => {
        e.preventDefault(); 
        if (!productForm.name || !productForm.price) {
            alert('Menu name and price are required!');
            return;
        }
        const newProduct = {
            id: Date.now(),
            name: productForm.name,
            description: productForm.description,
            price: parseInt(productForm.price),
            category: productForm.category,
            sales: 0,
            rating: 0
        };
        setProducts(prev => [...prev, newProduct]);
        setProductForm({ id: '', name: '', description: '', price: '', category: 'Makanan Utama' });
        setIsEditing(false);
        alert('✅ Menu item added successfully!');
    };

    const editProduct = (e) => {
        e.preventDefault();
        if (!productForm.name || !productForm.price) {
            alert('Menu name and price are required!');
            return;
        }
        setProducts(prev => prev.map(product => 
            product.id === productForm.id 
                ? { ...productForm, price: parseInt(productForm.price) }
                : product
        ));
        setProductForm({ id: '', name: '', description: '', price: '', category: 'Makanan Utama' });
        setIsEditing(false);
        alert('✅ Menu item updated successfully!');
    };

    const deleteProduct = (id) => {
        if (window.confirm('Are you sure you want to delete this menu item?')) {
            setProducts(prev => prev.filter(product => product.id !== id));
            alert('✅ Menu item deleted successfully!');
        }
    };

    const cancelEdit = () => {
        setProductForm({ id: '', name: '', description: '', price: '', category: 'Makanan Utama' });
        setIsEditing(false);
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

    // Inventory CRUD operations
    const addInventory = (e) => {
        e.preventDefault(); 
        if (!inventoryForm.product_id || !inventoryForm.stock) {
            alert('Product and stock quantity are required!');
            return;
        }
        const newInventory = {
            id: Date.now(),
            product_id: parseInt(inventoryForm.product_id),
            stock: parseInt(inventoryForm.stock),
            min_stock: parseInt(inventoryForm.min_stock) || 10,
            location: inventoryForm.location,
            status: 'Aman'
        };
        setInventory(prev => [...prev, newInventory]);
        setInventoryForm({ id: '', product_id: '', stock: '', min_stock: '', location: 'Dapur Utama', status: 'Aman' });
        setIsEditingInventory(false);
        alert('✅ Stock added successfully!');
    };

    const editInventory = (e) => {
        e.preventDefault();
        if (!inventoryForm.product_id || !inventoryForm.stock) {
            alert('Product and stock quantity are required!');
            return;
        }
        setInventory(prev => prev.map(item => 
            item.id === inventoryForm.id 
                ? { 
                    ...inventoryForm, 
                    product_id: parseInt(inventoryForm.product_id),
                    stock: parseInt(inventoryForm.stock),
                    min_stock: parseInt(inventoryForm.min_stock)
                }
                : item
        ));
        setInventoryForm({ id: '', product_id: '', stock: '', min_stock: '', location: 'Dapur Utama', status: 'Aman' });
        setIsEditingInventory(false);
        alert('✅ Stock updated successfully!');
    };

    const deleteInventory = (id) => {
        if (window.confirm('Are you sure you want to delete this inventory item?')) {
            setInventory(prev => prev.filter(item => item.id !== id));
            alert('✅ Inventory item deleted successfully!');
        }
    };

    const cancelEditInventory = () => {
        setInventoryForm({ id: '', product_id: '', stock: '', min_stock: '', location: 'Dapur Utama', status: 'Aman' });
        setIsEditingInventory(false);
    };

    const handleSetEditingInventory = (item) => {
        setInventoryForm({
            id: item.id,
            product_id: item.product_id,
            stock: item.stock,
            min_stock: item.min_stock,
            location: item.location,
            status: item.status
        });
        setIsEditingInventory(true);
    };

    // Operational CRUD operations
    const addOperational = (e) => {
        e.preventDefault(); 
        if (!operationalForm.activity || !operationalForm.cost) {
            alert('Activity and cost are required!');
            return;
        }
        const newOperational = {
            id: Date.now(),
            date: operationalForm.date,
            activity: operationalForm.activity,
            description: operationalForm.description,
            cost: parseInt(operationalForm.cost),
            type: operationalForm.type,
            status: operationalForm.status
        };
        setOperational(prev => [...prev, newOperational]);
        setOperationalForm({
            id: '',
            date: new Date().toISOString().split('T')[0],
            activity: '',
            description: '',
            cost: '',
            type: 'Bahan Baku',
            status: 'Pending'
        });
        setIsEditingOperational(false);
        alert('✅ Expense added successfully!');
    };

    const editOperational = (e) => {
        e.preventDefault();
        if (!operationalForm.activity || !operationalForm.cost) {
            alert('Activity and cost are required!');
            return;
        }
        setOperational(prev => prev.map(item => 
            item.id === operationalForm.id 
                ? { 
                    ...operationalForm, 
                    cost: parseInt(operationalForm.cost)
                }
                : item
        ));
        setOperationalForm({
            id: '',
            date: new Date().toISOString().split('T')[0],
            activity: '',
            description: '',
            cost: '',
            type: 'Bahan Baku',
            status: 'Pending'
        });
        setIsEditingOperational(false);
        alert('✅ Expense updated successfully!');
    };

    const deleteOperational = (id) => {
        if (window.confirm('Are you sure you want to delete this expense?')) {
            setOperational(prev => prev.filter(item => item.id !== id));
            alert('✅ Expense deleted successfully!');
        }
    };

    const cancelEditOperational = () => {
        setOperationalForm({
            id: '',
            date: new Date().toISOString().split('T')[0],
            activity: '',
            description: '',
            cost: '',
            type: 'Bahan Baku',
            status: 'Pending'
        });
        setIsEditingOperational(false);
    };

    const handleSetEditingOperational = (item) => {
        setOperationalForm({
            id: item.id,
            date: item.date,
            activity: item.activity,
            description: item.description,
            cost: item.cost,
            type: item.type,
            status: item.status
        });
        setIsEditingOperational(true);
    };

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard stats={stats} products={products} inventory={inventory} operational={operational} />;
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
                        inventory={inventory}
                        products={products}
                        inventoryForm={inventoryForm}
                        handleInventoryChange={handleInventoryChange}
                        addInventory={addInventory}
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
            default:
                return <Dashboard stats={stats} products={products} inventory={inventory} operational={operational} />;
        }
    };

    if (!isAdminLoggedIn) {
        return <AdminLogin onLogin={handleAdminLogin} />;
    }

    return (
        <div className="App">
            <AdminSidebar 
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                handleLogout={handleAdminLogout}
            />
            {renderContent()}
        </div>
    );
}

export default App;