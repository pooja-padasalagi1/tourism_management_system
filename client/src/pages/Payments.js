import React, { useEffect, useState, useRef } from 'react';
import Modal from '../components/Modal';

function toast(msg, type = 'success') {
  try {
    const el = document.createElement('div');
    const c = { success: '#4caf50', error: '#f44336', info: '#2196f3', warning: '#ff9800' };
    el.style.cssText = `
      position: fixed;
      top: 80px;
      right: 24px;
      z-index: 9999;
      padding: 14px 20px;
      border-radius: 8px;
      font-weight: 600;
      font-size: 13px;
      color: #fff;
      background: ${c[type] || c.success};
      box-shadow: 0 8px 24px rgba(0,0,0,0.2);
      animation: slideInRight 0.3s ease;
      min-width: 240px;
      max-width: 400px;
      word-wrap: break-word;
    `;
    el.textContent = msg;
    document.body.appendChild(el);
    setTimeout(() => {
      if (el.parentNode) {
        el.parentNode.removeChild(el);
      }
    }, 4000);
  } catch (error) {
    console.error('Error showing toast:', error);
  }
}

function exportCSV(data, filename) {
  if (!data || !data.length) {
    toast('No data to export', 'info');
    return;
  }
  try {
    const keys = Object.keys(data[0]);
    const csv = [
      keys.join(','),
      ...data.map(r => keys.map(k => `"${String(r[k] ?? '').replace(/"/g, '""')}"`).join(','))
    ].join('\n');

    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }));
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(a.href);
    toast(`Exported ${data.length} record${data.length !== 1 ? 's' : ''} to CSV`);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    toast('Error exporting data', 'error');
  }
}

