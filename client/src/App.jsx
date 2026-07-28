// ============================================
// App Component
// Routes and layout
// ============================================

import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import AnnouncementBanner from './components/AnnouncementBanner';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Analytics from './components/Analytics';
import Dashboard from './pages/Dashboard';
import ProductDetail from './pages/ProductDetail';
import HomePage from './pages/HomePage';
import Collection from './pages/Collection';
import './styles/App.css';

const App = () => {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner" />
      </div>
    );
  }

  return (
    <>
      <AnnouncementBanner />
      {isAuthenticated && <Navbar />}
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route path="/product/:slug" element={<ProductDetail />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={<Navigate to="/dashboard" replace />}
        />
        <Route path="/collections" element={<Collection />} />
        <Route path="/collections/:slug" element={<Collection />} />
        <Route
          path="/"
          element={<HomePage />}
        />
        <Route
          path="*"
          element={<HomePage />}
        />
      </Routes>
    </>
  );
};

export default App;
