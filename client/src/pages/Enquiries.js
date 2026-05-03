import React, { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { toast, exportCSV, formatDate } from '../utils/helpers';
import { Icon, Icons } from '../utils/icons';

const STORAGE_KEY = 'tms_enquiries_v1';
const SEED = [
  { id: 1, name: 'Amira Patel', email: 'amira@example.com', subject: 'Family tour package', message: 'I need a 7-day family-friendly tour in Bali with kids activities.', status: 'new', created_at: '2025-10-01' },
  { id: 2, name: 'Carlos Mendes', email: 'carlos@example.com', subject: 'Hotel availability', message: 'Do you have beachfront rooms available in Goa for November?', status: 'responded', created_at: '2025-10-03' },
  { id: 3, name: 'Lina Zhao', email: 'lina@example.com', subject: 'Group booking', message: 'Looking to book a tour for 12 people in Kyoto next spring.', status: 'new', created_at: '2025-10-05' },
];

const STATUS_OPTIONS = [
  { value: 'new', label: 'New', color: '#2563eb' },
  { value: 'responded', label: 'Responded', color: '#16a34a' },
  { value: 'closed', label: 'Closed', color: '#6b7280' },
];

function StatusBadge({ status }) {
  const option = STATUS_OPTIONS.find((item) => item.value === status) || STATUS_OPTIONS[0];
  return (
    <span style={{ padding: '4px 10px', borderRadius: '999px', background: `${option.color}22`, color: option.color, border: `1px solid ${option.color}44`, fontWeight: 700, fontSize: 12, textTransform: 'uppercase' }}>
      {option.label}
    </span>
  );
}

function readLocal() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function writeLocal(list) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  } catch {
    /* ignore */
  }
}

