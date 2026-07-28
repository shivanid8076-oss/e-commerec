// ============================================
// Frontend Input Validators
// Client-side validation + XSS sanitization
// ============================================

import DOMPurify from 'dompurify';

/**
 * Sanitize a string — remove all HTML/script injection
 */
export const sanitize = (input) => {
  if (typeof input !== 'string') return input;
  return DOMPurify.sanitize(input, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });
};

/**
 * Validate email format
 */
export const isValidEmail = (email) => {
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

/**
 * Validate username — alphanumeric + underscore, 3-50 chars
 */
export const isValidUsername = (username) => {
  const usernameRegex = /^[a-zA-Z0-9_]{3,50}$/;
  return usernameRegex.test(username);
};

/**
 * Validate password complexity
 * - Min 8 characters
 * - At least 1 uppercase, 1 lowercase, 1 number, 1 special char
 */
export const isValidPassword = (password) => {
  if (password.length < 8) return false;
  if (password.length > 128) return false;

  const hasUpper = /[A-Z]/.test(password);
  const hasLower = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecial = /[@$!%*?&]/.test(password);

  return hasUpper && hasLower && hasNumber && hasSpecial;
};

/**
 * Get password strength indicator
 */
export const getPasswordStrength = (password) => {
  if (!password) return { score: 0, label: '', color: '' };

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/\d/.test(password)) score++;
  if (/[@$!%*?&]/.test(password)) score++;

  if (score <= 2) return { score, label: 'Weak', color: '#ef4444' };
  if (score <= 4) return { score, label: 'Fair', color: '#f59e0b' };
  if (score <= 5) return { score, label: 'Good', color: '#06b6d4' };
  return { score, label: 'Strong', color: '#10b981' };
};

/**
 * Validate registration form
 */
export const validateRegisterForm = (data) => {
  const errors = {};

  if (!data.username?.trim()) {
    errors.username = 'Username is required';
  } else if (!isValidUsername(data.username.trim())) {
    errors.username = 'Username must be 3-50 characters (letters, numbers, underscore)';
  }

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  } else if (!isValidPassword(data.password)) {
    errors.password = 'Password must have 8+ chars with uppercase, lowercase, number, and special character';
  }

  if (!data.confirmPassword) {
    errors.confirmPassword = 'Please confirm your password';
  } else if (data.password !== data.confirmPassword) {
    errors.confirmPassword = 'Passwords do not match';
  }

  return errors;
};

/**
 * Validate login form
 */
export const validateLoginForm = (data) => {
  const errors = {};

  if (!data.email?.trim()) {
    errors.email = 'Email is required';
  } else if (!isValidEmail(data.email.trim())) {
    errors.email = 'Please enter a valid email address';
  }

  if (!data.password) {
    errors.password = 'Password is required';
  }

  return errors;
};
