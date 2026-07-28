import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../utils/api';
import '../styles/HomePage.css';

const SLIDES = [
  { img: '/images/hero_radha_krishna.png', title: 'The Royal Collection', sub: 'Handcrafted with devotion, designed for divinity.', link: '/collections/luxe-laddu' },
  { img: '/images/hero_mata_rani.png', title: 'Divine Elegance', sub: 'Mata Rani dresses that define pure grace.', link: '/collections/mata-rani' },
  { img: '/images/hero_laddu_gopal.png', title: 'New Arrivals', sub: 'Discover the latest in premium spiritual wear.', link: '/collections/newin-bestsellers' },
];

const CATS = [
  { n: 'Laddu Gopal', i: 'https://www.devastram.com/cdn/shop/files/DB0A19DD-7E35-4F5C-88F9-7C52226AB378.jpg?v=1751863990' },
  { n: 'Radha Rani', i: 'https://www.devastram.com/cdn/shop/files/PinkMataRaniDress.jpg?v=1756825972' },
  { n: 'Mata Rani', i: 'https://www.devastram.com/cdn/shop/files/FE6BCE77-34B3-478A-A993-5EAC22570486.jpg?v=1751863968' },
  { n: 'RK Set', i: 'https://www.devastram.com/cdn/shop/files/Radhe_Krishna_Ram_e4041746-675d-49b6-baa4-bbb16e9325f6.jpg?v=1756492942' },
  { n: 'Necklace', i: 'https://www.devastram.com/cdn/shop/files/Kamalkirti_Necklace.jpg?v=1776858864' },
  { n: 'Kangan', i: 'https://www.devastram.com/cdn/shop/files/Shree_Alankaar_Premium_Kangan.jpg?v=1777635517' },
  { n: 'Bansuri', i: 'https://www.devastram.com/cdn/shop/files/WhatsApp_Image_2026-06-04_at_14.25.15.jpg?v=1780563347' },
  { n: 'Mukut', i: 'https://www.devastram.com/cdn/shop/files/Raj_Tilak_Mukut.png?v=1778578370' },
];

const IMGS = [
  'https://www.devastram.com/cdn/shop/files/Red_Rose_Laddu_Gopal_Dress.jpg?v=1751864208',
  'https://www.devastram.com/cdn/shop/files/Pink_Heavy_Laddu_Gopal_Dress.jpg',
  'https://www.devastram.com/cdn/shop/files/Green_Radhe_Krishna_Dress_c233fcf0-a370-44fb-9024-098bb4848185.jpg?v=1759302045',
  'https://www.devastram.com/cdn/shop/files/Orange_Heavy_Laddu_Gopal_Dress_3_5be24ca8-33b0-4606-bd7c-7b0eda5cf731.jpg?v=1759551169',
  'https://www.devastram.com/cdn/shop/files/DB0A19DD-7E35-4F5C-88F9-7C52226AB378.jpg?v=1751863990',
  'https://www.devastram.com/cdn/shop/files/PinkMataRaniDress.jpg?v=1756825972',
  'https://www.devastram.com/cdn/shop/files/FE6BCE77-34B3-478A-A993-5EAC22570486.jpg?v=1751863968',
  'https://www.devastram.com/cdn/shop/files/Radhe_Krishna_Ram_e4041746-675d-49b6-baa4-bbb16e9325f6.jpg?v=1756492942'
];

