import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import { toast, exportCSV, formatDate, formatCurrency } from '../utils/helpers';
import { Icon, Icons } from '../utils/icons';

const STATUS_CFG = {
  completed: { color: '#16a34a', bg: '#dcfce7', border: '#86efac', label: 'Completed' },
  pending:   { color: '#d97706', bg: '#fef3c7', border: '#fde68a', label: 'Pending' },
  failed:    { color: '#dc2626', bg: '#fee2e2', border: '#fca5a5', label: 'Failed' },
  refunded:  { color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd', label: 'Refunded' },
};
const METHODS = ['Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash', 'Crypto'];

function StatusBadge({ status }) {
  const cfg = STATUS_CFG[status] || STATUS_CFG.pending;
  return <span className="badge" style={{ background: cfg.bg, color: cfg.color, borderColor: cfg.border }}>{cfg.label}</span>;
}

const EMPTY_FORM = { booking_id: '', user_name: '', amount: '', method: 'Credit Card', status: 'pending', transaction_id: '' };

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewModal, setViewModal] = useState(null);
  const [formModal, setFormModal] = useState(null); // null | 'add' | payment object
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [selected, setSelected] = useState(new Set());

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const r = await api.get('/payments');
      setPayments(r.data || []);
    } catch {
      toast('Failed to load payments', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = payments
    .filter(p => {
      const s = searchTerm.toLowerCase();
      return (!s || (p.user_name || '').toLowerCase().includes(s) || (p.transaction_id || '').toLowerCase().includes(s) || String(p.booking_id || '').includes(s))
        && (filterStatus === 'all' || p.status === filterStatus)
        && (filterMethod === 'all' || p.method === filterMethod);
    })
    .sort((a, b) =>
      sortBy === 'amount-desc' ? b.amount - a.amount :
      sortBy === 'amount-asc'  ? a.amount - b.amount :
      sortBy === 'oldest'      ? a.id - b.id : b.id - a.id
    );

  const totalRevenue  = payments.filter(p => p.status === 'completed').reduce((s, p) => s + Number(p.amount || 0), 0);
  const pendingAmount = payments.filter(p => p.status === 'pending').reduce((s, p) => s + Number(p.amount || 0), 0);
  const failedCount   = payments.filter(p => p.status === 'failed').length;
  const refundedAmt   = payments.filter(p => p.status === 'refunded').reduce((s, p) => s + Number(p.amount || 0), 0);

  function openAdd() {
    setFormData({ ...EMPTY_FORM, transaction_id: `TXN-${Date.now()}` });
    setFormModal('add');
  }

  function openEdit(p) {
    setFormData({
      booking_id: p.booking_id || '',
      user_name: p.user_name || '',
      amount: p.amount || '',
      method: p.method || 'Credit Card',
      status: p.status || 'pending',
      transaction_id: p.transaction_id || '',
    });
    setFormModal(p);
  }

  async function handleSave(e) {
    e.preventDefault();
    if (!formData.user_name.trim()) return toast('Guest name is required', 'error');
    if (!formData.amount || isNaN(formData.amount)) return toast('Valid amount is required', 'error');
    if (!formData.transaction_id.trim()) return toast('Transaction ID is required', 'error');
    setSaving(true);
    try {
      const payload = {
        booking_id: formData.booking_id ? Number(formData.booking_id) : null,
        user_name: formData.user_name,
        amount: parseFloat(formData.amount),
        method: formData.method,
        status: formData.status,
        transaction_id: formData.transaction_id,
      };
      if (formModal === 'add') {
        await api.post('/payments', payload);
        toast('Payment recorded successfully');
      } else {
        await api.put('/payments/' + formModal.id, payload);
        toast('Payment updated successfully');
      }
      setFormModal(null);
      load();
    } catch (err) {
      toast(err.response?.data?.error || 'Error saving payment', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p) {
    if (!window.confirm(`Delete payment ${p.transaction_id}?`)) return;
    try {
      await api.delete('/payments/' + p.id);
      toast('Payment deleted');
      setSelected(s => { s.delete(p.id); return new Set(s); });
      if (viewModal?.id === p.id) setViewModal(null);
      load();
    } catch {
      toast('Error deleting payment', 'error');
    }
  }

  async function quickStatus(p, status) {
    try {
      await api.put('/payments/' + p.id, { ...p, status });
      toast(`Status updated to ${status}`);
      if (viewModal?.id === p.id) setViewModal({ ...viewModal, status });
      load();
    } catch {
      toast('Error updating status', 'error');
    }
  }

  async function bulkDelete() {
    if (!selected.size || !window.confirm(`Delete ${selected.size} payment(s)?`)) return;
    try {
      await Promise.all([...selected].map(id => api.delete('/payments/' + id)));
      toast(`Deleted ${selected.size} payments`);
      setSelected(new Set());
      load();
    } catch {
      toast('Bulk delete failed', 'error');
    }
  }

  const toggleSelect = id => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(p => p.id)));

  return (
    <div className="page">
      {/* Header */}
      <div className="page-header-bar">
        <div className="page-title-block">
          <h1>💳 Payments & Billing</h1>
          <p>{payments.length} transactions recorded</p>
        </div>
        <div className="action-bar">
          <button className="btn-icon btn-icon-ghost" onClick={() => exportCSV(
            filtered.map(p => ({ ID: p.id, Transaction: p.transaction_id, Guest: p.user_name, Booking: p.booking_id || '', Amount: p.amount, Method: p.method, Status: p.status, Date: p.created_at || '' })),
            'payments.csv'
          )}>
            <Icon d={Icons.download} size={15} /> Export CSV
          </button>
          {selected.size > 0 && (
            <button className="btn-icon btn-icon-danger" onClick={bulkDelete}>
              <Icon d={Icons.trash} size={15} /> Delete {selected.size}
            </button>
          )}
          <button className="btn-icon btn-icon-primary" onClick={openAdd}>
            <Icon d={Icons.plus} size={15} /> Record Payment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {[
          { label: 'Total Revenue',  value: formatCurrency(totalRevenue),  color: 'var(--success)' },
          { label: 'Pending',        value: formatCurrency(pendingAmount),  color: '#d97706' },
          { label: 'Failed',         value: failedCount,                    color: '#dc2626' },
          { label: 'Refunded',       value: formatCurrency(refundedAmt),    color: '#7c3aed' },
          { label: 'Transactions',   value: payments.length,                color: 'var(--primary)' },
        ].map(s => (
          <div key={s.label} className="stat-mini" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="stat-mini-value" style={{ color: s.color, fontSize: String(s.value).length > 8 ? '1.1rem' : '1.5rem' }}>{s.value}</div>
            <div className="stat-mini-label">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="filter-bar">
        <Icon d={Icons.search} size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input placeholder="Search by name, transaction ID, booking…" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="all">All Statuses</option>
          {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterMethod} onChange={e => setFilterMethod(e.target.value)}>
          <option value="all">All Methods</option>
          {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount-desc">Amount: High → Low</option>
          <option value="amount-asc">Amount: Low → High</option>
        </select>
        {(searchTerm || filterStatus !== 'all' || filterMethod !== 'all') && (
          <button className="btn-icon btn-icon-ghost" onClick={() => { setSearchTerm(''); setFilterStatus('all'); setFilterMethod('all'); }}>
            <Icon d={Icons.x} size={14} /> Clear
          </button>
        )}
        <span className="filter-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card">
          <EmptyState icon="💳" title="No payments found" description="Record your first payment or adjust filters." action={<button className="btn-icon btn-icon-primary" onClick={openAdd}><Icon d={Icons.plus} size={14} /> Record Payment</button>} />
        </div>
      ) : (
        <div className="table-wrap">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', borderBottom: '1px solid var(--border)', background: 'var(--light)' }}>
            <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--primary)' }} />
            <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', fontWeight: 600 }}>
              {selected.size > 0 ? `${selected.size} selected` : `${filtered.length} payments`}
            </span>
          </div>
          <table className="table" style={{ margin: 0 }}>
            <thead>
              <tr>
                <th></th>
                <th>Transaction ID</th>
                <th>Guest</th>
                <th>Booking</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(p => (
                <tr key={p.id} style={{ background: selected.has(p.id) ? 'var(--lighter)' : 'transparent' }}>
                  <td>
                    <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} style={{ width: 14, height: 14, cursor: 'pointer', accentColor: 'var(--primary)' }} />
                  </td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '0.8rem', fontFamily: 'monospace' }}>{p.transaction_id}</td>
                  <td style={{ fontWeight: 600 }}>{p.user_name}</td>
                  <td style={{ color: 'var(--text-muted)' }}>{p.booking_id ? `#${p.booking_id}` : '—'}</td>
                  <td style={{ fontWeight: 800, color: 'var(--text)' }}>{formatCurrency(p.amount)}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>{p.method}</td>
                  <td style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>{formatDate(p.created_at)}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <div style={{ display: 'flex', gap: 4 }}>
                      <button className="btn-icon btn-icon-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setViewModal(p)}>
                        <Icon d={Icons.eye} size={12} /> View
                      </button>
                      <button className="btn-icon btn-icon-warning" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => openEdit(p)}>
                        <Icon d={Icons.edit} size={12} /> Edit
                      </button>
                      <button className="btn-icon btn-icon-outline-danger" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => handleDelete(p)}>
                        <Icon d={Icons.trash} size={12} /> Del
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewModal} title="💳 Payment Details" onClose={() => setViewModal(null)}>
        {viewModal && (
          <div>
            <div className="form-grid-2">
              <div className="info-row"><label>Transaction ID</label><div className="info-row-value" style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{viewModal.transaction_id}</div></div>
              <div className="info-row"><label>Status</label><div className="info-row-value"><StatusBadge status={viewModal.status} /></div></div>
              <div className="info-row"><label>Guest</label><div className="info-row-value">{viewModal.user_name}</div></div>
              <div className="info-row"><label>Booking ID</label><div className="info-row-value">{viewModal.booking_id ? `#${viewModal.booking_id}` : '—'}</div></div>
              <div className="info-row"><label>Amount</label><div className="info-row-value" style={{ fontWeight: 900, color: 'var(--success)', fontSize: '1.1rem' }}>{formatCurrency(viewModal.amount)}</div></div>
              <div className="info-row"><label>Method</label><div className="info-row-value">{viewModal.method}</div></div>
              <div className="info-row"><label>Date</label><div className="info-row-value">{formatDate(viewModal.created_at)}</div></div>
            </div>
            {/* Quick status change */}
            <div style={{ marginBottom: 12 }}>
              <label style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', display: 'block', marginBottom: 8 }}>Change Status</label>
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                {Object.entries(STATUS_CFG).filter(([k]) => k !== viewModal.status).map(([k, v]) => (
                  <button key={k} className="btn-icon" style={{ background: v.bg, color: v.color, border: `1px solid ${v.border}`, fontSize: '0.8rem', padding: '5px 10px' }} onClick={() => quickStatus(viewModal, k)}>
                    <Icon d={Icons.refresh} size={12} /> → {v.label}
                  </button>
                ))}
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
              <button className="btn-icon btn-icon-ghost" onClick={() => setViewModal(null)}><Icon d={Icons.x} size={14} /> Close</button>
              <button className="btn-icon btn-icon-primary" onClick={() => { setViewModal(null); openEdit(viewModal); }}><Icon d={Icons.edit} size={14} /> Edit</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Modal */}
      <Modal isOpen={!!formModal} title={formModal === 'add' ? '💳 Record Payment' : '✏️ Edit Payment'} onClose={() => setFormModal(null)}>
        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Guest Name *</label>
            <input type="text" value={formData.user_name} onChange={e => setFormData({ ...formData, user_name: e.target.value })} placeholder="Guest full name" required autoFocus />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Booking ID</label>
              <input type="number" value={formData.booking_id} onChange={e => setFormData({ ...formData, booking_id: e.target.value })} placeholder="e.g. 101" />
            </div>
            <div className="form-group">
              <label>Amount ($) *</label>
              <input type="number" step="0.01" min="0" value={formData.amount} onChange={e => setFormData({ ...formData, amount: e.target.value })} placeholder="0.00" required />
            </div>
          </div>
          <div className="form-group">
            <label>Transaction ID *</label>
            <input type="text" value={formData.transaction_id} onChange={e => setFormData({ ...formData, transaction_id: e.target.value })} placeholder="TXN-…" required />
          </div>
          <div className="form-grid-2">
            <div className="form-group">
              <label>Payment Method</label>
              <select value={formData.method} onChange={e => setFormData({ ...formData, method: e.target.value })}>
                {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Status</label>
              <select value={formData.status} onChange={e => setFormData({ ...formData, status: e.target.value })}>
                {Object.entries(STATUS_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="submit" className="btn-icon btn-icon-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
              <Icon d={Icons.check} size={15} /> {saving ? 'Saving…' : formModal === 'add' ? 'Record Payment' : 'Update Payment'}
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
