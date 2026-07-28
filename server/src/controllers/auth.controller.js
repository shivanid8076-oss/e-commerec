// ============================================
// Auth Controller
// Handles registration, login, logout, and session check
// ============================================

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const prisma = require('../config/db');
const { sanitizeUser, getCookieOptions } = require('../utils/helpers');

// Minimum salt rounds for bcrypt (using 12 for extra security)
const SALT_ROUNDS = 12;

/**
 * POST /api/auth/register
 * Register a new user
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Check if user already exists (email or username)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ email }, { username }],
      },
    });

    if (existingUser) {
      const field = existingUser.email === email ? 'email' : 'username';
      return res.status(409).json({
        success: false,
        message: `A user with this ${field} already exists.`,
      });
    }

    // Hash password with bcrypt (12 salt rounds)
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Create user via Prisma (parameterized query — SQL injection safe)
    const user = await prisma.user.create({
      data: {
        username,
        email,
        password: hashedPassword,
      },
    });

    // Generate JWT
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Set token in HTTP-only cookie (for web)
    res.cookie('token', token, getCookieOptions());

    // Return sanitized user + token (token for mobile apps)
    res.status(201).json({
      success: true,
      message: 'Registration successful.',
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during registration.',
    });
  }
};

/**
 * POST /api/auth/login
 * Authenticate user and set JWT cookie
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email via Prisma
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Use generic message to prevent email enumeration
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Compare password with stored hash
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // Generate JWT with minimal payload (no sensitive data)
    const token = jwt.sign(
      { userId: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    // Set token in HTTP-only, Secure, SameSite=Strict cookie (for web)
    res.cookie('token', token, getCookieOptions());

    // Return user + token (token for mobile apps)
    res.json({
      success: true,
      message: 'Login successful.',
      user: sanitizeUser(user),
      token,
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred during login.',
    });
  }
};

/**
 * POST /api/auth/logout
 * Clear the auth cookie
 */
const logout = (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0), // Expire immediately
    path: '/',
  });

  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};

/**
 * GET /api/auth/me
 * Get current authenticated user
 */
const getMe = async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.userId },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      user: sanitizeUser(user),
    });
  } catch (error) {
    console.error('GetMe error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred.',
    });
  }
};

/**
 * POST /api/auth/forgot-password
 * Send a password reset email
 */
const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Return true anyway to prevent email enumeration
      return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
    }

    // Generate token
    const crypto = require('crypto');
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenHash = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save token to DB (valid for 1 hour)
    await prisma.user.update({
      where: { email },
      data: {
        resetToken: resetTokenHash,
        resetTokenExpiry: new Date(Date.now() + 60 * 60 * 1000)
      }
    });

    // Send email
    const { sendEmail } = require('../utils/notification');
    const resetUrl = `${req.protocol}://${req.get('host')}/reset-password/${resetToken}`;
    
    const message = `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Please go to this link to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
    `;

    await sendEmail(user.email, 'Password Reset - Vastram', message);

    res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  } catch (error) {
    console.error('Forgot Password error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

/**
 * POST /api/auth/reset-password/:token
 * Reset the password
 */
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const crypto = require('crypto');
    const resetTokenHash = crypto.createHash('sha256').update(token).digest('hex');

    const user = await prisma.user.findFirst({
      where: {
        resetToken: resetTokenHash,
        resetTokenExpiry: { gt: new Date() } // Ensure token hasn't expired
      }
    });

    if (!user) {
      return res.status(400).json({ success: false, message: 'Invalid or expired reset token.' });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    // Update user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        resetToken: null,
        resetTokenExpiry: null
      }
    });

    res.json({ success: true, message: 'Password has been reset successfully.' });
  } catch (error) {
    console.error('Reset Password error:', error);
    res.status(500).json({ success: false, message: 'An error occurred.' });
  }
};

module.exports = { register, login, logout, getMe, forgotPassword, resetPassword };
