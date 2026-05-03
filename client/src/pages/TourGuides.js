import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { getUser } from '../auth';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { toast, exportCSV } from '../utils/helpers';
import { Icon, Icons } from '../utils/icons';

const EMPTY_FORM = { name: '', phone: '', bio: '', languages: '', rating: 5, tours: 0, available: true };

function Stars({ rating }) {
  const r = Number(rating) || 0;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
      {[1,2,3,4,5].map(i => <span key={i} style={{ color: i <= Math.round(r) ? '#f59e0b' : '#d1d5db', fontSize: 14 }}>★</span>)}
      <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--primary)', marginLeft: 4 }}>{r.toFixed(1)}</span>
    </div>
  );
}

export default function TourGuides() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formModal, setFormModal] = useState(null); // null | 'add' | guide object
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [viewGuide, setViewGuide] = useState(null);
  const [search, setSearch] = useState('');
  const [filterAvail, setFilterAvail] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const user = getUser();
  const isAdmin = user?.role === 'admin';

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const r = await api.get('/tour-guides');
      setGuides(r.data || []);
    } catch {
      toast('Failed to load tour guides', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = guides
    .filter(g => {
      const s = search.toLowerCase();
      return (!s || (g.name || '').toLowerCase().includes(s) || (g.bio || '').toLowerCase().includes(s) || (g.languages || '').toLowerCase().includes(s))
        && (filterAvail === 'all' || (filterAvail === 'available' ? g.available !== 0 && g.available !== false : g.available === 0 || g.available === false));
    })
    .sort((a, b) =>
      sortBy === 'rating' ? Number(b.rating || 0) - Number(a.rating || 0) :
      sortBy === 'tours'  ? Number(b.tours || 0) - Number(a.tours || 0) :
      (a.name || '').localeCompare(b.name || '')
    );

  function openAdd() { setFormData(EMPTY_FORM); setFormModal('add'); }
  function openEdit(g) {
    setFormData({
      name: g.name || '',
      phone: g.phone || '',
      bio: g.bio || '',
      languages: g.languages || '',
      rating: g.rating || 5,
      tours: g.tours || 0,
      available: g.available !== 0 && g.available !== false,
    });
    setFormModal(g);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!formData.name.trim()) return toast('Name is required', 'error');
    setSaving(true);
    try {
      const payload = {
        name: formData.name,
        phone: formData.phone,
        bio: formData.bio,
        languages: formData.languages,
        rating: parseFloat(formData.rating) || 0,
        tours: parseInt(formData.tours) || 0,
        available: formData.available,
      };
      if (formModal === 'add') {
        await api.post('/tour-guides', payload);
        toast('Guide added successfully');
      } else {
        await api.put('/tour-guides/' + formModal.id, payload);
        toast('Guide updated successfully');
      }
      setFormModal(null);
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Error saving guide', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(g) {
    if (!window.confirm(`Delete guide "${g.name}"?`)) return;
    try {
      await api.delete('/tour-guides/' + g.id);
      toast('Guide deleted');
      if (viewGuide?.id === g.id) setViewGuide(null);
      load();
    } catch {
      toast('Error deleting guide', 'error');
    }
  }

  async function toggleAvailability(g) {
    const newAvail = !(g.available !== 0 && g.available !== false);
    try {
      await api.put('/tour-guides/' + g.id, { ...g, available: newAvail });
      toast(newAvail ? 'Guide marked available' : 'Guide marked unavailable');
      if (viewGuide?.id === g.id) setViewGuide({ ...viewGuide, available: newAvail });
      load();
    } catch {
      toast('Error updating availability', 'error');
    }
  }

  const avgRating = guides.length ? (guides.reduce((s, g) => s + Number(g.rating || 0), 0) / guides.length).toFixed(1) : '0.0';
  const isAvailable = g => g.available !== 0 && g.available !== false;

  return (
    <div className="page">
      <div className="page-header-bar">
        <div className="page-title-block">
          <h1>🧭 Tour Guides</h1>
          <p>{guides.length} guides · avg rating {avgRating} ★</p>
        </div>
        <div className="action-bar">
          <button className="btn-icon btn-icon-ghost" onClick={() => exportCSV(filtered.map(g => ({ ID: g.id, Name: g.name, Phone: g.phone || '', Languages: g.languages || '', Rating: g.rating || '', Tours: g.tours || 0, Available: isAvailable(g) })), 'guides.csv')}>
            <Icon d={Icons.download} size={15} /> Export CSV
          </button>
          {isAdmin && (
            <button className="btn-icon btn-icon-primary" onClick={openAdd}>
              <Icon d={Icons.plus} size={15} /> Add Guide
            </button>
          )}
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Guides', value: guides.length, color: 'var(--primary)' },
          { label: 'Available', value: guides.filter(g => isAvailable(g)).length, color: 'var(--success)' },
          { label: 'Avg Rating', value: `${avgRating} ★`, color: '#f59e0b' },
          { label: 'Total Tours', value: guides.reduce((s, g) => s + Number(g.tours || 0), 0), color: '#7c3aed' },
        ].map(s => (
          <div key={s.label} className="stat-mini" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="stat-mini-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-mini-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <Icon d={Icons.search} size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input placeholder="Search by name, bio, languages…" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={filterAvail} onChange={e => setFilterAvail(e.target.value)}>
          <option value="all">All Guides</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="rating">Sort: Rating ↓</option>
          <option value="tours">Sort: Tours ↓</option>
        </select>
        {(search || filterAvail !== 'all') && (
          <button className="btn-icon btn-icon-ghost" onClick={() => { setSearch(''); setFilterAvail('all'); }}>
            <Icon d={Icons.x} size={14} /> Clear
          </button>
        )}
        <span className="filter-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon="🧭" title="No guides found" description={search || filterAvail !== 'all' ? 'Try different filters.' : 'Add your first tour guide.'} action={isAdmin && <button className="btn-icon btn-icon-primary" onClick={openAdd}><Icon d={Icons.plus} size={14} /> Add Guide</button>} />
        </div>
      ) : (
        <div className="data-grid">
          {filtered.map((g, idx) => (
            <div key={g.id} className="data-card" style={{ animation: `slideInUp .3s ease ${idx * .04}s backwards`, opacity: isAvailable(g) ? 1 : 0.75 }}>
              <div className="data-card-header">
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--lighter)', border: '2px solid var(--border-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, fontWeight: 900, color: 'var(--primary)', flexShrink: 0 }}>
                    {(g.name || 'G').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>{g.name}</div>
                    {g.phone && (
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Icon d={Icons.phone} size={11} style={{ color: 'var(--text-muted)' }} /> {g.phone}
                      </div>
                    )}
                  </div>
                  <span className="badge" style={{ background: isAvailable(g) ? '#dcfce7' : '#fee2e2', color: isAvailable(g) ? '#16a34a' : '#dc2626', borderColor: isAvailable(g) ? '#86efac' : '#fca5a5', flexShrink: 0 }}>
                    {isAvailable(g) ? 'Active' : 'Off'}
                  </span>
                </div>
              </div>
              <div className="data-card-body">
                {g.rating > 0 && <div style={{ marginBottom: 8 }}><Stars rating={g.rating} /></div>}
                {g.bio && <p style={{ margin: '0 0 8px', color: 'var(--text-muted)', fontSize: '0.85rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{g.bio}</p>}
                {g.languages && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: '0.8rem', color: 'var(--primary)', padding: '5px 8px', background: 'var(--lighter)', borderRadius: 6, border: '1px solid var(--border)' }}>
                    <Icon d={Icons.globe} size={12} style={{ color: 'var(--primary)' }} /> {g.languages}
                  </div>
                )}
                {g.tours > 0 && (
                  <div style={{ marginTop: 8, fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
                    <Icon d={Icons.plane} size={12} style={{ color: 'var(--text-muted)', marginRight: 4 }} />
                    {g.tours} tours conducted
                  </div>
                )}
              </div>
              <div className="data-card-footer">
                <button className="btn-icon btn-icon-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setViewGuide(g)}>
                  <Icon d={Icons.eye} size={14} /> View
                </button>
                {isAdmin && (
                  <>
                    <button className="btn-icon btn-icon-warning" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(g)}>
                      <Icon d={Icons.edit} size={14} /> Edit
                    </button>
                    <button className="btn-icon" style={{ flex: 1, justifyContent: 'center', background: isAvailable(g) ? '#fee2e2' : '#dcfce7', color: isAvailable(g) ? '#dc2626' : '#16a34a', border: `1px solid ${isAvailable(g) ? '#fca5a5' : '#86efac'}` }} onClick={() => toggleAvailability(g)}>
                      {isAvailable(g) ? 'Disable' : 'Enable'}
                    </button>
                    <button className="btn-icon btn-icon-outline-danger" style={{ padding: '6px 10px' }} onClick={() => handleDelete(g)}>
                      <Icon d={Icons.trash} size={14} />
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewGuide} title={`🧭 ${viewGuide?.name || ''}`} onClose={() => setViewGuide(null)}>
        {viewGuide && (
          <div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 14px', background: 'var(--light)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'var(--lighter)', border: '2px solid var(--border-dark)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, fontWeight: 900, color: 'var(--primary)' }}>
                {(viewGuide.name || 'G').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>{viewGuide.name}</div>
                {viewGuide.phone && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>{viewGuide.phone}</div>}
                {viewGuide.rating > 0 && <div style={{ marginTop: 6 }}><Stars rating={viewGuide.rating} /></div>}
              </div>
            </div>
            {viewGuide.languages && <div className="info-row"><label>Languages</label><div className="info-row-value">{viewGuide.languages}</div></div>}
            {viewGuide.bio && <div className="info-row"><label>About</label><div className="info-row-value" style={{ lineHeight: 1.6 }}>{viewGuide.bio}</div></div>}
            <div className="form-grid-2">
              <div className="info-row"><label>Tours Conducted</label><div className="info-row-value" style={{ fontWeight: 900, color: 'var(--success)', fontSize: '1.1rem' }}>{viewGuide.tours || 0}</div></div>
              <div className="info-row"><label>Status</label><div className="info-row-value"><span className="badge" style={{ background: isAvailable(viewGuide) ? '#dcfce7' : '#fee2e2', color: isAvailable(viewGuide) ? '#16a34a' : '#dc2626', borderColor: isAvailable(viewGuide) ? '#86efac' : '#fca5a5' }}>{isAvailable(viewGuide) ? 'Available' : 'Unavailable'}</span></div></div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn-icon btn-icon-ghost" onClick={() => setViewGuide(null)}><Icon d={Icons.x} size={14} /> Close</button>
              {isAdmin && <button className="btn-icon btn-icon-primary" onClick={() => { setViewGuide(null); openEdit(viewGuide); }}><Icon d={Icons.edit} size={14} /> Edit</button>}
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Modal */}
      <Modal isOpen={!!formModal} title={formModal === 'add' ? '🧭 Add Tour Guide' : '✏️ Edit Tour Guide'} onClose={() => setFormModal(null)}>
        <form onSubmit={handleSave}>
          <div className="form-group"><label>Full Name *</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Guide's full name" required autoFocus /></div>
          <div className="form-grid-2">
            <div className="form-group"><label>Phone</label><input type="tel" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 555-0000" /></div>
            <div className="form-group"><label>Rating (1–5)</label><input type="number" min="0" max="5" step="0.1" value={formData.rating} onChange={e => setFormData({ ...formData, rating: e.target.value })} /></div>
          </div>
          <div className="form-group"><label>Languages</label><input type="text" value={formData.languages} onChange={e => setFormData({ ...formData, languages: e.target.value })} placeholder="e.g. English, Spanish, French" /></div>
          <div className="form-group"><label>Bio</label><textarea value={formData.bio} onChange={e => setFormData({ ...formData, bio: e.target.value })} placeholder="Guide's experience and specialties…" rows={3} /></div>
          <div className="form-group"><label>Tours Conducted</label><input type="number" min="0" value={formData.tours} onChange={e => setFormData({ ...formData, tours: e.target.value })} placeholder="0" /></div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <input type="checkbox" id="guideAvail" checked={!!formData.available} onChange={e => setFormData({ ...formData, available: e.target.checked })} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: 'var(--primary)' }} />
            <label htmlFor="guideAvail" style={{ cursor: 'pointer', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', textTransform: 'none', letterSpacing: 0 }}>Available for tours</label>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn-icon btn-icon-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
              <Icon d={Icons.check} size={15} /> {saving ? 'Saving…' : formModal === 'add' ? 'Add Guide' : 'Update Guide'}
            </button>
            <button type="button" className="btn-icon btn-icon-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setFormModal(null)}>
              <Icon d={Icons.x} size={15} /> Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
