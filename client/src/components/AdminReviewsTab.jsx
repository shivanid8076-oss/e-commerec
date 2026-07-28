import { useState, useEffect } from 'react';
import api from '../utils/api';

const AdminReviewsTab = () => {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const { data } = await api.get('/reviews/all');
      if (data.success) {
        setReviews(data.reviews);
      }
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleApproval = async (id, currentStatus) => {
    try {
      await api.patch(`/reviews/${id}/approve`, { isApproved: !currentStatus });
      fetchReviews();
    } catch (error) {
      console.error('Error toggling review:', error);
    }
  };

  return (
    <div className="tab-panel animate-fade-in">
      <div className="tab-header" style={{ marginBottom: '20px' }}>
        <h2>Customer Reviews</h2>
        <p style={{ color: 'var(--text-muted)' }}>Moderate and manage product reviews from your customers.</p>
      </div>

      <div className="pro-card">
        {loading ? (
          <p>Loading reviews...</p>
        ) : reviews.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <h3>No reviews yet</h3>
            <p>Customer reviews will appear here once submitted.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>PRODUCT</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>CUSTOMER</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>RATING & REVIEW</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)' }}>STATUS</th>
                  <th style={{ padding: '12px 10px', color: 'var(--text-muted)', textAlign: 'right' }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {reviews.map((r) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                    <td style={{ padding: '12px 10px', fontWeight: 'bold' }}>{r.product?.title || 'Unknown Product'}</td>
                    <td style={{ padding: '12px 10px' }}>
                      {r.user?.username || 'Unknown User'}
                      {r.isVerifiedPurchase && (
                        <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--color-success)', marginTop: '4px' }}>
                          ✓ Verified Purchase
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '12px 10px', maxWidth: '300px' }}>
                      <div style={{ color: '#fbbf24', fontSize: '1.2rem', marginBottom: '4px' }}>
                        {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}
                      </div>
                      {r.title && <strong style={{ display: 'block', fontSize: '0.9rem' }}>{r.title}</strong>}
                      <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '4px 0 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {r.comment}
                      </p>
                    </td>
                    <td style={{ padding: '12px 10px' }}>
                      <span style={{
                        padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold',
                        background: r.isApproved ? 'var(--color-success-bg)' : 'var(--color-warning-bg)',
                        color: r.isApproved ? 'var(--color-success)' : 'var(--color-warning)'
                      }}>
                        {r.isApproved ? 'PUBLISHED' : 'HIDDEN'}
                      </span>
                    </td>
                    <td style={{ padding: '12px 10px', textAlign: 'right' }}>
                      <button 
                        onClick={() => toggleApproval(r.id, r.isApproved)} 
                        className={`pro-btn ${r.isApproved ? 'pro-btn-secondary' : 'pro-btn-primary'}`} 
                        style={{padding: '4px 8px', fontSize: '0.8rem'}}
                      >
                        {r.isApproved ? 'Hide (Spam)' : 'Approve'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminReviewsTab;
