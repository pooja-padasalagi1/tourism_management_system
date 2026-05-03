import React, { useState, useEffect } from 'react';
import api from '../api';
import Spinner from '../components/Spinner';
import Toast from '../components/Toast';

export default function Booking() {
  const [formData, setFormData] = useState({
    tour_id: '',
    hotel_id: '',
    status: 'pending'
  });
  const [tours, setTours] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [toursRes, hotelsRes] = await Promise.all([
        api.get('/tours'),
        api.get('/hotels')
      ]);
      setTours(toursRes.data || []);
      setHotels(hotelsRes.data || []);
    } catch (err) {
      console.error('Failed to load data', err);
      setToast({ type: 'error', message: 'Failed to load tours and hotels' });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.tour_id || !formData.hotel_id) {
      setToast({ type: 'error', message: 'Please select both a tour and hotel' });
      return;
    }

    setLoading(true);
    try {
      await api.post('/bookings', {
        ...formData,
        user_id: JSON.parse(localStorage.getItem('tms_user'))?.id
      });
      setToast({ type: 'success', message: 'Booking created successfully!' });
      setFormData({ tour_id: '', hotel_id: '', status: 'pending' });
    } catch (err) {
      console.error('Failed to create booking', err);
      setToast({ type: 'error', message: err.response?.data?.error || 'Failed to create booking' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Create Booking</h1>
        <p className="page-subtitle">Book your perfect tour and accommodation</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Booking Details</h3>
        </div>
        <div className="card-body">
          <form onSubmit={handleSubmit} className="form-professional">
            <div className="form-group">
              <label>Select Tour</label>
              <select
                value={formData.tour_id}
                onChange={(e) => setFormData({ ...formData, tour_id: e.target.value })}
                required
              >
                <option value="">Choose a tour...</option>
                {tours.map((tour) => (
                  <option key={tour.id} value={tour.id}>
                    {tour.title} - ${tour.price}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Select Hotel</label>
              <select
                value={formData.hotel_id}
                onChange={(e) => setFormData({ ...formData, hotel_id: e.target.value })}
                required
              >
                <option value="">Choose a hotel...</option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name} - {hotel.location}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Booking Status</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              >
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>

            <div className="form-actions">
              <button
                type="submit"
                className="btn btn-primary"
                disabled={loading}
              >
                {loading ? 'Creating...' : 'Create Booking'}
              </button>
            </div>
          </form>
        </div>
      </div>

      {toast && <Toast type={toast.type} message={toast.message} onClose={() => setToast(null)} />}
    </div>
  );
}