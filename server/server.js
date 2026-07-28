// ============================================
// Server Entry Point
// Loads environment variables and starts Express
// ============================================

// Load .env BEFORE anything else
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = require('./app');

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`\n🔒 Secure Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🌐 CORS origin: ${process.env.CLIENT_URL || 'http://localhost:5173'}\n`);
});
