import React, { useEffect, useState } from 'react';
import api from '../api';
import { getUser } from '../auth';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const RatingStars = ({ rating }) => {
  const fullStars = Math.floor(rating);
  const hasHalfStar = rating % 1 >= 0.5;
  
  return (
    <div style={{ 
      display: 'flex', 
      alignItems: 'center', 
      gap: '8px',
      padding: '8px 12px',
      background: 'linear-gradient(135deg, rgba(245,158,11,0.1) 0%, rgba(251,191,36,0.1) 100%)',
      borderRadius: '8px',
      border: '1px solid rgba(245,158,11,0.2)'
    }}>
      <div style={{ fontSize: '18px', display: 'flex', gap: '2px' }}>
        {[...Array(5)].map((_, i) => (
          <span key={i} style={{ 
            color: i < fullStars ? '#f59e0b' : (i === fullStars && hasHalfStar ? '#fbbf24' : '#e5e7eb'),
            filter: i < rating ? 'drop-shadow(0 2px 4px rgba(245,158,11,0.3))' : 'none',
            transition: 'all 0.3s ease'
          }}>
            {i < fullStars ? '⭐' : (i === fullStars && hasHalfStar ? '⭐' : '☆')}
          </span>
        ))}
      </div>
      <span style={{ 
        fontWeight: 700, 
        color: '#f59e0b', 
        fontSize: '14px',
        textShadow: '0 1px 2px rgba(0,0,0,0.1)'
      }}>
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

export default function Hotels(){
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', location: '', rating: 0 });
  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  useEffect(() => { load(); }, []);

  async function load(){
    try {
      setLoading(true);
      const res = await api.get('/hotels');
      setItems(res.data || []);
    } catch(e) {
      console.error('Error loading hotels:', e);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items
    .filter(h => h.name.toLowerCase().includes(search.toLowerCase()) || h.location.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'rating') return b.rating - a.rating;
      if (sortBy === 'location') return a.location.localeCompare(b.location);
      return 0;
    });

  function openCreateModal() {
    setEditingItem(null);
    setFormData({ name: '', location: '', rating: 0 });
    setShowModal(true);
  }

  function openEditModal(h) {
    setEditingItem(h);
    setFormData({ name: h.name, location: h.location, rating: h.rating });
    setShowModal(true);
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      alert('Hotel name is required');
      return;
    }
    try {
      if (editingItem) {
        await api.put('/hotels/' + editingItem.id, formData);
      } else {
        await api.post('/hotels', formData);
      }
      load();
      setShowModal(false);
    } catch(e) {
      alert('Error saving hotel');
    }
  }

  async function handleDelete(h){
    if (!confirm('Delete hotel ' + h.name + '?')) return;
    try {
      await api.delete('/hotels/' + h.id);
      load();
    } catch(e) {
      alert('Error deleting hotel');
    }
  }

  return (
    <div className="page">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              fontSize: '42px',
              filter: 'drop-shadow(0 4px 8px rgba(99,102,241,0.3))'
            }}>🏨</span>
            <span>Hotels</span>
          </h2>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: 'var(--muted)', 
            fontSize: '15px',
            fontWeight: 500
          }}>
            Manage your hotel listings and accommodations
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={openCreateModal}
            className="btn"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '14px 28px',
              fontSize: '14px'
            }}
          >
            <span style={{ fontSize: '18px' }}>✨</span>
            <span>Add Hotel</span>
          </button>
        )}
      </div>
      
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '32px', 
        flexWrap: 'wrap', 
        alignItems: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        borderRadius: '16px',
        border: '2px solid rgba(99,102,241,0.1)',
        boxShadow: '0 4px 20px rgba(99,102,241,0.08)'
      }}>
        <input
          type="text"
          placeholder="🔍 Search hotels by name or location..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '250px',
            padding: '14px 20px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#8b5cf6';
            e.target.style.boxShadow = '0 0 0 4px rgba(139,92,246,0.15), 0 4px 12px rgba(0,0,0,0.08)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            e.target.style.transform = 'translateY(0)';
          }}
        />
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          style={{
            padding: '14px 20px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            minWidth: '180px'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#8b5cf6';
            e.target.style.boxShadow = '0 0 0 4px rgba(139,92,246,0.15), 0 4px 12px rgba(0,0,0,0.08)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          }}
        >
          <option value="name">📝 Sort by Name</option>
          <option value="rating">⭐ Sort by Rating</option>
          <option value="location">📍 Sort by Location</option>
        </select>
      </div>

      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.3) 100%)',
          borderRadius: '20px',
          border: '2px dashed rgba(99,102,241,0.2)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Spinner size="md" />
            <p style={{ 
              marginTop: '20px', 
              color: 'var(--muted)',
              fontSize: '16px',
              fontWeight: 600
            }}>
              Loading amazing hotels...
            </p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="🏨"
          title={search ? "No hotels found" : "No hotels yet"}
          description={search ? "Try adjusting your search filters." : "Start by creating your first hotel!"}
          action={isAdmin && !search && (
            <button
              onClick={openCreateModal}
              className="btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <span style={{ fontSize: '18px' }}>✨</span>
              <span>Create First Hotel</span>
            </button>
          )}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '24px'
        }}>
          {filteredItems.map((h, idx) => (
            <div 
              key={h.id} 
              className="card" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                animation: `slideInUp 0.5s ease ${idx * 0.08}s backwards`,
                position: 'relative',
                overflow: 'hidden',
                minHeight: '220px',
                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0) scale(1)';
              }}
            >
              <div style={{
                position: 'absolute',
                top: '12px',
                right: '12px',
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                color: '#fff',
                padding: '6px 12px',
                borderRadius: '20px',
                fontSize: '11px',
                fontWeight: 800,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                boxShadow: '0 4px 12px rgba(99,102,241,0.4)',
                border: '2px solid rgba(255,255,255,0.3)'
              }}>
                Hotel
              </div>
              
              <div>
                <h3 style={{ 
                  margin: '0 0 12px 0', 
                  color: 'var(--text)',
                  fontSize: '22px',
                  fontWeight: 800,
                  background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                  paddingRight: '80px'
                }}>
                  {h.name}
                </h3>
                
                <div style={{ 
                  marginBottom: '16px', 
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 14px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.05) 0%, rgba(139,92,246,0.05) 100%)',
                  borderRadius: '10px',
                  border: '1px solid rgba(99,102,241,0.1)'
                }}>
                  <span style={{ fontSize: '18px' }}>📍</span>
                  <span style={{ 
                    color: 'var(--muted)', 
                    fontSize: '14px',
                    fontWeight: 600
                  }}>
                    {h.location}
                  </span>
                </div>
                
                <RatingStars rating={h.rating} />
              </div>
              
              {isAdmin && (
                <div style={{ 
                  display: 'flex', 
                  gap: '10px', 
                  marginTop: '20px',
                  paddingTop: '16px',
                  borderTop: '2px solid rgba(99,102,241,0.1)'
                }}>
                  <button
                    onClick={() => openEditModal(h)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(99,102,241,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(99,102,241,0.3)';
                    }}
                  >
                    <span>✏️</span> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(h)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(244,63,94,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(244,63,94,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(244,63,94,0.3)';
                    }}
                  >
                    <span>🗑️</span> Delete
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      <Modal
        isOpen={showModal}
        title={editingItem ? '✏️ Edit Hotel' : '✨ Add New Hotel'}
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 700, 
              fontSize: '14px',
              color: 'var(--text)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              🏨 Hotel Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter hotel name"
              required
              style={{
                width: '100%',
                padding: '14px 18px',
                fontSize: '14px',
                fontWeight: 600
              }}
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 700, 
              fontSize: '14px',
              color: 'var(--text)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              📍 Location
            </label>
            <input
              type="text"
              value={formData.location}
              onChange={(e) => setFormData({ ...formData, location: e.target.value })}
              placeholder="Enter location"
              style={{
                width: '100%',
                padding: '14px 18px',
                fontSize: '14px',
                fontWeight: 600
              }}
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 700, 
              fontSize: '14px',
              color: 'var(--text)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              ⭐ Rating (1-5)
            </label>
            <input
              type="number"
              min="1"
              max="5"
              step="0.1"
              value={formData.rating}
              onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
              placeholder="Enter rating"
              style={{
                width: '100%',
                padding: '14px 18px',
                fontSize: '14px',
                fontWeight: 600
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              className="btn"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>💾</span> Save Hotel
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                flex: 1,
                padding: '14px 20px',
                background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                color: '#374151',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
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
