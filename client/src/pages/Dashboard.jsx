// ============================================
// Dashboard Page (Protected)
// Interactive tabbed dashboard for both users & admins
// ============================================

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import AddProductTab from '../components/AddProductTab';
import InventoryTab from '../components/InventoryTab';
import AdminOrdersTab from '../components/AdminOrdersTab';
import StoreSettingsTab from '../components/StoreSettingsTab';
import CustomersTab from '../components/CustomersTab';
import OverviewTab from '../components/OverviewTab';
import CouponsTab from '../components/CouponsTab';
import AdminReviewsTab from '../components/AdminReviewsTab';
import '../styles/Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  
  // Dark / Light Mode State
  const [isDarkMode, setIsDarkMode] = useState(true);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const isAdmin = user?.role === 'ADMIN';

  const tabs = isAdmin
    ? [
      { id: 'overview', label: 'Overview', icon: '📊' },
      { id: 'add', label: 'Add Product', icon: '➕' },
      { id: 'inventory', label: 'Inventory', icon: '📋' },
      { id: 'admin-orders', label: 'Orders', icon: '🛍️' },
      { id: 'customers', label: 'Customers', icon: '👥' },
      { id: 'coupons', label: 'Coupons', icon: '🎟️' },
      { id: 'reviews', label: 'Reviews', icon: '⭐' },
      { id: 'store-settings', label: 'Store Settings', icon: '🎨' },
    ]
    : [
      { id: 'overview', label: 'Overview', icon: '📊' },
      { id: 'orders', label: 'My Orders', icon: '📦' },
      { id: 'wishlist', label: 'Wishlist', icon: '❤️' },
      { id: 'addresses', label: 'Addresses', icon: '📍' },
      { id: 'settings', label: 'Settings', icon: '⚙️' },
    ];

  return (
    <main className={`dashboard ${isDarkMode ? 'dark-mode' : 'light-mode'}`} id="dashboard-page">
      <div className="dashboard-layout">
        {/* Pro Sidebar Navigation */}
        <aside className="dashboard-sidebar">
          <div className="sidebar-profile">
            <div className="sidebar-avatar">
              {user?.username?.charAt(0)?.toUpperCase() || 'U'}
            </div>
            <div className="sidebar-info">
              <h3>{user?.username}</h3>
              <span className="sidebar-role-badge">{user?.role}</span>
            </div>
          </div>

          <nav className="sidebar-nav">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                className={`sidebar-nav-item ${activeTab === tab.id ? 'active' : ''}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="nav-icon">{tab.icon}</span>
                <span className="nav-label">{tab.label}</span>
              </button>
            ))}
          </nav>

          {!isAdmin && (
            <a href="http://localhost:5000/" className="sidebar-cta store-cta">
              <span>🛍️</span> Visit Store
            </a>
          )}
        </aside>

        {/* Main Content Area */}
        <section className="dashboard-main">
          {/* Welcome Banner */}
          <div className="dashboard-welcome-banner">
            <div>
              <h1>
                Welcome back, <span className="accent-text">{user?.username}</span> 👋
              </h1>
              <p>
                {isAdmin
                  ? 'Here is what is happening with your store today.'
                  : 'Track your orders, manage your wishlist, and update your account details.'}
              </p>
            </div>
            {isAdmin && (
              <div className="dashboard-actions">
                <button 
                  className="pro-btn pro-btn-secondary" 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  title="Toggle Dark/Light Mode"
                >
                  {isDarkMode ? '☀️ Light Mode' : '🌙 Dark Mode'}
                </button>
                <button className="pro-btn pro-btn-primary" onClick={() => setActiveTab('add')}>➕ Add Product</button>
              </div>
            )}
          </div>

          {/* Tab Content */}
          <div className="tab-content" key={activeTab}>
            {activeTab === 'overview' && <OverviewTab user={user} formatDate={formatDate} isAdmin={isAdmin} />}
            {activeTab === 'add' && <AddProductTab />}
            {activeTab === 'inventory' && <InventoryTab />}
            {activeTab === 'admin-orders' && <AdminOrdersTab />}
            { activeTab === 'customers' && <CustomersTab />}
            { activeTab === 'coupons' && <CouponsTab />}
            { activeTab === 'reviews' && <AdminReviewsTab />}
            { activeTab === 'store-settings' && <StoreSettingsTab />}
            {activeTab === 'orders' && <OrdersTab />}
            {activeTab === 'wishlist' && <WishlistTab />}
            {activeTab === 'addresses' && <AddressesTab />}
            {activeTab === 'settings' && <SettingsTab user={user} formatDate={formatDate} />}
          </div>
        </section>
      </div>
    </main>
  );
};

// ===================== TAB COMPONENTS =====================



// User Tabs placeholders...
const OrdersTab = () => (
  <div className="tab-panel">
    <div className="empty-state">
      <div className="empty-icon">🛒</div>
      <h3>No orders yet</h3>
      <p>When you place your first order, it will appear here with tracking details.</p>
      <a href="http://localhost:5000/" className="pro-btn pro-btn-primary" style={{marginTop: '20px'}}>
        Start Shopping
      </a>
    </div>
  </div>
);

const WishlistTab = () => (
  <div className="tab-panel">
    <div className="empty-state">
      <div className="empty-icon">✨</div>
      <h3>Your wishlist is empty</h3>
      <p>Browse our collections and tap the heart icon to save items you love.</p>
    </div>
  </div>
);

const AddressesTab = () => (
  <div className="tab-panel">
    <div className="empty-state">
      <div className="empty-icon">🏠</div>
      <h3>No addresses saved</h3>
      <p>Add a delivery address for faster checkout.</p>
    </div>
  </div>
);

const SettingsTab = ({ user }) => (
  <div className="tab-panel">
    <div className="empty-state">
      <div className="empty-icon">⚙️</div>
      <h3>Settings</h3>
      <p>User settings page.</p>
    </div>
  </div>
);

export default Dashboard;
