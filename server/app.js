// ============================================
// Express Application Setup
// Security middleware stack + routes
// ============================================

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const { globalLimiter, authLimiter } = require('./src/middleware/rateLimiter');
const { sanitizeInput } = require('./src/middleware/sanitize');
const { securityLogger } = require('./src/middleware/securityLogger');
const authRoutes = require('./src/routes/auth.routes');
const userRoutes = require('./src/routes/user.routes');
const orderRoutes = require('./src/routes/order.routes');
const productRoutes = require('./src/routes/product.routes');
const statsRoutes = require('./src/routes/stats.routes');
const settingsRoutes = require('./src/routes/settings.routes');
const cartRoutes = require('./src/routes/cart.routes');
const paymentRoutes = require('./src/routes/payment.routes');
const couponRoutes = require('./src/routes/coupon.routes');
const reviewRoutes = require('./src/routes/review.routes');
const shippingRoutes = require('./src/routes/shipping.routes');
const path = require('path');

const app = express();

// ========== SECURITY MIDDLEWARE STACK ==========

// 1. Helmet — Hardened HTTP security headers
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com'],
        imgSrc: ["'self'", 'data:', 'https:'],
        connectSrc: ["'self'"],
        objectSrc: ["'none'"],       // Block Flash/Java plugins
        frameSrc: ["'none'"],        // Block iframes (clickjacking protection)
        baseUri: ["'self'"],         // Prevent base tag injection
        formAction: ["'self'"],      // Only allow forms to submit to our server
      },
    },
    crossOriginEmbedderPolicy: false,
    // Additional hardening:
    hidePoweredBy: true,              // Hide "X-Powered-By: Express" header
    hsts: { maxAge: 31536000, includeSubDomains: true }, // Force HTTPS for 1 year
    noSniff: true,                    // Prevent MIME-type sniffing
    xssFilter: true,                  // Enable browser XSS filter
    referrerPolicy: { policy: 'strict-origin-when-cross-origin' },
  })
);

// 2. CORS — Strict cross-origin policy (Updated for phone local network testing)
app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || origin.startsWith('http://localhost') || origin.startsWith('http://192.168.') || origin.startsWith('http://127.0.0.1')) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true, // Allow cookies to be sent
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// 3. Global rate limiter
app.use(globalLimiter);

// 4. Body parsers — Conditional Limits (10kb global, 50mb for products)
app.use((req, res, next) => {
  if (req.path.startsWith('/api/products')) {
    express.json({ limit: '50mb' })(req, res, (err) => {
      if (err) return next(err);
      express.urlencoded({ extended: true, limit: '50mb' })(req, res, next);
    });
  } else {
    express.json({ limit: '10kb' })(req, res, (err) => {
      if (err) return next(err);
      express.urlencoded({ extended: true, limit: '10kb' })(req, res, next);
    });
  }
});

// 5. Cookie parser
app.use(cookieParser());

// 6. XSS Input sanitization
app.use(sanitizeInput);

// 7. Security Logger — Forensic logging of all auth/admin actions
app.use(securityLogger);

// 8. Serve Static Storefront
app.use(express.static(path.join(__dirname, 'public')));

// ========== ROUTES ==========

// Auth routes — extra brute-force protection via authLimiter
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// Product routes
app.use('/api/products', productRoutes);

// Stats routes
app.use('/api/stats', statsRoutes);

// Settings routes
app.use('/api/settings', settingsRoutes);

// Cart routes
app.use('/api/cart', cartRoutes);

// Payment routes
app.use('/api/payment', paymentRoutes);

// Coupon routes
app.use('/api/coupons', couponRoutes);

// Review routes
app.use('/api/reviews', reviewRoutes);

// Shipping routes
app.use('/api/shipping', shippingRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
  });
});

// ========== ERROR HANDLING ==========

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.',
  });
});

// Global error handler — NEVER expose internal details to attackers
app.use((err, req, res, next) => {
  // Log full error for developers (server-side only)
  console.error(`[ERROR] ${new Date().toISOString()} | ${req.method} ${req.path} |`, err.message);

  // Determine status code
  const statusCode = err.status || err.statusCode || 500;

  // NEVER send stack traces or internal messages to the client
  res.status(statusCode).json({
    success: false,
    message: statusCode === 413
      ? 'Request payload too large. Maximum allowed size is 10KB for this endpoint.'
      : statusCode === 429
      ? 'Too many requests. Please slow down.'
      : 'An unexpected error occurred. Please try again later.',
  });
});

module.exports = app;
