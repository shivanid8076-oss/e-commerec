import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../utils/api';
import '../styles/Collection.css';

const SAMPLE_PRODUCTS = [
  {
    id: 'harit-darbar-mata-rani-dress',
    slug: 'harit-darbar-mata-rani-dress',
    title: 'Harit Darbar Mata Rani Dress',
    price: 630,
    salePrice: 598.50,
    badge: 'Bestseller',
    image: 'https://www.devastram.com/cdn/shop/files/B3C172E1-B9E7-4FFE-A6A8-EAADB5E5A4C2.png?v=1780632086&width=990',
  },
  {
    id: 'kamakhya-mata-rani-dress',
    slug: 'kamakhya-mata-rani-dress',
    title: 'Kamakhya Mata Rani Dress',
    price: 750,
    salePrice: 699,
    badge: 'New In',
    image: 'https://www.devastram.com/cdn/shop/files/B3C172E1-B9E7-4FFE-A6A8-EAADB5E5A4C2.png?v=1780632086&width=990',
  },
  {
    id: 'sarveshvari-mata-rani-dress',
    slug: 'sarveshvari-mata-rani-dress',
    title: 'Sarveshvari Mata Rani Dress',
    price: 890,
    salePrice: 799,
    badge: 'LUXE',
    image: 'https://www.devastram.com/cdn/shop/files/IMG_0026.jpg?v=1772875667&width=990',
  },
  {
    id: 'mahagauri-mata-rani-dress',
    slug: 'mahagauri-mata-rani-dress',
    title: 'Mahagauri Mata Rani Dress',
    price: 680,
    salePrice: 598,
    badge: 'Bestseller',
    image: 'https://www.devastram.com/cdn/shop/files/IMG_0067.jpg?v=1772875666&width=990',
  },
  {
    id: 'aadishakti-mata-rani-dress',
    slug: 'aadishakti-mata-rani-dress',
    title: 'Aadishakti Mata Rani Dress',
    price: 950,
    salePrice: 849,
    badge: 'LUXE',
    image: 'https://www.devastram.com/cdn/shop/files/Mata_cff6945e-5a1e-4007-9f58-b9ffeee3fec1.jpg?v=1775557899&width=990',
  },
  {
    id: 'shailputri-mata-rani-dress',
    slug: 'shailputri-mata-rani-dress',
    title: 'Shailputri Mata Rani Dress',
    price: 720,
    salePrice: 649,
    badge: 'New In',
    image: 'https://www.devastram.com/cdn/shop/files/B3C172E1-B9E7-4FFE-A6A8-EAADB5E5A4C2.png?v=1780632086&width=990',
  },
];

const badgeCls = (b) => b === 'LUXE' ? 'luxe' : b === 'New In' ? 'new' : 'bestseller';

const colorHexMap = {
  'Blue': '#5e7b99',
  'Green': '#6b7a5a',
  'Orange': '#cc7a52',
  'Pink': '#c77d88',
  'Red': '#a64444',
  'White': '#fdfaf6',
  'Yellow': '#d9a05b',
};