export default function Enquiries() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [useBackend, setUseBackend] = useState(false);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ name: '', email: '', subject: '', message: '', status: 'new' });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const local = readLocal();
      try {
        const res = await api.get('/enquiries');
        if (Array.isArray(res.data)) {
          setItems(res.data);
          setUseBackend(true);
        } else {
          setItems(local.length ? local : SEED);
          if (!local.length) writeLocal(SEED);
        }
      } catch (err) {
        setItems(local.length ? local : SEED);
        if (!local.length) writeLocal(SEED);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = items
    .filter((item) => {
      const q = search.toLowerCase();
      return (
        !q ||
        item.name.toLowerCase().includes(q) ||
        item.email.toLowerCase().includes(q) ||
        item.subject.toLowerCase().includes(q) ||
        item.message.toLowerCase().includes(q)
      );
    })
    .filter((item) => filterStatus === 'all' || item.status === filterStatus)
    .sort((a, b) => {
      if (sortBy === 'oldest') return new Date(a.created_at) - new Date(b.created_at);
      return new Date(b.created_at) - new Date(a.created_at);
    });

  function openCreate() {
    setEditingItem(null);
    setFormData({ name: '', email: '', subject: '', message: '', status: 'new' });
    setShowModal(true);
  }

  function openEdit(item) {
    setEditingItem(item);
    setFormData({ name: item.name, email: item.email, subject: item.subject, message: item.message, status: item.status });
    setShowModal(true);
  }

  async function saveItem(e) {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.subject.trim()) {
      return toast('Name, email, and subject are required', 'error');
    }
    const payload = {
      ...formData,
      created_at: editingItem ? editingItem.created_at : new Date().toISOString().split('T')[0],
    };

    if (editingItem && useBackend) {
      try {
        const res = await api.put('/enquiries/' + editingItem.id, payload);
        setItems(items.map((item) => (item.id === editingItem.id ? res.data : item)));
        toast('Enquiry updated');
      } catch {
        toast('Error updating enquiry', 'error');
      }
    } else if (!editingItem && useBackend) {
      try {
        const res = await api.post('/enquiries', payload);
        setItems([res.data, ...items]);
        toast('Enquiry created');
      } catch {
        toast('Error creating enquiry', 'error');
      }
    } else {
      const next = editingItem
        ? items.map((item) => (item.id === editingItem.id ? { ...item, ...payload } : item))
        : [{ id: Date.now(), ...payload }, ...items];
      setItems(next);
      writeLocal(next);
      toast(editingItem ? 'Enquiry updated' : 'Enquiry created');
    }

    setShowModal(false);
    setEditingItem(null);
  }

  async function deleteItem(item) {
    if (!window.confirm('Delete this enquiry?')) return;
    if (useBackend) {
      try {
        await api.delete('/enquiries/' + item.id);
        setItems(items.filter((entry) => entry.id !== item.id));
        toast('Enquiry deleted', 'info');
      } catch {
        toast('Error deleting enquiry', 'error');
      }
      return;
    }
    const next = items.filter((entry) => entry.id !== item.id);
    setItems(next);
    writeLocal(next);
    toast('Enquiry deleted', 'info');
  }

  async function updateStatus(item, status) {
    const next = items.map((entry) => (entry.id === item.id ? { ...entry, status } : entry));
    if (useBackend) {
      try {
        await api.put('/enquiries/' + item.id, { ...item, status });
        setItems(next);
        toast(`Status updated to ${status}`, 'success');
      } catch {
        toast('Error updating status', 'error');
      }
      return;
    }
    setItems(next);
    writeLocal(next);
    toast(`Status updated to ${status}`, 'success');
  }

  return (
    <div className="page">
      <div className="page-header-bar">
        <div className="page-title-block">
          <h1>📩 Enquiries</h1>
          <p>{items.length} enquiries received</p>
        </div>
        <div className="action-bar">
          <button className="btn-icon btn-icon-ghost" onClick={() => exportCSV(filtered.map((item) => ({ ID: item.id, Name: item.name, Email: item.email, Subject: item.subject, Status: item.status, Date: item.created_at })), 'enquiries.csv')}>
            <Icon d={Icons.download} size={15} /> Export CSV
          </button>
          <button className="btn-icon btn-icon-primary" onClick={openCreate}>
            <Icon d={Icons.plus} size={15} /> New Enquiry
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total', value: items.length, color: 'var(--primary)' },
          { label: 'New', value: items.filter((item) => item.status === 'new').length, color: '#2563eb' },
          { label: 'Responded', value: items.filter((item) => item.status === 'responded').length, color: '#16a34a' },
          { label: 'Closed', value: items.filter((item) => item.status === 'closed').length, color: '#6b7280' },
        ].map((stat) => (
          <div key={stat.label} className="stat-mini" style={{ borderLeft: `3px solid ${stat.color}` }}>
            <div className="stat-mini-value" style={{ color: stat.color }}>{stat.value}</div>
            <div className="stat-mini-label">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <Icon d={Icons.search} size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input placeholder="Search enquiries…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
          <option value="all">All statuses</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>
        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
        </select>
        {(search || filterStatus !== 'all') && (
          <button className="btn-icon btn-icon-ghost" onClick={() => { setSearch(''); setFilterStatus('all'); }}>
            <Icon d={Icons.x} size={14} /> Clear
          </button>
        )}
        <span className="filter-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon="📩" title="No enquiries yet" description="Add a new enquiry or wait for incoming customer messages." action={<button className="btn-icon btn-icon-primary" onClick={openCreate}><Icon d={Icons.plus} size={14} /> New Enquiry</button>} /></div>
      ) : (
        <div className="data-grid">
          {filtered.map((item, index) => (
            <div key={item.id} className="data-card" style={{ animation: `slideInUp .3s ease ${index * 0.04}s backwards` }}>
              <div className="data-card-header">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 800, fontSize: '1rem', color: 'var(--text)' }}>{item.subject}</div>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: 4 }}>{item.name} · {item.email}</div>
                  </div>
                  <StatusBadge status={item.status} />
                </div>
              </div>
              <div className="data-card-body">
                <p style={{ margin: '0 0 14px', color: 'var(--text-muted)', fontSize: '0.9rem', lineHeight: 1.6, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{item.message}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  <span>{formatDate(item.created_at)}</span>
                  <span>{item.id}</span>
                </div>
              </div>
              <div className="data-card-footer">
                <button className="btn-icon btn-icon-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(item)}><Icon d={Icons.edit} size={14} /> Edit</button>
                <button className="btn-icon btn-icon-warning" style={{ flex: 1, justifyContent: 'center' }} onClick={() => updateStatus(item, item.status === 'new' ? 'responded' : item.status === 'responded' ? 'closed' : 'closed')}>
                  <Icon d={Icons.refresh} size={14} /> {item.status === 'new' ? 'Responded' : item.status === 'responded' ? 'Close' : 'Closed'}
                </button>
                <button className="btn-icon btn-icon-outline-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => deleteItem(item)}><Icon d={Icons.trash} size={14} /> Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal isOpen={showModal} title={editingItem ? '✏️ Edit Enquiry' : '📩 New Enquiry'} onClose={() => { setShowModal(false); setEditingItem(null); }}>
        <form onSubmit={saveItem}>
          <div className="form-group"><label>Name</label><input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} placeholder="Customer name" required autoFocus /></div>
          <div className="form-group"><label>Email</label><input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="customer@example.com" required /></div>
          <div className="form-group"><label>Subject</label><input type="text" value={formData.subject} onChange={(e) => setFormData({ ...formData, subject: e.target.value })} placeholder="Enquiry subject" required /></div>
          <div className="form-group"><label>Message</label><textarea rows="4" value={formData.message} onChange={(e) => setFormData({ ...formData, message: e.target.value })} placeholder="Customer message" /></div>
          <div className="form-group"><label>Status</label><select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value })}>{STATUS_OPTIONS.map((status) => <option key={status.value} value={status.value}>{status.label}</option>)}</select></div>
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <button type="submit" className="btn btn-primary" style={{ flex: 1 }}>Save</button>
            <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => { setShowModal(false); setEditingItem(null); }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
