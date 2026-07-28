// ============================================
// ProductDetail Page
// Devastram.com-inspired product detail page
// ============================================

import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import CheckoutModal from '../components/CheckoutModal';
import CartDrawer from '../components/CartDrawer';
import api from '../utils/api';
import '../styles/ProductDetail.css';

// Sample product data (fallback when localStorage is empty)
const SAMPLE_PRODUCTS = [
  {
    id: 'harit-darbar-mata-rani-dress',
    slug: 'harit-darbar-mata-rani-dress',
    title: 'Harit Darbar Mata Rani Dress',
    brand: 'Rishigyan',
    price: 630,
    salePrice: 598.50,
    description: 'The Harit Darbar Poshak reflects serenity and divine elegance inspired by sacred temple traditions. Crafted with delicate pleats and intricate borders, this poshak beautifully enhances the divine appearance of Mata Rani.',
    includes: 'Lehenga & Patka',
    category: 'Mata Rani Dresses',
    sizes: ['0 No', '1 No', '2 No', '3 No', '4 No', '5 No', '6 No'],
    images: [
      'https://www.devastram.com/cdn/shop/files/B3C172E1-B9E7-4FFE-A6A8-EAADB5E5A4C2.png?v=1780632086&width=990',
      'https://www.devastram.com/cdn/shop/files/IMG_0026.jpg?v=1772875667&width=990',
      'https://www.devastram.com/cdn/shop/files/IMG_0067.jpg?v=1772875666&width=990',
      'https://www.devastram.com/cdn/shop/files/Mata_cff6945e-5a1e-4007-9f58-b9ffeee3fec1.jpg?v=1775557899&width=990',
    ],
    isLuxe: false,
  },
  {
    id: 'kamakhya-mata-rani-dress',
    slug: 'kamakhya-mata-rani-dress',
    title: 'Kamakhya Mata Rani Dress',
    brand: 'Rishigyan',
    price: 750,
    salePrice: 699,
    description: 'A divine poshak inspired by the Kamakhya temple traditions, featuring rich embroidery and vibrant colors.',
    includes: 'Lehenga & Patka',
    category: 'Mata Rani Dresses',
    sizes: ['0 No', '1 No', '2 No', '3 No'],
    images: [
      'https://www.devastram.com/cdn/shop/files/B3C172E1-B9E7-4FFE-A6A8-EAADB5E5A4C2.png?v=1780632086&width=990',
    ],
    isLuxe: false,
  },
  {
    id: 'sarveshvari-mata-rani-dress',
    slug: 'sarveshvari-mata-rani-dress',
    title: 'Sarveshvari Mata Rani Dress',
    brand: 'Rishigyan',
    price: 890,
    salePrice: 799,
    description: 'An exquisite designer poshak with golden zari work and divine motifs.',
    includes: 'Lehenga & Patka',
    category: 'Mata Rani Dresses',
    sizes: ['0 No', '1 No', '2 No', '3 No', '4 No', '5 No'],
    images: [
      'https://www.devastram.com/cdn/shop/files/IMG_0026.jpg?v=1772875667&width=990',
    ],
    isLuxe: true,
  },
  {
    id: 'mahagauri-mata-rani-dress',
    slug: 'mahagauri-mata-rani-dress',
    title: 'Mahagauri Mata Rani Dress',
    brand: 'Rishigyan',
    price: 680,
    salePrice: 598,
    description: 'Pure white elegance inspired by Mahagauri, adorned with silver detailing.',
    includes: 'Lehenga & Patka',
    category: 'Mata Rani Dresses',
    sizes: ['1 No', '2 No', '3 No', '4 No'],
    images: [
      'https://www.devastram.com/cdn/shop/files/IMG_0067.jpg?v=1772875666&width=990',
    ],
    isLuxe: false,
  },
  {
    id: 'aadishakti-mata-rani-dress',
    slug: 'aadishakti-mata-rani-dress',
    title: 'Aadishakti Mata Rani Dress',
    brand: 'Rishigyan',
    price: 950,
    salePrice: 849,
    description: 'A luxurious poshak representing the supreme divine feminine energy.',
    includes: 'Lehenga, Patka & Dupatta',
    category: 'Mata Rani Dresses',
    sizes: ['0 No', '1 No', '2 No', '3 No'],
    images: [
      'https://www.devastram.com/cdn/shop/files/Mata_cff6945e-5a1e-4007-9f58-b9ffeee3fec1.jpg?v=1775557899&width=990',
    ],
    isLuxe: true,
  },
  {
    id: 'shailputri-mata-rani-dress',
    slug: 'shailputri-mata-rani-dress',
    title: 'Shailputri Mata Rani Dress',
    brand: 'Rishigyan',
    price: 720,
    salePrice: 649,
    description: 'Inspired by the daughter of mountains, featuring earthy tones and natural motifs.',
    includes: 'Lehenga & Patka',
    category: 'Mata Rani Dresses',
    sizes: ['0 No', '1 No', '2 No', '3 No', '4 No', '5 No', '6 No'],
    images: [
      'https://www.devastram.com/cdn/shop/files/B3C172E1-B9E7-4FFE-A6A8-EAADB5E5A4C2.png?v=1780632086&width=990',
    ],
    isLuxe: false,
  },
];

