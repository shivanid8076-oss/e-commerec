// ============================================
// Navbar Component
// Sticky navigation with user info and logout
// ============================================

import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <nav className="navbar" id="main-navbar">
      <div className="navbar-content">
        <Link to="/" className="navbar-brand">
          <span className="brand-icon">🔒</span>
          <span className="brand-text">SecureVault</span>
        </Link>

        {isAuthenticated && user && (
          <div className="navbar-user">
            <div className="navbar-user-info">
              <span className="navbar-username">{user.username}</span>
              <span className="navbar-role">{user.role}</span>
            </div>
            <button
              id="logout-btn"
              className="btn btn-ghost btn-sm"
              onClick={handleLogout}
            >
              ↗ Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
