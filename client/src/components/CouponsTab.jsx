import { useState, useEffect } from 'react';
import api from '../utils/api';

const CouponsTab = () => {
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'PERCENTAGE',
    discountValue: '',
    minOrderValue: '',
    maxDiscount: '',
    usageLimit: '',
    expiryDate: ''
  });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/coupons');
      if (data.success) {
        setCoupons(data.coupons);
      }
    } catch (error) {
      console.error('Error fetching coupons:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/coupons', formData);
      if (data.success) {
        setShowForm(false);
        setFormData({
          code: '', discountType: 'PERCENTAGE', discountValue: '',
          minOrderValue: '', maxDiscount: '', usageLimit: '', expiryDate: ''
        });
        fetchCoupons();
      }
    } catch (error) {
      console.error('Error creating coupon:', error);
      alert(error.response?.data?.message || 'Failed to create coupon');
    }
  };

  const toggleStatus = async (id, currentStatus) => {
    try {
      await api.patch(`/coupons/${id}/status`, { isActive: !currentStatus });
      fetchCoupons();
    } catch (error) {
      console.error('Error toggling coupon:', error);
    }
  };

  const deleteCoupon = async (id) => {
    if (!window.confirm('Are you sure you want to delete this coupon?')) return;
    try {
      await api.delete(`/coupons/${id}`);
      fetchCoupons();
    } catch (error) {
      console.error('Error deleting coupon:', error);
    }
  };

  return (
    <div className="tab-panel animate-fade-in">
      <div className="tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <div>
          <h2>Discount Coupons</h2>
          <p style={{ color: 'var(--text-muted)' }}>Create and manage promo codes for your store.</p>
        </div>
        <button className="pro-btn pro-btn-primary" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '➕ Create Coupon'}
        </button>
      </div>

      {showForm && (
        <div className="pro-card" style={{ marginBottom: '20px' }}>
          <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
            <div className="form-group">
              <label>Coupon Code *</label>
              <input type="text" name="code" className="pro-input" value={formData.code} onChange={handleChange} required placeholder="e.g. SUMMER50" style={{textTransform: 'uppercase'}}/>
            </div>
            <div className="form-group">
              <label>Discount Type *</label>
              <select name="discountType" className="pro-input" value={formData.discountType} onChange={handleChange}>
                <option value="PERCENTAGE">Percentage (%)</option>
                <option value="FLAT">Flat Amount (₹)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Discount Value *</label>
              <input type="number" name="discountValue" className="pro-input" value={formData.discountValue} onChange={handleChange} required placeholder={formData.discountType === 'FLAT' ? '₹ amount' : '% percentage'}/>
            </div>
            <div className="form-group">
              <label>Minimum Order Value (Optional)</label>
              <input type="number" name="minOrderValue" className="pro-input" value={formData.minOrderValue} onChange={handleChange} placeholder="e.g. 999"/>
            </div>
            {formData.discountType === 'PERCENTAGE' && (
              <div className="form-group">
                <label>Max Discount Amount (Optional)</label>
                <input type="number" name="maxDiscount" className="pro-input" value={formData.maxDiscount} onChange={handleChange} placeholder="e.g. 500"/>
              </div>
            )}
            <div className="form-group">
              <label>Usage Limit (Optional)</label>
              <input type="number" name="usageLimit" className="pro-input" value={formData.usageLimit} onChange={handleChange} placeholder="Total times it can be used"/>
            </div>
            <div className="form-group">
              <label>Expiry Date (Optional)</label>
              <input type="date" name="expiryDate" className="pro-input" value={formData.expiryDate} onChange={handleChange}/>
            </div>
            <div className="form-group" style={{ gridColumn: '1 / -1', marginTop: '10px' }}>
              <button type="submit" className="pro-btn pro-btn-primary" style={{width: '100%'}}>Save Coupon</button>
            </div>
          </form>
        </div>
      )}

      <div className="pro-card">
        {loading ? (
          <p>Loading coupons...</p>
        ) : coupons.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">🎟️</div>
            <h3>No coupons found</h3>
            <p>You haven't created any discount codes yet.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>CODE</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>DISCOUNT</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>LIMIT/USED</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>STATUS</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {coupons.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 'bold', color: 'var(--accent-color)' }}>{c.code}</td>
                    <td style={{ padding: '12px 10px' }}>
                      {c.discountType === 'FLAT' ? `₹${c.discountValue}` : `${c.discountValue}%`}
                      {c.minOrderValue && <span style={{display:'block', fontSize:'0.75rem', color: 'var(--text-muted)'}}>Min: ₹{c.minOrderValue}</span>}
                    </td>
                    <td style={{ padding: '12px 10px' }}>{c.usedCount} / {c.usageLimit || '∞'}</td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                        background: c.isActive ? 'var(--color-success-bg)' : 'var(--color-error-bg)',
                        color: c.isActive ? 'var(--color-success)' : 'var(--color-error)'
                      }}>
                        {c.isActive ? 'ACTIVE' : 'INACTIVE'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <button onClick={() => toggleStatus(c.id, c.isActive)} className="pro-btn pro-btn-secondary" style={{padding: '4px 8px', fontSize: '0.8rem', marginRight: '5px'}}>
                        {c.isActive ? 'Disable' : 'Enable'}
                      </button>
                      <button onClick={() => deleteCoupon(c.id)} className="pro-btn" style={{padding: '4px 8px', fontSize: '0.8rem', background: 'var(--color-error-bg)', color: 'var(--color-error)', border: 'none'}}>
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default CouponsTab;
