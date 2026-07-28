// ============================================
// User Controller
// Handles user-related operations (protected)
// ============================================

const prisma = require('../config/db');
const { sanitizeUser } = require('../utils/helpers');

/**
 * GET /api/users/profile
 * Get authenticated user's full profile
 */
const getProfile = async (req, res) => {
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
    console.error('GetProfile error:', error);
    res.status(500).json({
      success: false,
      message: 'An error occurred while fetching profile.',
    });
  }
};

module.exports = { getProfile };
