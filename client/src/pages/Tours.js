import React, { useEffect, useState } from 'react';
import api from '../api';
import { getUser } from '../auth';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const PriceBadge = ({ price }) => {
  const p = Number(price || 0);
  let category, gradient, icon;
  
  if (p < 500) {
    category = 'Budget';
    gradient = 'linear-gradient(135deg, #10b981 0%, #34d399 100%)';
    icon = '💚';
  } else if (p < 1500) {
    category = 'Mid-Range';
    gradient = 'linear-gradient(135deg, #f59e0b 0%, #fbbf24 100%)';
    icon = '🟡';
  } else {
    category = 'Luxury';
    gradient = 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)';
    icon = '💜';
  }
  
  return (
    <div style={{
      background: gradient,
      color: '#fff',
      padding: '6px 14px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: 800,
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
      border: '2px solid rgba(255,255,255,0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '4px'
    }}>
      <span>{icon}</span>
      <span>{category}</span>
    </div>
  );
};

export default function Tours(){
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ title: '', description: '', price: 0 });
  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  useEffect(() => { load(); }, []);

  async function load(){
    try {
      setLoading(true);
      const res = await api.get('/tours');
      setItems(res.data || []);
    } catch(e) {
      console.error('Error loading tours:', e);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || (t.description && t.description.toLowerCase().includes(search.toLowerCase())))
    .filter(t => {
      const p = Number(t.price || 0);
      if (priceFilter === 'budget') return p < 500;
      if (priceFilter === 'mid') return p >= 500 && p < 1500;
      if (priceFilter === 'luxury') return p >= 1500;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'title') return a.title.localeCompare(b.title);
      if (sortBy === 'price') return Number(a.price || 0) - Number(b.price || 0);
      if (sortBy === 'price-desc') return Number(b.price || 0) - Number(a.price || 0);
      return 0;
    });

  function openCreateModal() {
    setEditingItem(null);
    setFormData({ title: '', description: '', price: 0 });
    setShowModal(true);
  }

  function openEditModal(t) {
    setEditingItem(t);
    setFormData({ title: t.title, description: t.description, price: Number(t.price) || 0 });
    setShowModal(true);
  }

  async function handleSave() {
    if (!formData.title.trim()) {
      alert('Tour title is required');
      return;
    }
    try {
      if (editingItem) {
        await api.put('/tours/' + editingItem.id, formData);
      } else {
        await api.post('/tours', formData);
      }
      load();
      setShowModal(false);
    } catch(e) {
      alert('Error saving tour');
    }
  }

  async function handleDelete(t){
    if (!confirm('Delete tour ' + t.title + '?')) return;
    try {
      await api.delete('/tours/' + t.id);
      load();
    } catch(e) {
      alert('Error deleting tour');
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
            }}>✈️</span>
            <span>Tours</span>
          </h2>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: 'var(--muted)', 
            fontSize: '15px',
            fontWeight: 500
          }}>
            Discover and manage amazing travel experiences
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
            <span>Add Tour</span>
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
          placeholder="🔍 Search tours by title or description..."
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
          value={priceFilter}
          onChange={(e) => setPriceFilter(e.target.value)}
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
            minWidth: '160px'
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
          <option value="all">💰 All Prices</option>
          <option value="budget">💚 Budget</option>
          <option value="mid">🟡 Mid-Range</option>
          <option value="luxury">💜 Luxury</option>
        </select>
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
          <option value="title">📝 Sort by Title</option>
          <option value="price">💵 Price: Low to High</option>
          <option value="price-desc">💎 Price: High to Low</option>
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
              Loading amazing tours...
            </p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="✈️"
          title={search || priceFilter !== 'all' ? "No tours found" : "No tours yet"}
          description={search || priceFilter !== 'all' ? "Try adjusting your search or filters." : "Start by creating your first tour!"}
          action={isAdmin && !search && priceFilter === 'all' && (
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
              <span>Create First Tour</span>
            </button>
          )}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {filteredItems.map((t, idx) => (
            <div 
              key={t.id} 
              className="card" 
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                animation: `slideInUp 0.5s ease ${idx * 0.08}s backwards`,
                position: 'relative',
                overflow: 'hidden',
                minHeight: '280px',
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
                zIndex: 10
              }}>
                <PriceBadge price={t.price} />
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
                  paddingRight: '100px',
                  lineHeight: '1.3'
                }}>
                  {t.title}
                </h3>
                
                {t.description && (
                  <p style={{ 
                    margin: '0 0 16px 0', 
                    color: 'var(--muted)', 
                    fontSize: '14px', 
                    lineHeight: '1.6',
                    fontWeight: 500,
                    display: '-webkit-box',
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                  }}>
                    {t.description}
                  </p>
                )}
                
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '12px 16px',
                  background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(139,92,246,0.08) 100%)',
                  borderRadius: '12px',
                  border: '2px solid rgba(99,102,241,0.15)',
                  marginTop: '12px'
                }}>
                  <span style={{ fontSize: '24px' }}>💰</span>
                  <div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--muted)', 
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      Price
                    </div>
                    <div style={{ 
                      fontSize: '26px', 
                      fontWeight: 900,
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      lineHeight: '1'
                    }}>
                      ${Number(t.price || 0).toFixed(2)}
                    </div>
                  </div>
                </div>
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
                    onClick={() => openEditModal(t)}
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
                    onClick={() => handleDelete(t)}
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
        title={editingItem ? '✏️ Edit Tour' : '✨ Add New Tour'}
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
              ✈️ Tour Title *
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Enter tour title"
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
              📝 Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter tour description"
              style={{ 
                resize: 'vertical', 
                minHeight: '120px',
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
              💰 Price ($) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.price}
              onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
              placeholder="Enter price"
              required
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
              <span>💾</span> Save Tour
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
