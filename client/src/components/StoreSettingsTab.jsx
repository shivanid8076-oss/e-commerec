import { useState, useEffect } from 'react';
import api from '../utils/api';
import '../styles/Dashboard.css';

const StoreSettingsTab = () => {
  const [settings, setSettings] = useState({
    announcement_text: 'Welcome to Vastram - Premium Traditional Wear',
    announcement_active: 'true',
    announcement_bg: '#be185d',
    announcement_color: '#ffffff',
    maintenance_mode: 'false', // Feature 1
    tax_rate: '18', // Feature 2
    shipping_flat_rate: '50', // Feature 3
    shipping_free_threshold: '999',
    meta_title: 'Vastram - Premium Store', // Feature 4
    meta_desc: 'Buy the best premium traditional wear at Vastram.',
    theme_primary: '#be185d', // Feature 5
    theme_secondary: '#1f2937',
    payment_upi: true, // Feature 6
    payment_cod: true,
    payment_cards: false,
    social_insta: 'https://instagram.com/vastram', // Feature 7
    social_fb: '',
    social_wa: '',
    notify_new_order: true, // Feature 8
    notify_low_stock: true,
    policy_returns: '7 Days easy returns on all unworn items.', // Feature 9
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const res = await api.get('/settings');
      if (res.data && res.data.settings) {
        setSettings(prev => ({ ...prev, ...res.data.settings }));
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings({ ...settings, [name]: type === 'checkbox' ? checked : value });
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      // In a real app, we'd loop through keys or send the whole object
      for (const [key, value] of Object.entries(settings)) {
        await api.post('/settings', { key, value: String(value) });
      }
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    } catch (err) {
      alert('Failed to save settings');
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="tab-panel">Loading advanced settings...</div>;

  return (
    <div className="tab-panel animate-in">
      {showToast && (
        <div className="toast-notification show" style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>
          ✅ All settings saved successfully!
        </div>
      )}
      
      <div className="tab-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <div>
          <h2>Advanced Store Settings</h2>
          <p className="tab-subtitle">Configure global storefront preferences, policies, and integrations</p>
        </div>
        <button 
          onClick={handleSaveAll}
          disabled={saving}
          className="pro-btn pro-btn-primary"
          style={{ padding: '12px 24px', fontSize: '1rem', boxShadow: '0 4px 12px rgba(136, 132, 216, 0.3)' }}
        >
          {saving ? '⏳ Saving...' : '💾 Save All Changes'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           
           {/* Feature 1: Maintenance Mode */}
           <div className="pro-card" style={{ padding: '24px', border: settings.maintenance_mode === 'true' ? '2px solid #ff8042' : '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                 <div>
                   <h3 style={{ margin: '0 0 4px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
                     🚧 Maintenance Mode 
                     {settings.maintenance_mode === 'true' && <span className="pro-badge pro-badge-warning">Active</span>}
                   </h3>
                   <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Temporarily take your store offline for updates.</p>
                 </div>
                 <div className="toggle-switch">
                    <input type="checkbox" id="maint-mode" name="maintenance_mode" checked={settings.maintenance_mode === 'true'} onChange={(e) => setSettings({...settings, maintenance_mode: e.target.checked ? 'true' : 'false'})} />
                    <label htmlFor="maint-mode"></label>
                 </div>
              </div>
           </div>

           {/* Feature 10: Advanced Announcement Banner */}
           <div className="pro-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>📢 Announcement Banner</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                 <div>
                   <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold'}}>Banner Status</label>
                   <select name="announcement_active" value={settings.announcement_active} onChange={handleChange} className="pro-input">
                     <option value="true">Visible</option>
                     <option value="false">Hidden</option>
                   </select>
                 </div>
                 <div>
                   <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold'}}>Banner Text</label>
                   <input type="text" name="announcement_text" value={settings.announcement_text} onChange={handleChange} className="pro-input" />
                 </div>
                 <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold'}}>Background Color</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                         <input type="color" name="announcement_bg" value={settings.announcement_bg} onChange={handleChange} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px' }} />
                         <input type="text" name="announcement_bg" value={settings.announcement_bg} onChange={handleChange} className="pro-input" />
                      </div>
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold'}}>Text Color</label>
                      <div style={{ display: 'flex', gap: '8px' }}>
                         <input type="color" name="announcement_color" value={settings.announcement_color} onChange={handleChange} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px' }} />
                         <input type="text" name="announcement_color" value={settings.announcement_color} onChange={handleChange} className="pro-input" />
                      </div>
                    </div>
                 </div>
                 
                 {/* Live Preview */}
                 <div style={{ marginTop: '16px', padding: '12px', background: 'var(--bg-primary)', borderRadius: '8px', border: '1px dashed var(--border-color)' }}>
                   <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '8px' }}>Live Preview:</div>
                   {settings.announcement_active === 'true' ? (
                     <div style={{ background: settings.announcement_bg, color: settings.announcement_color, padding: '10px', textAlign: 'center', fontWeight: 'bold', overflow: 'hidden', borderRadius: '4px' }}>
                       <marquee>{settings.announcement_text}</marquee>
                     </div>
                   ) : (
                     <div style={{ color: 'var(--text-muted)', fontStyle: 'italic', textAlign: 'center' }}>Banner is currently hidden.</div>
                   )}
                 </div>
              </div>
           </div>

           {/* Feature 4: Automated SEO */}
           <div className="pro-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>🔍 Global SEO Configuration</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                 <div>
                   <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold'}}>Global Meta Title</label>
                   <input type="text" name="meta_title" value={settings.meta_title} onChange={handleChange} className="pro-input" />
                 </div>
                 <div>
                   <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold'}}>Global Meta Description</label>
                   <textarea name="meta_desc" value={settings.meta_desc} onChange={handleChange} className="pro-input" style={{ minHeight: '80px' }}></textarea>
                 </div>
              </div>
           </div>

           {/* Feature 9: Store Policies */}
           <div className="pro-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>📜 Store Policies</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                 <div>
                   <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold'}}>Return & Refund Policy</label>
                   <textarea name="policy_returns" value={settings.policy_returns} onChange={handleChange} className="pro-input" style={{ minHeight: '100px' }}></textarea>
                 </div>
                 <button className="pro-btn pro-btn-secondary" style={{ width: 'fit-content' }}>+ Add Terms & Conditions</button>
              </div>
           </div>

        </div>

        {/* Right Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
           
           {/* Feature 3: Advanced Shipping & Feature 2: Tax */}
           <div className="pro-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>🚚 Shipping & Taxes</h3>
              <div style={{ display: 'grid', gap: '16px' }}>
                 <div style={{ display: 'flex', gap: '16px' }}>
                    <div style={{ flex: 1 }}>
                      <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold'}}>Flat Shipping Rate (₹)</label>
                      <input type="number" name="shipping_flat_rate" value={settings.shipping_flat_rate} onChange={handleChange} className="pro-input" />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold'}}>Free Shipping Above (₹)</label>
                      <input type="number" name="shipping_free_threshold" value={settings.shipping_free_threshold} onChange={handleChange} className="pro-input" />
                    </div>
                 </div>
                 <div>
                   <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold'}}>Default Tax Rate (%)</label>
                   <input type="number" name="tax_rate" value={settings.tax_rate} onChange={handleChange} className="pro-input" style={{ width: '50%' }} />
                   <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Applied universally if product-specific tax is not set.</p>
                 </div>
              </div>
           </div>

           {/* Feature 6: Payment Gateway Toggles */}
           <div className="pro-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>💳 Payment Gateways</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" name="payment_upi" checked={settings.payment_upi} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontWeight: 'bold' }}>UPI / QR Code</span>
                    <span className="pro-badge pro-badge-success" style={{ marginLeft: 'auto' }}>Active</span>
                 </label>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" name="payment_cod" checked={settings.payment_cod} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontWeight: 'bold' }}>Cash on Delivery (COD)</span>
                    {settings.payment_cod && <span className="pro-badge pro-badge-success" style={{ marginLeft: 'auto' }}>Active</span>}
                 </label>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '12px', cursor: 'pointer' }}>
                    <input type="checkbox" name="payment_cards" checked={settings.payment_cards} onChange={handleChange} style={{ width: '18px', height: '18px' }} />
                    <span style={{ fontWeight: 'bold' }}>Credit/Debit Cards (Stripe/Razorpay)</span>
                    <span className="pro-badge pro-badge-warning" style={{ marginLeft: 'auto' }}>Needs Setup</span>
                 </label>
              </div>
           </div>

           {/* Feature 5: Theme Customizer */}
           <div className="pro-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>🎨 Brand Identity (Theme)</h3>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                 <div>
                   <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold'}}>Primary Brand Color</label>
                   <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="color" name="theme_primary" value={settings.theme_primary} onChange={handleChange} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px' }} />
                      <input type="text" name="theme_primary" value={settings.theme_primary} onChange={handleChange} className="pro-input" />
                   </div>
                 </div>
                 <div>
                   <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold'}}>Secondary Color</label>
                   <div style={{ display: 'flex', gap: '8px' }}>
                      <input type="color" name="theme_secondary" value={settings.theme_secondary} onChange={handleChange} style={{ width: '40px', height: '40px', padding: 0, border: 'none', borderRadius: '4px' }} />
                      <input type="text" name="theme_secondary" value={settings.theme_secondary} onChange={handleChange} className="pro-input" />
                   </div>
                 </div>
              </div>
           </div>

           {/* Feature 7: Social Media & Feature 8: Notifications */}
           <div className="pro-card" style={{ padding: '24px' }}>
              <h3 style={{ margin: '0 0 16px 0', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>🔗 Integrations</h3>
              
              <div style={{ marginBottom: '20px' }}>
                 <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: 'bold'}}>Instagram URL</label>
                 <input type="text" name="social_insta" value={settings.social_insta} onChange={handleChange} className="pro-input" placeholder="https://instagram.com/yourstore" />
              </div>

              <h4 style={{ margin: '0 0 12px 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Admin Notifications (Email/SMS)</h4>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" name="notify_new_order" checked={settings.notify_new_order} onChange={handleChange} />
                    <span style={{ fontSize: '0.9rem' }}>Notify me when a new order is placed</span>
                 </label>
                 <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input type="checkbox" name="notify_low_stock" checked={settings.notify_low_stock} onChange={handleChange} />
                    <span style={{ fontSize: '0.9rem' }}>Notify me when inventory drops below threshold</span>
                 </label>
              </div>
           </div>

        </div>
      </div>
    </div>
  );
};

export default StoreSettingsTab;
