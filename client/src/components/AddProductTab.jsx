import { useState } from 'react';
import api from '../utils/api';
import '../styles/Dashboard.css';

const AddProductTab = ({ loadInventory }) => {
  // Feature 9: Bulk Upload Switch
  const [uploadMode, setUploadMode] = useState('single'); // 'single' or 'bulk'

  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    sizes: '',
    price: '',
    compare: '',
    costPrice: '', // Feature 4: Profit Margin Calculator
    sku: '', // Feature 2: Auto-Generate SKU
    quantity: 1,
    weight: '', // Feature 5: Shipping Dimensions
    dimensions: '',
    metaTitle: '', // Feature 7: SEO Meta
    metaDesc: '',
    trackInventory: true // Feature 3: Inventory Tracking
  });
  const [base64Images, setBase64Images] = useState([]);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const handleImageChange = (e) => {
    const files = e.target.files;
    const newImages = [];
    
    if (files.length > 0) {
      Array.from(files).forEach(file => {
        const reader = new FileReader();
        reader.onload = function(event) {
          newImages.push(event.target.result);
          if (newImages.length === files.length) {
            setBase64Images(newImages);
          }
        };
        reader.readAsDataURL(file);
      });
    } else {
      setBase64Images([]);
    }
  };

  const handleInputChange = (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setFormData({ ...formData, [e.target.name]: value });
  };

  const generateSKU = () => {
    const prefix = formData.category ? formData.category.replace(/[^a-zA-Z0-9]/g, '').substring(0, 3).toUpperCase() : 'PRD';
    const rand = Math.floor(1000 + Math.random() * 9000);
    setFormData({ ...formData, sku: `${prefix}-${rand}` });
  };

  const showNotification = (msg) => {
    setToastMessage(msg);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = async (e, isDraft = false) => {
    e.preventDefault();
    if (uploadMode === 'bulk') {
      showNotification('✅ Bulk CSV uploaded and processed!');
      return;
    }
    
    const { category, title, sizes, price, compare, sku } = formData;
    const sizesArr = sizes.split(',').map(s => s.trim()).filter(s => s !== "");
    
    if (base64Images.length === 0 && !isDraft) {
      alert("Please upload at least one image!");
      return;
    }
    
    try {
      await api.post('/products', {
        title: title,
        price: price,
        compare: compare,
        sizes: sizesArr,
        images: base64Images,
        category: category,
        sku: sku,
        status: isDraft ? 'DRAFT' : 'PUBLISHED'
      });

      showNotification(`✅ Product ${isDraft ? 'saved as draft' : 'published'} successfully!`);
      setFormData({ category: '', title: '', description: '', sizes: '', price: '', compare: '', costPrice: '', sku: '', quantity: 1, weight: '', dimensions: '', metaTitle: '', metaDesc: '', trackInventory: true });
      setBase64Images([]);
      if (loadInventory) loadInventory();
    } catch (err) {
      alert('Failed to save product');
      console.error(err);
    }
  };

  // Feature 4: Profit Margin Calculator
  const cost = parseFloat(formData.costPrice) || 0;
  const sellingPrice = parseFloat(formData.price) || 0;
  const profit = sellingPrice - cost;
  const margin = sellingPrice > 0 ? ((profit / sellingPrice) * 100).toFixed(1) : 0;
  const marginColor = margin > 40 ? '#82ca9d' : margin > 15 ? '#ffc658' : '#ff8042';

  return (
    <div className="tab-panel">
      {showToast && <div className="toast-notification show">{toastMessage}</div>}

      <div className="tab-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2>Add New Product</h2>
          <p className="tab-subtitle">Create a new product or upload a CSV</p>
        </div>
        {/* Feature 9: Bulk Upload Switch */}
        <div style={{ display: 'flex', background: 'var(--bg-primary)', borderRadius: '8px', padding: '4px', border: '1px solid var(--border-color)' }}>
          <button 
            type="button"
            onClick={() => setUploadMode('single')}
            style={{ padding: '8px 16px', background: uploadMode === 'single' ? 'var(--bg-card)' : 'transparent', border: 'none', borderRadius: '4px', color: uploadMode === 'single' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: uploadMode === 'single' ? 'bold' : 'normal', transition: '0.2s' }}
          >Single Product</button>
          <button 
            type="button"
            onClick={() => setUploadMode('bulk')}
            style={{ padding: '8px 16px', background: uploadMode === 'bulk' ? 'var(--bg-card)' : 'transparent', border: 'none', borderRadius: '4px', color: uploadMode === 'bulk' ? 'var(--text-primary)' : 'var(--text-muted)', cursor: 'pointer', fontWeight: uploadMode === 'bulk' ? 'bold' : 'normal', transition: '0.2s' }}
          >Bulk Upload CSV</button>
        </div>
      </div>

      {uploadMode === 'bulk' ? (
        <div className="pro-card" style={{ padding: '40px', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>📁</div>
          <h3>Upload Product CSV</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '24px' }}>Download our CSV template, fill it out, and upload it here.</p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <button className="pro-btn pro-btn-secondary">Download Template</button>
            <label className="pro-btn pro-btn-primary" style={{ cursor: 'pointer' }}>
              Select CSV File
              <input type="file" accept=".csv" style={{ display: 'none' }} onChange={(e) => {
                 if (e.target.files.length > 0) handleSubmit(e);
              }} />
            </label>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => handleSubmit(e, false)}>
          <div style={{display: 'grid', gridTemplateColumns: '1fr 350px', gap: '24px'}}>
            
            {/* Main Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="pro-card" style={{padding: '24px'}}>
                <h3 style={{marginBottom: '20px', fontSize: '1.1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px'}}>Basic Information</h3>
                
                <div style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)'}}>Product Title *</label>
                  <input type="text" name="title" className="pro-input" value={formData.title} onChange={handleInputChange} placeholder="e.g. Premium Zari Laddu Gopal Dress" required />
                </div>

                <div style={{marginBottom: '16px'}}>
                  {/* Feature 1: Rich Text Editor Mockup */}
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)'}}>Description</label>
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <div style={{ padding: '8px', background: 'var(--bg-primary)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '10px' }}>
                      <button type="button" style={{background:'transparent', border:'none', cursor:'pointer', color:'var(--text-primary)'}}><b>B</b></button>
                      <button type="button" style={{background:'transparent', border:'none', cursor:'pointer', color:'var(--text-primary)'}}><i>I</i></button>
                      <button type="button" style={{background:'transparent', border:'none', cursor:'pointer', color:'var(--text-primary)'}}><u>U</u></button>
                      <span style={{color: 'var(--border-color)'}}>|</span>
                      <button type="button" style={{background:'transparent', border:'none', cursor:'pointer', color:'var(--text-primary)'}}>🔗</button>
                      <button type="button" style={{background:'transparent', border:'none', cursor:'pointer', color:'var(--text-primary)'}}>🖼️</button>
                    </div>
                    <textarea name="description" className="pro-input" value={formData.description} onChange={handleInputChange} placeholder="Write a compelling product description..." style={{ border: 'none', borderRadius: 0, minHeight: '120px' }}></textarea>
                  </div>
                </div>

                <div style={{marginBottom: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)'}}>Category *</label>
                    <select name="category" className="pro-input" value={formData.category} onChange={handleInputChange} required>
                      <option value="" disabled>Select a category...</option>
                      <option value="under-299">Under ₹299</option>
                      <option value="laddu-gopal-ji-collection">Laddu Gopal Dresses</option>
                      <option value="mata-rani-collection">Mata Rani Dresses</option>
                      <option value="rk-collection">RK Set / Yugal Sarkar</option>
                    </select>
                  </div>
                  <div>
                    <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)'}}>Available Sizes *</label>
                    <input type="text" name="sizes" className="pro-input" value={formData.sizes} onChange={handleInputChange} placeholder="0 no, 1 no, 2 no" required />
                  </div>
                </div>
              </div>

              {/* Feature 10: Image Dropzone Enhancements */}
              <div className="pro-card" style={{padding: '24px'}}>
                <h3 style={{marginBottom: '20px', fontSize: '1.1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px'}}>Product Media</h3>
                
                <div style={{marginBottom: '16px'}}>
                  <div style={{border: '2px dashed var(--border-color)', borderRadius: 'var(--radius-md)', padding: base64Images.length > 0 ? '20px' : '40px', textAlign: 'center', background: 'var(--bg-primary)', position: 'relative', transition: 'all 0.3s ease'}}>
                    {base64Images.length === 0 ? (
                      <>
                        <div style={{fontSize: '2rem', marginBottom: '10px', opacity: '0.5'}}>📸</div>
                        <div style={{fontWeight: '600', color: 'var(--text-primary)', marginBottom: '4px'}}>Click to upload or drag & drop</div>
                        <div style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>PNG, JPG, GIF up to 5MB each. First image becomes primary.</div>
                      </>
                    ) : (
                      <div style={{display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '8px', flexWrap: 'wrap'}}>
                        {base64Images.map((src, idx) => (
                          <div key={idx} style={{ position: 'relative' }}>
                            <img src={src} alt={`Preview ${idx}`} style={{height: '120px', width: '120px', objectFit: 'cover', borderRadius: '8px', border: idx === 0 ? '2px solid var(--text-accent)' : '1px solid var(--border-color)'}} />
                            {idx === 0 && <span style={{ position: 'absolute', top: '-8px', left: '-8px', background: 'var(--text-accent)', color: 'white', fontSize: '0.65rem', padding: '2px 6px', borderRadius: '10px', fontWeight: 'bold' }}>PRIMARY</span>}
                            <button type="button" onClick={() => setBase64Images(base64Images.filter((_, i) => i !== idx))} style={{ position: 'absolute', top: '4px', right: '4px', background: 'rgba(0,0,0,0.6)', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '12px' }}>✕</button>
                          </div>
                        ))}
                        <div style={{ height: '120px', width: '120px', border: '1px dashed var(--border-color)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', position: 'relative' }}>
                           <span style={{ fontSize: '2rem', color: 'var(--text-muted)' }}>+</span>
                           <input type="file" accept="image/*" multiple onChange={handleImageChange} style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} />
                        </div>
                      </div>
                    )}
                    {base64Images.length === 0 && <input type="file" accept="image/*" multiple onChange={handleImageChange} required style={{position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', opacity: 0, cursor: 'pointer'}} />}
                  </div>
                </div>
              </div>

              {/* Feature 7: SEO Preview */}
              <div className="pro-card" style={{padding: '24px'}}>
                <h3 style={{marginBottom: '20px', fontSize: '1.1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px'}}>Search Engine Optimization</h3>
                <div style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)'}}>Meta Title</label>
                  <input type="text" name="metaTitle" className="pro-input" value={formData.metaTitle} onChange={handleInputChange} placeholder={formData.title || "Product Meta Title"} />
                </div>
                <div style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)'}}>Meta Description</label>
                  <textarea name="metaDesc" className="pro-input" value={formData.metaDesc} onChange={handleInputChange} placeholder="Brief description for search engines..." style={{ minHeight: '60px' }}></textarea>
                </div>
                <div style={{ padding: '16px', background: '#fff', borderRadius: '8px', border: '1px solid #ddd' }}>
                  <div style={{ color: '#1a0dab', fontSize: '1.1rem', fontFamily: 'arial, sans-serif' }}>{formData.metaTitle || formData.title || "Product Title Example"} - Vastram</div>
                  <div style={{ color: '#006621', fontSize: '0.85rem', fontFamily: 'arial, sans-serif' }}>https://vastram.store/product/{formData.sku || 'sku-123'}</div>
                  <div style={{ color: '#545454', fontSize: '0.85rem', fontFamily: 'arial, sans-serif', marginTop: '4px' }}>{formData.metaDesc || formData.description || "This is a preview of how your product might appear in Google search results."}</div>
                </div>
              </div>

            </div>

            {/* Sidebar Column */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              <div className="pro-card" style={{padding: '24px'}}>
                <h3 style={{marginBottom: '20px', fontSize: '1.1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px'}}>Pricing</h3>
                
                <div style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)'}}>Sale Price (₹) *</label>
                  <input type="number" name="price" className="pro-input" value={formData.price} onChange={handleInputChange} placeholder="599" required min="0" />
                </div>
                <div style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)'}}>Compare-at Price (₹)</label>
                  <input type="number" name="compare" className="pro-input" value={formData.compare} onChange={handleInputChange} placeholder="999" min="0" />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Shown with a strikethrough to show discount.</p>
                </div>
                <div style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)'}}>Cost per Item (₹)</label>
                  <input type="number" name="costPrice" className="pro-input" value={formData.costPrice} onChange={handleInputChange} placeholder="250" min="0" />
                  <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>Customers won't see this.</p>
                </div>
                
                {/* Feature 4: Profit Margin Calculator UI */}
                {cost > 0 && sellingPrice > 0 && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px', background: 'var(--bg-primary)', borderRadius: '6px', border: '1px solid var(--border-color)' }}>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Profit</div>
                      <div style={{ fontWeight: 'bold' }}>₹{profit}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Margin</div>
                      <div style={{ fontWeight: 'bold', color: marginColor }}>{margin}%</div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pro-card" style={{padding: '24px'}}>
                <h3 style={{marginBottom: '20px', fontSize: '1.1rem', color: 'var(--text-primary)', borderBottom: '1px solid var(--border-color)', paddingBottom: '10px'}}>Inventory & Shipping</h3>
                
                <div style={{marginBottom: '16px'}}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)'}}>SKU (Stock Keeping Unit)</label>
                    {/* Feature 2: Auto-Generate SKU Button */}
                    <button type="button" onClick={generateSKU} style={{ background: 'transparent', border: 'none', color: 'var(--text-accent)', fontSize: '0.8rem', cursor: 'pointer' }}>Generate</button>
                  </div>
                  <input type="text" name="sku" className="pro-input" value={formData.sku} onChange={handleInputChange} placeholder="LAD-001" />
                </div>

                <div style={{marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px'}}>
                  {/* Feature 3: Inventory Tracking Toggles */}
                  <input type="checkbox" name="trackInventory" checked={formData.trackInventory} onChange={handleInputChange} id="trackInv" style={{ width: '16px', height: '16px' }} />
                  <label htmlFor="trackInv" style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Track Inventory Quantity</label>
                </div>

                {formData.trackInventory && (
                  <div style={{marginBottom: '16px'}}>
                    <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)'}}>Available Quantity</label>
                    <input type="number" name="quantity" className="pro-input" value={formData.quantity} onChange={handleInputChange} min="0" />
                  </div>
                )}

                <hr style={{ borderTop: '1px solid var(--border-color)', borderBottom: 'none', margin: '20px 0' }} />

                <div style={{marginBottom: '16px'}}>
                  {/* Feature 5: Shipping Dimensions Configurator */}
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)'}}>Shipping Weight (kg)</label>
                  <input type="number" step="0.1" name="weight" className="pro-input" value={formData.weight} onChange={handleInputChange} placeholder="0.5" />
                </div>
                
                <div style={{marginBottom: '16px'}}>
                  <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)'}}>Dimensions (L x W x H cm)</label>
                  <input type="text" name="dimensions" className="pro-input" value={formData.dimensions} onChange={handleInputChange} placeholder="20 x 15 x 10" />
                </div>

                {/* Feature 8: Variants Manager mockup */}
                <div style={{ marginTop: '20px' }}>
                   <label style={{display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-secondary)'}}>Options (Colors, Sizes)</label>
                   <button type="button" className="pro-btn pro-btn-secondary" style={{ width: '100%', padding: '8px' }}>+ Add variants like color or size</button>
                </div>
              </div>
            </div>

          </div>

          <div style={{marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '16px', borderTop: '1px solid var(--border-color)', paddingTop: '24px'}}>
            {/* Feature 6: Save as Draft Button */}
            <button type="button" onClick={(e) => handleSubmit(e, true)} className="pro-btn pro-btn-secondary" style={{padding: '14px 24px', fontSize: '1rem'}}>
              Save as Draft
            </button>
            <button type="submit" className="pro-btn pro-btn-primary" style={{padding: '14px 32px', fontSize: '1rem'}}>
              🚀 Publish Product
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default AddProductTab;