const PRODS = [
  { t: 'Harit Darbar Mata Rani Dress', s: 'harit-darbar-mata-rani-dress', p: 598.5, o: 630, b: 'Bestseller', img: 0 },
  { t: 'Kamakhya Mata Rani Dress', s: 'kamakhya-mata-rani-dress', p: 699, o: 750, b: 'New In', img: 1 },
  { t: 'Sarveshvari Mata Rani Dress', s: 'sarveshvari-mata-rani-dress', p: 799, o: 890, b: 'LUXE', img: 2 },
  { t: 'Mahagauri Mata Rani Dress', s: 'mahagauri-mata-rani-dress', p: 598, o: 680, b: 'Bestseller', img: 3 },
  { t: 'Aadishakti Mata Rani Dress', s: 'aadishakti-mata-rani-dress', p: 849, o: 950, b: 'LUXE', img: 4 },
  { t: 'Shailputri Mata Rani Dress', s: 'shailputri-mata-rani-dress', p: 649, o: 720, b: 'New In', img: 5 },
  { t: 'Prem Tarang Laddu Gopal Dress', s: 'harit-darbar-mata-rani-dress', p: 499, o: 599, b: 'Bestseller', img: 6 },
  { t: 'Neelpushpa Laddu Gopal Dress', s: 'kamakhya-mata-rani-dress', p: 549, o: 650, b: 'New In', img: 7 },
  { t: 'Divyaneel Laddu Gopal Dress', s: 'sarveshvari-mata-rani-dress', p: 599, o: 699, b: 'Bestseller', img: 0 },
  { t: 'Swarangini Laddu Gopal Dress', s: 'mahagauri-mata-rani-dress', p: 699, o: 799, b: 'Bestseller', img: 1 },
];

const COLLS = [
  ['Summer Collection', 'Pastel Collection', 'Designer Collection', 'Luxe Collection', 'Bedding Set'],
  ['Summer Collection', 'Pastel Collection', 'Lehenga & Patka', 'Designer Collection', 'Luxe Collection'],
  ['Summer Collection', 'Pastel Collection', 'Designer RK', 'Luxe Collection'],
];

const REVIEWS = [
  { t: "The poshak for my Laddu Gopal is breathtaking. The details and zardosi work are absolutely exquisite! Best I've ever seen.", n: "Aarti S.", l: "Vrindavan, UP" },
  { t: "Such premium quality. The velvet lehenga for Mata Rani is so divine and the packaging felt incredibly special. Highly recommended.", n: "Priya M.", l: "Mumbai, MH" },
  { t: "Absolutely stunning craftsmanship. You can truly feel the devotion woven into every single thread. Fast delivery too.", n: "Rajesh K.", l: "Delhi, NCR" }
];

const badgeCls = (b) => b === 'LUXE' ? 'luxe' : b === 'New In' ? 'new' : 'bestseller';

const TRUST_ITEMS = [
  {
    ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M14.121 14.121L19 19m-7-7l2-2m-3.5-3.5l1.5-1.5m3.5 3.5l1.5-1.5M3 11l4-4m-1 14l-2 2M6.5 17.5L5 19"/></svg>,
    ti: 'Handcrafted by Skilled Artisans',
    de: ''
  },
  {
    ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z"/></svg>,
    ti: 'Premium Quality Fabrics',
    de: ''
  },
  {
    ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>,
    ti: 'Triple Quality Check',
    de: ''
  },
  {
    ic: <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/></svg>,
    ti: 'Secure Packaging & Fast Delivery',
    de: ''
  }
];

// Custom Hook for Scroll Reveal
const useReveal = (dependencies = []) => {
  useEffect(() => {
    let observer;
    const timeout = setTimeout(() => {
      observer = new IntersectionObserver(
        (entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('is-visible');
              observer.unobserve(entry.target);
            }
          });
        },
        { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
      );

      const elements = document.querySelectorAll('.reveal-element:not(.is-visible)');
      elements.forEach(el => observer.observe(el));
    }, 100);

    return () => {
      clearTimeout(timeout);
      if (observer) observer.disconnect();
    };
  }, dependencies);
};

