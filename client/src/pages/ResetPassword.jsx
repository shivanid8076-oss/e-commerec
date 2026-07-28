import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import api from '../utils/api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const { data } = await api.post(`/auth/reset-password/${token}`, { password });
      setMessage(data.message);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'An error occurred. The token may be expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="auth-page">
      <div className="auth-container">
        <div className="auth-card">
          <div className="auth-header">
            <div className="auth-icon">🔑</div>
            <h1>Create New Password</h1>
            <p>Please enter your new password below</p>
          </div>

          {message && (
            <div className="alert alert-success" style={{ marginBottom: '15px', padding: '10px', background: 'var(--color-success-bg)', color: 'var(--color-success)', borderRadius: '6px' }}>
              {message} <br/> Redirecting to login...
            </div>
          )}

          {error && (
            <div className="alert alert-error" style={{ marginBottom: '15px', padding: '10px', background: 'var(--color-error-bg)', color: 'var(--color-error)', borderRadius: '6px' }}>
              {error}
            </div>
          )}

          {!message && (
            <form className="auth-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">New Password</label>
                <div className="form-input-wrapper">
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Enter new password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <span className="form-input-icon">🔒</span>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Confirm Password</label>
                <div className="form-input-wrapper">
                  <input
                    className="form-input"
                    type="password"
                    placeholder="Confirm new password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                  <span className="form-input-icon">🔒</span>
                </div>
              </div>

              <button className="btn btn-primary btn-full" type="submit" disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </button>
            </form>
          )}

          <div className="auth-footer" style={{ marginTop: '20px', textAlign: 'center' }}>
            <Link to="/login">Back to Login</Link>
          </div>
        </div>
      </div>
    </main>
  );
};

export default ResetPassword;
