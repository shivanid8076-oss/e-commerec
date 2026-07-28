// ============================================
// Register Page
// Secure registration with real-time validation
// ============================================

import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  validateRegisterForm,
  sanitize,
  getPasswordStrength,
} from '../utils/validators';

const Register = () => {
  const { register, isAuthenticated, loading } = useAuth();

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  // Redirect if already authenticated
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Sanitize text inputs (not passwords — they may have special chars)
    const sanitizedData = {
      username: sanitize(formData.username.trim()),
      email: sanitize(formData.email.trim()),
      password: formData.password,
      confirmPassword: formData.confirmPassword,
    };

    const validationErrors = validateRegisterForm(sanitizedData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setApiError('');

    try {
      await register(sanitizedData);
    } catch (error) {
      const message =
        error.response?.data?.message ||
        'An error occurred. Please try again.';
      setApiError(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="auth-page" id="register-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">🛡️</div>
            <h1>Create Account</h1>
            <p>Join SecureVault with a protected account</p>
          </div>

          {apiError && (
            <div className="alert alert-error" role="alert" id="register-error">
              <span className="alert-icon">⚠</span>
              <span>{apiError}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Username Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-username">
                Username
              </label>
              <div className="form-input-wrapper">
                <input
                  id="reg-username"
                  className={`form-input ${errors.username ? 'error' : ''}`}
                  type="text"
                  name="username"
                  placeholder="john_doe"
                  value={formData.username}
                  onChange={handleChange}
                  autoComplete="username"
                  autoFocus
                />
                <span className="form-input-icon">👤</span>
              </div>
              {errors.username && (
                <span className="form-error">⚠ {errors.username}</span>
              )}
            </div>

            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-email">
                Email Address
              </label>
              <div className="form-input-wrapper">
                <input
                  id="reg-email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                />
                <span className="form-input-icon">✉</span>
              </div>
              {errors.email && (
                <span className="form-error">⚠ {errors.email}</span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-password">
                Password
              </label>
              <div className="form-input-wrapper">
                <input
                  id="reg-password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Min 8 chars, mixed case, number, symbol"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <span className="form-input-icon">🔑</span>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? '🙈' : '👁'}
                </button>
              </div>
              {/* Password strength indicator */}
              {formData.password && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '4px' }}>
                  <div
                    style={{
                      flex: 1,
                      height: '3px',
                      borderRadius: '2px',
                      background: 'rgba(148, 163, 184, 0.1)',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        width: `${(passwordStrength.score / 6) * 100}%`,
                        height: '100%',
                        background: passwordStrength.color,
                        borderRadius: '2px',
                        transition: 'all 0.3s ease',
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 600,
                      color: passwordStrength.color,
                      minWidth: '40px',
                    }}
                  >
                    {passwordStrength.label}
                  </span>
                </div>
              )}
              {errors.password && (
                <span className="form-error">⚠ {errors.password}</span>
              )}
            </div>

            {/* Confirm Password Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="reg-confirm">
                Confirm Password
              </label>
              <div className="form-input-wrapper">
                <input
                  id="reg-confirm"
                  className={`form-input ${errors.confirmPassword ? 'error' : ''}`}
                  type={showConfirm ? 'text' : 'password'}
                  name="confirmPassword"
                  placeholder="Re-enter your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  autoComplete="new-password"
                />
                <span className="form-input-icon">🔒</span>
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowConfirm(!showConfirm)}
                  aria-label={showConfirm ? 'Hide password' : 'Show password'}
                >
                  {showConfirm ? '🙈' : '👁'}
                </button>
              </div>
              {errors.confirmPassword && (
                <span className="form-error">⚠ {errors.confirmPassword}</span>
              )}
            </div>

            {/* Submit Button */}
            <button
              id="register-submit"
              className="btn btn-primary btn-full"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="btn-spinner" />
                  Creating account...
                </>
              ) : (
                'Create Secure Account'
              )}
            </button>
          </form>

          <div className="auth-footer">
            Already have an account?{' '}
            <Link to="/login">Sign in</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Register;