const HomePage = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [slide, setSlide] = useState(0);
  const [dbProducts, setDbProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [activeTab, setActiveTab] = useState('Bestseller');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useReveal([dbProducts, activeTab, loadingProducts]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMobileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const t = setInterval(() => setSlide(p => (p + 1) % SLIDES.length), 6000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await api.get('/products');
        if (res.data && res.data.success) {
          setDbProducts(res.data.products);
        }
      } catch (err) {
        console.error('Error fetching products on home page:', err);
      } finally {
        setLoadingProducts(false);
      }
    };
    fetchProducts();
  }, []);

  const inStockDbProducts = dbProducts.filter(p => !p.isOutOfStock);
  
  // Map DB products
  const mappedDbProducts = inStockDbProducts.map(p => {
    let badge = 'New In';
    if (p.category === 'bestsellers' || p.category === 'laddu-gopal') badge = 'Bestseller';
    if (p.category === 'luxe' || p.category === 'mata-rani') badge = 'LUXE';
    return {
      id: p.id,
      t: p.title,
      s: p.slug,
      p: p.price,
      o: p.compare || p.price,
      b: badge,
      imageSrc: p.images?.[0] || IMGS[0]
    };
  });

  // Map Hardcoded products
  const mappedHardcoded = PRODS.map((p, i) => ({
    ...p, 
    id: `hardcoded-${i}`, 
    imageSrc: IMGS[p.img]
  }));

  // Combine them to always ensure the grid looks full (at least 10 items)
  // Real DB products come first, then padded with hardcoded ones
  const allCombinedProducts = [...mappedDbProducts, ...mappedHardcoded];

  // Filter based on active tab
  const filteredProducts = allCombinedProducts.filter(p => {
    if (activeTab === 'All') return true;
    return p.b === activeTab;
  });

  return (
    <div className="home-page">
      {/* Advanced Aurora Colorful Glowing Background Orbs */}
      <div className="h-bg-glow orb-1"></div>
      <div className="h-bg-glow orb-2"></div>
      <div className="h-bg-glow orb-3"></div>
      <div className="h-bg-glow orb-4"></div>

      {/* Navigation Area Wrapper for Click Outside */}
      <div ref={menuRef}>
        {/* Top Bar */}
        <div className="h-topbar">
          <div className="h-topbar-left">
            <Link to="/" className="h-logo">Vas<span>tram</span></Link>
          </div>
          <div className="h-search">
            <input type="text" placeholder="Search for Laddu Gopal, Mata Rani dresses..." />
            <button className="h-search-btn">🔍</button>
          </div>
          <div className="h-topbar-right">
            {isAuthenticated ? (
              <>
                {user?.role === 'ADMIN' && (
                  <Link to="/dashboard" className="h-top-action">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                    <span>Seller Hub</span>
                  </Link>
                )}
                <Link to="/dashboard" className="h-top-action">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                  <span>Account</span>
                </Link>
                <button onClick={() => logout()} className="h-top-action">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <Link to="/login" className="h-top-action">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path><circle cx="12" cy="7" r="4"></circle></svg>
                <span>Login</span>
              </Link>
            )}
            <button className="h-cart-badge h-top-action">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"></circle><circle cx="20" cy="21" r="1"></circle><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path></svg>
              <span className="h-cart-count">0</span>
            </button>
            <button className="h-mobile-menu-btn" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>
        </div>

        {/* Pink Ribbon Nav */}
        <nav className={`h-ribbon ${isMobileMenuOpen ? 'mobile-open' : ''}`}>
          <div className="h-ribbon-inner">
            <Link to="/" className="h-ribbon-item">New In & Bestsellers</Link>
            <Link to="/" className="h-ribbon-item">Devotees Collection</Link>

            <div className="h-ribbon-item">Luxe Edits <span className="h-ribbon-arrow">▾</span>
              <div className="h-mega">
                <Link to="/collections/luxe-laddu-gopal-dress">Luxe Laddu Gopal Dress</Link>
                <Link to="/collections/luxe-mata-rani-dress">Luxe Mata Rani Dress</Link>
                <Link to="/collections/luxe-rk-dress">Luxe RK Dress</Link>
                <Link to="/collections/luxe-shringar-jewellery">Luxe Shringar Jewellery Set</Link>
                <Link to="/collections/luxe-necklace">Luxe Necklace</Link>
                <Link to="/collections/luxe-mukut">Luxe Mukut</Link>
                <Link to="/collections/luxe-kangan">Luxe Kangan</Link>
                <Link to="/collections/luxe-bansuri">Luxe Bansuri</Link>
              </div>
            </div>

            <div className="h-ribbon-item">Shop By Deity <span className="h-ribbon-arrow">▾</span>
              <div className="h-mega-wide">
                <div><div className="h-mega-title">Laddu Gopal</div><Link to="/collections/soft-pastel-edit">Soft Pastel Edit</Link><Link to="/collections/designer-dresses">Designer Dresses</Link><Link to="/collections/luxe-edit">Luxe Edit</Link><Link to="/collections/summer-collection">Summer Collection</Link><Link to="/collections/woollen-dresses">Woollen Dresses</Link><Link to="/collections/velvet-dresses">Velvet Dresses</Link></div>
                <div><div className="h-mega-title">Mata Rani</div><Link to="/collections/summer-collection">Summer Collection</Link><Link to="/collections/soft-pastel-edit">Soft Pastel Edit</Link><Link to="/collections/lehenga-patka">Lehenga & Patka</Link><Link to="/collections/designer-dresses">Designer Dresses</Link><Link to="/collections/luxe-edit">Luxe Edit</Link><Link to="/collections/velvet-dresses">Velvet Dresses</Link></div>
                <div><div className="h-mega-title">RK / Yugal Sarkar</div><Link to="/collections/summer-collection">Summer Collection</Link><Link to="/collections/soft-pastel-edit">Soft Pastel Edit</Link><Link to="/collections/designer-rk-dresses">Designer RK Dresses</Link><Link to="/collections/luxe-edit">Luxe Edit</Link><Link to="/collections/dhoti-patka">Dhoti & Patka</Link><Link to="/collections/shiv-parivar-dress">Shiv Parivar Dress</Link></div>
              </div>
            </div>

            <div className="h-ribbon-item">Jewellery <span className="h-ribbon-arrow">▾</span>
              <div className="h-mega">
                <Link to="/collections/under-299">Under ₹299</Link>
                <Link to="/collections/daily-wear-mukut">Daily Wear Mukut</Link><Link to="/collections/luxe-mukut">Luxe Mukut</Link>
                <Link to="/collections/daily-wear-necklace">Daily Wear Necklace</Link><Link to="/collections/luxe-necklace">Luxe Necklace</Link>
                <Link to="/collections/designer-bansuri">Designer Bansuri</Link><Link to="/collections/designer-kangan">Designer Kangan</Link>
                <Link to="/collections/earrings">Earrings</Link><Link to="/collections/maang-tika">Maang Tika</Link><Link to="/collections/chandrika">Chandrika</Link>
              </div>
            </div>

            <Link to="/" className="h-ribbon-item">Support</Link>
          </div>
        </nav>
      </div>

      {/* Hero */}
      <div className="h-hero">
        {SLIDES.map((s, i) => (
          <div key={i} className={`h-hero-slide ${slide === i ? 'active' : ''}`}>
            <img src={s.img} alt={`Slide ${i}`} />
            <div className="h-hero-overlay">
              <div className="h-hero-content">
                {s.title && <h1>{s.title}</h1>}
                {s.sub && <p>{s.sub}</p>}
                <Link to={s.link} className="h-hero-btn">Explore Collection</Link>
              </div>
            </div>
          </div>
        ))}
        <div className="h-hero-dots">
          {SLIDES.map((_, i) => <button key={i} className={`h-hero-dot ${slide === i ? 'active' : ''}`} onClick={() => setSlide(i)} />)}
        </div>
      </div>

      {/* Category Circles */}
      <section className="h-section">
        <h2 className="h-section-title reveal-element">Shop by Deity</h2>
        <div className="h-marquee-wrapper reveal-element reveal-delay-1">
          <div className="h-categories-track">
            {[...CATS, ...CATS].map((c, i) => (
              <Link key={i} to={`/collections/${c.n.toLowerCase().replace(/ /g, '-')}`} className="h-cat-item">
                <div className="h-cat-circle"><img src={c.i} alt={c.n} /></div>
                <span className="h-cat-name">{c.n}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* New In & Bestsellers */}
      <section className="h-section glass-section" id="bestsellers">
        <div className="h-section-header reveal-element">
          <h2 className="h-section-title" style={{marginBottom: '10px'}}>The Royal Edit</h2>
          <div className="h-section-flourish">~ ✦ ~</div>
          <p className="h-section-subtitle">Handpicked premium poshaks and jewelry, crafted with pure devotion.</p>
        </div>

        <div className="h-tabs reveal-element reveal-delay-1">
          {['All', 'Bestseller', 'LUXE', 'New In'].map(tab => (
            <button 
              key={tab} 
              className={`h-tab-btn ${activeTab === tab ? 'active' : ''}`}
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* 2 Promotional Dress Banners Above Grid */}
        <div className="h-promo-banners reveal-element">
          <div className="h-promo-card">
            <img src="https://www.devastram.com/cdn/shop/files/PinkMataRaniDress.jpg?v=1756825972" alt="Mata Rani" />
            <div className="h-promo-overlay">
              <h3>Divine Elegance</h3>
              <Link to="/collections/luxe-edit">Shop Mata Rani →</Link>
            </div>
          </div>
          <div className="h-promo-card">
            <img src="https://www.devastram.com/cdn/shop/files/Red_Rose_Laddu_Gopal_Dress.jpg?v=1751864208" alt="Laddu Gopal" />
            <div className="h-promo-overlay">
              <h3>Royal Poshak</h3>
              <Link to="/collections/luxe-edit">Shop Laddu Gopal →</Link>
            </div>
          </div>
        </div>

        <div className="h-products">
          {loadingProducts ? (
            <div style={{padding: '40px', textAlign: 'center', width: '100%', gridColumn: '1 / -1', color: 'var(--h-text-muted)', fontStyle: 'italic'}}>Loading divine poshak...</div>
          ) : filteredProducts.length === 0 ? (
            <div style={{padding: '40px', textAlign: 'center', width: '100%', gridColumn: '1 / -1', color: 'var(--h-text-muted)'}}>No products found in this category.</div>
          ) : (
            filteredProducts.slice(0, 8).map((p, i) => (
              <Link key={p.id} to={`/product/${p.s}`} className={`h-prod-card reveal-element reveal-delay-${(i%4)+1}`}>
                <div className="h-prod-img">
                  {p.b && <span className={`h-prod-badge ${badgeCls(p.b)}`}>{p.b}</span>}
                  <img src={p.imageSrc} alt={p.t} />
                  <div className="h-prod-quick-add">Quick View</div>
                </div>
                <div className="h-prod-info">
                  <div className="h-prod-title">{p.t}</div>
                  <div className="h-prod-price">₹{p.p.toLocaleString('en-IN')}{p.o > p.p && <span className="orig">₹{p.o.toLocaleString('en-IN')}</span>}</div>
                </div>
              </Link>
            ))
          )}
        </div>
        <div className="h-view-all reveal-element"><Link to="/collections">VIEW ALL DESIGNS</Link></div>
      </section>

      {/* Bespoke Laddu Gopal Collection (Bento Grid) */}
      <section className="h-section glass-section">
        <div className="h-section-header reveal-element">
          <h2 className="h-section-title" style={{marginBottom: '10px'}}>Laddu Gopal Ji Collection</h2>
          <div className="h-section-flourish">~ 🦚 ~</div>
          <p className="h-section-subtitle">Adorn your beloved Kanha with our handcrafted, intricate poshaks fit for royalty.</p>
        </div>
        
        <div className="h-bento-grid">
          {COLLS[0].map((name, ci) => (
            <Link key={ci} to={`/collections/${name.toLowerCase().replace(/ /g, '-')}`} className={`h-bento-card reveal-element reveal-delay-${(ci%3)+1}`}>
              <img src={IMGS[ci % 4]} alt={name} />
              <div className="h-bento-overlay">
                <h3>{name}</h3>
                <span>Shop Now →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Mata Rani Collection (Expanding Accordion) */}
      <section className="h-section glass-section">
        <div className="h-section-header reveal-element">
          <h2 className="h-section-title" style={{marginBottom: '10px'}}>Mata Rani Collection</h2>
          <div className="h-section-flourish">~ 🌺 ~</div>
          <p className="h-section-subtitle">Divine grace woven into every thread. Premium lehengas for the Supreme Goddess.</p>
        </div>
        <div className="h-coll-banners">
          {COLLS[1].map((name, ci) => (
            <Link key={ci} to={`/collections/${name.toLowerCase().replace(/ /g, '-')}`} className={`h-coll-card reveal-element reveal-delay-${(ci%3)+1}`}>
              <img src={IMGS[ci % 4]} alt={name} />
              <div className="h-coll-overlay">
                <h3>{name}</h3>
                <span>Explore Collection →</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Bespoke Trust Badges */}
      <section className="h-section" style={{padding: '0 40px'}}>
        <div className="h-trust">
          {TRUST_ITEMS.map((item, i) => (
            <div key={i} className={`h-trust-item reveal-element reveal-delay-${(i%4)+1}`}>
              <div className="h-trust-icon-svg">{item.ic}</div>
              <span className="h-trust-title">{item.ti}</span>
              <span className="h-trust-desc">{item.de}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Words of Devotion (Minimal Luxury Reviews) */}
      <section className="h-section" id="reviews" style={{paddingTop: '40px', paddingBottom: '80px'}}>
        <div className="h-section-header reveal-element">
          <h2 className="h-section-title" style={{marginBottom: '10px'}}>Devotion in Every Thread</h2>
          <div className="h-section-flourish">✧</div>
          <p className="h-section-subtitle">Read what our cherished patrons have to say about their experience.</p>
        </div>
        <div className="h-reviews-minimal">
          {REVIEWS.map((r, i) => (
            <div key={i} className={`h-review-minimal-card reveal-element reveal-delay-${i+1}`}>
              <div className="h-rm-quote">“</div>
              <p className="h-rm-text">{r.t}</p>
              <div className="h-rm-author">
                <strong>{r.n}</strong>
                <span>{r.l}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="h-footer">
        <div className="h-footer-grid reveal-element">
          <div className="h-footer-col"><h4>About Us</h4><Link to="#">Our Vision</Link><Link to="#">Founder Story</Link><Link to="#">Contact Us</Link></div>
          <div className="h-footer-col"><h4>Helpful Links</h4><Link to="#">Shop</Link><Link to="#">Cart</Link><Link to="#">My Account</Link></div>
          <div className="h-footer-col"><h4>Support</h4><Link to="#">Refund & Returns</Link><Link to="#">Shipping & Delivery</Link><Link to="#">Terms & Conditions</Link></div>
          <div className="h-footer-col"><h4>Contact Us</h4><Link to="#">📍 Vipul Trade Centre, Gurugram</Link><Link to="#">📱 +91-7290023092</Link><Link to="#">✉️ support@vastram.com</Link>
            <div className="h-footer-social"><Link to="#">📘</Link><Link to="#">📷</Link></div>
          </div>
        </div>
        <div className="h-footer-bottom reveal-element">© 2026 Vastram Premium. Crafted for Divinity.</div>
      </footer>
    </div>
  );
};

export default HomePage;
