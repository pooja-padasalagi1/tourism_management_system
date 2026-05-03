import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { getUser } from '../auth';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { toast, exportCSV } from '../utils/helpers';
import { Icon, Icons } from '../utils/icons';

function StarRating({ rating, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  const r = Number(rating || 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i}
          style={{ fontSize: 18, cursor: interactive ? 'pointer' : 'default', color: i <= (hover || r) ? '#f59e0b' : '#d1d5db', transition: 'color .15s' }}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange && onChange(i)}
        >★</span>
      ))}
      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--primary)', marginLeft: 4 }}>{r.toFixed(1)}</span>
    </div>
  );
}

export default function Hotels() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [minRating, setMinRating] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', rating: 0, description: '', amenities: '', price_range: '' });
  const [viewHotel, setViewHotel] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const user = getUser();
  const isAdmin = user?.role === 'admin';

  const load = useCallback(async () => {
    try { setLoading(true); const r = await api.get('/hotels'); setItems(r.data || []); }
    catch { toast('Failed to load hotels', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items
    .filter(h => ((String(h.name || '')).toLowerCase().includes(search.toLowerCase()) || (String(h.location || '')).toLowerCase().includes(search.toLowerCase())) && Number(h.rating || 0) >= minRating)
    .sort((a, b) => sortBy === 'rating' ? Number(b.rating || 0) - Number(a.rating || 0) : sortBy === 'location' ? String(a.location || '').localeCompare(String(b.location || '')) : String(a.name || '').localeCompare(String(b.name || '')));

  function openCreate() { setEditingItem(null); setFormData({ name: '', location: '', rating: 0, description: '', amenities: '', price_range: '' }); setShowModal(true); }
  function openEdit(h) { setEditingItem(h); setFormData({ name: h.name, location: h.location, rating: h.rating, description: h.description || '', amenities: h.amenities || '', price_range: h.price_range || '' }); setShowModal(true); }

  async function handleSave(e) {
    e.preventDefault();
    if (!formData.name.trim()) return toast('Hotel name is required', 'error');
    setSaving(true);
    try {
      if (editingItem) { await api.put('/hotels/' + editingItem.id, formData); toast('Hotel updated'); }
      else { await api.post('/hotels', formData); toast('Hotel created'); }
      load(); setShowModal(false); setEditingItem(null);
    } catch { toast('Error saving hotel', 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(h) {
    if (!window.confirm(`Delete "${h.name}"?`)) return;
    try { await api.delete('/hotels/' + h.id); toast('Hotel deleted'); load(); setSelected(s => { s.delete(h.id); return new Set(s); }); }
    catch { toast('Error deleting hotel', 'error'); }
  }

  async function bulkDelete() {
    if (!selected.size || !window.confirm(`Delete ${selected.size} hotel(s)?`)) return;
    try { await Promise.all([...selected].map(id => api.delete('/hotels/' + id))); toast(`Deleted ${selected.size} hotels`); setSelected(new Set()); load(); }
    catch { toast('Bulk delete failed', 'error'); }
  }

  const toggleSelect = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(h => h.id)));
  const avgRating = items.length ? (items.reduce((s, h) => s + Number(h.rating || 0), 0) / items.length).toFixed(1) : '0.0';

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header-bar">
        <div className="page-title-block">
          <h1>🏨 Hotels</h1>
          <p>{items.length} hotels · avg rating {avgRating} ★</p>
        </div>
        <div className="action-bar">
          <button className="btn-icon btn-icon-ghost" onClick={() => exportCSV(filtered.map(h => ({ ID: h.id, Name: h.name, Location: h.location, Rating: h.rating, Description: h.description, Amenities: h.amenities, PriceRange: h.price_range })), 'hotels.csv')}>
            <Icon d={Icons.download} size={15} /> Export CSV
          </button>
          {isAdmin && selected.size > 0 && (
            <button className="btn-icon btn-icon-danger" onClick={bulkDelete}>
              <Icon d={Icons.trash} size={15} /> Delete {selected.size}
            </button>
          )}
          {isAdmin && (
            <button className="btn-icon btn-icon-primary" onClick={openCreate}>
              <Icon d={Icons.plus} size={15} /> Add Hotel
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Hotels', value: items.length, color: 'var(--primary)' },
          { label: 'Avg Rating', value: `${avgRating} ★`, color: '#f59e0b' },
          { label: '4★ & Above', value: items.filter(h => Number(h.rating || 0) >= 4).length, color: 'var(--success)' },
          { label: 'Locations', value: new Set(items.map(h => h.location)).size, color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} className="stat-mini" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="stat-mini-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-mini-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <Icon d={Icons.search} size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input placeholder="Search by name or location…" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Sort: Name A–Z</option>
          <option value="rating">Sort: Rating ↓</option>
          <option value="location">Sort: Location</option>
        </select>
        <select value={minRating} onChange={e => setMinRating(Number(e.target.value))}>
          <option value={0}>All Ratings</option>
          <option value={3}>3★ & above</option>
          <option value={4}>4★ & above</option>
          <option value={4.5}>4.5★ & above</option>
        </select>
        {(search || minRating > 0) && (
          <button className="btn-icon btn-icon-ghost" onClick={() => { setSearch(''); setMinRating(0); }}>
            <Icon d={Icons.x} size={14} /> Clear
          </button>
        )}
        <span className="filter-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon="🏨" title="No hotels found" description={search || minRating > 0 ? 'Try different filters.' : 'Add your first hotel.'} action={isAdmin && !search && <button className="btn-icon btn-icon-primary" onClick={openCreate}><Icon d={Icons.plus} size={14} /> Add Hotel</button>} /></div>
      ) : (
        <>
          {isAdmin && (
            <div className="select-row">
              <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
              <span>{selected.size > 0 ? `${selected.size} selected` : 'Select all'}</span>
            </div>
          )}
          <div className="data-grid">
            {filtered.map((h, idx) => (
              <div key={h.id} className="data-card" style={{ animation: `slideInUp .3s ease ${idx * .04}s backwards`, borderLeft: selected.has(h.id) ? '3px solid var(--primary)' : '3px solid transparent' }}>
                <div className="data-card-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{h.name}</div>
                      <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 3, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z M12 10a2 2 0 100-4 2 2 0 000 4z" size={12} style={{ color: 'var(--text-muted)' }} />
                        {h.location}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isAdmin && <input type="checkbox" checked={selected.has(h.id)} onChange={() => toggleSelect(h.id)} style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--primary)' }} />}
                      <span style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', background: 'var(--lighter)', padding: '2px 8px', borderRadius: 20 }}>#{h.id}</span>
                    </div>
                  </div>
                </div>
                <div className="data-card-body">
                  <StarRating rating={h.rating} />
                </div>
                {isAdmin && (
                  <div className="data-card-footer">
                    <button className="btn-icon btn-icon-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setViewHotel(h)}>
                      <Icon d={Icons.eye} size={14} /> View
                    </button>
                    <button className="btn-icon btn-icon-warning" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(h)}>
                      <Icon d={Icons.edit} size={14} /> Edit
                    </button>
                    <button className="btn-icon btn-icon-outline-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleDelete(h)}>
                      <Icon d={Icons.trash} size={14} /> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewHotel} title={`🏨 ${viewHotel?.name || ''}`} onClose={() => setViewHotel(null)}>
        {viewHotel && (
          <div>
            <div className="form-grid-2">
              <div className="info-row"><label>Hotel ID</label><div className="info-row-value">#{viewHotel.id}</div></div>
              <div className="info-row"><label>Rating</label><div className="info-row-value"><StarRating rating={viewHotel.rating} /></div></div>
            </div>
            <div className="info-row"><label>Location</label><div className="info-row-value">{viewHotel.location}</div></div>
            {viewHotel.description && <div className="info-row"><label>Description</label><div className="info-row-value">{viewHotel.description}</div></div>}
            {viewHotel.amenities && <div className="info-row"><label>Amenities</label><div className="info-row-value">{viewHotel.amenities}</div></div>}
            {viewHotel.price_range && <div className="info-row"><label>Price Range</label><div className="info-row-value">{viewHotel.price_range}</div></div>}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn-icon btn-icon-ghost" onClick={() => setViewHotel(null)}><Icon d={Icons.x} size={14} /> Close</button>
              {isAdmin && <button className="btn-icon btn-icon-primary" onClick={() => { setViewHotel(null); openEdit(viewHotel); }}><Icon d={Icons.edit} size={14} /> Edit</button>}
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} title={editingItem ? '✏️ Edit Hotel' : '🏨 Add Hotel'} onClose={() => { setShowModal(false); setEditingItem(null); }}>
        <form onSubmit={handleSave}>
          <div className="form-group"><label>Hotel Name *</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="e.g. Grand Palace Hotel" required autoFocus /></div>
          <div className="form-group"><label>Location *</label><input type="text" value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} placeholder="City, Country" required /></div>
          <div className="form-group">
            <label>Rating — click stars to set</label>
            <StarRating rating={formData.rating} interactive onChange={v => setFormData({ ...formData, rating: v })} />
            <input type="range" min="0" max="5" step="0.5" value={formData.rating} onChange={e => setFormData({ ...formData, rating: parseFloat(e.target.value) })} style={{ width: '100%', marginTop: 8, accentColor: 'var(--primary)' }} />
          </div>
          <div className="form-group"><label>Description</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Brief description of the hotel" rows={3} /></div>
          <div className="form-group"><label>Amenities</label><input type="text" value={formData.amenities} onChange={e => setFormData({ ...formData, amenities: e.target.value })} placeholder="WiFi, Pool, Gym, etc." /></div>
          <div className="form-group"><label>Price Range</label><input type="text" value={formData.price_range} onChange={e => setFormData({ ...formData, price_range: e.target.value })} placeholder="e.g. $100-$300 per night" /></div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit" className="btn-icon btn-icon-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
              <Icon d={saving ? Icons.refresh : Icons.check} size={15} /> {saving ? 'Saving…' : editingItem ? 'Update Hotel' : 'Create Hotel'}
            </button>
            <button type="button" className="btn-icon btn-icon-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setShowModal(false); setEditingItem(null); }}>
              <Icon d={Icons.x} size={15} /> Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
