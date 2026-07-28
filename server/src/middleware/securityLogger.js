// ============================================
// Security Logger Middleware
// Logs suspicious activity for forensic analysis
// ============================================

const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const LOG_DIR = path.join(__dirname, '../../logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

const LOG_FILE = path.join(LOG_DIR, 'security.log');

/**
 * Write a security event to the log file
 */
function logSecurityEvent(event) {
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${event}\n`;
  
  // Append to log file (non-blocking)
  fs.appendFile(LOG_FILE, entry, (err) => {
    if (err) console.error('Failed to write security log:', err.message);
  });
}

/**
 * Middleware to log suspicious requests
 */
const securityLogger = (req, res, next) => {
  const ip = req.ip || req.connection.remoteAddress;
  const userAgent = req.get('User-Agent') || 'Unknown';

  // Log all authentication attempts
  if (req.path.includes('/auth/login') || req.path.includes('/auth/register')) {
    logSecurityEvent(`AUTH_ATTEMPT | IP: ${ip} | Path: ${req.method} ${req.path} | Email: ${req.body?.email || 'N/A'} | UA: ${userAgent}`);
  }

  // Log admin-only route access attempts
  if (req.path.includes('/products') && (req.method === 'POST' || req.method === 'DELETE')) {
    logSecurityEvent(`ADMIN_ACTION | IP: ${ip} | Path: ${req.method} ${req.path} | UA: ${userAgent}`);
  }

  // Log failed auth responses
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    if (res.statusCode === 401 || res.statusCode === 403) {
      logSecurityEvent(`ACCESS_DENIED | IP: ${ip} | Status: ${res.statusCode} | Path: ${req.method} ${req.path} | Reason: ${body?.message || 'Unknown'}`);
    }
    if (res.statusCode === 429) {
      logSecurityEvent(`RATE_LIMITED | IP: ${ip} | Path: ${req.method} ${req.path}`);
    }
    return originalJson(body);
  };

  next();
};

module.exports = { securityLogger, logSecurityEvent };
