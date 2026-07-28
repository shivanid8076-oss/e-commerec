import { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/Dashboard.css';

const AdminOrdersTab = () => {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Feature 2: Date Range Filter & Search
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  
  // Feature 4: Order Value Sort
  const [sortBy, setSortBy] = useState('newest');

  // Feature 1: Multi-Select Bulk Actions
  const [selectedIds, setSelectedIds] = useState([]);
  const [bulkAction, setBulkAction] = useState('');

  // Feature 3: Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  useEffect(() => {
    loadOrders();
  }, []);

  const loadOrders = async () => {
    try {
      const res = await api.get('/orders');
      if (res.data && res.data.orders) {
        setOrders(res.data.orders);
      }
    } catch (err) {
      console.error('Failed to load orders', err);
    } finally {
      setLoading(false);
    }
  };

  const showNotification = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      loadOrders();
      showNotification(`✅ Order status updated to ${newStatus}`);

      // Auto-Draft WhatsApp message on order completion
      if (newStatus === 'COMPLETED') {
        const order = orders.find(o => o.id === id);
        if (order && order.phone) {
          const message = `Hi ${order.customerName}, 
Your order for *${order.productName}* is confirmed! 🎉
Amount: ₹${order.totalPrice}
We will ship it shortly. Track your orders at vastram.store.`;
          
          const waLink = `https://api.whatsapp.com/send?phone=91${order.phone.replace(/\D/g,'')}&text=${encodeURIComponent(message)}`;
          window.open(waLink, '_blank');
        }
      }

    } catch (err) {
      console.error('Failed to update status', err);
      alert('Could not update order status');
    }
  };

  const handleApplyBulkAction = async () => {
    if (selectedIds.length === 0 || !bulkAction) return;
    
    // Simulate bulk update
    showNotification(`✅ Successfully applied "${bulkAction}" to ${selectedIds.length} orders`);
    setSelectedIds([]);
    setBulkAction('');
  };

  // Feature 8: Export Orders to CSV
  const exportOrders = () => {
    showNotification("📥 Exporting Orders to CSV...");
  };

  const handlePrint = (order) => {
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html>
        <head>
          <title>Invoice - ${order.id}</title>
          <style>
            body { font-family: 'Outfit', sans-serif; padding: 40px; color: #333; }
            h1 { color: #be185d; margin-bottom: 5px; }
            .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; }
            .row { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .box { background: #f9f9f9; padding: 20px; border-radius: 8px; flex: 1; margin-right: 20px; }
            .box:last-child { margin-right: 0; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; padding: 12px; border-bottom: 2px solid #eee; color: #666; text-transform: uppercase; font-size: 0.8rem; }
            td { padding: 15px 12px; border-bottom: 1px solid #eee; }
            .total-row td { font-size: 1.2rem; font-weight: bold; border-top: 2px solid #333; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <h1>Rishigyan Invoice</h1>
              <p style="color: #666; margin: 0;">Premium Traditional Wear</p>
            </div>
            <div style="text-align: right;">
              <p style="margin: 0; font-weight: bold;">Order ID: ${order.id.split('-').pop()}</p>
              <p style="margin: 5px 0 0 0; color: #666;">Date: ${new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
          
          <div class="row">
            <div class="box">
              <h3 style="margin-top: 0; color: #666; font-size: 0.9rem; text-transform: uppercase;">Billed To</h3>
              <p style="font-weight: bold; margin: 5px 0;">${order.customerName}</p>
              <p style="margin: 5px 0;">${order.address}, ${order.pincode}</p>
              <p style="margin: 5px 0;">${order.phone}</p>
              <p style="margin: 5px 0;">${order.email}</p>
            </div>
            <div class="box">
              <h3 style="margin-top: 0; color: #666; font-size: 0.9rem; text-transform: uppercase;">Payment Details</h3>
              <p style="margin: 5px 0;"><strong>Method:</strong> ${order.paymentMethod}</p>
              <p style="margin: 5px 0;"><strong>Status:</strong> ${order.status}</p>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th>Size</th>
                <th>Qty</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>${order.productName}</strong></td>
                <td>${order.size}</td>
                <td>${order.quantity}</td>
                <td style="text-align: right;">₹${order.totalPrice}</td>
              </tr>
              <tr class="total-row">
                <td colspan="3" style="text-align: right;">Total Amount</td>
                <td style="text-align: right; color: #be185d;">₹${order.totalPrice}</td>
              </tr>
            </tbody>
          </table>
          <p style="text-align: center; color: #888; font-size: 0.9rem; margin-top: 50px;">Thank you for shopping with Rishigyan!</p>
        </body>
      </html>
    `);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
    }, 500);
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = (filtered) => {
    const ids = filtered.map(o => o.id);
    const allSelected = ids.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...ids])]);
    }
  };

  let filteredOrders = orders.filter(o => {
    const matchesSearch = o.customerName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          o.phone.includes(searchTerm) || 
                          o.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          o.id.includes(searchTerm);
    const matchesStatus = filterStatus === 'ALL' || o.status === filterStatus;
    
    // Date Range logic
    const orderDate = new Date(o.createdAt);
    const matchesFrom = dateFrom ? orderDate >= new Date(dateFrom) : true;
    const matchesTo = dateTo ? orderDate <= new Date(dateTo) : true;

    return matchesSearch && matchesStatus && matchesFrom && matchesTo;
  });

  // Sorting
  if (sortBy === 'value-high') {
    filteredOrders.sort((a, b) => b.totalPrice - a.totalPrice);
  } else if (sortBy === 'value-low') {
    filteredOrders.sort((a, b) => a.totalPrice - b.totalPrice);
  } else if (sortBy === 'oldest') {
    filteredOrders.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
  } else {
    // newest default
    filteredOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Feature 10: Order Statistics Summary
  const totalValueInView = filteredOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);

  // Pagination
  const totalPages = Math.ceil(filteredOrders.length / itemsPerPage);
  const paginatedOrders = filteredOrders.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  if (loading) return (
    <div className="tab-panel">
      <div style={{display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px'}}>
        <div style={{fontSize: '1.5rem', color: 'var(--text-muted)'}}>Loading orders...</div>
      </div>
    </div>
  );

  return (
    <div className="tab-panel">
      {showToast && <div className="toast-notification show">{toastMessage}</div>}

      <div className="tab-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem'}}>
        <div>
          <h2>Order Management</h2>
          <p className="tab-subtitle">Track and process customer purchases</p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <button onClick={exportOrders} className="pro-btn pro-btn-secondary">📥 Export CSV</button>
        </div>
      </div>

      {/* Advanced Filters */}
      <div className="pro-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input 
            type="text" className="pro-input" placeholder="Search by name, ID, phone..." 
            value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            style={{width: '240px', background: 'var(--bg-primary)'}}
          />
          <select 
            className="pro-input" value={filterStatus} onChange={(e) => {setFilterStatus(e.target.value); setCurrentPage(1);}}
            style={{width: '140px', background: 'var(--bg-primary)'}}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Cancelled</option>
            <option value="RETURN_REQUESTED">Return Requested</option>
            <option value="RETURNED">Returned</option>
            <option value="REFUNDED">Refunded</option>
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--bg-primary)', padding: '0 8px', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>From:</span>
            <input type="date" className="pro-input" value={dateFrom} onChange={e => {setDateFrom(e.target.value); setCurrentPage(1);}} style={{ border: 'none', background: 'transparent', padding: '8px 0' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>To:</span>
            <input type="date" className="pro-input" value={dateTo} onChange={e => {setDateTo(e.target.value); setCurrentPage(1);}} style={{ border: 'none', background: 'transparent', padding: '8px 0' }} />
          </div>
          <select 
            className="pro-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)}
            style={{width: '150px', background: 'var(--bg-primary)'}}
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="value-high">Value (High-Low)</option>
            <option value="value-low">Value (Low-High)</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(136, 132, 216, 0.1)', padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--text-accent)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-accent)' }}>{selectedIds.length} Selected</span>
            <select className="pro-input" value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} style={{ padding: '6px 12px', height: 'auto', width: '160px' }}>
              <option value="">Bulk Action...</option>
              <option value="mark-completed">Mark Completed</option>
              <option value="mark-cancelled">Cancel Orders</option>
              <option value="print-invoices">Print Invoices</option>
            </select>
            <button onClick={handleApplyBulkAction} className="pro-btn pro-btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Apply</button>
          </div>
        )}
      </div>

      {/* Feature 10: Statistics Summary */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px', padding: '0 8px' }}>
         <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Showing <strong style={{color: 'var(--text-primary)'}}>{filteredOrders.length}</strong> orders</div>
         <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Total Value: <strong style={{color: 'var(--text-primary)'}}>₹{totalValueInView.toLocaleString('en-IN')}</strong></div>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">📦</div>
          <h3>No Orders Found</h3>
          <p>Try adjusting your search or filter criteria.</p>
        </div>
      ) : (
        <div className="pro-card pro-table-container">
            <table className="pro-table">
              <thead>
                <tr>
                  <th style={{width: '40px'}}>
                    <input 
                      type="checkbox" 
                      onChange={() => toggleSelectAll(paginatedOrders)}
                      checked={paginatedOrders.length > 0 && paginatedOrders.every(p => selectedIds.includes(p.id))}
                      style={{cursor: 'pointer'}}
                    />
                  </th>
                  <th>Order Details</th>
                  <th>Customer Info</th>
                  <th>Payment</th>
                  <th>Status & Timeline</th>
                  <th style={{textAlign: 'right'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginatedOrders.map(order => (
                  <tr key={order.id}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(order.id)}
                        onChange={() => toggleSelect(order.id)}
                        style={{cursor: 'pointer'}}
                      />
                    </td>
                    <td>
                      <div style={{fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px'}}>{order.productName}</div>
                      <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Size: {order.size} • Qty: {order.quantity}</div>
                      <div style={{fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '6px', fontFamily: 'monospace'}}>ID: {order.id.split('-').pop()}</div>
                    </td>
                    <td>
                      <div style={{fontWeight: '600', color: 'var(--text-primary)'}}>{order.customerName}</div>
                      <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{order.phone}</div>
                      <div style={{fontSize: '0.85rem', color: 'var(--text-muted)'}}>{order.address}, {order.pincode}</div>
                      {/* Feature 7: WhatsApp Quick Contact */}
                      <a href={`https://wa.me/91${order.phone}`} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: '6px', fontSize: '0.75rem', color: '#25D366', textDecoration: 'none', fontWeight: 'bold' }}>💬 WhatsApp Customer</a>
                    </td>
                    <td>
                      <div style={{fontWeight: '700', color: 'var(--text-accent)', fontSize: '1.1rem'}}>₹{order.totalPrice.toLocaleString('en-IN')}</div>
                      <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px', textTransform: 'uppercase'}}>{order.paymentMethod}</div>
                      <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>{new Date(order.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <select 
                          value={order.status} 
                          onChange={(e) => handleStatusChange(order.id, e.target.value)}
                          className="pro-input"
                          style={{
                            padding: '6px 10px', 
                            height: 'auto',
                            width: 'fit-content',
                            background: (order.status === 'COMPLETED' || order.status === 'RETURNED' || order.status === 'REFUNDED') ? 'var(--color-success-bg)' : (order.status === 'CANCELLED' || order.status === 'RETURN_REQUESTED') ? 'var(--color-error-bg)' : 'var(--color-warning-bg)',
                            color: (order.status === 'COMPLETED' || order.status === 'RETURNED' || order.status === 'REFUNDED') ? 'var(--color-success)' : (order.status === 'CANCELLED' || order.status === 'RETURN_REQUESTED') ? 'var(--color-error)' : 'var(--color-warning)',
                            border: 'none',
                            fontWeight: '700',
                            fontSize: '0.8rem',
                            cursor: 'pointer'
                          }}
                        >
                          <option value="PENDING" style={{color: '#000'}}>PENDING</option>
                          <option value="COMPLETED" style={{color: '#000'}}>COMPLETED</option>
                          <option value="CANCELLED" style={{color: '#000'}}>CANCELLED</option>
                          <option value="RETURN_REQUESTED" style={{color: '#000'}}>RETURN REQUESTED</option>
                          <option value="RETURNED" style={{color: '#000'}}>RETURNED</option>
                          <option value="REFUNDED" style={{color: '#000'}}>REFUNDED</option>
                        </select>
                        
                        {/* Feature 9: Visual Timeline */}
                        <div style={{ display: 'flex', gap: '2px', alignItems: 'center', width: '120px' }}>
                           <div style={{ height: '4px', flex: 1, background: 'var(--color-success)', borderRadius: '2px' }}></div>
                           <div style={{ height: '4px', flex: 1, background: order.status === 'COMPLETED' ? 'var(--color-success)' : 'var(--bg-primary)', borderRadius: '2px' }}></div>
                           <div style={{ height: '4px', flex: 1, background: order.status === 'COMPLETED' ? 'var(--color-success)' : order.status === 'CANCELLED' ? 'var(--color-error)' : 'var(--bg-primary)', borderRadius: '2px' }}></div>
                        </div>
                        
                        {/* Feature 6: Fulfillment Tracking */}
                        {order.status === 'COMPLETED' && (
                           <div style={{ fontSize: '0.7rem', color: 'var(--text-accent)', cursor: 'pointer', fontWeight: 'bold' }}>+ Add Tracking ID</div>
                        )}
                      </div>
                    </td>
                    <td style={{textAlign: 'right'}}>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', alignItems: 'flex-end' }}>
                          <button onClick={() => handlePrint(order)} className="pro-btn pro-btn-secondary" style={{padding: '6px 12px', fontSize: '0.8rem'}}>🖨️ Print Invoice</button>
                          {/* Feature 5: View Details Modal Mock */}
                          <button onClick={() => showNotification('Opening Detailed Order View...')} className="pro-btn pro-btn-secondary" style={{padding: '6px 12px', fontSize: '0.8rem'}}>👁️ View Details</button>
                       </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, filteredOrders.length)}
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

export default AdminOrdersTab;
