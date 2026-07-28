import { useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../utils/api';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data } = await api.post('/auth/forgot-password', { email });
      setMessage(data.message);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">📩</div>
            <h1>Reset Password</h1>
            <p>Enter your email to receive a reset link</p>
          </div>

          {message && (
            <div className="alert alert-success" style={{ marginBottom: '15px', padding: '10px', background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: '6px' }}>
              {message}
            </div>
          )}

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '15px', padding: '10px', background: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: '6px' }}>
              {error}
            </div>
          )}

          <form className="auth-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div className="form-input-wrapper">
                <input
                  className="form-input"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <span className="form-input-icon">✉</span>
              </div>
            </div>

            <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>

          <div className="auth-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
            Remembered your password? <Link to="/login">Sign In</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ForgotPassword;
