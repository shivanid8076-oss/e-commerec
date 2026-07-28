// ============================================
// User Routes
// /api/users — Protected user operations
// ============================================

const express = require('express');
const router = express.Router();

const { getProfile } = require('../controllers/user.controller');
const { authenticate } = require('../middleware/auth');

// GET /api/users/profile — Requires authentication
router.get('/profile', authenticate, getProfile);

module.exports = router;
