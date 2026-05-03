import React, { useState, useEffect } from 'react';
import api from '../api';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';

export default function Ratings() {
  const [ratings, setRatings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    try {
      setLoading(true);
      // Assuming there's a ratings endpoint, if not, we can use reviews
      const res = await api.get('/reviews');
      setRatings(res.data || []);
    } catch (err) {
      console.error('Failed to load ratings', err);
      setToast({ type: 'error', message: 'Failed to load ratings data' });
    } finally {
      setLoading(false);
    }
  };

  const renderStars = (rating) => {
    const value = Number(rating || 0);
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <span key={i} className={i <= value ? 'star filled' : 'star'}>
          ★
        </span>
      );
    }
    return stars;
  };

  if (loading) return <Spinner />;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Ratings & Reviews</h1>
        <p className="page-subtitle">Manage and view all ratings and customer feedback</p>
      </div>

      <div className="ratings-summary">
        <div className="stat-card">
          <div className="stat-icon">⭐</div>
          <div className="stat-content">
            <div className="stat-number">
              {ratings.length > 0 ? (ratings.reduce((sum, r) => sum + (r.rating || 0), 0) / ratings.length).toFixed(1) : '0.0'}
            </div>
            <div className="stat-label">Average Rating</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">💬</div>
          <div className="stat-content">
            <div className="stat-number">{ratings.length}</div>
            <div className="stat-label">Total Reviews</div>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>All Ratings & Reviews</h3>
        </div>
        <div className="card-body">
          {ratings.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⭐</div>
              <h4>No ratings yet</h4>
              <p>Ratings and reviews will appear here once customers start leaving feedback.</p>
            </div>
          ) : (
            <div className="ratings-list">
              {ratings.map((rating) => (
                <div key={rating.id} className="rating-item">
                  <div className="rating-header">
                    <div className="rating-user">
                      <strong>{rating.user_name || 'Anonymous'}</strong>
                      <span className="rating-date">
                        {rating.created_at ? new Date(rating.created_at).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                    <div className="rating-stars">
                      {renderStars(rating.rating || 0)}
                      <span className="rating-number">({rating.rating || 0}/5)</span>
                    </div>
                  </div>
                  <div className="rating-content">
                    <p>{rating.comment || rating.review || 'No comment provided'}</p>
                    {rating.tour_name && (
                      <div className="rating-target">
                        <small>Tour: {rating.tour_name}</small>
                      </div>
                    )}
                    {rating.hotel_name && (
                      <div className="rating-target">
                        <small>Hotel: {rating.hotel_name}</small>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}