import React, { useEffect, useState } from 'react';

function toast(msg, type='success') {
  const el=document.createElement('div');
  const c={success:'#1e8e3e',error:'#d93025',info:'#1a73e8'};
  el.style.cssText=`position:fixed;top:80px;right:24px;z-index:9999;padding:14px 20px;border-radius:8px;font-weight:700;font-size:13px;color:#fff;background:${c[type]||c.success};box-shadow:0 8px 24px rgba(0,0,0,.2);animation:slideInRight .3s ease;min-width:240px;`;
  el.textContent=msg;document.body.appendChild(el);setTimeout(()=>el.remove(),3000);
}

function exportCSV(data, filename) {
  if (!data.length) return toast('Nothing to export','info');
  const keys=Object.keys(data[0]);
  const csv=[keys.join(','),...data.map(r=>keys.map(k=>`"${String(r[k]??'').replace(/"/g,'""')}"`).join(','))].join('\n');
  const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));a.download=filename;a.click();
  toast(`Exported ${data.length} rows`);
}

const STATUS_CFG = {
  completed: { color:'#1e8e3e', bg:'#d1fae5', border:'#6ee7b7', label:'Completed' },
  pending:   { color:'#d97706', bg:'#fef3c7', border:'#fde68a', label:'Pending' },
  failed:    { color:'#d93025', bg:'#fee2e2', border:'#fca5a5', label:'Failed' },
  refunded:  { color:'#7c3aed', bg:'#ede9fe', border:'#c4b5fd', label:'Refunded' },
};

const METHODS = ['Credit Card','Debit Card','PayPal','Bank Transfer','Cash','Crypto'];