const STATUS_CONFIG = {
  completed: { color: '#1e8e3e', bg: '#d1fae5', border: '#6ee7b7', label: 'Completed', icon: '✓' },
  pending: { color: '#d97706', bg: '#fef3c7', border: '#fde68a', label: 'Pending', icon: '⏳' },
  failed: { color: '#d93025', bg: '#fee2e2', border: '#fca5a5', label: 'Failed', icon: '✗' },
  refunded: { color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd', label: 'Refunded', icon: '↩' },
  processing: { color: '#0891b2', bg: '#cffafe', border: '#67e8f9', label: 'Processing', icon: '⟳' },
};

const PAYMENT_METHODS = [
  'Credit Card', 'Debit Card', 'PayPal', 'Bank Transfer', 'Cash',
  'Crypto', 'Apple Pay', 'Google Pay', 'Venmo', 'Stripe'
];

const CURRENCIES = ['USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY'];

function StatusBadge({ status, size = 'normal' }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  const fontSize = size === 'small' ? '9px' : '10px';
  const padding = size === 'small' ? '3px 8px' : '4px 10px';

  return (
    <span style={{
      padding, borderRadius: '4px', fontSize, fontWeight: 800,
      letterSpacing: '1px', textTransform: 'uppercase',
      background: cfg.bg, color: cfg.color, border: `1px solid ${cfg.border}`,
      display: 'inline-flex', alignItems: 'center', gap: '4px'
    }}>
      <span>{cfg.icon}</span>
      {cfg.label}
    </span>
  );
}

function PaymentCard({ payment, onView, onEdit, onDelete, onStatusChange, isSelected, onSelect }) {
  return (
    <div className="card" style={{
      padding: '16px',
      marginBottom: '12px',
      border: isSelected ? '2px solid #1a73e8' : '1px solid #e8f0fe',
      background: isSelected ? '#f0f7ff' : '#ffffff',
      cursor: 'pointer',
      transition: 'all 0.2s ease'
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <input
            type="checkbox"
            checked={isSelected}
            onChange={onSelect}
            style={{ width: '16px', height: '16px', cursor: 'pointer' }}
          />
          <div>
            <div style={{ fontSize: '14px', fontWeight: 700, color: '#1a2332', marginBottom: '2px' }}>
              {payment.transaction_id}
            </div>
            <div style={{ fontSize: '12px', color: '#5f6b7a' }}>
              {payment.user_name} • Booking #{payment.booking_id}
            </div>
          </div>
        </div>
        <StatusBadge status={payment.status} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '18px', fontWeight: 900, color: '#1a2332' }}>
          ${payment.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </div>
        <div style={{ fontSize: '12px', color: '#5f6b7a', textAlign: 'right' }}>
          <div>{payment.method}</div>
          <div>{new Date(payment.created_at).toLocaleDateString()}</div>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button
          onClick={() => onView(payment)}
          style={{
            padding: '6px 12px', borderRadius: '6px', background: '#e8f0fe',
            color: '#1a73e8', border: 'none', fontWeight: 700, fontSize: '11px',
            cursor: 'pointer', textTransform: 'uppercase'
          }}
        >
          👁 View
        </button>
        <button
          onClick={() => onEdit(payment)}
          style={{
            padding: '6px 12px', borderRadius: '6px', background: '#fef3c7',
            color: '#d97706', border: 'none', fontWeight: 700, fontSize: '11px',
            cursor: 'pointer', textTransform: 'uppercase'
          }}
        >
          ✏ Edit
        </button>
        <button
          onClick={() => onDelete(payment)}
          style={{
            padding: '6px 12px', borderRadius: '6px', background: '#fee2e2',
            color: '#d93025', border: 'none', fontWeight: 700, fontSize: '11px',
            cursor: 'pointer', textTransform: 'uppercase'
          }}
        >
          🗑 Delete
        </button>
      </div>

      {/* Quick status actions */}
      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #e8f0fe' }}>
        {Object.keys(STATUS_CONFIG).filter(s => s !== payment.status).map(s => (
          <button
            key={s}
            onClick={() => onStatusChange(payment, s)}
            style={{
              padding: '4px 8px', borderRadius: '4px',
              background: STATUS_CONFIG[s].bg, color: STATUS_CONFIG[s].color,
              border: `1px solid ${STATUS_CONFIG[s].border}`,
              fontWeight: 700, fontSize: '9px', cursor: 'pointer',
              textTransform: 'uppercase'
            }}
          >
            {STATUS_CONFIG[s].icon} {s}
          </button>
        ))}
      </div>
    </div>
  );
}

function StatCard({ title, value, subtitle, color, icon, trend }) {
  return (
    <div className="card" style={{
      padding: '20px',
      borderLeft: `4px solid ${color}`,
      background: `linear-gradient(135deg, ${color}08 0%, ${color}04 100%)`,
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        fontSize: '24px',
        opacity: 0.3
      }}>
        {icon}
      </div>
      <div style={{ fontSize: '24px', fontWeight: 900, color, marginBottom: '4px' }}>
        {value}
      </div>
      <div style={{ fontSize: '12px', color: '#5f6b7a', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '2px' }}>
        {title}
      </div>
      {subtitle && (
        <div style={{ fontSize: '11px', color: '#9ca3af' }}>
          {subtitle}
        </div>
      )}
      {trend && (
        <div style={{
          fontSize: '10px',
          color: trend > 0 ? '#1e8e3e' : '#d93025',
          fontWeight: 700,
          marginTop: '4px'
        }}>
          {trend > 0 ? '↗' : '↘'} {Math.abs(trend)}% from last month
        </div>
      )}
    </div>
  );
}

function PaymentTimeline({ payments }) {
  const recentPayments = payments
    .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    .slice(0, 10);

  return (
    <div className="card" style={{ padding: '20px' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '16px', color: '#1a2332' }}>
        Recent Activity
      </h3>
      <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
        {recentPayments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>
            No recent payments
          </div>
        ) : (
          recentPayments.map((payment, index) => (
            <div key={payment.id} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 0',
              borderBottom: index < recentPayments.length - 1 ? '1px solid #e8f0fe' : 'none'
            }}>
              <div style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: STATUS_CONFIG[payment.status]?.color || '#9ca3af'
              }} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#1a2332' }}>
                  ${payment.amount.toFixed(2)} - {payment.user_name}
                </div>
                <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                  {payment.transaction_id} • {new Date(payment.created_at).toLocaleDateString()}
                </div>
              </div>
              <StatusBadge status={payment.status} size="small" />
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function generateReceipt(payment) {
  const receipt = {
    receiptId: `RCP-${Date.now()}`,
    transactionId: payment.transaction_id,
    date: new Date().toISOString(),
    customer: payment.user_name,
    bookingId: payment.booking_id,
    amount: payment.amount,
    method: payment.method,
    status: payment.status,
    currency: 'USD'
  };

  // In a real app, this would send to a receipt service
  toast(`Receipt generated: ${receipt.receiptId}`);
  return receipt;
}

function processPayment(paymentData) {
  return new Promise((resolve, reject) => {
    // Simulate payment processing
    setTimeout(() => {
      const success = Math.random() > 0.1; // 90% success rate
      if (success) {
        resolve({
          ...paymentData,
          status: 'completed',
          processed_at: new Date().toISOString(),
          gateway_response: 'APPROVED'
        });
      } else {
        reject({
          ...paymentData,
          status: 'failed',
          error: 'Payment declined by gateway'
        });
      }
    }, 2000);
  });
}

const SAMPLE_PAYMENTS = [
  { id: 1, booking_id: 101, user_name: 'John Doe', amount: 1299.00, method: 'Credit Card', status: 'completed', transaction_id: 'TXN-2024-001', created_at: '2024-02-15', currency: 'USD', notes: 'Beach resort booking' },
  { id: 2, booking_id: 102, user_name: 'Jane Smith', amount: 899.00, method: 'PayPal', status: 'completed', transaction_id: 'TXN-2024-002', created_at: '2024-02-16', currency: 'USD', notes: 'City hotel booking' },
  { id: 3, booking_id: 103, user_name: 'Bob Johnson', amount: 1599.00, method: 'Debit Card', status: 'pending', transaction_id: 'TXN-2024-003', created_at: '2024-02-17', currency: 'USD', notes: 'Luxury suite' },
  { id: 4, booking_id: 104, user_name: 'Alice Brown', amount: 2199.00, method: 'Bank Transfer', status: 'completed', transaction_id: 'TXN-2024-004', created_at: '2024-02-18', currency: 'USD', notes: 'Family vacation package' },
  { id: 5, booking_id: 105, user_name: 'Charlie Wilson', amount: 799.00, method: 'Credit Card', status: 'failed', transaction_id: 'TXN-2024-005', created_at: '2024-02-19', currency: 'USD', notes: 'Budget hotel' },
  { id: 6, booking_id: 106, user_name: 'Diana Prince', amount: 3499.00, method: 'Bank Transfer', status: 'completed', transaction_id: 'TXN-2024-006', created_at: '2024-03-01', currency: 'USD', notes: 'Premium resort' },
  { id: 7, booking_id: 107, user_name: 'Ethan Hunt', amount: 650.00, method: 'PayPal', status: 'refunded', transaction_id: 'TXN-2024-007', created_at: '2024-03-05', currency: 'USD', notes: 'Cancelled booking refund' },
  { id: 8, booking_id: 108, user_name: 'Fiona Green', amount: 1100.00, method: 'Credit Card', status: 'processing', transaction_id: 'TXN-2024-008', created_at: '2024-03-10', currency: 'USD', notes: 'Business trip' },
];

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('grid'); // 'grid' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [filterCurrency, setFilterCurrency] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [processModal, setProcessModal] = useState(null);
  const [receiptModal, setReceiptModal] = useState(null);
  const [formData, setFormData] = useState({
    user_name: '', booking_id: '', amount: '', method: 'Credit Card',
    status: 'pending', transaction_id: '', currency: 'USD', notes: ''
  });
  const [saving, setSaving] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const fileInputRef = useRef(null);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('tms_payments_v2');
      setPayments(stored ? JSON.parse(stored) : SAMPLE_PAYMENTS);
    } catch (error) {
      console.error('Error loading payments from localStorage:', error);
      setPayments(SAMPLE_PAYMENTS);
    }
    setLoading(false);
  }, []);

  function save(list) {
    try {
      setPayments(list);
      localStorage.setItem('tms_payments_v2', JSON.stringify(list));
    } catch (error) {
      console.error('Error saving payments to localStorage:', error);
      toast('Error saving data', 'error');
    }
  }

  const filtered = payments
    .filter(p => {
      const s = searchTerm.toLowerCase();
      const matchesSearch = !s || p.user_name.toLowerCase().includes(s) ||
        p.transaction_id.toLowerCase().includes(s) ||
        String(p.booking_id).includes(s) ||
        (p.notes && p.notes.toLowerCase().includes(s));

      const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
      const matchesMethod = filterMethod === 'all' || p.method === filterMethod;
      const matchesCurrency = filterCurrency === 'all' || p.currency === filterCurrency;

      const paymentDate = new Date(p.created_at);
      const matchesDateRange = (!dateRange.start || paymentDate >= new Date(dateRange.start)) &&
        (!dateRange.end || paymentDate <= new Date(dateRange.end));

      return matchesSearch && matchesStatus && matchesMethod && matchesCurrency && matchesDateRange;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'amount-desc': return b.amount - a.amount;
        case 'amount-asc': return a.amount - b.amount;
        case 'oldest': return a.id - b.id;
        case 'newest':
        default: return b.id - a.id;
      }
    });

  const stats = {
    totalRevenue: payments.filter(p => p.status === 'completed').reduce((s, p) => s + p.amount, 0),
    pendingAmount: payments.filter(p => p.status === 'pending').reduce((s, p) => s + p.amount, 0),
    processingAmount: payments.filter(p => p.status === 'processing').reduce((s, p) => s + p.amount, 0),
    failedCount: payments.filter(p => p.status === 'failed').length,
    refundedAmount: payments.filter(p => p.status === 'refunded').reduce((s, p) => s + p.amount, 0),
    totalTransactions: payments.length,
    successRate: payments.length > 0 ? (payments.filter(p => p.status === 'completed').length / payments.length * 100).toFixed(1) : 0
  };

  function handleAdd() {
    if (!formData.user_name?.trim() || !formData.amount || !formData.transaction_id?.trim()) {
      toast('Please fill all required fields', 'error');
      return;
    }
    if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      toast('Please enter a valid amount', 'error');
      return;
    }
    setSaving(true);
    const newP = {
      id: Date.now(),
      booking_id: Number(formData.booking_id) || 0,
      user_name: formData.user_name.trim(),
      amount: parseFloat(formData.amount),
      method: formData.method,
      status: formData.status,
      transaction_id: formData.transaction_id.trim(),
      currency: formData.currency,
      notes: formData.notes.trim(),
      created_at: new Date().toISOString().split('T')[0]
    };
    save([newP, ...payments]);
    setAddModal(false);
    setFormData({
      user_name: '', booking_id: '', amount: '', method: 'Credit Card',
      status: 'pending', transaction_id: `TXN-${Date.now()}`, currency: 'USD', notes: ''
    });
    toast('Payment recorded successfully');
    setSaving(false);
  }

  function handleEdit() {
    if (!formData.user_name?.trim() || !formData.amount) {
      toast('Please fill required fields', 'error');
      return;
    }
    if (isNaN(parseFloat(formData.amount)) || parseFloat(formData.amount) <= 0) {
      toast('Please enter a valid amount', 'error');
      return;
    }
    setSaving(true);
    save(payments.map(p => p.id === editModal.id ? {
      ...p,
      ...formData,
      amount: parseFloat(formData.amount),
      user_name: formData.user_name.trim(),
      transaction_id: formData.transaction_id.trim(),
      notes: formData.notes.trim()
    } : p));
    setEditModal(null);
    toast('Payment updated successfully');
    setSaving(false);
  }

  function handleDelete(p) {
    if (!window.confirm(`Delete payment "${p.transaction_id}" for ${p.user_name}?`)) return;
    try {
      save(payments.filter(x => x.id !== p.id));
      toast('Payment deleted successfully');
      setSelected(s => { s.delete(p.id); return new Set(s); });
    } catch (error) {
      console.error('Error deleting payment:', error);
      toast('Error deleting payment', 'error');
    }
  }

  function handleStatusChange(p, status) {
    try {
      save(payments.map(x => x.id === p.id ? { ...x, status } : x));
      toast(`Status changed to ${STATUS_CONFIG[status]?.label || status}`);
      if (viewModal?.id === p.id) setViewModal({ ...viewModal, status });
    } catch (error) {
      console.error('Error updating payment status:', error);
      toast('Error updating status', 'error');
    }
  }

  async function handleProcessPayment(payment) {
    setProcessing(true);
    setProcessModal(payment);
    try {
      const result = await processPayment(payment);
      save(payments.map(p => p.id === payment.id ? result : p));
      toast('Payment processed successfully');
      setProcessModal(null);
    } catch (error) {
      save(payments.map(p => p.id === payment.id ? error : p));
      toast('Payment processing failed', 'error');
      setProcessModal(null);
    }
    setProcessing(false);
  }

  function handleGenerateReceipt(payment) {
    const receipt = generateReceipt(payment);
    setReceiptModal({ payment, receipt });
  }

  function bulkDelete() {
    if (!selected.size) {
      toast('No payments selected', 'info');
      return;
    }
    if (!window.confirm(`Delete ${selected.size} payment${selected.size !== 1 ? 's' : ''}?`)) return;
    try {
      save(payments.filter(p => !selected.has(p.id)));
      toast(`Deleted ${selected.size} payment${selected.size !== 1 ? 's' : ''} successfully`);
      setSelected(new Set());
    } catch (error) {
      console.error('Error deleting payments:', error);
      toast('Error deleting payments', 'error');
    }
  }

  function toggleSelect(id) {
    setSelected(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  }

  function toggleAll() {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(p => p.id)));
    }
  }

  function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const csv = e.target.result;
        const lines = csv.split('\n');
        const headers = lines[0].split(',').map(h => h.replace(/"/g, '').trim());

        const importedPayments = lines.slice(1)
          .filter(line => line.trim())
          .map(line => {
            const values = line.split(',').map(v => v.replace(/"/g, '').trim());
            const payment = {};
            headers.forEach((header, index) => {
              const value = values[index];
              switch (header.toLowerCase()) {
                case 'amount':
                  payment[header] = parseFloat(value) || 0;
                  break;
                case 'booking_id':
                  payment[header] = parseInt(value) || 0;
                  break;
                default:
                  payment[header] = value;
              }
            });
            return {
              id: Date.now() + Math.random(),
              ...payment,
              created_at: payment.created_at || new Date().toISOString().split('T')[0],
              status: payment.status || 'pending',
              currency: payment.currency || 'USD'
            };
          });

        save([...importedPayments, ...payments]);
        toast(`Imported ${importedPayments.length} payments successfully`);
      } catch (error) {
        console.error('Error importing CSV:', error);
        toast('Error importing CSV file', 'error');
      }
    };
    reader.readAsText(file);
  }

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h2 style={{ margin: 0, color: '#1a2332' }}>💳 Payment Management</h2>
          <p style={{ margin: '6px 0 0', color: '#5f6b7a', fontSize: '13px' }}>
            {payments.length} transactions • {stats.successRate}% success rate
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button
            onClick={() => fileInputRef.current?.click()}
            style={{
              padding: '9px 16px', borderRadius: '7px', background: '#e8f0fe',
              color: '#1a73e8', border: '1px solid #c5d8f5', fontWeight: 700,
              fontSize: '12px', cursor: 'pointer', letterSpacing: '.5px', textTransform: 'uppercase'
            }}
          >
            📁 Import CSV
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleFileImport}
            style={{ display: 'none' }}
          />
          <button
            onClick={() => exportCSV(filtered.map(p => ({
              ID: p.id, Transaction: p.transaction_id, Guest: p.user_name,
              Booking: p.booking_id, Amount: p.amount, Currency: p.currency,
              Method: p.method, Status: p.status, Date: p.created_at, Notes: p.notes
            })), 'payments.csv')}
            style={{
              padding: '9px 16px', borderRadius: '7px', background: '#e8f0fe',
              color: '#1a73e8', border: '1px solid #c5d8f5', fontWeight: 700,
              fontSize: '12px', cursor: 'pointer', letterSpacing: '.5px', textTransform: 'uppercase'
            }}
          >
            ↓ Export CSV
          </button>
          {selected.size > 0 && (
            <button
              onClick={bulkDelete}
              className="btn text-danger"
              style={{
                padding: '9px 16px', borderRadius: '7px', background: '#fde8e8',
                border: '1px solid #fca5a5', fontWeight: 700,
                fontSize: '12px', cursor: 'pointer', letterSpacing: '.5px', textTransform: 'uppercase'
              }}
            >
              🗑 Delete {selected.size}
            </button>
          )}
          <button
            className="btn btn-vibrant"
            onClick={() => {
              setFormData({
                user_name: '', booking_id: '', amount: '', method: 'Credit Card',
                status: 'pending', transaction_id: `TXN-${Date.now()}`, currency: 'USD', notes: ''
              });
              setAddModal(true);
            }}
            style={{ padding: '9px 18px', fontSize: '12px' }}
          >
            + Record Payment
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard
          title="Total Revenue"
          value={`$${stats.totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Completed payments"
          color="#1e8e3e"
          icon="💰"
          trend={12.5}
        />
        <StatCard
          title="Pending"
          value={`$${stats.pendingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Awaiting completion"
          color="#d97706"
          icon="⏳"
        />
        <StatCard
          title="Processing"
          value={`$${stats.processingAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="In progress"
          color="#0891b2"
          icon="⟳"
        />
        <StatCard
          title="Failed"
          value={stats.failedCount}
          subtitle="Payment failures"
          color="#d93025"
          icon="✗"
        />
        <StatCard
          title="Refunded"
          value={`$${stats.refundedAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`}
          subtitle="Total refunds"
          color="#7c3aed"
          icon="↩"
        />
        <StatCard
          title="Success Rate"
          value={`${stats.successRate}%`}
          subtitle="Payment success"
          color="#059669"
          icon="📈"
        />
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
        {/* Payments List */}
        <div>
          {/* Filters */}
          <div style={{
            display: 'flex', gap: '10px', marginBottom: '20px', flexWrap: 'wrap',
            alignItems: 'center', padding: '16px', background: '#f8fbff',
            borderRadius: '12px', border: '1px solid #e8f0fe'
          }}>
            <input
              type="text"
              placeholder="Search payments..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{ flex: 1, minWidth: '200px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #c5d8f5' }}
            />

            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              style={{ minWidth: '120px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #c5d8f5' }}
            >
              <option value="all">All Statuses</option>
              {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                <option key={key} value={key}>{config.label}</option>
              ))}
            </select>

            <select
              value={filterMethod}
              onChange={e => setFilterMethod(e.target.value)}
              style={{ minWidth: '130px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #c5d8f5' }}
            >
              <option value="all">All Methods</option>
              {PAYMENT_METHODS.map(method => (
                <option key={method} value={method}>{method}</option>
              ))}
            </select>

            <select
              value={filterCurrency}
              onChange={e => setFilterCurrency(e.target.value)}
              style={{ minWidth: '100px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #c5d8f5' }}
            >
              <option value="all">All Currencies</option>
              {CURRENCIES.map(currency => (
                <option key={currency} value={currency}>{currency}</option>
              ))}
            </select>

            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value)}
              style={{ minWidth: '140px', padding: '8px 12px', borderRadius: '6px', border: '1px solid #c5d8f5' }}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-desc">Amount: High → Low</option>
              <option value="amount-asc">Amount: Low → High</option>
            </select>

            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="date"
                value={dateRange.start}
                onChange={e => setDateRange(prev => ({ ...prev, start: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #c5d8f5', minWidth: '140px' }}
                placeholder="Start date"
              />
              <input
                type="date"
                value={dateRange.end}
                onChange={e => setDateRange(prev => ({ ...prev, end: e.target.value }))}
                style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid #c5d8f5', minWidth: '140px' }}
                placeholder="End date"
              />
            </div>

            <div style={{ display: 'flex', gap: '4px' }}>
              <button
                onClick={() => setView('grid')}
                style={{
                  padding: '8px 12px', borderRadius: '6px',
                  background: view === 'grid' ? '#1a73e8' : '#f0f7ff',
                  color: view === 'grid' ? '#fff' : '#1a73e8',
                  border: '1px solid #c5d8f5', cursor: 'pointer'
                }}
              >
                ⊞
              </button>
              <button
                onClick={() => setView('table')}
                style={{
                  padding: '8px 12px', borderRadius: '6px',
                  background: view === 'table' ? '#1a73e8' : '#f0f7ff',
                  color: view === 'table' ? '#fff' : '#1a73e8',
                  border: '1px solid #c5d8f5', cursor: 'pointer'
                }}
              >
                ⊟
              </button>
            </div>

            {(searchTerm || filterStatus !== 'all' || filterMethod !== 'all' || filterCurrency !== 'all' || dateRange.start || dateRange.end) && (
              <button
                onClick={() => {
                  setSearchTerm('');
                  setFilterStatus('all');
                  setFilterMethod('all');
                  setFilterCurrency('all');
                  setDateRange({ start: '', end: '' });
                }}
                style={{
                  padding: '8px 14px', borderRadius: '6px', background: '#fff',
                  color: '#5f6b7a', border: '1px solid #c5d8f5', fontWeight: 700,
                  fontSize: '11px', cursor: 'pointer', textTransform: 'uppercase'
                }}
              >
                Clear Filters
              </button>
            )}
          </div>

          <div style={{ marginBottom: '12px', fontSize: '14px', color: '#5f6b7a', fontWeight: 600 }}>
            {filtered.length} payment{filtered.length !== 1 ? 's' : ''} found
          </div>

          {/* Payments Display */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#5f6b7a' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⟳</div>
              Loading payments...
            </div>
          ) : view === 'grid' ? (
            <div>
              {filtered.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📄</div>
                  No payments match your filters
                </div>
              ) : (
                filtered.map(payment => (
                  <PaymentCard
                    key={payment.id}
                    payment={payment}
                    onView={setViewModal}
                    onEdit={(p) => {
                      setEditModal(p);
                      setFormData({
                        user_name: p.user_name,
                        booking_id: p.booking_id,
                        amount: p.amount,
                        method: p.method,
                        status: p.status,
                        transaction_id: p.transaction_id,
                        currency: p.currency,
                        notes: p.notes || ''
                      });
                    }}
                    onDelete={handleDelete}
                    onStatusChange={handleStatusChange}
                    isSelected={selected.has(payment.id)}
                    onSelect={() => toggleSelect(payment.id)}
                  />
                ))
              )}
            </div>
          ) : (
            /* Table View */
            <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '12px 16px', borderBottom: '1px solid #e8f0fe',
                background: '#f8fbff'
              }}>
                <input
                  type="checkbox"
                  checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleAll}
                  style={{ width: '14px', height: '14px', cursor: 'pointer' }}
                />
                <span style={{ fontSize: '12px', color: '#5f6b7a', fontWeight: 600 }}>
                  {selected.size > 0 ? `${selected.size} selected` : `${filtered.length} payments`}
                </span>
              </div>
              <div style={{ overflowX: 'auto', maxWidth: '100%' }}>
                <table className="table" style={{ margin: 0, minWidth: '1000px' }}>
                  <thead>
                    <tr>
                      <th style={{ width: '40px', position: 'sticky', left: 0, background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)', zIndex: 1 }}></th>
                      <th style={{ minWidth: '120px' }}>Transaction</th>
                      <th style={{ minWidth: '120px' }}>Guest</th>
                      <th style={{ minWidth: '80px' }}>Booking</th>
                      <th style={{ minWidth: '100px' }}>Amount</th>
                      <th style={{ minWidth: '100px' }}>Method</th>
                      <th style={{ minWidth: '80px' }}>Status</th>
                      <th style={{ minWidth: '100px' }}>Date</th>
                      <th style={{ minWidth: '150px', position: 'sticky', right: 0, background: 'linear-gradient(90deg, #1976d2 0%, #2196f3 100%)', zIndex: 1 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={9} style={{ textAlign: 'center', padding: '40px', color: '#9ca3af' }}>No payments match your filters</td></tr>
                    ) : filtered.map(p => (
                      <tr key={p.id} style={{ background: selected.has(p.id) ? '#eff6ff' : 'transparent' }}>
                        <td style={{ position: 'sticky', left: 0, background: selected.has(p.id) ? '#eff6ff' : '#ffffff', zIndex: 1 }}>
                          <input type="checkbox" checked={selected.has(p.id)} onChange={() => toggleSelect(p.id)} style={{ width: '14px', height: '14px', cursor: 'pointer' }} />
                        </td>
                        <td style={{ fontWeight: 700, color: '#1a73e8', fontSize: '12px', fontFamily: 'monospace' }}>{p.transaction_id}</td>
                        <td style={{ fontWeight: 600, color: '#1a2332' }}>{p.user_name}</td>
                        <td style={{ color: '#5f6b7a' }}>#{p.booking_id}</td>
                        <td style={{ fontWeight: 800, color: '#1a2332' }}>{p.currency} ${p.amount.toFixed(2)}</td>
                        <td style={{ color: '#5f6b7a', fontSize: '12px' }}>{p.method}</td>
                        <td><StatusBadge status={p.status} /></td>
                        <td style={{ color: '#9ca3af', fontSize: '12px' }}>{new Date(p.created_at).toLocaleDateString()}</td>
                        <td style={{ position: 'sticky', right: 0, background: selected.has(p.id) ? '#eff6ff' : '#ffffff', zIndex: 1 }}>
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button onClick={() => setViewModal(p)} style={{ padding: '5px 8px', borderRadius: '5px', background: '#e8f0fe', color: '#1a73e8', border: 'none', fontWeight: 700, fontSize: '10px', cursor: 'pointer', boxShadow: 'none', textTransform: 'uppercase' }}>View</button>
                            <button onClick={() => { setEditModal(p); setFormData({ user_name: p.user_name, booking_id: p.booking_id, amount: p.amount, method: p.method, status: p.status, transaction_id: p.transaction_id, currency: p.currency, notes: p.notes || '' }); }} style={{ padding: '5px 8px', borderRadius: '5px', background: '#fef3c7', color: '#d97706', border: 'none', fontWeight: 700, fontSize: '10px', cursor: 'pointer', boxShadow: 'none', textTransform: 'uppercase' }}>Edit</button>
                            <button onClick={() => handleDelete(p)} style={{ padding: '5px 8px', borderRadius: '5px', background: '#fee2e2', color: '#d93025', border: 'none', fontWeight: 700, fontSize: '10px', cursor: 'pointer', boxShadow: 'none', textTransform: 'uppercase' }}>Del</button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div>
          <PaymentTimeline payments={payments} />
        </div>
      </div>

      {/* View Modal */}
      <Modal isOpen={!!viewModal} title="Payment Details" onClose={() => setViewModal(null)}>
        {viewModal && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '400px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: '#f8fbff', borderRadius: '8px', border: '1px solid #e8f0fe' }}>
              <div>
                <div style={{ fontSize: '20px', fontWeight: 900, color: '#1a2332', marginBottom: '4px' }}>
                  {viewModal.currency} ${viewModal.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <div style={{ fontSize: '12px', color: '#5f6b7a' }}>
                  {viewModal.transaction_id}
                </div>
              </div>
              <StatusBadge status={viewModal.status} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="info-field">
                <label>Guest</label>
                <span>{viewModal.user_name}</span>
              </div>
              <div className="info-field">
                <label>Booking ID</label>
                <span>#{viewModal.booking_id}</span>
              </div>
              <div className="info-field">
                <label>Payment Method</label>
                <span>{viewModal.method}</span>
              </div>
              <div className="info-field">
                <label>Currency</label>
                <span>{viewModal.currency}</span>
              </div>
              <div className="info-field">
                <label>Date Created</label>
                <span>{new Date(viewModal.created_at).toLocaleDateString()}</span>
              </div>
              <div className="info-field">
                <label>Transaction ID</label>
                <span style={{ fontFamily: 'monospace', fontSize: '12px' }}>{viewModal.transaction_id}</span>
              </div>
            </div>

            {viewModal.notes && (
              <div className="info-field">
                <label>Notes</label>
                <span>{viewModal.notes}</span>
              </div>
            )}

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '16px', borderTop: '1px solid #e8f0fe' }}>
              {viewModal.status === 'pending' && (
                <button
                  onClick={() => handleProcessPayment(viewModal)}
                  disabled={processing}
                  style={{
                    flex: 1, padding: '10px', borderRadius: '6px',
                    background: 'linear-gradient(135deg, #1e8e3e, #059669)',
                    color: '#fff', border: 'none', fontWeight: 700,
                    fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase'
                  }}
                >
                  {processing ? '⟳ Processing...' : '✅ Process Payment'}
                </button>
              )}

              <button
                onClick={() => handleGenerateReceipt(viewModal)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '6px',
                  background: '#e8f0fe', color: '#1a73e8', border: '1px solid #c5d8f5',
                  fontWeight: 700, fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase'
                }}
              >
                📄 Generate Receipt
              </button>

              <button
                onClick={() => {
                  setEditModal(viewModal);
                  setFormData({
                    user_name: viewModal.user_name,
                    booking_id: viewModal.booking_id,
                    amount: viewModal.amount,
                    method: viewModal.method,
                    status: viewModal.status,
                    transaction_id: viewModal.transaction_id,
                    currency: viewModal.currency,
                    notes: viewModal.notes || ''
                  });
                  setViewModal(null);
                }}
                style={{
                  flex: 1, padding: '10px', borderRadius: '6px',
                  background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a',
                  fontWeight: 700, fontSize: '12px', cursor: 'pointer', textTransform: 'uppercase'
                }}
              >
                ✏ Edit
              </button>
            </div>

            {/* Quick status actions */}
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {Object.keys(STATUS_CONFIG).filter(s => s !== viewModal.status).map(s => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(viewModal, s)}
                  style={{
                    padding: '6px 12px', borderRadius: '6px',
                    background: STATUS_CONFIG[s].bg, color: STATUS_CONFIG[s].color,
                    border: `1px solid ${STATUS_CONFIG[s].border}`,
                    fontWeight: 700, fontSize: '10px', cursor: 'pointer',
                    textTransform: 'uppercase'
                  }}
                >
                  {STATUS_CONFIG[s].icon} {s}
                </button>
              ))}
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      {(addModal || editModal) && (
        <Modal
          isOpen={true}
          title={editModal ? 'Edit Payment' : 'Record New Payment'}
          onClose={() => { setAddModal(false); setEditModal(null); }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', minWidth: '420px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 700, color: '#1a2332' }}>
                  Guest Name *
                </label>
                <input
                  type="text"
                  value={formData.user_name}
                  onChange={e => setFormData({ ...formData, user_name: e.target.value })}
                  placeholder="Enter guest name"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #c5d8f5' }}
                  autoFocus
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 700, color: '#1a2332' }}>
                  Booking ID
                </label>
                <input
                  type="number"
                  value={formData.booking_id}
                  onChange={e => setFormData({ ...formData, booking_id: e.target.value })}
                  placeholder="101"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #c5d8f5' }}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 700, color: '#1a2332' }}>
                  Amount *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.amount}
                  onChange={e => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #c5d8f5' }}
                  required
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 700, color: '#1a2332' }}>
                  Currency
                </label>
                <select
                  value={formData.currency}
                  onChange={e => setFormData({ ...formData, currency: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #c5d8f5' }}
                >
                  {CURRENCIES.map(currency => (
                    <option key={currency} value={currency}>{currency}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 700, color: '#1a2332' }}>
                  Status
                </label>
                <select
                  value={formData.status}
                  onChange={e => setFormData({ ...formData, status: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #c5d8f5' }}
                >
                  {Object.entries(STATUS_CONFIG).map(([key, config]) => (
                    <option key={key} value={key}>{config.label}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 700, color: '#1a2332' }}>
                  Payment Method
                </label>
                <select
                  value={formData.method}
                  onChange={e => setFormData({ ...formData, method: e.target.value })}
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #c5d8f5' }}
                >
                  {PAYMENT_METHODS.map(method => (
                    <option key={method} value={method}>{method}</option>
                  ))}
                </select>
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 700, color: '#1a2332' }}>
                  Transaction ID *
                </label>
                <input
                  type="text"
                  value={formData.transaction_id}
                  onChange={e => setFormData({ ...formData, transaction_id: e.target.value })}
                  placeholder="TXN-..."
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #c5d8f5', fontFamily: 'monospace' }}
                  required
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '4px', fontSize: '12px', fontWeight: 700, color: '#1a2332' }}>
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={e => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Additional notes..."
                rows={3}
                style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #c5d8f5', resize: 'vertical' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
              <button
                onClick={editModal ? handleEdit : handleAdd}
                style={{
                  flex: 1, padding: '12px', borderRadius: '8px',
                  background: 'linear-gradient(135deg, #1557b0, #1a73e8)',
                  color: '#fff', border: 'none', fontWeight: 800,
                  fontSize: '12px', cursor: 'pointer', letterSpacing: '1px',
                  textTransform: 'uppercase'
                }}
                disabled={saving}
              >
                {saving ? '⟳ Saving...' : editModal ? '💾 Update Payment' : '💳 Record Payment'}
              </button>
              <button
                onClick={() => { setAddModal(false); setEditModal(null); }}
                style={{
                  flex: 1, padding: '12px', borderRadius: '8px',
                  background: '#f0f7ff', color: '#5f6b7a', border: '1px solid #c5d8f5',
                  fontWeight: 700, fontSize: '12px', cursor: 'pointer',
                  boxShadow: 'none', textTransform: 'uppercase'
                }}
              >
                ❌ Cancel
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Process Payment Modal */}
      {processModal && (
        <Modal isOpen={true} title="Processing Payment" onClose={() => {}}>
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>
              {processing ? '⟳' : '✅'}
            </div>
            <div style={{ fontSize: '16px', fontWeight: 700, color: '#1a2332', marginBottom: '8px' }}>
              {processing ? 'Processing Payment...' : 'Payment Processed!'}
            </div>
            <div style={{ fontSize: '14px', color: '#5f6b7a' }}>
              {processing ? 'Please wait while we process your payment.' : 'The payment has been successfully processed.'}
            </div>
            {!processing && (
              <button
                onClick={() => setProcessModal(null)}
                style={{
                  marginTop: '20px', padding: '10px 20px', borderRadius: '6px',
                  background: '#1a73e8', color: '#fff', border: 'none',
                  fontWeight: 700, cursor: 'pointer'
                }}
              >
                Close
              </button>
            )}
          </div>
        </Modal>
      )}

      {/* Receipt Modal */}
      {receiptModal && (
        <Modal isOpen={true} title="Payment Receipt" onClose={() => setReceiptModal(null)}>
          <div style={{ padding: '20px', background: '#f8fbff', borderRadius: '8px', border: '1px solid #e8f0fe' }}>
            <div style={{ textAlign: 'center', marginBottom: '24px' }}>
              <h3 style={{ margin: '0 0 8px 0', color: '#1a2332' }}>PAYMENT RECEIPT</h3>
              <div style={{ fontSize: '12px', color: '#5f6b7a' }}>{receiptModal.receipt.receiptId}</div>
            </div>

            <div style={{ display: 'grid', gap: '12px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Date:</span>
                <span>{new Date(receiptModal.receipt.date).toLocaleString()}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Customer:</span>
                <span>{receiptModal.receipt.customer}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Transaction ID:</span>
                <span style={{ fontFamily: 'monospace' }}>{receiptModal.receipt.transactionId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Booking ID:</span>
                <span>#{receiptModal.receipt.bookingId}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ fontWeight: 600 }}>Payment Method:</span>
                <span>{receiptModal.receipt.method}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '18px', fontWeight: 900, color: '#1a2332' }}>
                <span>Total Amount:</span>
                <span>{receiptModal.receipt.currency} ${receiptModal.receipt.amount.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ textAlign: 'center', padding: '16px', background: '#fff', borderRadius: '6px', border: '1px solid #e8f0fe' }}>
              <div style={{ fontSize: '12px', color: '#5f6b7a', marginBottom: '8px' }}>
                Status: <StatusBadge status={receiptModal.receipt.status} />
              </div>
              <div style={{ fontSize: '10px', color: '#9ca3af' }}>
                This is a computer-generated receipt
              </div>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '20px' }}>
              <button
                onClick={() => window.print()}
                style={{
                  flex: 1, padding: '10px', borderRadius: '6px',
                  background: '#1a73e8', color: '#fff', border: 'none',
                  fontWeight: 700, cursor: 'pointer'
                }}
              >
                🖨 Print Receipt
              </button>
              <button
                onClick={() => setReceiptModal(null)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '6px',
                  background: '#f0f7ff', color: '#5f6b7a', border: '1px solid #c5d8f5',
                  fontWeight: 700, cursor: 'pointer'
                }}
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
