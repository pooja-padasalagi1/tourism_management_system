import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { getUser } from '../auth';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { toast, exportCSV } from '../utils/helpers';
import { Icon, Icons } from '../utils/icons';

function PriceTier({ price }) {
  const p = Number(price || 0);
  const [label, color] = p < 500 ? ['Budget', '#16a34a'] : p < 1500 ? ['Mid-Range', '#d97706'] : ['Luxury', '#7c3aed'];
  return <span className="badge" style={{ background: `${color}18`, color, borderColor: `${color}40` }}>{label}</span>;
}

export default function Tours() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('title');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', price: 0, duration_days: 1, difficulty: 'Easy', max_participants: 10 });
  const [viewTour, setViewTour] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const user = getUser();
  const isAdmin = user?.role === 'admin';

  const load = useCallback(async () => {
    try { setLoading(true); const r = await api.get('/tours'); setItems(r.data || []); }
    catch { toast('Failed to load tours', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items
    .filter(t => (String(t.title || '')).toLowerCase().includes(search.toLowerCase()) || (String(t.description || '')).toLowerCase().includes(search.toLowerCase()))
    .filter(t => { const p = Number(t.price || 0); if (priceFilter === 'budget') return p < 500; if (priceFilter === 'mid') return p >= 500 && p < 1500; if (priceFilter === 'luxury') return p >= 1500; return true; })
    .sort((a, b) => sortBy === 'price' ? Number(a.price || 0) - Number(b.price || 0) : sortBy === 'price-desc' ? Number(b.price || 0) - Number(a.price || 0) : String(a.title || '').localeCompare(String(b.title || '')));

  function openCreate() { setEditingItem(null); setFormData({ title: '', description: '', price: 0, duration_days: 1, difficulty: 'Easy', max_participants: 10 }); setShowModal(true); }
  function openEdit(t) { setEditingItem(t); setFormData({ title: t.title, description: t.description || '', price: Number(t.price) || 0, duration_days: t.duration_days || 1, difficulty: t.difficulty || 'Easy', max_participants: t.max_participants || 10 }); setShowModal(true); }

  async function handleSave(e) {
    e.preventDefault();
    if (!formData.title.trim()) return toast('Tour title is required', 'error');
    setSaving(true);
    try {
      if (editingItem) { await api.put('/tours/' + editingItem.id, formData); toast('Tour updated'); }
      else { await api.post('/tours', formData); toast('Tour created'); }
      load(); setShowModal(false); setEditingItem(null);
    } catch { toast('Error saving tour', 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(t) {
    if (!window.confirm(`Delete "${t.title}"?`)) return;
    try { await api.delete('/tours/' + t.id); toast('Tour deleted'); load(); setSelected(s => { s.delete(t.id); return new Set(s); }); }
    catch { toast('Error deleting tour', 'error'); }
  }

  async function bulkDelete() {
    if (!selected.size || !window.confirm(`Delete ${selected.size} tour(s)?`)) return;
    try { await Promise.all([...selected].map(id => api.delete('/tours/' + id))); toast(`Deleted ${selected.size} tours`); setSelected(new Set()); load(); }
    catch { toast('Bulk delete failed', 'error'); }
  }

  const toggleSelect = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(t => t.id)));
  const totalRevenue = items.reduce((s, t) => s + Number(t.price || 0), 0);
  const avgPrice = items.length ? (totalRevenue / items.length).toFixed(0) : 0;

  return (
    <div className="page">
      <div className="page-header-bar">
        <div className="page-title-block">
          <h1>✈️ Tours</h1>
          <p>{items.length} tours · avg price ${avgPrice}</p>
        </div>
        <div className="action-bar">
          <button className="btn-icon btn-icon-ghost" onClick={() => exportCSV(filtered.map(t => ({ ID: t.id, Title: t.title, Description: t.description || '', Price: t.price })), 'tours.csv')}>
            <Icon d={Icons.download} size={15} /> Export CSV
          </button>
          {isAdmin && selected.size > 0 && (
            <button className="btn-icon btn-icon-danger" onClick={bulkDelete}>
              <Icon d={Icons.trash} size={15} /> Delete {selected.size}
            </button>
          )}
          {isAdmin && (
            <button className="btn-icon btn-icon-primary" onClick={openCreate}>
              <Icon d={Icons.plus} size={15} /> Add Tour
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Tours', value: items.length, color: 'var(--primary)' },
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, color: 'var(--success)' },
          { label: 'Avg Price', value: `$${avgPrice}`, color: '#d97706' },
          { label: 'Luxury Tours', value: items.filter(t => Number(t.price || 0) >= 1500).length, color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} className="stat-mini" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="stat-mini-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-mini-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <Icon d={Icons.search} size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input placeholder="Search tours…" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={priceFilter} onChange={e => setPriceFilter(e.target.value)}>
          <option value="all">All Prices</option>
          <option value="budget">Budget (&lt;$500)</option>
          <option value="mid">Mid ($500–$1500)</option>
          <option value="luxury">Luxury ($1500+)</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="title">Sort: Title A–Z</option>
          <option value="price">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
        {(search || priceFilter !== 'all') && (
          <button className="btn-icon btn-icon-ghost" onClick={() => { setSearch(''); setPriceFilter('all'); }}>
            <Icon d={Icons.x} size={14} /> Clear
          </button>
        )}
        <span className="filter-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon="✈️" title="No tours found" description={search || priceFilter !== 'all' ? 'Try different filters.' : 'Create your first tour.'} action={isAdmin && !search && priceFilter === 'all' && <button className="btn-icon btn-icon-primary" onClick={openCreate}><Icon d={Icons.plus} size={14} /> Add Tour</button>} /></div>
      ) : (
        <>
          {isAdmin && (
            <div className="select-row">
              <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
              <span>{selected.size > 0 ? `${selected.size} selected` : 'Select all'}</span>
            </div>
          )}
          <div className="data-grid">
            {filtered.map((t, idx) => (
              <div key={t.id} className="data-card" style={{ animation: `slideInUp .3s ease ${idx * .04}s backwards`, borderLeft: selected.has(t.id) ? '3px solid var(--primary)' : '3px solid transparent' }}>
                <div className="data-card-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.title}</div>
                      <div style={{ marginTop: 6 }}><PriceTier price={t.price} /></div>
                    </div>
                    {isAdmin && <input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSelect(t.id)} style={{ width: 15, height: 15, cursor: 'pointer', accentColor: 'var(--primary)', flexShrink: 0 }} />}
                  </div>
                </div>
                <div className="data-card-body">
                  {t.description && <p style={{ margin: '0 0 12px', color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{t.description}</p>}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', background: 'var(--light)', borderRadius: 8, border: '1px solid var(--border)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Price</span>
                    <span style={{ fontSize: '1.3rem', fontWeight: 900, color: 'var(--primary)', fontFamily: 'Poppins, sans-serif' }}>${Number(t.price || 0).toLocaleString()}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
                    <span style={{ fontSize: '0.75rem', background: 'var(--lighter)', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: 12, fontWeight: 600 }}>{t.duration_days || 1} day{t.duration_days !== 1 ? 's' : ''}</span>
                    <span style={{ fontSize: '0.75rem', background: 'var(--lighter)', color: 'var(--text-muted)', padding: '4px 8px', borderRadius: 12, fontWeight: 600 }}>{t.difficulty || 'Easy'}</span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="data-card-footer">
                    <button className="btn-icon btn-icon-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setViewTour(t)}><Icon d={Icons.eye} size={14} /> View</button>
                    <button className="btn-icon btn-icon-warning" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(t)}><Icon d={Icons.edit} size={14} /> Edit</button>
                    <button className="btn-icon btn-icon-outline-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleDelete(t)}><Icon d={Icons.trash} size={14} /> Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      <Modal isOpen={!!viewTour} title={`✈️ ${viewTour?.title || ''}`} onClose={() => setViewTour(null)}>
        {viewTour && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <PriceTier price={viewTour.price} />
              <span style={{ fontSize: '1.5rem', fontWeight: 900, color: 'var(--primary)' }}>${Number(viewTour.price || 0).toLocaleString()}</span>
            </div>
            {viewTour.description && <div className="info-row"><label>Description</label><div className="info-row-value" style={{ lineHeight: 1.6 }}>{viewTour.description}</div></div>}
            <div className="form-grid-2">
              <div className="info-row"><label>Duration</label><div className="info-row-value">{viewTour.duration_days || 1} day{viewTour.duration_days !== 1 ? 's' : ''}</div></div>
              <div className="info-row"><label>Difficulty</label><div className="info-row-value">{viewTour.difficulty || 'Easy'}</div></div>
            </div>
            <div className="info-row"><label>Max Participants</label><div className="info-row-value">{viewTour.max_participants || 10}</div></div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn-icon btn-icon-ghost" onClick={() => setViewTour(null)}><Icon d={Icons.x} size={14} /> Close</button>
              {isAdmin && <button className="btn-icon btn-icon-primary" onClick={() => { setViewTour(null); openEdit(viewTour); }}><Icon d={Icons.edit} size={14} /> Edit</button>}
            </div>
          </div>
        )}
      </Modal>

      <Modal isOpen={showModal} title={editingItem ? '✏️ Edit Tour' : '✈️ Add Tour'} onClose={() => setShowModal(false)}>
        <form onSubmit={handleSave}>
          <div className="form-group"><label>Tour Title *</label><input type="text" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} placeholder="e.g. Bali Adventure Trek" required autoFocus /></div>
          <div className="form-group"><label>Description</label><textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} placeholder="Describe the tour experience…" rows={3} /></div>
          <div className="form-group">
            <label>Price (USD) *</label>
            <input type="number" step="1" min="0" value={formData.price} onChange={e => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })} placeholder="0" required />
            <div style={{ marginTop: 6 }}><PriceTier price={formData.price} /></div>
          </div>
          <div className="form-grid-2">
            <div className="form-group"><label>Duration (Days)</label><input type="number" min="1" value={formData.duration_days} onChange={e => setFormData({ ...formData, duration_days: parseInt(e.target.value) || 1 })} /></div>
            <div className="form-group"><label>Difficulty</label><select value={formData.difficulty} onChange={e => setFormData({ ...formData, difficulty: e.target.value })}><option>Easy</option><option>Moderate</option><option>Hard</option><option>Extreme</option></select></div>
          </div>
          <div className="form-group"><label>Max Participants</label><input type="number" min="1" value={formData.max_participants} onChange={e => setFormData({ ...formData, max_participants: parseInt(e.target.value) || 10 })} /></div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit" className="btn-icon btn-icon-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
              <Icon d={Icons.check} size={15} /> {saving ? 'Saving…' : editingItem ? 'Update Tour' : 'Create Tour'}
            </button>
            <button type="button" className="btn-icon btn-icon-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setShowModal(false)}>
              <Icon d={Icons.x} size={15} /> Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
