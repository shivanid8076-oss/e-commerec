// ============================================
// Utility Helpers
// Shared utility functions
// ============================================

/**
 * Sanitize user object — remove sensitive fields before sending to client
 * NEVER expose password hash or internal fields
 */
const sanitizeUser = (user) => {
  const { password, ...safeUser } = user;
  return safeUser;
};

/**
 * Generate JWT cookie options
 * Secure, HTTP-only, SameSite=Strict
 */
const getCookieOptions = () => {
  const isProduction = process.env.NODE_ENV === 'production';

  return {
    httpOnly: true, // Cannot be accessed by JavaScript (prevents XSS token theft)
    secure: isProduction, // Only send over HTTPS in production
    sameSite: 'strict', // Prevents CSRF attacks
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
    path: '/',
  };
};

module.exports = { sanitizeUser, getCookieOptions };
