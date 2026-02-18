import React, { useEffect, useState } from 'react';
import api from '../api';
import { getUser } from '../auth';
import Modal from '../components/Modal';

const StatusBadge = ({ status }) => {
  const statusConfig = {
    pending: { color: '#f59e0b', icon: '⏳', label: 'Pending' },
    confirmed: { color: '#10b981', icon: '✅', label: 'Confirmed' },
    cancelled: { color: '#ef4444', icon: '❌', label: 'Cancelled' },
    completed: { color: '#8b5cf6', icon: '🎉', label: 'Completed' }
  };
  const config = statusConfig[status] || statusConfig.pending;
  return (
    <span style={{
      background: config.color,
      color: '#fff',
      padding: '6px 12px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '600',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      {config.icon} {config.label}
    </span>
  );
};

export default function Bookings(){
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ user_id: '', tour_id: '', hotel_id: '', status: 'pending' });
  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  useEffect(() => { load(); }, []);

  async function load(){
    try {
      const res = await api.get('/bookings');
      setItems(res.data || []);
    } catch(e) {
      console.error('Error loading bookings:', e);
    }
  }

  const filteredItems = items
    .filter(b => statusFilter === 'all' || b.status === statusFilter)
    .filter(b => {
      const searchLower = search.toLowerCase();
      return (
        String(b.id).includes(searchLower) ||
        (b.user_name && b.user_name.toLowerCase().includes(searchLower)) ||
        (b.tour_title && b.tour_title.toLowerCase().includes(searchLower)) ||
        (b.hotel_name && b.hotel_name.toLowerCase().includes(searchLower))
      );
    });

  function openCreateModal() {
    setEditingItem(null);
    setFormData({ user_id: '', tour_id: '', hotel_id: '', status: 'pending' });
    setShowModal(true);
  }

  async function handleSave() {
    if (!formData.user_id || !formData.tour_id || !formData.hotel_id) {
      alert('All fields are required');
      return;
    }
    try {
      await api.post('/bookings', formData);
      load();
      setShowModal(false);
    } catch(e) {
      alert('Error creating booking');
    }
  }

  async function handleDelete(b){
    if (!confirm('Delete booking #' + b.id + '?')) return;
    try {
      await api.delete('/bookings/' + b.id);
      load();
    } catch(e) {
      alert('Error deleting booking');
    }
  }

  const stats = {
    total: items.length,
    pending: items.filter(b => b.status === 'pending').length,
    confirmed: items.filter(b => b.status === 'confirmed').length,
    completed: items.filter(b => b.status === 'completed').length
  };

  return (
    <div className="page">
      <h2>📅 Bookings Management</h2>
      
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#1e40af' }}>{stats.total}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Total Bookings</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#f59e0b' }}>{stats.pending}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Pending</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#10b981' }}>{stats.confirmed}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Confirmed</div>
        </div>
        <div className="card" style={{ textAlign: 'center', padding: '16px' }}>
          <div style={{ fontSize: '28px', fontWeight: '700', color: '#8b5cf6' }}>{stats.completed}</div>
          <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '4px' }}>Completed</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '12px', marginBottom: '24px', flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="🔍 Search bookings..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '200px',
            padding: '10px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px'
          }}
        />
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{
            padding: '10px 14px',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '14px',
            cursor: 'pointer'
          }}
        >
          <option value="all">📊 All Bookings</option>
          <option value="pending">⏳ Pending</option>
          <option value="confirmed">✅ Confirmed</option>
          <option value="cancelled">❌ Cancelled</option>
          <option value="completed">🎉 Completed</option>
        </select>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            style={{
              padding: '10px 20px',
              background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: '600',
              cursor: 'pointer',
              transition: 'all 0.3s ease'
            }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px)'}
            onMouseLeave={(e) => e.target.style.transform = 'translateY(0)'}
          >
            ➕ Create Booking
          </button>
        )}
      </div>

      {filteredItems.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📅</div>
          <p>No bookings found.</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table className="table">
            <thead>
              <tr>
                <th>Booking ID</th>
                <th>Guest</th>
                <th>Tour</th>
                <th>Hotel</th>
                <th>Status</th>
                {isAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {filteredItems.map(b => (
                <tr key={b.id}>
                  <td style={{ fontWeight: '600', color: '#1e40af' }}>#{b.id}</td>
                  <td>{b.user_name || 'N/A'}</td>
                  <td>{b.tour_title || 'N/A'}</td>
                  <td>{b.hotel_name || 'N/A'}</td>
                  <td><StatusBadge status={b.status} /></td>
                  {isAdmin && (
                    <td>
                      <button
                        onClick={() => handleDelete(b)}
                        style={{
                          padding: '6px 12px',
                          background: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer',
                          fontSize: '12px',
                          fontWeight: '500'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <Modal
        isOpen={showModal}
        title="➕ Create New Booking"
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
              User ID *
            </label>
            <input
              type="number"
              value={formData.user_id}
              onChange={(e) => setFormData({ ...formData, user_id: e.target.value })}
              placeholder="Enter user ID"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
              Tour ID *
            </label>
            <input
              type="number"
              value={formData.tour_id}
              onChange={(e) => setFormData({ ...formData, tour_id: e.target.value })}
              placeholder="Enter tour ID"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
              Hotel ID *
            </label>
            <input
              type="number"
              value={formData.hotel_id}
              onChange={(e) => setFormData({ ...formData, hotel_id: e.target.value })}
              placeholder="Enter hotel ID"
              required
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '6px', fontWeight: '600', fontSize: '14px' }}>
              Status
            </label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              style={{
                width: '100%',
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '6px',
                fontSize: '14px'
              }}
            >
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="cancelled">Cancelled</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              type="submit"
              style={{
                flex: 1,
                padding: '10px 16px',
                background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              💾 Create
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                flex: 1,
                padding: '10px 16px',
                background: '#e5e7eb',
                color: '#374151',
                border: 'none',
                borderRadius: '6px',
                fontWeight: '600',
                cursor: 'pointer'
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
