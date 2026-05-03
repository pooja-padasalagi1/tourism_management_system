import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { getUser } from '../auth';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { toast, exportCSV, formatDate } from '../utils/helpers';
import { Icon, Icons } from '../utils/icons';

const STATUS_CFG = {
  pending:   { color: '#d97706', bg: '#fef3c7', border: '#fde68a', label: 'Pending' },
  confirmed: { color: '#16a34a', bg: '#dcfce7', border: '#86efac', label: 'Confirmed' },
  cancelled: { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', label: 'Cancelled' },
  completed: { color: '#2563eb', bg: '#dbeafe', border: '#93c5fd', label: 'Completed' },
};

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  return <span className="badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>{cfg.label}</span>;
}

export default function Bookings() {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ user_id: '', tour_id: '', hotel_id: '', status: 'pending', notes: '' });
  const [viewBooking, setViewBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [tours, setTours] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]);
  const user = getUser();
  const isAdmin = user?.role === 'admin';

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [bRes, tRes, hRes, uRes] = await Promise.all([
        api.get('/bookings').catch(() => ({ data: [] })),
        api.get('/tours').catch(() => ({ data: [] })),
        api.get('/hotels').catch(() => ({ data: [] })),
        api.get('/users').catch(() => ({ data: [] })),
      ]);
      setItems(bRes.data || []); setTours(tRes.data || []); setHotels(hRes.data || []); setUsers(uRes.data || []);
    } catch { toast('Failed to load bookings', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items
    .filter(b => (statusFilter === 'all' || b.status === statusFilter))
    .filter(b => { const s = search.toLowerCase(); return !s || String(b.id).includes(s) || (b.user_name || '').toLowerCase().includes(s) || (b.tour_title || '').toLowerCase().includes(s) || (b.hotel_name || '').toLowerCase().includes(s); })
    .sort((a, b) => sortBy === 'oldest' ? a.id - b.id : b.id - a.id);

  function openCreate() { setEditingItem(null); setFormData({ user_id: '', tour_id: '', hotel_id: '', status: 'pending', notes: '' }); setShowModal(true); }
  function openEdit(b) { setEditingItem(b); setFormData({ user_id: b.user_id || '', tour_id: b.tour_id || '', hotel_id: b.hotel_id || '', status: b.status || 'pending', notes: b.notes || '' }); setShowModal(true); }

  async function handleSave(e) {
    e.preventDefault();
    if (!formData.user_id || !formData.tour_id || !formData.hotel_id) return toast('User, Tour and Hotel are required', 'error');
    setSaving(true);
    try {
      if (editingItem) { await api.put('/bookings/' + editingItem.id, formData); toast('Booking updated'); }
      else { await api.post('/bookings', formData); toast('Booking created'); }
      load(); setShowModal(false); setEditingItem(null);
    } catch { toast('Error saving booking', 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(b) {
    if (!window.confirm(`Delete booking #${b.id}?`)) return;
    try { await api.delete('/bookings/' + b.id); toast('Booking deleted'); load(); setSelected(s => { s.delete(b.id); return new Set(s); }); }
    catch { toast('Error deleting booking', 'error'); }
  }

  async function quickStatus(b, status) {
    try { await api.put('/bookings/' + b.id, { ...b, status }); toast(`Status → ${status}`); load(); if (viewBooking?.id === b.id) setViewBooking({ ...viewBooking, status }); }
    catch { toast('Error updating status', 'error'); }
  }

  async function bulkDelete() {
    if (!selected.size || !window.confirm(`Delete ${selected.size} booking(s)?`)) return;
    try { await Promise.all([...selected].map(id => api.delete('/bookings/' + id))); toast(`Deleted ${selected.size} bookings`); setSelected(new Set()); load(); }
    catch { toast('Bulk delete failed', 'error'); }
  }

  const toggleSelect = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(b => b.id)));

  const stats = { total: items.length, pending: items.filter(b => b.status === 'pending').length, confirmed: items.filter(b => b.status === 'confirmed').length, completed: items.filter(b => b.status === 'completed').length, cancelled: items.filter(b => b.status === 'cancelled').length };

  return (
    <div className="page">
      <div className="page-header-bar">
        <div className="page-title-block">
          <h1>📅 Bookings</h1>
          <p>{items.length} total bookings</p>
        </div>
        <div className="action-bar">
          <button className="btn-icon btn-icon-ghost" onClick={() => exportCSV(filtered.map(b => ({ ID: b.id, Guest: b.user_name || b.user_id, Tour: b.tour_title || b.tour_id, Hotel: b.hotel_name || b.hotel_id, Status: b.status, Date: formatDate(b.created_at) })), 'bookings.csv')}>
            <Icon d={Icons.download} size={15} /> Export CSV
          </button>
          {isAdmin && selected.size > 0 && (
            <button className="btn-icon btn-icon-danger" onClick={bulkDelete}><Icon d={Icons.trash} size={15} /> Delete {selected.size}</button>
          )}
          {isAdmin && (
            <button className="btn-icon btn-icon-primary" onClick={openCreate}><Icon d={Icons.plus} size={15} /> Create Booking</button>
          )}
        </div>
      </div>

      {/* Stats — clickable to filter */}
      <div className="stats-grid">
        {[
          { label: 'Total', value: stats.total, color: 'var(--primary)', key: 'all' },
          { label: 'Pending', value: stats.pending, color: '#d97706', key: 'pending' },
          { label: 'Confirmed', value: stats.confirmed, color: '#16a34a', key: 'confirmed' },
          { label: 'Completed', value: stats.completed, color: '#7c3aed', key: 'completed' },
          { label: 'Cancelled', value: stats.cancelled, color: '#dc2626', key: 'cancelled' },
        ].map(s => (
          <div key={s.label} className="stat-mini" style={{ borderLeft: `3px solid ${s.color}`, cursor: 'pointer', outline: statusFilter === s.key ? `2px solid ${s.color}` : 'none' }} onClick={() => setStatusFilter(s.key)}>
            <div className="stat-mini-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-mini-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <Icon d={Icons.search} size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input placeholder="Search by ID, guest, tour, hotel…" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        {(search || statusFilter !== 'all') && (
          <button className="btn-icon btn-icon-ghost" onClick={() => { setSearch(''); setStatusFilter('all'); }}><Icon d={Icons.x} size={14} /> Clear</button>
        )}
        <span className="filter-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon="📅" title="No bookings found" description="Try different filters or create a new booking." action={isAdmin && <button className="btn-icon btn-icon-primary" onClick={openCreate}><Icon d={Icons.plus} size={14} /> Create Booking</button>} /></div>
      ) : (
        <>
          {isAdmin && (
            <div className="select-row">
              <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
              <span>{selected.size > 0 ? `${selected.size} selected` : 'Select all'}</span>
            </div>
          )}
          <div className="data-grid">
            {filtered.map((b, idx) => (
              <div key={b.id} className="data-card" style={{ animation: `slideInUp .3s ease ${idx * .04}s backwards`, borderLeft: selected.has(b.id) ? '3px solid var(--primary)' : '3px solid transparent' }}>
                <div className="data-card-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>#{b.id} — {b.user_name || `User ${b.user_id}`}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 3 }}>{b.tour_title || `Tour ${b.tour_id}`}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 2 }}>{b.hotel_name || `Hotel ${b.hotel_id}`}</div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                      <StatusBadge status={b.status} />
                      {b.created_at && <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{formatDate(b.created_at)}</span>}
                      {isAdmin && <input type="checkbox" checked={selected.has(b.id)} onChange={() => toggleSelect(b.id)} style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--primary)' }} />}
                    </div>
                  </div>
                </div>
                {/* Quick status actions */}
                {isAdmin && b.status === 'pending' && (
                  <div style={{ display: 'flex', gap: 6, padding: '8px 12px', background: 'var(--light)', borderBottom: '1px solid var(--border)' }}>
                    <button className="btn-icon btn-icon-success" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '5px 8px' }} onClick={() => quickStatus(b, 'confirmed')}><Icon d={Icons.check} size={12} /> Confirm</button>
                    <button className="btn-icon btn-icon-outline-danger" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '5px 8px' }} onClick={() => quickStatus(b, 'cancelled')}><Icon d={Icons.x} size={12} /> Cancel</button>
                  </div>
                )}
                {isAdmin && b.status === 'confirmed' && (
                  <div style={{ display: 'flex', gap: 6, padding: '8px 12px', background: 'var(--light)', borderBottom: '1px solid var(--border)' }}>
                    <button className="btn-icon btn-icon-primary" style={{ flex: 1, justifyContent: 'center', fontSize: '0.75rem', padding: '5px 8px' }} onClick={() => quickStatus(b, 'completed')}><Icon d={Icons.check} size={12} /> Mark Complete</button>
                  </div>
                )}
                {isAdmin && (
                  <div className="data-card-footer">
                    <button className="btn-icon btn-icon-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setViewBooking(b)}><Icon d={Icons.eye} size={14} /> View</button>
                    <button className="btn-icon btn-icon-warning" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(b)}><Icon d={Icons.edit} size={14} /> Edit</button>
                    <button className="btn-icon btn-icon-outline-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleDelete(b)}><Icon d={Icons.trash} size={14} /> Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewBooking} title={`📅 Booking #${viewBooking?.id}`} onClose={() => setViewBooking(null)}>
        {viewBooking && (
          <div>
            <div className="form-grid-2">
              <div className="info-row"><label>Guest</label><div className="info-row-value">{viewBooking.user_name || `User #${viewBooking.user_id}`}</div></div>
              <div className="info-row"><label>Status</label><div className="info-row-value"><StatusBadge status={viewBooking.status} /></div></div>
            </div>
            <div className="info-row"><label>Tour</label><div className="info-row-value">{viewBooking.tour_title || `Tour #${viewBooking.tour_id}`}</div></div>
            <div className="info-row"><label>Hotel</label><div className="info-row-value">{viewBooking.hotel_name || `Hotel #${viewBooking.hotel_id}`}</div></div>
            {viewBooking.created_at && <div className="info-row"><label>Created</label><div className="info-row-value">{formatDate(viewBooking.created_at)}</div></div>}
            {viewBooking.notes && <div className="info-row"><label>Notes</label><div className="info-row-value">{viewBooking.notes}</div></div>}
            {isAdmin && (
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
                {Object.entries(STATUS_CFG).filter(([k]) => k !== viewBooking.status).map(([k, v]) => (
                  <button key={k} className="btn-icon" style={{ background: v.bg, color: v.color, border: `1px solid ${v.border}`, fontSize: '0.8rem', padding: '5px 10px' }} onClick={() => quickStatus(viewBooking, k)}>
                    → {v.label}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn-icon btn-icon-ghost" onClick={() => setViewBooking(null)}><Icon d={Icons.x} size={14} /> Close</button>
              {isAdmin && <button className="btn-icon btn-icon-primary" onClick={() => { setViewBooking(null); openEdit(viewBooking); }}><Icon d={Icons.edit} size={14} /> Edit</button>}
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} title={editingItem ? `✏️ Edit Booking #${editingItem.id}` : '📅 Create Booking'} onClose={() => { setShowModal(false); setEditingItem(null); }}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>User *</label>
            <select value={formData.user_id} onChange={e => setFormData({ ...formData, user_id: e.target.value })} required>
              <option value="">Select user…</option>
              {users.map(u => <option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Tour *</label>
            <select value={formData.tour_id} onChange={e => setFormData({ ...formData, tour_id: e.target.value })} required>
              <option value="">Select tour…</option>
              {tours.map(t => <option key={t.id} value={t.id}>{t.title} — ${t.price}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Hotel *</label>
            <select value={formData.hotel_id} onChange={e => setFormData({ ...formData, hotel_id: e.target.value })} required>
              <option value="">Select hotel…</option>
              {hotels.map(h => <option key={h.id} value={h.id}>{h.name} — {h.location}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Status</label>
            <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
              {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Notes (optional)</label><textarea value={formData.notes} onChange={e => setFormData({ ...formData, notes: e.target.value })} placeholder="Any special requests…" rows={2} /></div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit" className="btn-icon btn-icon-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
              <Icon d={Icons.check} size={15} /> {saving ? 'Saving…' : editingItem ? 'Update' : 'Create'}
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
