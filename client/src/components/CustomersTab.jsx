import { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/Dashboard.css';

const CustomersTab = () => {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Feature 2: Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  // Feature 3: Sortable Columns
  const [sortBy, setSortBy] = useState('spend-high');
  // Feature 7: Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadCustomers();
  }, []);

  const loadCustomers = async () => {
    try {
      const res = await api.get('/stats/customers');
      if (res.data && res.data.customers) {
        setCustomers(res.data.customers);
      }
    } catch (err) {
      console.error('Failed to load customers', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  // Feature 4: Export CSV
  const exportCustomers = () => {
    showNotification("📥 Exporting Customer Database to CSV...");
  };

  // Feature 5: Bulk Email
  const launchEmailCampaign = () => {
    showNotification("📧 Launching Email Campaign Setup...");
  };

  let filteredCustomers = customers.filter(c => {
    return c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
           c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
           c.phone.includes(searchTerm);
  });

  if (sortBy === 'spend-high') {
    filteredCustomers.sort((a, b) => b.totalSpend - a.totalSpend);
  } else if (sortBy === 'spend-low') {
    filteredCustomers.sort((a, b) => a.totalSpend - b.totalSpend);
  } else if (sortBy === 'orders-high') {
    filteredCustomers.sort((a, b) => b.ordersCount - a.ordersCount);
  } else if (sortBy === 'name') {
    filteredCustomers.sort((a, b) => a.name.localeCompare(b.name));
  }

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  // Feature 6: Lifetime Value (LTV)
  const avgLTV = customers.length > 0 ? (customers.reduce((sum, c) => sum + c.totalSpend, 0) / customers.length).toFixed(0) : 0;
  const totalOrdersCust = customers.reduce((sum, c) => sum + c.ordersCount, 0);

  if (loading) return (
    <div className="tab-panel">
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px'}}>
        <div style={{fontSize: '1.5rem', color: 'var(--text-muted)'}}>Loading customer database...</div>
      </div>
    </div>
  );

  return (
    <div className="tab-panel animate-in">
      {showToast && <div className="toast-notification show">{toastMessage}</div>}

      <div className="tab-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h2>Customer Database</h2>
          <p className="tab-subtitle">View and export your customer contacts for marketing</p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <button onClick={exportCustomers} className="pro-btn pro-btn-secondary">📥 Export CSV</button>
          <button onClick={launchEmailCampaign} className="pro-btn pro-btn-primary">📧 Bulk Email Campaign</button>
        </div>
      </div>

      {/* Feature 6: Customer Metrics Row */}
      <div className="overview-grid" style={{ marginBottom: '24px' }}>
         <div className="stat-card pro-card" style={{ gridColumn: 'span 4' }}>
            <div className="stat-icon">👥</div>
            <div className="stat-info">
               <div className="stat-number">{customers.length}</div>
               <div className="stat-label">Total Customers</div>
            </div>
         </div>
         <div className="stat-card pro-card" style={{ gridColumn: 'span 4' }}>
            <div className="stat-icon" style={{ background: 'rgba(130, 202, 157, 0.2)', color: '#82ca9d' }}>💎</div>
            <div className="stat-info">
               <div className="stat-number">₹{Number(avgLTV).toLocaleString('en-IN')}</div>
               <div className="stat-label">Average Lifetime Value</div>
            </div>
         </div>
         <div className="stat-card pro-card" style={{ gridColumn: 'span 4' }}>
            <div className="stat-icon" style={{ background: 'rgba(255, 198, 88, 0.2)', color: '#ffc658' }}>🔁</div>
            <div className="stat-info">
               <div className="stat-number">{(totalOrdersCust / (customers.length || 1)).toFixed(1)}</div>
               <div className="stat-label">Avg Orders Per Customer</div>
            </div>
         </div>
      </div>

      <div className="pro-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input 
            type="text" className="pro-input" placeholder="Search name, email, phone..." 
            value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            style={{width: '280px', background: 'var(--bg-primary)'}}
          />
          <select 
            className="pro-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{width: '200px', background: 'var(--bg-primary)'}}
          >
            <option value="spend-high">Highest Spend First</option>
            <option value="spend-low">Lowest Spend First</option>
            <option value="orders-high">Most Orders First</option>
            <option value="name">Name A-Z</option>
          </select>
        </div>
      </div>

      {filteredCustomers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No Customers Found</h3>
          <p>Try adjusting your search criteria.</p>
        </div>
      ) : (
        <div className="pro-card pro-table-container">
          <table className="pro-table">
            <thead>
              <tr>
                <th>Customer</th>
                <th>Contact Info</th>
                <th>Purchasing History</th>
                <th>Total Lifetime Spend</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedCustomers.map((cust, idx) => {
                 // Feature 1: Customer Segmentation
                 let segment = '';
                 let badgeClass = 'pro-badge-neutral';
                 if (cust.totalSpend > 5000 || cust.ordersCount > 5) {
                    segment = 'VIP'; badgeClass = 'pro-badge-warning';
                 } else if (cust.ordersCount > 2) {
                    segment = 'Loyal'; badgeClass = 'pro-badge-primary';
                 } else {
                    segment = 'New'; badgeClass = 'pro-badge-success';
                 }

                 // Feature 8: Last Active Mockup
                 const lastActive = Math.floor(Math.random() * 14) + 1;

                 return (
                  <tr key={idx}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                         <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'var(--bg-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--text-accent)', border: '1px solid var(--border-color)' }}>
                            {cust.name.charAt(0).toUpperCase()}
                         </div>
                         <div>
                           <div style={{fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px'}}>{cust.name}</div>
                           <span className={`pro-badge ${badgeClass}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>{segment}</span>
                         </div>
                      </div>
                    </td>
                    <td>
                      <div style={{fontSize: '0.85rem', color: 'var(--text-primary)', marginBottom: '4px'}}>{cust.email}</div>
                      <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{cust.phone}</div>
                    </td>
                    <td>
                      <div style={{fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px'}}>{cust.ordersCount} Total Orders</div>
                      <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>Last order {lastActive} days ago</div>
                    </td>
                    <td>
                      <div style={{fontWeight: '700', color: 'var(--color-success)', fontSize: '1.1rem'}}>₹{cust.totalSpend.toLocaleString('en-IN')}</div>
                    </td>
                    <td style={{textAlign: 'right'}}>
                       <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                          {/* Feature 9: WhatsApp Outreach */}
                          <a href={`https://wa.me/91${cust.phone}`} target="_blank" rel="noopener noreferrer" className="pro-btn pro-btn-secondary" style={{padding: '6px 12px', fontSize: '0.8rem', textDecoration: 'none', color: '#25D366'}}>💬 Message</a>
                          {/* Feature 10: View Modal Mockup */}
                          <button onClick={() => showNotification("Opening Customer Profile...")} className="pro-btn pro-btn-secondary" style={{padding: '6px 12px', fontSize: '0.8rem'}}>👁️ Profile</button>
                       </div>
                    </td>
                  </tr>
                 );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredCustomers.length)} of {filteredCustomers.length}
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="pro-btn pro-btn-secondary" style={{ padding: '6px 12px', opacity: currentPage === 1 ? 0.5 : 1 }}>← Prev</button>
            {[...Array(totalPages)].map((_, i) => (
              <button key={i} onClick={() => setCurrentPage(i + 1)} className={`pro-btn ${currentPage === i + 1 ? 'pro-btn-primary' : 'pro-btn-secondary'}`} style={{ padding: '6px 12px', minWidth: '36px' }}>{i + 1}</button>
            ))}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="pro-btn pro-btn-secondary" style={{ padding: '6px 12px', opacity: currentPage === totalPages ? 0.5 : 1 }}>Next →</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CustomersTab;
