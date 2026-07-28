// ============================================
// Auth Routes
// /api/auth — Registration, Login, Logout
// ============================================

const express = require('express');
const router = express.Router();

const { register, login, logout, getMe, forgotPassword, resetPassword } = require('../controllers/auth.controller');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiter');
const { registerSchema, loginSchema } = require('../validators/auth.validator');

// POST /api/auth/register — Rate limited + validated
router.post('/register', authLimiter, validate(registerSchema), register);

// POST /api/auth/login — Rate limited + validated
router.post('/login', authLimiter, validate(loginSchema), login);

// POST /api/auth/logout — Requires authentication
router.post('/logout', authenticate, logout);

// GET /api/auth/me — Get current session user
router.get('/me', authenticate, getMe);

// POST /api/auth/forgot-password - Send reset email
router.post('/forgot-password', authLimiter, forgotPassword);

// POST /api/auth/reset-password/:token - Reset password using token
router.post('/reset-password/:token', authLimiter, resetPassword);

module.exports = router;