const ProductDetail = () => {
  const { slug } = useParams();
  const [product, setProduct] = useState(null);
  const [allProducts, setAllProducts] = useState([]);
  const [selectedImage, setSelectedImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [addedToCart, setAddedToCart] = useState(false);
  const [showCheckout, setShowCheckout] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Accordion State
  const [expandedAcc, setExpandedAcc] = useState({
    desc: true,
    shipping: false,
    care: false
  });

  const toggleAcc = (key) => {
    setExpandedAcc(prev => ({ ...prev, [key]: !prev[key] }));
  };

  // Load product from database
  useEffect(() => {
    window.scrollTo(0, 0);
    const fetchProduct = async () => {
      try {
        const res = await api.get('/products');
        if (res.data && res.data.success) {
          const dbProducts = res.data.products;
          setAllProducts(dbProducts);
          const found = dbProducts.find(p => p.slug === slug);
          if (found) {
            setProduct({
              ...found,
              images: found.images && found.images.length > 0 ? found.images : ['https://via.placeholder.com/600'],
              salePrice: found.price, // Prisma model has price. The form had price and compare
              price: found.compare || found.price, // Display original price
              sizes: found.sizes && found.sizes.length > 0 ? found.sizes : ['Free Size']
            });
            setSelectedSize(found.sizes?.[0] || 'Free Size');
            setSelectedImage(0);
            return;
          }
        }
      } catch (err) {
        console.error('Error fetching product detail:', err);
      }
      
      // Fallback to sample data
      setAllProducts(SAMPLE_PRODUCTS);
      const sampleFound = SAMPLE_PRODUCTS.find(p => p.slug === slug) || SAMPLE_PRODUCTS[0];
      setProduct(sampleFound);
      setSelectedSize(sampleFound.sizes?.[0] || '0 no');
      setSelectedImage(0);
    };
    
    fetchProduct();
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(
      (item) => item.id === product.id && item.size === selectedSize
    );
    if (existing) {
      existing.quantity += quantity;
    } else {
      cart.push({
        id: product.id,
        slug: product.slug,
        title: product.title,
        image: product.images?.[0],
        price: product.salePrice || product.price,
        size: selectedSize,
        quantity,
      });
    }
    localStorage.setItem('cart', JSON.stringify(cart));
    setAddedToCart(true);
    setIsCartOpen(true); // Open the drawer immediately
    setTimeout(() => setAddedToCart(false), 2000);
  };

  const getCartCount = () => {
    try {
      return JSON.parse(localStorage.getItem('cart') || '[]').reduce(
        (sum, item) => sum + (item.quantity || 1),
        0
      );
    } catch {
      return 0;
    }
  };

  const relatedProducts = allProducts
    .filter((p) => p.id !== product?.id)
    .slice(0, 6);

  if (!product) {
    return (
      <div className="product-page">
        <div style={{ textAlign: 'center', padding: '100px 20px', color: '#999' }}>
          <div style={{ fontSize: '3rem', marginBottom: '16px' }}>🔍</div>
          <h2>Product not found</h2>
          <p style={{ marginTop: '8px' }}>The product you are looking for does not exist.</p>
          <Link to="/dashboard" style={{ display: 'inline-block', marginTop: '20px', padding: '12px 28px', background: '#1a1a1a', color: '#fff', borderRadius: '8px', textDecoration: 'none' }}>
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const discount = product.price > product.salePrice
    ? Math.round(((product.price - product.salePrice) / product.price) * 100)
    : 0;
  const savings = product.price - product.salePrice;
  const images = product.images?.length > 0
    ? product.images
    : ['https://via.placeholder.com/600x600?text=No+Image'];

  return (
    <div className="product-page">
      {/* Navbar */}
      <nav className="pd-navbar" id="product-navbar">
        <Link to="/" className="pd-navbar-brand">
          Rishi<span>gyan</span>
        </Link>
        <div className="pd-navbar-actions">
          <Link to="/login" className="pd-nav-link">Login</Link>
          <Link to="/dashboard" className="pd-nav-link">Dashboard</Link>
          <button className="pd-nav-cart" id="nav-cart-btn" title="Cart">
            🛒
            {getCartCount() > 0 && (
              <span className="pd-nav-cart-count">{getCartCount()}</span>
            )}
          </button>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="pd-breadcrumb pd-animate">
        <Link to="/">Home</Link>
        <span>/</span>
        <Link to="/">{product.category || 'Collection'}</Link>
        <span>/</span>
        <span className="pd-breadcrumb-current">{product.title}</span>
      </div>

      {/* Main Product Section */}
      <div className="pd-container">
        {/* Image Gallery */}
        <div className="pd-gallery pd-animate">
          <div
            className="pd-main-image-wrap"
            onClick={() => setLightboxOpen(true)}
            id="product-main-image"
          >
            <img
              src={images[selectedImage]}
              alt={product.title}
              key={selectedImage}
            />
            {images.length > 1 && (
              <span className="pd-image-counter">
                {selectedImage + 1} / {images.length}
              </span>
            )}
          </div>
          {images.length > 1 && (
            <div className="pd-thumbnails" id="product-thumbnails">
              {images.map((img, idx) => (
                <div
                  key={idx}
                  className={`pd-thumb ${selectedImage === idx ? 'active' : ''}`}
                  onClick={() => setSelectedImage(idx)}
                >
                  <img src={img} alt={`${product.title} - ${idx + 1}`} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="pd-info pd-animate pd-animate-delay-1">
          <div className="pd-brand">{product.brand || 'Rishigyan'}</div>
          <h1 className="pd-title" id="product-title">{product.title}</h1>

          {/* Price Block */}
          <div className="pd-price-block">
            <div className="pd-price-row">
              <span className="pd-price-sale" id="product-price">
                ₹{product.salePrice?.toLocaleString('en-IN') || product.price?.toLocaleString('en-IN')}
              </span>
              {discount > 0 && (
                <>
                  <span className="pd-price-original">
                    ₹{product.price?.toLocaleString('en-IN')}
                  </span>
                  <span className="pd-price-discount">
                    {discount}% OFF
                  </span>
                </>
              )}
            </div>
            {savings > 0 && (
              <div className="pd-savings">
                💸 Total Savings: ₹{savings.toFixed(2)}
              </div>
            )}
            <div className="pd-tax-info">
              Tax included. <a href="#shipping">Shipping</a> calculated at checkout.
            </div>
          </div>

          {product.sizes?.length > 0 && (
            <div className="pd-size-wrap">
              <div className="pd-section-label">Select Size</div>
              <div className="pd-size-pills">
                {product.sizes.map((size) => (
                  <button
                    key={size}
                    className={`pd-size-pill ${selectedSize === size ? 'active' : ''}`}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity */}
          <div className="pd-quantity-wrap">
            <div className="pd-section-label">Quantity</div>
            <div className="pd-quantity" id="product-quantity">
              <button
                className="pd-qty-btn"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >
                −
              </button>
              <div className="pd-qty-value">{quantity}</div>
              <button
                className="pd-qty-btn"
                onClick={() => setQuantity((q) => q + 1)}
              >
                +
              </button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pd-actions">
            <button
              className="pd-btn-cart"
              id="add-to-cart-btn"
              onClick={handleAddToCart}
            >
              {addedToCart ? '✓ Added to Cart!' : '🛒 Add to Cart'}
            </button>
            <button className="pd-btn-buy" id="buy-now-btn" onClick={() => setShowCheckout(true)}>
              ⚡ Buy It Now
            </button>
          </div>

          {/* Shipping Badges */}
          <div className="pd-shipping-badges">
            <div className="pd-badge">
              <span className="pd-badge-icon">🚚</span>
              <span className="pd-badge-title">Free Shipping</span>
              <span className="pd-badge-desc">5-7 Working Days</span>
            </div>
            <div className="pd-badge">
              <span className="pd-badge-icon">⚡</span>
              <span className="pd-badge-title">Express Shipping</span>
              <span className="pd-badge-desc">2-4 Working Days</span>
            </div>
            <div className="pd-badge">
              <span className="pd-badge-icon">🔄</span>
              <span className="pd-badge-title">7 Days Exchange</span>
              <span className="pd-badge-desc">Hassle Free</span>
            </div>
          </div>

          {/* Accordion Details */}
          <div className="pd-accordions pd-animate pd-animate-delay-2">
            
            {/* Description Accordion */}
            <div className={`pd-acc-group ${expandedAcc.desc ? 'expanded' : ''}`}>
              <div className="pd-acc-title" onClick={() => toggleAcc('desc')}>
                <span>Product Description</span>
                <span className="pd-acc-icon">{expandedAcc.desc ? '−' : '+'}</span>
              </div>
              <div className="pd-acc-content">
                <div className="pd-acc-inner">
                  <p className="pd-description-text">{product.description}</p>
                  {product.includes && (
                    <div className="pd-includes">
                      📦 Includes: {product.includes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Shipping Accordion */}
            <div className={`pd-acc-group ${expandedAcc.shipping ? 'expanded' : ''}`}>
              <div className="pd-acc-title" onClick={() => toggleAcc('shipping')}>
                <span>Shipping & Returns</span>
                <span className="pd-acc-icon">{expandedAcc.shipping ? '−' : '+'}</span>
              </div>
              <div className="pd-acc-content">
                <div className="pd-acc-inner">
                  <p className="pd-description-text">
                    <strong>Free Shipping:</strong> Available on all orders. Ships within 2-4 working days.<br/><br/>
                    <strong>Returns:</strong> 7-day hassle-free exchange policy for unused items with original packaging.
                  </p>
                </div>
              </div>
            </div>

            {/* Care Instructions Accordion */}
            <div className={`pd-acc-group ${expandedAcc.care ? 'expanded' : ''}`}>
              <div className="pd-acc-title" onClick={() => toggleAcc('care')}>
                <span>Care Instructions</span>
                <span className="pd-acc-icon">{expandedAcc.care ? '−' : '+'}</span>
              </div>
              <div className="pd-acc-content">
                <div className="pd-acc-inner">
                  <p className="pd-description-text">
                    • Dry clean only recommended.<br/>
                    • Keep away from direct perfumes and strong chemicals.<br/>
                    • Store in a cool, dry place in the provided Rishigyan pouch.
                  </p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="pd-related pd-animate pd-animate-delay-3" id="related-products">
          <h2 className="pd-related-title">You May Also Like</h2>
          <div className="pd-related-grid">
            {relatedProducts.map((rp) => (
              <Link
                key={rp.id || rp.slug}
                to={`/product/${rp.slug}`}
                className="pd-related-card"
              >
                <div className="pd-related-card-img">
                  <img
                    src={rp.images?.[0] || 'https://via.placeholder.com/300x300?text=No+Image'}
                    alt={rp.title}
                  />
                </div>
                <div className="pd-related-card-info">
                  {rp.isLuxe && <span className="pd-luxe-tag">LUXE</span>}
                  <div className="pd-related-card-title">{rp.title}</div>
                  <div className="pd-related-card-price">
                    ₹{(rp.salePrice || rp.price)?.toLocaleString('en-IN')}
                    {rp.price > (rp.salePrice || rp.price) && (
                      <span className="original">₹{rp.price?.toLocaleString('en-IN')}</span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="pd-footer">
        <div className="pd-footer-grid">
          <div className="pd-footer-col">
            <h4>About Us</h4>
            <a href="#">Our Vision</a>
            <a href="#">Founder Story</a>
            <a href="#">Contact Us</a>
            <a href="#">Privacy Policy</a>
          </div>
          <div className="pd-footer-col">
            <h4>Helpful Links</h4>
            <a href="#">Shop</a>
            <a href="#">Cart</a>
            <a href="#">My Account</a>
            <a href="#">Wishlist</a>
          </div>
          <div className="pd-footer-col">
            <h4>Support</h4>
            <a href="#">Refund & Returns</a>
            <a href="#">Shipping & Delivery</a>
            <a href="#">Terms & Conditions</a>
          </div>
          <div className="pd-footer-col">
            <h4>Contact Us</h4>
            <a href="#">📍 314-315, Vipul Trade Centre, Sector-48, Gurugram</a>
            <a href="#">📱 +91-7290023092</a>
            <a href="#">✉️ support@rishigyan.com</a>
          </div>
        </div>
        <div className="pd-footer-bottom">
          © 2026 Rishigyan. All rights reserved.
        </div>
      </footer>

      {/* Lightbox */}
      {lightboxOpen && (
        <div
          className="pd-lightbox"
          onClick={() => setLightboxOpen(false)}
          id="product-lightbox"
        >
          <button
            className="pd-lightbox-close"
            onClick={() => setLightboxOpen(false)}
          >
            ✕
          </button>
          {images.length > 1 && (
            <>
              <button
                className="pd-lightbox-nav pd-lightbox-prev"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) =>
                    prev === 0 ? images.length - 1 : prev - 1
                  );
                }}
              >
                ‹
              </button>
              <button
                className="pd-lightbox-nav pd-lightbox-next"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedImage((prev) =>
                    prev === images.length - 1 ? 0 : prev + 1
                  );
                }}
              >
                ›
              </button>
            </>
          )}
          <img
            src={images[selectedImage]}
            alt={product.title}
            onClick={(e) => e.stopPropagation()}
            style={{ cursor: 'default' }}
          />
        </div>
      )}

      {showCheckout && (
        <CheckoutModal 
          product={product} 
          selectedSize={selectedSize} 
          quantity={quantity} 
          onClose={() => setShowCheckout(false)} 
        />
      )}

      {/* Cart Drawer */}
      <CartDrawer 
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
      />
    </div>
  );
};

export default ProductDetail;
