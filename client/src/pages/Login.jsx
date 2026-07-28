// ============================================
// Login Page
// Secure login with client-side validation
// ============================================

import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { validateLoginForm, sanitize } from '../utils/validators';

const Login = () => {
  const { login, isAuthenticated, loading } = useAuth();

  const [formData, setFormData] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Redirect if already authenticated
  if (!loading && isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear field error on change
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
    if (apiError) setApiError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Client-side validation
    const sanitizedData = {
      email: sanitize(formData.email.trim()),
      password: formData.password, // Don't sanitize password — it may contain special chars
    };

    const validationErrors = validateLoginForm(sanitizedData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setSubmitting(true);
    setApiError('');

    try {
      await login(sanitizedData);
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
    <main className="auth-page" id="login-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">🔐</div>
            <h1>Welcome Back</h1>
            <p>Sign in to your secure account</p>
          </div>

          {apiError && (
            <div className="alert alert-error" role="alert" id="login-error">
              <span className="alert-icon">⚠</span>
              <span>{apiError}</span>
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit} noValidate>
            {/* Email Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-email">
                Email Address
              </label>
              <div className="form-input-wrapper">
                <input
                  id="login-email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  autoFocus
                />
                <span className="form-input-icon">✉</span>
              </div>
              {errors.email && (
                <span className="form-error" id="email-error">
                  ⚠ {errors.email}
                </span>
              )}
            </div>

            {/* Password Field */}
            <div className="form-group">
              <label className="form-label" htmlFor="login-password">
                Password
              </label>
              <div className="form-input-wrapper">
                <input
                  id="login-password"
                  className={`form-input ${errors.password ? 'error' : ''}`}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
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
              {errors.password && (
                <span className="form-error" id="password-error">
                  ⚠ {errors.password}
                </span>
              )}
              <div style={{ textAlign: 'right', marginTop: '8px' }}>
                <Link to="/forgot-password" style={{ fontSize: '0.85rem', color: 'var(--accent-color)', textDecoration: 'none' }}>
                  Forgot Password?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button
              id="login-submit"
              className="btn btn-primary btn-full"
              type="submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <span className="btn-spinner" />
                  Signing in...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="auth-footer">
            Don't have an account?{' '}
            <Link to="/register">Create one now</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default Login;