const Collection = () => {
  const { slug } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Advanced Features State
  const [gridCols, setGridCols] = useState(4);
  const [expandedFilters, setExpandedFilters] = useState({
    color: true,
    size: true,
    availability: false
  });
  
  const [activeSize, setActiveSize] = useState('All');
  const [activeColor, setActiveColor] = useState('');

  const toggleFilter = (key) => {
    setExpandedFilters(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const title = slug
    ? slug.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')
    : 'All Collections';

  const descText = slug && slug.includes('laddu-gopal')
    ? 'Premium designer dresses for Laddu Gopal Ji. Handcrafted with devotion, intricate embroidery, and luxurious fabrics for divine shringar.'
    : slug && slug.includes('mata-rani')
    ? 'Exquisite poshak and lehengas for Mata Rani. Designed with rich zari work and timeless elegance for divine celebrations.'
    : 'Discover our premium handcrafted collection of devotional wear. Experience the perfect blend of tradition, luxury, and devotion.';

  useEffect(() => {
    // Scroll to top on navigation
    window.scrollTo(0, 0);
    
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        if (res.data && res.data.success) {
          let dbProducts = res.data.products;
          // Filter by slug (category) if slug exists and is not 'all'
          if (slug && slug !== 'all' && slug !== 'newin-bestsellers') {
            const searchSlug = slug.toLowerCase();
            const filtered = dbProducts.filter(p => {
              const cat = (p.category || '').toLowerCase();
              return cat === searchSlug || cat.includes(searchSlug) || searchSlug.includes(cat);
            });
            dbProducts = filtered;
          }
          
          const formatted = dbProducts.map(p => ({
            id: p.id,
            slug: p.slug,
            title: p.title,
            price: p.price,
            salePrice: p.compare || p.price,
            badge: p.category === 'bestsellers' ? 'Bestseller' : 'New In',
            image: p.images?.[0] || 'https://via.placeholder.com/400'
          }));
          
          setProducts(formatted.length > 0 ? formatted : SAMPLE_PRODUCTS);
        }
      } catch (err) {
        console.error('Error fetching collection products:', err);
        setProducts(SAMPLE_PRODUCTS);
      } finally {
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, [slug]);

  return (
    <div className="collection-page">
      {/* Earthy Elegant Hero Header */}
      <div className="c-hero">
        <div className="c-hero-left">
          <div className="c-breadcrumb">
            <Link to="/">Home</Link>
            <span>/</span>
            <span>Collections</span>
            <span>/</span>
            <span style={{ color: 'var(--c-accent)' }}>{title}</span>
          </div>
          <h1 className="c-title">{title}</h1>
        </div>
        <div className="c-hero-right">
          <p className="c-desc">
            {descText}
          </p>
        </div>
      </div>

      <div className="c-layout">
        {/* Sidebar Filters */}
        <aside className="c-sidebar">
          {/* Elegant Size Pill Toggles */}
          <div className={`c-filter-group ${expandedFilters.size ? 'expanded' : ''}`}>
            <div className="c-filter-title" onClick={() => toggleFilter('size')}>
              Filter by Size <span className="c-filter-icon">{expandedFilters.size ? '−' : '+'}</span>
            </div>
            <div className="c-filter-content">
              <div className="c-filter-pills">
                {['All', '0 no', '1 no', '2 no', '3 no', '4 no', '5 no', '6 no'].map(size => (
                  <div 
                    key={size} 
                    className={`c-pill ${activeSize === size ? 'active' : ''}`}
                    onClick={() => setActiveSize(size)}
                  >
                    {size}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Earthy Color Swatches Filter */}
          <div className={`c-filter-group ${expandedFilters.color ? 'expanded' : ''}`}>
            <div className="c-filter-title" onClick={() => toggleFilter('color')}>
              Color Palette <span className="c-filter-icon">{expandedFilters.color ? '−' : '+'}</span>
            </div>
            <div className="c-filter-content">
              <div className="c-filter-swatches">
                {Object.keys(colorHexMap).map(color => (
                  <div 
                    key={color} 
                    className={`c-swatch-wrap ${activeColor === color ? 'active' : ''}`} 
                    title={color}
                    onClick={() => setActiveColor(activeColor === color ? '' : color)}
                  >
                    <div className="c-swatch" style={{ backgroundColor: colorHexMap[color] }}></div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Availability Filter */}
          <div className={`c-filter-group ${expandedFilters.availability ? 'expanded' : ''}`}>
            <div className="c-filter-title" onClick={() => toggleFilter('availability')}>
              Availability <span className="c-filter-icon">{expandedFilters.availability ? '−' : '+'}</span>
            </div>
            <div className="c-filter-content">
              <div className="c-filter-list">
                <label className="c-filter-item"><input type="checkbox" defaultChecked /> In Stock</label>
                <label className="c-filter-item"><input type="checkbox" /> Out of Stock</label>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Product Grid */}
        <main className="c-main">
          <div className="c-toolbar">
            <div className="c-count">{products.length} Designs found</div>
            
            <div className="c-toolbar-actions">
              {/* Grid View Toggles */}
              <div className="c-grid-toggles">
                <button className={`c-grid-btn ${gridCols === 3 ? 'active' : ''}`} onClick={() => setGridCols(3)} title="3 Items per row">
                  <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M3 3h4v18H3V3zm7 0h4v18h-4V3zm7 0h4v18h-4V3z"/></svg>
                </button>
                <button className={`c-grid-btn ${gridCols === 4 ? 'active' : ''}`} onClick={() => setGridCols(4)} title="4 Items per row">
                  <svg viewBox="0 0 24 24" width="22" height="22"><path fill="currentColor" d="M2 3h3v18H2V3zm5 0h3v18H7V3zm5 0h3v18h-3V3zm5 0h3v18h-3V3z"/></svg>
                </button>
              </div>

              {/* Advanced Sorting */}
              <div className="c-sort">
                Sort by:
                <select className="c-custom-select">
                  <option>Featured Collection</option>
                  <option>Best Selling</option>
                  <option>Alphabetically, A-Z</option>
                  <option>Price, low to high</option>
                  <option>Price, high to low</option>
                  <option>Newest Arrivals</option>
                </select>
              </div>
            </div>
          </div>

          <div className={`c-grid c-grid-${gridCols}`}>
            {loading ? (
              <div style={{padding: '50px', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--c-text-muted)', fontSize: '1.2rem', fontFamily: 'var(--c-font-display)'}}>Curating the collection...</div>
            ) : products.length === 0 ? (
              <div style={{padding: '50px', textAlign: 'center', gridColumn: '1 / -1', color: 'var(--c-text-muted)'}}>No pieces found in this collection.</div>
            ) : (
              products.map((p, i) => (
                <Link key={i} to={`/product/${p.slug}`} className="c-prod-card">
                  <div className="c-prod-img">
                    {p.badge && <span className={`c-prod-badge ${badgeCls(p.badge)}`}>{p.badge}</span>}
                    <img src={p.image} alt={p.title} />
                    {/* Minimal Quick Add Hover Button */}
                    <button className="c-quick-add" onClick={(e) => { 
                      e.preventDefault(); 
                      alert(`Added ${p.title} to bag.`); 
                    }}>Quick Add</button>
                  </div>
                  <div className="c-prod-info">
                    <div className="c-prod-title">{p.title}</div>
                    <div className="c-prod-price">
                      ₹{(p.salePrice || p.price).toLocaleString('en-IN')}
                      {p.price > (p.salePrice || p.price) && <span className="orig">₹{p.price.toLocaleString('en-IN')}</span>}
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Collection;