function StatusBadge({ status }) {
  const cfg=STATUS_CFG[status]||STATUS_CFG.pending;
  return <span style={{ padding:'4px 10px', borderRadius:'4px', fontSize:'10px', fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>{cfg.label}</span>;
}

const SEED = [
  { id:1, booking_id:101, user_name:'John Doe',       amount:1299.00, method:'Credit Card',  status:'completed', transaction_id:'TXN-2024-001', created_at:'2024-02-15' },
  { id:2, booking_id:102, user_name:'Jane Smith',     amount:899.00,  method:'PayPal',        status:'completed', transaction_id:'TXN-2024-002', created_at:'2024-02-16' },
  { id:3, booking_id:103, user_name:'Bob Johnson',    amount:1599.00, method:'Debit Card',    status:'pending',   transaction_id:'TXN-2024-003', created_at:'2024-02-17' },
  { id:4, booking_id:104, user_name:'Alice Brown',    amount:2199.00, method:'Bank Transfer', status:'completed', transaction_id:'TXN-2024-004', created_at:'2024-02-18' },
  { id:5, booking_id:105, user_name:'Charlie Wilson', amount:799.00,  method:'Credit Card',   status:'failed',    transaction_id:'TXN-2024-005', created_at:'2024-02-19' },
  { id:6, booking_id:106, user_name:'Diana Prince',   amount:3499.00, method:'Bank Transfer', status:'completed', transaction_id:'TXN-2024-006', created_at:'2024-03-01' },
  { id:7, booking_id:107, user_name:'Ethan Hunt',     amount:650.00,  method:'PayPal',        status:'refunded',  transaction_id:'TXN-2024-007', created_at:'2024-03-05' },
  { id:8, booking_id:108, user_name:'Fiona Green',    amount:1100.00, method:'Credit Card',   status:'pending',   transaction_id:'TXN-2024-008', created_at:'2024-03-10' },
];

export default function Payments() {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterMethod, setFilterMethod] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [viewModal, setViewModal] = useState(null);
  const [editModal, setEditModal] = useState(null);
  const [addModal, setAddModal] = useState(false);
  const [formData, setFormData] = useState({ user_name:'', booking_id:'', amount:'', method:'Credit Card', status:'pending', transaction_id:'' });
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(new Set());

  useEffect(() => {
    const stored = localStorage.getItem('tms_payments_v1');
    setPayments(stored ? JSON.parse(stored) : SEED);
    setLoading(false);
  }, []);

  function save(list) { setPayments(list); localStorage.setItem('tms_payments_v1', JSON.stringify(list)); }

  const filtered = payments
    .filter(p => {
      const s=searchTerm.toLowerCase();
      return (!s || p.user_name.toLowerCase().includes(s) || p.transaction_id.toLowerCase().includes(s) || String(p.booking_id).includes(s))
        && (filterStatus==='all' || p.status===filterStatus)
        && (filterMethod==='all' || p.method===filterMethod);
    })
    .sort((a,b) => sortBy==='amount-desc'?b.amount-a.amount:sortBy==='amount-asc'?a.amount-b.amount:sortBy==='oldest'?a.id-b.id:b.id-a.id);

  const totalRevenue = payments.filter(p=>p.status==='completed').reduce((s,p)=>s+p.amount,0);
  const pendingAmount = payments.filter(p=>p.status==='pending').reduce((s,p)=>s+p.amount,0);
  const failedCount = payments.filter(p=>p.status==='failed').length;
  const refundedAmount = payments.filter(p=>p.status==='refunded').reduce((s,p)=>s+p.amount,0);

  function handleAdd() {
    if (!formData.user_name||!formData.amount||!formData.transaction_id) { toast('Fill all required fields','error'); return; }
    setSaving(true);
    const newP = { id:Date.now(), booking_id:Number(formData.booking_id)||0, user_name:formData.user_name, amount:parseFloat(formData.amount), method:formData.method, status:formData.status, transaction_id:formData.transaction_id, created_at:new Date().toISOString().split('T')[0] };
    save([newP,...payments]); setAddModal(false); setFormData({user_name:'',booking_id:'',amount:'',method:'Credit Card',status:'pending',transaction_id:''}); toast('Payment recorded'); setSaving(false);
  }

  function handleEdit() {
    if (!formData.user_name||!formData.amount) { toast('Fill required fields','error'); return; }
    setSaving(true);
    save(payments.map(p=>p.id===editModal.id?{...p,...formData,amount:parseFloat(formData.amount)}:p));
    setEditModal(null); toast('Payment updated'); setSaving(false);
  }

  function handleDelete(p) {
    if (!window.confirm(`Delete payment ${p.transaction_id}?`)) return;
    save(payments.filter(x=>x.id!==p.id)); toast('Payment deleted'); setSelected(s=>{s.delete(p.id);return new Set(s);});
  }

  function quickStatus(p, status) {
    save(payments.map(x=>x.id===p.id?{...x,status}:x)); toast(`Status → ${status}`);
    if (viewModal?.id===p.id) setViewModal({...viewModal,status});
  }

  function bulkDelete() {
    if (!selected.size) return;
    if (!window.confirm(`Delete ${selected.size} payment(s)?`)) return;
    save(payments.filter(p=>!selected.has(p.id))); toast(`Deleted ${selected.size} payments`); setSelected(new Set());
  }

  const toggleSelect = id => setSelected(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});
  const toggleAll = () => setSelected(selected.size===filtered.length?new Set():new Set(filtered.map(p=>p.id)));

  const infoRow = (label, val) => (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #e8f0fe' }}>
      <span style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>{label}</span>
      <span style={{ fontSize:'14px', color:'#1a2332', fontWeight:700 }}>{val}</span>
    </div>
  );

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h2 style={{ margin:0 }}>Payments & Billing</h2>
          <p style={{ margin:'6px 0 0', color:'#5f6b7a', fontSize:'13px' }}>{payments.length} transactions recorded</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={()=>exportCSV(filtered.map(p=>({ID:p.id,Transaction:p.transaction_id,Guest:p.user_name,Booking:p.booking_id,Amount:p.amount,Method:p.method,Status:p.status,Date:p.created_at})),'payments.csv')}
            style={{ padding:'9px 16px', borderRadius:'7px', background:'#e8f0fe', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
            ↓ Export CSV
          </button>
          {selected.size>0 && (
            <button onClick={bulkDelete} style={{ padding:'9px 16px', borderRadius:'7px', background:'#fde8e8', color:'#d93025', border:'1px solid #fca5a5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
              Delete {selected.size}
            </button>
          )}
          <button className="btn" onClick={()=>{setFormData({user_name:'',booking_id:'',amount:'',method:'Credit Card',status:'pending',transaction_id:`TXN-${Date.now()}`});setAddModal(true);}} style={{ padding:'9px 18px', fontSize:'12px' }}>
            + Record Payment
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'12px', marginBottom:'20px' }}>
        {[
          {label:'Total Revenue',value:`$${totalRevenue.toLocaleString('en',{minimumFractionDigits:2})}`,color:'#1e8e3e'},
          {label:'Pending',value:`$${pendingAmount.toLocaleString('en',{minimumFractionDigits:2})}`,color:'#d97706'},
          {label:'Failed',value:failedCount,color:'#d93025'},
          {label:'Refunded',value:`$${refundedAmount.toLocaleString('en',{minimumFractionDigits:2})}`,color:'#7c3aed'},
          {label:'Transactions',value:payments.length,color:'#1a73e8'},
        ].map(s=>(
          <div key={s.label} className="card" style={{ padding:'16px', borderLeft:`3px solid ${s.color}`, margin:0 }}>
            <div style={{ fontSize:'18px', fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginTop:'3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center', padding:'14px 16px', background:'#f0f7ff', borderRadius:'10px', border:'1px solid #c5d8f5' }}>
        <input type="text" placeholder="Search by name, transaction ID, booking..." value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{ flex:1, minWidth:'200px' }} />
        <select value={filterStatus} onChange={e=>setFilterStatus(e.target.value)} style={{ minWidth:'140px' }}>
          <option value="all">All Statuses</option>
          <option value="completed">Completed</option>
          <option value="pending">Pending</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </select>
        <select value={filterMethod} onChange={e=>setFilterMethod(e.target.value)} style={{ minWidth:'150px' }}>
          <option value="all">All Methods</option>
          {METHODS.map(m=><option key={m} value={m}>{m}</option>)}
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ minWidth:'160px' }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="amount-desc">Amount: High → Low</option>
          <option value="amount-asc">Amount: Low → High</option>
        </select>
        {(searchTerm||filterStatus!=='all'||filterMethod!=='all') && (
          <button onClick={()=>{setSearchTerm('');setFilterStatus('all');setFilterMethod('all');}} style={{ padding:'9px 14px', borderRadius:'7px', background:'#fff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'11px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Clear</button>
        )}
        <span style={{ fontSize:'12px', color:'#5f6b7a', fontWeight:600 }}>{filtered.length} result{filtered.length!==1?'s':''}</span>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign:'center', padding:'60px 0', color:'#5f6b7a' }}>Loading...</div>
      ) : (
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', padding:'12px 16px', borderBottom:'1px solid #e8f0fe', background:'#f8fbff' }}>
            <input type="checkbox" checked={selected.size===filtered.length&&filtered.length>0} onChange={toggleAll} style={{ width:'14px', height:'14px', cursor:'pointer' }} />
            <span style={{ fontSize:'12px', color:'#5f6b7a', fontWeight:600 }}>{selected.size>0?`${selected.size} selected`:`${filtered.length} payments`}</span>
          </div>
          <table className="table" style={{ margin:0 }}>
            <thead>
              <tr>
                <th style={{ width:'40px' }}></th>
                <th>Transaction</th><th>Guest</th><th>Booking</th>
                <th>Amount</th><th>Method</th><th>Date</th><th>Status</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length===0 ? (
                <tr><td colSpan={9} style={{ textAlign:'center', padding:'40px', color:'#5f6b7a' }}>No payments match your filters</td></tr>
              ) : filtered.map(p=>(
                <tr key={p.id} style={{ background:selected.has(p.id)?'#eff6ff':'transparent' }}>
                  <td><input type="checkbox" checked={selected.has(p.id)} onChange={()=>toggleSelect(p.id)} style={{ width:'14px', height:'14px', cursor:'pointer' }} /></td>
                  <td style={{ fontWeight:700, color:'#1a73e8', fontSize:'12px', fontFamily:'monospace' }}>{p.transaction_id}</td>
                  <td style={{ fontWeight:600, color:'#1a2332' }}>{p.user_name}</td>
                  <td style={{ color:'#5f6b7a' }}>#{p.booking_id}</td>
                  <td style={{ fontWeight:800, color:'#1a2332' }}>${p.amount.toFixed(2)}</td>
                  <td style={{ color:'#5f6b7a', fontSize:'12px' }}>{p.method}</td>
                  <td style={{ color:'#9ca3af', fontSize:'12px' }}>{p.created_at}</td>
                  <td><StatusBadge status={p.status} /></td>
                  <td>
                    <div style={{ display:'flex', gap:'4px' }}>
                      <button onClick={()=>setViewModal(p)} style={{ padding:'5px 8px', borderRadius:'5px', background:'#e8f0fe', color:'#1a73e8', border:'none', fontWeight:700, fontSize:'10px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>View</button>
                      <button onClick={()=>{setEditModal(p);setFormData({user_name:p.user_name,booking_id:p.booking_id,amount:p.amount,method:p.method,status:p.status,transaction_id:p.transaction_id});}} style={{ padding:'5px 8px', borderRadius:'5px', background:'#fef3c7', color:'#d97706', border:'none', fontWeight:700, fontSize:'10px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Edit</button>
                      <button onClick={()=>handleDelete(p)} style={{ padding:'5px 8px', borderRadius:'5px', background:'#fee2e2', color:'#d93025', border:'none', fontWeight:700, fontSize:'10px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewModal} title="Payment Details" onClose={()=>setViewModal(null)}>
        {viewModal && (
          <div style={{ display:'flex', flexDirection:'column', gap:'4px', minWidth:'360px' }}>
            {infoRow('Transaction ID', viewModal.transaction_id)}
            {infoRow('Guest', viewModal.user_name)}
            {infoRow('Booking ID', `#${viewModal.booking_id}`)}
            {infoRow('Amount', `$${viewModal.amount.toFixed(2)}`)}
            {infoRow('Method', viewModal.method)}
            {infoRow('Date', viewModal.created_at)}
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0' }}>
              <span style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>Status</span>
              <StatusBadge status={viewModal.status} />
            </div>
            {/* Quick status actions */}
            <div style={{ display:'flex', gap:'6px', flexWrap:'wrap', paddingTop:'10px', borderTop:'1px solid #e8f0fe' }}>
              {Object.keys(STATUS_CFG).filter(s=>s!==viewModal.status).map(s=>(
                <button key={s} onClick={()=>quickStatus(viewModal,s)}
                  style={{ padding:'6px 12px', borderRadius:'6px', background:STATUS_CFG[s].bg, color:STATUS_CFG[s].color, border:`1px solid ${STATUS_CFG[s].border}`, fontWeight:700, fontSize:'10px', cursor:'pointer', textTransform:'uppercase', boxShadow:'none' }}>
                  → {s}
                </button>
              ))}
            </div>
            <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'12px' }}>
              <button onClick={()=>setViewModal(null)} style={{ padding:'9px 18px', borderRadius:'7px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Close</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Add/Edit Modal */}
      {(addModal || editModal) && (
        <Modal isOpen={true} title={editModal?'Edit Payment':'Record Payment'} onClose={()=>{setAddModal(false);setEditModal(null);}}>
          <div style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'340px' }}>
            <div><label>Guest Name *</label><input type="text" value={formData.user_name} onChange={e=>setFormData({...formData,user_name:e.target.value})} placeholder="Guest name" autoFocus /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div><label>Booking ID</label><input type="number" value={formData.booking_id} onChange={e=>setFormData({...formData,booking_id:e.target.value})} placeholder="101" /></div>
              <div><label>Amount ($) *</label><input type="number" step="0.01" min="0" value={formData.amount} onChange={e=>setFormData({...formData,amount:e.target.value})} placeholder="0.00" /></div>
            </div>
            <div><label>Transaction ID *</label><input type="text" value={formData.transaction_id} onChange={e=>setFormData({...formData,transaction_id:e.target.value})} placeholder="TXN-..." /></div>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div><label>Method</label><select value={formData.method} onChange={e=>setFormData({...formData,method:e.target.value})}>{METHODS.map(m=><option key={m}>{m}</option>)}</select></div>
              <div><label>Status</label><select value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})}>{Object.keys(STATUS_CFG).map(s=><option key={s}>{s}</option>)}</select></div>
            </div>
            <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
              <button onClick={editModal?handleEdit:handleAdd} style={{ flex:1, padding:'12px', borderRadius:'8px', background:'linear-gradient(135deg,#1557b0,#1a73e8)', color:'#fff', border:'none', fontWeight:800, fontSize:'12px', cursor:'pointer', letterSpacing:'1px', textTransform:'uppercase' }} disabled={saving}>
                {saving?'Saving…':editModal?'Update':'Record'}
              </button>
              <button onClick={()=>{setAddModal(false);setEditModal(null);}} style={{ flex:1, padding:'12px', borderRadius:'8px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Cancel</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

function infoRow(label, val) {
  return (
    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'10px 0', borderBottom:'1px solid #e8f0fe' }}>
      <span style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>{label}</span>
      <span style={{ fontSize:'14px', color:'#1a2332', fontWeight:700 }}>{val}</span>
    </div>
  );
}
