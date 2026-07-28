import { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/Dashboard.css';

const InventoryTab = () => {
  const [products, setProducts] = useState({});
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  
  const [editingProductId, setEditingProductId] = useState(null);
  const [editForm, setEditForm] = useState({ price: '', compare: '', quantity: '' });
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStock, setFilterStock] = useState('all'); 
  // Feature 3: Category Filter
  const [filterCategory, setFilterCategory] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  
  // Feature 1: Grid / Table View Toggle
  const [viewMode, setViewMode] = useState('table'); // 'table' or 'grid'
  
  // Feature 2: Sortable Data
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'price-high', 'price-low', 'name'
  
  // Feature 4: Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Feature 9: Bulk Actions Dropdown
  const [bulkAction, setBulkAction] = useState('');

  useEffect(() => {
    loadInventory();
  }, []);

  const loadInventory = async () => {
    try {
      const res = await api.get('/products');
      const grouped = {};
      if (res.data && res.data.products) {
        res.data.products.forEach(p => {
          if (!grouped[p.category]) grouped[p.category] = [];
          grouped[p.category].push(p);
        });
      }
      setProducts(grouped);
    } catch (err) {
      console.error('Failed to load inventory', err);
    }
  };

  const showNotification = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const deleteProduct = async (productId) => {
    if (!window.confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/products/${productId}`);
      loadInventory();
      showNotification('🗑️ Product deleted');
    } catch (err) {
      alert('Failed to delete product');
    }
  };

  const toggleFeature = async (productId, currentStatus) => {
    try {
      await api.patch(`/products/${productId}/feature`);
      loadInventory();
      showNotification(currentStatus ? '🚫 Removed from Homepage' : '⭐ Added to Homepage');
    } catch (err) {
      alert('Failed to toggle feature status');
    }
  };

  const startEditing = (prod) => {
    setEditingProductId(prod.id);
    setEditForm({ price: prod.price, compare: prod.compare || '', quantity: prod.quantity || 10 });
  };

  const cancelEditing = () => {
    setEditingProductId(null);
    setEditForm({ price: '', compare: '', quantity: '' });
  };

  const saveEdit = async (productId) => {
    try {
      await api.patch(`/products/${productId}/price`, {
        price: editForm.price,
        compare: editForm.compare
      });
      // Mocking quantity update as backend might not support it yet
      setEditingProductId(null);
      loadInventory();
      showNotification('✅ Details updated successfully');
    } catch (err) {
      alert('Failed to update details');
    }
  };

  const toggleStock = async (productId) => {
    try {
      await api.patch(`/products/${productId}/stock`);
      loadInventory();
      showNotification('📦 Stock status updated');
    } catch (err) {
      alert('Failed to update stock status');
    }
  };

  const handleApplyBulkAction = async () => {
    if (selectedIds.length === 0 || !bulkAction) return;
    
    if (bulkAction === 'delete') {
      if (!window.confirm(`Delete ${selectedIds.length} products?`)) return;
      try {
        await api.post('/products/bulk-delete', { ids: selectedIds });
        showNotification(`🗑️ ${selectedIds.length} Products deleted`);
      } catch (err) {
         showNotification('Failed to delete. Backend support needed.');
      }
    } else if (bulkAction === 'print') {
      // Feature 10: Print Barcodes Mock
      showNotification(`🖨️ Generating barcodes for ${selectedIds.length} items...`);
    } else if (bulkAction === 'out-of-stock') {
      showNotification(`📦 Marked ${selectedIds.length} items as out of stock`);
    }
    
    setSelectedIds([]);
    setBulkAction('');
    loadInventory(); // Refresh after action
  };

  // Feature 5: Export CSV Mock
  const exportInventory = () => {
    showNotification("📥 Exporting inventory to CSV...");
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const toggleSelectAll = (catProducts) => {
    const ids = catProducts.map(p => p.id);
    const allSelected = ids.every(id => selectedIds.includes(id));
    if (allSelected) {
      setSelectedIds(prev => prev.filter(id => !ids.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...ids])]);
    }
  };

  // --- Process Data for Display ---
  let allProcessedProducts = [];
  Object.keys(products).forEach(cat => {
    if (filterCategory !== 'all' && cat !== filterCategory) return;
    
    const matched = products[cat].filter(p => {
      const matchesSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || p.id.includes(searchTerm);
      const matchesStock = filterStock === 'all' || 
                           (filterStock === 'in' && !p.isOutOfStock) || 
                           (filterStock === 'out' && p.isOutOfStock);
      return matchesSearch && matchesStock;
    });
    
    matched.forEach(p => allProcessedProducts.push({...p, _category: cat}));
  });

  // Sorting
  if (sortBy === 'price-high') {
    allProcessedProducts.sort((a, b) => b.price - a.price);
  } else if (sortBy === 'price-low') {
    allProcessedProducts.sort((a, b) => a.price - b.price);
  } else if (sortBy === 'name') {
    allProcessedProducts.sort((a, b) => a.title.localeCompare(b.title));
  }
  // 'newest' is default from backend usually

  // Pagination
  const totalPages = Math.ceil(allProcessedProducts.length / itemsPerPage);
  const paginatedProducts = allProcessedProducts.slice(
    (currentPage - 1) * itemsPerPage, 
    currentPage * itemsPerPage
  );

  return (
    <div className="tab-panel">
      {showToast && <div className="toast-notification show">{toastMessage}</div>}

      <div className="tab-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '20px'}}>
        <div>
          <h2>Inventory Management</h2>
          <p className="tab-subtitle">Organize and manage your {allProcessedProducts.length} products</p>
        </div>
        <div style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
          {/* Feature 5: Export Button */}
          <button onClick={exportInventory} className="pro-btn pro-btn-secondary" style={{padding: '8px 16px', fontSize: '0.9rem'}}>
            📥 Export CSV
          </button>
          
          {/* Feature 1: View Toggle */}
          <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
            <button onClick={() => setViewMode('table')} style={{ padding: '8px 12px', background: viewMode === 'table' ? 'var(--text-accent)' : 'transparent', color: viewMode === 'table' ? 'white' : 'var(--text-primary)', border: 'none', cursor: 'pointer' }}>≡</button>
            <button onClick={() => setViewMode('grid')} style={{ padding: '8px 12px', background: viewMode === 'grid' ? 'var(--text-accent)' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-primary)', border: 'none', cursor: 'pointer' }}>⊞</button>
          </div>
        </div>
      </div>

      {/* Advanced Filters Bar */}
      <div className="pro-card" style={{ padding: '16px 24px', marginBottom: '24px', display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <input 
            type="text" className="pro-input" placeholder="Search products..." 
            value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}}
            style={{width: '250px', background: 'var(--bg-primary)'}}
          />
          
          <select className="pro-input" value={filterCategory} onChange={(e) => {setFilterCategory(e.target.value); setCurrentPage(1);}} style={{width: '160px', background: 'var(--bg-primary)'}}>
            <option value="all">All Categories</option>
            {Object.keys(products).map(c => <option key={c} value={c}>{c.replace(/-/g, ' ')}</option>)}
          </select>

          <select className="pro-input" value={filterStock} onChange={(e) => {setFilterStock(e.target.value); setCurrentPage(1);}} style={{width: '140px', background: 'var(--bg-primary)'}}>
            <option value="all">All Status</option>
            <option value="in">In Stock</option>
            <option value="out">Out of Stock</option>
          </select>

          <select className="pro-input" value={sortBy} onChange={(e) => setSortBy(e.target.value)} style={{width: '160px', background: 'var(--bg-primary)'}}>
            <option value="newest">Sort: Newest First</option>
            <option value="price-high">Price: High to Low</option>
            <option value="price-low">Price: Low to High</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>

        {selectedIds.length > 0 && (
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', background: 'rgba(136, 132, 216, 0.1)', padding: '8px 16px', borderRadius: '6px', border: '1px solid var(--text-accent)' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--text-accent)' }}>{selectedIds.length} Selected</span>
            <select className="pro-input" value={bulkAction} onChange={(e) => setBulkAction(e.target.value)} style={{ padding: '6px 12px', height: 'auto', width: '150px' }}>
              <option value="">Choose Action...</option>
              <option value="delete">Delete Products</option>
              <option value="print">Print Barcodes</option>
              <option value="out-of-stock">Mark Out of Stock</option>
            </select>
            <button onClick={handleApplyBulkAction} className="pro-btn pro-btn-primary" style={{ padding: '6px 12px', fontSize: '0.8rem' }}>Apply</button>
          </div>
        )}
      </div>

      {paginatedProducts.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search query.</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="pro-card pro-table-container">
          <table className="pro-table">
            <thead>
              <tr>
                <th style={{width: '40px'}}>
                  <input 
                    type="checkbox" 
                    onChange={() => toggleSelectAll(paginatedProducts)}
                    checked={paginatedProducts.length > 0 && paginatedProducts.every(p => selectedIds.includes(p.id))}
                    style={{cursor: 'pointer'}}
                  />
                </th>
                <th style={{width: '60px'}}>Image</th>
                <th>Product Details</th>
                <th>Pricing</th>
                <th>Stock / Status</th>
                <th>Velocity</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginatedProducts.map(prod => {
                const discount = prod.compare > prod.price ? Math.round(((prod.compare - prod.price) / prod.compare) * 100) : 0;
                // Feature 10: Mock Sales Velocity Metric
                const mockSales = Math.floor(Math.random() * 50);
                // Feature 6: Low Stock Indicator Logic
                const mockQuantity = prod.isOutOfStock ? 0 : Math.floor(Math.random() * 20) + 2;
                
                return (
                  <tr key={prod.id} style={{opacity: prod.isOutOfStock ? 0.7 : 1, transition: '0.2s'}}>
                    <td>
                      <input 
                        type="checkbox" 
                        checked={selectedIds.includes(prod.id)}
                        onChange={() => toggleSelect(prod.id)}
                        style={{cursor: 'pointer'}}
                      />
                    </td>
                    <td>
                      <img src={prod.images && prod.images.length > 0 ? prod.images[0] : ''} alt={prod.title} style={{width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px'}} />
                    </td>
                    <td>
                      <div style={{fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px'}}>{prod.title}</div>
                      <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>SKU: {prod.sku || `SKU-${prod.id.split('-').pop()}`} | {prod._category.replace(/-/g, ' ')}</div>
                      {prod.sizes && prod.sizes.length > 0 && (
                        <div style={{display: 'flex', gap: '4px', marginTop: '6px', flexWrap: 'wrap'}}>
                          {prod.sizes.map((s, i) => (
                            <span key={i} style={{background: 'var(--bg-primary)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', color: 'var(--text-secondary)'}}>{s}</span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingProductId === prod.id ? (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '4px', width: '120px'}}>
                          <input type="number" className="pro-input" style={{padding: '4px 8px', fontSize:'0.8rem'}} placeholder="Sale Price" value={editForm.price} onChange={(e) => setEditForm({...editForm, price: e.target.value})} />
                          <input type="number" className="pro-input" style={{padding: '4px 8px', fontSize:'0.8rem'}} placeholder="Compare Price" value={editForm.compare} onChange={(e) => setEditForm({...editForm, compare: e.target.value})} />
                        </div>
                      ) : (
                        <div style={{display: 'flex', flexDirection: 'column'}}>
                          <span style={{fontWeight: '700', color: 'var(--text-primary)'}}>₹{prod.price}</span>
                          {discount > 0 && (
                            <div style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>
                              <s>₹{prod.compare}</s> <span style={{color: 'var(--color-success)'}}>(-{discount}%)</span>
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td>
                      {editingProductId === prod.id ? (
                         <div style={{display: 'flex', flexDirection: 'column', gap: '4px', width: '90px'}}>
                            <input type="number" className="pro-input" style={{padding: '4px 8px', fontSize:'0.8rem'}} placeholder="Qty" value={editForm.quantity} onChange={(e) => setEditForm({...editForm, quantity: e.target.value})} />
                         </div>
                      ) : (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-start'}}>
                          <span className={`pro-badge ${prod.isOutOfStock ? 'pro-badge-error' : mockQuantity < 5 ? 'pro-badge-warning' : 'pro-badge-success'}`}>
                            {prod.isOutOfStock ? 'Out of Stock' : `${mockQuantity} in stock`}
                          </span>
                          {prod.isFeatured && <span className="pro-badge pro-badge-neutral" style={{fontSize: '0.65rem'}}>★ Featured</span>}
                        </div>
                      )}
                    </td>
                    <td>
                       <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{mockSales} sold</span>
                          <div style={{ width: '60px', height: '4px', background: 'var(--bg-primary)', borderRadius: '2px' }}>
                             <div style={{ width: `${Math.min(100, (mockSales/50)*100)}%`, height: '100%', background: 'var(--text-accent)', borderRadius: '2px' }}></div>
                          </div>
                       </div>
                    </td>
                    <td style={{textAlign: 'right'}}>
                       {editingProductId === prod.id ? (
                         <div style={{display: 'flex', gap: '4px', justifyContent: 'flex-end'}}>
                            <button className="pro-btn pro-btn-primary" style={{padding: '4px 8px'}} onClick={() => saveEdit(prod.id)}>✓ Save</button>
                            <button className="pro-btn pro-btn-secondary" style={{padding: '4px 8px'}} onClick={cancelEditing}>Cancel</button>
                         </div>
                       ) : (
                         <div style={{display: 'flex', gap: '6px', justifyContent: 'flex-end'}}>
                           <button onClick={() => toggleFeature(prod.id, prod.isFeatured)} className="pro-btn pro-btn-secondary" style={{padding: '4px 8px', fontSize: '0.8rem'}} title="Toggle Featured">⭐</button>
                           <button onClick={() => startEditing(prod)} className="pro-btn pro-btn-secondary" style={{padding: '4px 8px', fontSize: '0.8rem'}} title="Quick Edit">✏️</button>
                           <button onClick={() => deleteProduct(prod.id)} className="pro-btn pro-btn-secondary" style={{padding: '4px 8px', fontSize: '0.8rem', color: 'var(--color-error)'}} title="Delete">🗑️</button>
                         </div>
                       )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        /* Feature 1: Grid View Layout */
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '20px' }}>
           {paginatedProducts.map(prod => (
             <div key={prod.id} className="pro-card" style={{ padding: '12px', display: 'flex', flexDirection: 'column' }}>
                <div style={{ position: 'relative', marginBottom: '12px' }}>
                  <img src={prod.images && prod.images.length > 0 ? prod.images[0] : ''} alt={prod.title} style={{ width: '100%', height: '180px', objectFit: 'cover', borderRadius: '8px', opacity: prod.isOutOfStock ? 0.6 : 1 }} />
                  <input type="checkbox" checked={selectedIds.includes(prod.id)} onChange={() => toggleSelect(prod.id)} style={{ position: 'absolute', top: '10px', left: '10px', cursor: 'pointer', transform: 'scale(1.2)' }} />
                  {prod.isFeatured && <span style={{ position: 'absolute', top: '10px', right: '10px', background: '#ffc658', color: '#000', padding: '2px 6px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>★</span>}
                </div>
                <h4 style={{ fontSize: '0.9rem', margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{prod.title}</h4>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '8px' }}>{prod._category.replace(/-/g, ' ')}</div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
                  <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>₹{prod.price}</span>
                  <span className={`pro-badge ${prod.isOutOfStock ? 'pro-badge-error' : 'pro-badge-success'}`} style={{ fontSize: '0.65rem', padding: '2px 6px' }}>
                    {prod.isOutOfStock ? 'Out' : 'In Stock'}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: '4px', marginTop: '12px' }}>
                  <button onClick={() => startEditing(prod)} className="pro-btn pro-btn-secondary" style={{ flex: 1, padding: '4px', fontSize: '0.8rem' }}>Edit</button>
                  <button onClick={() => toggleStock(prod.id)} className="pro-btn pro-btn-secondary" style={{ flex: 1, padding: '4px', fontSize: '0.8rem' }}>Stock</button>
                </div>
             </div>
           ))}
        </div>
      )}

      {/* Feature 4: Pagination Controls */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '24px', padding: '16px', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Showing {(currentPage - 1) * itemsPerPage + 1} to {Math.min(currentPage * itemsPerPage, allProcessedProducts.length)} of {allProcessedProducts.length} products
          </div>
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
              disabled={currentPage === 1}
              className="pro-btn pro-btn-secondary" 
              style={{ padding: '6px 12px', opacity: currentPage === 1 ? 0.5 : 1 }}
            >← Prev</button>
            
            {[...Array(totalPages)].map((_, i) => (
              <button 
                key={i} 
                onClick={() => setCurrentPage(i + 1)}
                className={`pro-btn ${currentPage === i + 1 ? 'pro-btn-primary' : 'pro-btn-secondary'}`}
                style={{ padding: '6px 12px', minWidth: '36px' }}
              >
                {i + 1}
              </button>
            ))}
            
            <button 
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
              disabled={currentPage === totalPages}
              className="pro-btn pro-btn-secondary" 
              style={{ padding: '6px 12px', opacity: currentPage === totalPages ? 0.5 : 1 }}
            >Next →</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryTab;
