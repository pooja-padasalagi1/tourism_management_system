import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import { toast, exportCSV } from '../utils/helpers';
import { Icon, Icons } from '../utils/icons';

const ROLE_CFG = {
  admin:   { color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd', label: 'Admin' },
  manager: { color: '#2563eb', bg: '#dbeafe', border: '#93c5fd', label: 'Manager' },
  user:    { color: '#16a34a', bg: '#dcfce7', border: '#86efac', label: 'User' },
};

function RoleBadge({ role }) {
  const cfg = ROLE_CFG[role] || ROLE_CFG.user;
  return <span className="badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>{cfg.label}</span>;
}

function Avatar({ name, email, role }) {
  const initials = (name || email || 'U').split(' ').map(s => s[0]).slice(0, 2).join('').toUpperCase();
  const cfg = ROLE_CFG[role] || ROLE_CFG.user;
  return (
    <div style={{ width: 44, height: 44, borderRadius: '50%', background: cfg.bg, border: `2px solid ${cfg.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontWeight: 900, color: cfg.color, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

export default function Users() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [viewMode, setViewMode] = useState('grid');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user', password: '' });
  const [viewUser, setViewUser] = useState(null);
  const [selected, setSelected] = useState(new Set());

  const load = useCallback(async () => {
    try { setLoading(true); const r = await api.get('/users'); setItems(r.data || []); }
    catch { toast('Failed to load users', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items
    .filter(u => (roleFilter === 'all' || u.role === roleFilter))
    .filter(u => { const s = search.toLowerCase(); return !s || (u.name || '').toLowerCase().includes(s) || (u.email || '').toLowerCase().includes(s); })
    .sort((a, b) => sortBy === 'email' ? a.email.localeCompare(b.email) : sortBy === 'role' ? a.role.localeCompare(b.role) : (a.name || '').localeCompare(b.name || ''));

  function openCreate() { setEditingItem(null); setFormData({ name: '', email: '', role: 'user', password: '' }); setShowModal(true); }
  function openEdit(u) { setEditingItem(u); setFormData({ name: u.name, email: u.email, role: u.role, password: '' }); setShowModal(true); }

  async function handleSave(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim()) return toast('Name and email are required', 'error');
    if (!editingItem && !formData.password.trim()) return toast('Password is required for new users', 'error');
    setSaving(true);
    try {
      if (editingItem) { await api.put('/users/' + editingItem.id, formData); toast('User updated'); }
      else { await api.post('/users', formData); toast('User created'); }
      load(); setShowModal(false); setEditingItem(null);
    } catch (err) { toast(err.response?.data?.error || 'Error saving user', 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(u) {
    if (!window.confirm(`Delete user "${u.email}"?`)) return;
    try { await api.delete('/users/' + u.id); toast('User deleted'); load(); setSelected(s => { s.delete(u.id); return new Set(s); }); }
    catch { toast('Error deleting user', 'error'); }
  }

  async function bulkDelete() {
    if (!selected.size || !window.confirm(`Delete ${selected.size} user(s)?`)) return;
    try { await Promise.all([...selected].map(id => api.delete('/users/' + id))); toast(`Deleted ${selected.size} users`); setSelected(new Set()); load(); }
    catch { toast('Bulk delete failed', 'error'); }
  }

  const toggleSelect = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(u => u.id)));
  const stats = { total: items.length, admins: items.filter(u => u.role === 'admin').length, managers: items.filter(u => u.role === 'manager').length, users: items.filter(u => u.role === 'user').length };

  return (
    <div className="page">
      <div className="page-header-bar">
        <div className="page-title-block">
          <h1>👥 Travellers</h1>
          <p>{items.length} registered travellers</p>
        </div>
        <div className="action-bar">
          <button className="btn-icon btn-icon-ghost" onClick={() => exportCSV(filtered.map(u => ({ ID: u.id, Name: u.name, Email: u.email, Role: u.role })), 'users.csv')}>
            <Icon d={Icons.download} size={15} /> Export CSV
          </button>
          <button className="btn-icon btn-icon-ghost" onClick={() => setViewMode(v => v === 'grid' ? 'table' : 'grid')}>
            <Icon d={viewMode === 'grid' ? Icons.sort : Icons.dashboard} size={15} /> {viewMode === 'grid' ? 'Table' : 'Grid'}
          </button>
          {selected.size > 0 && (
            <button className="btn-icon btn-icon-danger" onClick={bulkDelete}><Icon d={Icons.trash} size={15} /> Delete {selected.size}</button>
          )}
          <button className="btn-icon btn-icon-primary" onClick={openCreate}><Icon d={Icons.plus} size={15} /> Add User</button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total', value: stats.total, color: 'var(--primary)', key: 'all' },
          { label: 'Admins', value: stats.admins, color: '#7c3aed', key: 'admin' },
          { label: 'Managers', value: stats.managers, color: 'var(--primary)', key: 'manager' },
          { label: 'Users', value: stats.users, color: 'var(--success)', key: 'user' },
        ].map(s => (
          <div key={s.label} className="stat-mini" style={{ borderLeft: `3px solid ${s.color}`, cursor: 'pointer', outline: roleFilter === s.key ? `2px solid ${s.color}` : 'none' }} onClick={() => setRoleFilter(s.key)}>
            <div className="stat-mini-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-mini-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <Icon d={Icons.search} size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input placeholder="Search by name or email…" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
          <option value="all">All Roles</option>
          {Object.entries(ROLE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="name">Sort: Name</option>
          <option value="email">Sort: Email</option>
          <option value="role">Sort: Role</option>
        </select>
        {(search || roleFilter !== 'all') && (
          <button className="btn-icon btn-icon-ghost" onClick={() => { setSearch(''); setRoleFilter('all'); }}><Icon d={Icons.x} size={14} /> Clear</button>
        )}
        <span className="filter-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon="👥" title="No users found" description={search || roleFilter !== 'all' ? 'Try different filters.' : 'Add your first user.'} action={!search && roleFilter === 'all' && <button className="btn-icon btn-icon-primary" onClick={openCreate}><Icon d={Icons.plus} size={14} /> Add User</button>} /></div>
      ) : viewMode === 'table' ? (
        <div className="table-wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--light)' }}>
            <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--primary)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>{selected.size > 0 ? `${selected.size} selected` : `${filtered.length} users`}</span>
          </div>
          <table className="table" style={{ margin: 0 }}>
            <thead><tr><th></th><th>Name</th><th>Email</th><th>Role</th><th>Actions</th></tr></thead>
            <tbody>
              {filtered.map(u => (
                <tr key={u.id}>
                  <td><input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleSelect(u.id)} style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--primary)' }} /></td>
                  <td style={{ fontWeight: 700 }}>{u.name || '—'}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{u.email}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn-icon btn-icon-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setViewUser(u)}><Icon d={Icons.eye} size={12} /> View</button>
                      <button className="btn-icon btn-icon-warning" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => openEdit(u)}><Icon d={Icons.edit} size={12} /> Edit</button>
                      <button className="btn-icon btn-icon-outline-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDelete(u)}><Icon d={Icons.trash} size={12} /> Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          <div className="select-row">
            <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
            <span>{selected.size > 0 ? `${selected.size} selected` : 'Select all'}</span>
          </div>
          <div className="data-grid">
            {filtered.map((u, idx) => {
              const cfg = ROLE_CFG[u.role] || ROLE_CFG.user;
              return (
                <div key={u.id} className="data-card" style={{ animation: `slideInUp .3s ease ${idx * .04}s backwards`, borderLeft: selected.has(u.id) ? '3px solid var(--primary)' : `3px solid ${cfg.color}` }}>
                  <div className="data-card-header">
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <Avatar name={u.name} email={u.email} role={u.role} />
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.name || '—'}</div>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginTop: 2 }}>{u.email}</div>
                      </div>
                      <input type="checkbox" checked={selected.has(u.id)} onChange={() => toggleSelect(u.id)} style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--primary)', flexShrink: 0 }} />
                    </div>
                  </div>
                  <div className="data-card-body">
                    <RoleBadge role={u.role} />
                  </div>
                  <div className="data-card-footer">
                    <button className="btn-icon btn-icon-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setViewUser(u)}><Icon d={Icons.eye} size={14} /> View</button>
                    <button className="btn-icon btn-icon-warning" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(u)}><Icon d={Icons.edit} size={14} /> Edit</button>
                    <button className="btn-icon btn-icon-outline-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleDelete(u)}><Icon d={Icons.trash} size={14} /> Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewUser} title="👤 User Details" onClose={() => setViewUser(null)}>
        {viewUser && (
          <div>
            <div style={{ display: 'flex', gap: 14, alignItems: 'center', padding: '12px 14px', background: 'var(--light)', borderRadius: 10, border: '1px solid var(--border)', marginBottom: 16 }}>
              <Avatar name={viewUser.name} email={viewUser.email} role={viewUser.role} />
              <div>
                <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>{viewUser.name || '—'}</div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 2 }}>{viewUser.email}</div>
                <div style={{ marginTop: 6 }}><RoleBadge role={viewUser.role} /></div>
              </div>
            </div>
            <div className="info-row"><label>User ID</label><div className="info-row-value">#{viewUser.id}</div></div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
              <button className="btn-icon btn-icon-ghost" onClick={() => setViewUser(null)}><Icon d={Icons.x} size={14} /> Close</button>
              <button className="btn-icon btn-icon-primary" onClick={() => { setViewUser(null); openEdit(viewUser); }}><Icon d={Icons.edit} size={14} /> Edit</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} title={editingItem ? '✏️ Edit User' : '👤 Add User'} onClose={() => { setShowModal(false); setEditingItem(null); }}>
        <form onSubmit={handleSave}>
          <div className="form-group"><label>Full Name *</label><input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="John Doe" required autoFocus /></div>
          <div className="form-group"><label>Email Address *</label><input type="email" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} placeholder="john@example.com" required /></div>
          <div className="form-group">
            <label>Role</label>
            <select value={formData.role} onChange={e => setFormData({ ...formData, role: e.target.value })}>
              {Object.entries(ROLE_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
          </div>
          <div className="form-group"><label>{editingItem ? 'New Password (leave blank to keep)' : 'Password *'}</label><input type="password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} placeholder={editingItem ? 'Leave blank to keep current' : 'Min 6 characters'} required={!editingItem} /></div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit" className="btn-icon btn-icon-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
              <Icon d={Icons.check} size={15} /> {saving ? 'Saving…' : editingItem ? 'Update User' : 'Create User'}
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
