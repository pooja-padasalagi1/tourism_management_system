import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { getUser } from '../auth';
import Modal from '../components/Modal';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';

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
  pending:   { color:'#d97706', bg:'#fef3c7', border:'#fde68a', label:'Pending' },
  confirmed: { color:'#1e8e3e', bg:'#d1fae5', border:'#6ee7b7', label:'Confirmed' },
  cancelled: { color:'#d93025', bg:'#fee2e2', border:'#fca5a5', label:'Cancelled' },
  completed: { color:'#1a73e8', bg:'#dbeafe', border:'#93c5fd', label:'Completed' },
};

function StatusBadge({ status }) {
  const cfg=STATUS_CFG[status]||STATUS_CFG.pending;
  return <span style={{ padding:'4px 10px', borderRadius:'4px', fontSize:'10px', fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>{cfg.label}</span>;
}

export default function Bookings() {
  const [items, setItems] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({ user_id:'', tour_id:'', hotel_id:'', status:'pending', notes:'' });
  const [viewBooking, setViewBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [tours, setTours] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [users, setUsers] = useState([]);
  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [bRes, tRes, hRes, uRes] = await Promise.all([
        api.get('/bookings').catch(()=>({data:[]})),
        api.get('/tours').catch(()=>({data:[]})),
        api.get('/hotels').catch(()=>({data:[]})),
        api.get('/users').catch(()=>({data:[]})),
      ]);
      setItems(bRes.data||[]); setTours(tRes.data||[]); setHotels(hRes.data||[]); setUsers(uRes.data||[]);
    } catch(e) { toast('Failed to load bookings','error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items
    .filter(b => statusFilter==='all' || b.status===statusFilter)
    .filter(b => {
      const s=search.toLowerCase();
      return !s || String(b.id).includes(s) || (b.user_name||'').toLowerCase().includes(s) || (b.tour_title||'').toLowerCase().includes(s) || (b.hotel_name||'').toLowerCase().includes(s);
    })
    .sort((a,b) => sortBy==='oldest' ? a.id-b.id : b.id-a.id);

  function openCreate() { setEditingItem(null); setFormData({user_id:'',tour_id:'',hotel_id:'',status:'pending',notes:''}); setShowModal(true); }
  function openEdit(b) { setEditingItem(b); setFormData({user_id:b.user_id||'',tour_id:b.tour_id||'',hotel_id:b.hotel_id||'',status:b.status||'pending',notes:b.notes||''}); setShowModal(true); }

  async function handleSave() {
    if (!formData.user_id||!formData.tour_id||!formData.hotel_id) { toast('User, Tour and Hotel are required','error'); return; }
    setSaving(true);
    try {
      if (editingItem) { await api.put('/bookings/'+editingItem.id, formData); toast('Booking updated'); }
      else { await api.post('/bookings', formData); toast('Booking created'); }
      load(); setShowModal(false); setEditingItem(null);
    } catch(e) { toast('Error saving booking','error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(b) {
    if (!window.confirm(`Delete booking #${b.id}?`)) return;
    try { await api.delete('/bookings/'+b.id); toast('Booking deleted'); load(); setSelected(s=>{s.delete(b.id);return new Set(s);}); }
    catch(e) { toast('Error deleting booking','error'); }
  }

  async function quickStatus(b, status) {
    try { await api.put('/bookings/'+b.id, {...b, status}); toast(`Status → ${status}`); load(); }
    catch(e) { toast('Error updating status','error'); }
  }

  async function bulkDelete() {
    if (!selected.size) return;
    if (!window.confirm(`Delete ${selected.size} booking(s)?`)) return;
    try { await Promise.all([...selected].map(id=>api.delete('/bookings/'+id))); toast(`Deleted ${selected.size} bookings`); setSelected(new Set()); load(); }
    catch(e) { toast('Error deleting bookings','error'); }
  }

  const toggleSelect = id => setSelected(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});
  const toggleAll = () => setSelected(selected.size===filtered.length?new Set():new Set(filtered.map(b=>b.id)));

  const stats = {
    total:items.length, pending:items.filter(b=>b.status==='pending').length,
    confirmed:items.filter(b=>b.status==='confirmed').length, completed:items.filter(b=>b.status==='completed').length,
    cancelled:items.filter(b=>b.status==='cancelled').length,
  };

  const infoBox = (label, val) => (
    <div>
      <label>{label}</label>
      <div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', color:'#1a2332', fontSize:'14px', fontWeight:600, border:'1px solid #c5d8f5' }}>{val}</div>
    </div>
  );

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h2 style={{ margin:0 }}>Bookings</h2>
          <p style={{ margin:'6px 0 0', color:'#5f6b7a', fontSize:'13px' }}>{items.length} total bookings</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={()=>exportCSV(filtered.map(b=>({ID:b.id,Guest:b.user_name||b.user_id,Tour:b.tour_title||b.tour_id,Hotel:b.hotel_name||b.hotel_id,Status:b.status,Date:b.created_at?new Date(b.created_at).toLocaleDateString():''})),'bookings.csv')}
            style={{ padding:'9px 16px', borderRadius:'7px', background:'#e8f0fe', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
            ↓ Export CSV
          </button>
          {isAdmin && selected.size>0 && (
            <button onClick={bulkDelete} style={{ padding:'9px 16px', borderRadius:'7px', background:'#fde8e8', color:'#d93025', border:'1px solid #fca5a5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
              Delete {selected.size}
            </button>
          )}
          {isAdmin && <button className="btn btn-vibrant" onClick={openCreate} style={{ padding:'9px 18px', fontSize:'12px' }}>+ Create Booking</button>}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(120px,1fr))', gap:'12px', marginBottom:'20px' }}>
        {[
          {label:'Total',value:stats.total,color:'#1a73e8'},
          {label:'Pending',value:stats.pending,color:'#d97706'},
          {label:'Confirmed',value:stats.confirmed,color:'#1e8e3e'},
          {label:'Completed',value:stats.completed,color:'#7c3aed'},
          {label:'Cancelled',value:stats.cancelled,color:'#d93025'},
        ].map(s=>(
          <div key={s.label} className="card" style={{ padding:'14px', textAlign:'center', borderLeft:`3px solid ${s.color}`, margin:0, cursor:'pointer' }}
            onClick={()=>setStatusFilter(s.label.toLowerCase()==='total'?'all':s.label.toLowerCase())}>
            <div style={{ fontSize:'22px', fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginTop:'3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center', padding:'14px 16px', background:'#f0f7ff', borderRadius:'10px', border:'1px solid #c5d8f5' }}>
        <input type="text" placeholder="Search by ID, guest, tour, hotel..." value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:'200px' }} />
        <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} style={{ minWidth:'150px' }}>
          <option value="all">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="confirmed">Confirmed</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ minWidth:'140px' }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
        </select>
        {(search||statusFilter!=='all') && (
          <button onClick={()=>{setSearch('');setStatusFilter('all');}} style={{ padding:'9px 14px', borderRadius:'7px', background:'#fff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'11px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Clear</button>
        )}
        <span style={{ fontSize:'12px', color:'#5f6b7a', fontWeight:600 }}>{filtered.length} result{filtered.length!==1?'s':''}</span>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><Spinner /></div>
      ) : filtered.length===0 ? (
        <EmptyState icon="📅" title="No bookings found" description="Try different filters or create a new booking." action={isAdmin&&<button className="btn" onClick={openCreate}>Create Booking</button>} />
      ) : (
        <>
          {isAdmin && (
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
              <input type="checkbox" checked={selected.size===filtered.length&&filtered.length>0} onChange={toggleAll} style={{ width:'16px', height:'16px', cursor:'pointer' }} />
              <span style={{ fontSize:'12px', color:'#5f6b7a', fontWeight:600 }}>{selected.size>0?`${selected.size} selected`:'Select all'}</span>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'16px' }}>
            {filtered.map((b,idx)=>(
              <div key={b.id} className="card" style={{ padding:'18px', animation:`slideInUp .3s ease ${idx*.04}s backwards`, position:'relative', borderLeft:selected.has(b.id)?'3px solid #1a73e8':'3px solid transparent' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                {isAdmin && <input type="checkbox" checked={selected.has(b.id)} onChange={()=>toggleSelect(b.id)} style={{ position:'absolute', top:'14px', right:'14px', width:'16px', height:'16px', cursor:'pointer' }} />}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:'14px', color:'#1a2332' }}>#{b.id} — {b.user_name||`User ${b.user_id}`}</div>
                    <div style={{ color:'#5f6b7a', marginTop:'3px', fontSize:'12px' }}>{b.tour_title||`Tour ${b.tour_id}`}</div>
                    <div style={{ color:'#9ca3af', marginTop:'2px', fontSize:'11px' }}>{b.hotel_name||`Hotel ${b.hotel_id}`}</div>
                  </div>
                  <div style={{ textAlign:'right' }}>
                    <StatusBadge status={b.status} />
                    {b.created_at && <div style={{ color:'#9ca3af', fontSize:'10px', marginTop:'4px' }}>{new Date(b.created_at).toLocaleDateString()}</div>}
                  </div>
                </div>
                {/* Quick status change */}
                {isAdmin && b.status==='pending' && (
                  <div style={{ display:'flex', gap:'4px', marginBottom:'10px' }}>
                    <button onClick={()=>quickStatus(b,'confirmed')} style={{ flex:1, padding:'5px', borderRadius:'5px', background:'#d1fae5', color:'#1e8e3e', border:'none', fontWeight:700, fontSize:'10px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>✓ Confirm</button>
                    <button onClick={()=>quickStatus(b,'cancelled')} style={{ flex:1, padding:'5px', borderRadius:'5px', background:'#fee2e2', color:'#d93025', border:'none', fontWeight:700, fontSize:'10px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>✕ Cancel</button>
                  </div>
                )}
                {isAdmin && b.status==='confirmed' && (
                  <div style={{ display:'flex', gap:'4px', marginBottom:'10px' }}>
                    <button onClick={()=>quickStatus(b,'completed')} style={{ flex:1, padding:'5px', borderRadius:'5px', background:'#dbeafe', color:'#1a73e8', border:'none', fontWeight:700, fontSize:'10px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>✓ Complete</button>
                  </div>
                )}
                {isAdmin && (
                  <div style={{ display:'flex', gap:'6px', paddingTop:'10px', borderTop:'1px solid #e8f0fe' }}>
                    <button onClick={()=>setViewBooking(b)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#e8f0fe', color:'#1a73e8', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>View</button>
                    <button onClick={()=>openEdit(b)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#fef3c7', color:'#d97706', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>Edit</button>
                    <button onClick={()=>handleDelete(b)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#fee2e2', color:'#d93025', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewBooking} title={`Booking #${viewBooking?.id}`} onClose={()=>setViewBooking(null)}>
        {viewBooking && (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'360px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              {infoBox('Guest', viewBooking.user_name||`User #${viewBooking.user_id}`)}
              <div><label>Status</label><div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', border:'1px solid #c5d8f5' }}><StatusBadge status={viewBooking.status} /></div></div>
            </div>
            {infoBox('Tour', viewBooking.tour_title||`Tour #${viewBooking.tour_id}`)}
            {infoBox('Hotel', viewBooking.hotel_name||`Hotel #${viewBooking.hotel_id}`)}
            {viewBooking.created_at && infoBox('Created', new Date(viewBooking.created_at).toLocaleString())}
            {viewBooking.notes && infoBox('Notes', viewBooking.notes)}
            {isAdmin && (
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                {['pending','confirmed','completed','cancelled'].filter(s=>s!==viewBooking.status).map(s=>(
                  <button key={s} onClick={()=>{quickStatus(viewBooking,s);setViewBooking({...viewBooking,status:s});}}
                    style={{ padding:'7px 12px', borderRadius:'6px', background:STATUS_CFG[s].bg, color:STATUS_CFG[s].color, border:`1px solid ${STATUS_CFG[s].border}`, fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', boxShadow:'none' }}>
                    → {s}
                  </button>
                ))}
              </div>
            )}
            <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'8px' }}>
              <button onClick={()=>setViewBooking(null)} style={{ padding:'9px 18px', borderRadius:'7px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Close</button>
              {isAdmin && <button className="btn btn-info-vibrant" onClick={()=>{setViewBooking(null);openEdit(viewBooking);}}>Edit</button>}
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} title={editingItem?`Edit Booking #${editingItem.id}`:'Create Booking'} onClose={()=>{setShowModal(false);setEditingItem(null);}}>
        <form onSubmit={e=>{e.preventDefault();handleSave();}} style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'360px' }}>
          <div>
            <label>User *</label>
            <select value={formData.user_id} onChange={e=>setFormData({...formData,user_id:e.target.value})} required>
              <option value="">Select user...</option>
              {users.map(u=><option key={u.id} value={u.id}>{u.name} ({u.email})</option>)}
            </select>
          </div>
          <div>
            <label>Tour *</label>
            <select value={formData.tour_id} onChange={e=>setFormData({...formData,tour_id:e.target.value})} required>
              <option value="">Select tour...</option>
              {tours.map(t=><option key={t.id} value={t.id}>{t.title} — ${t.price}</option>)}
            </select>
          </div>
          <div>
            <label>Hotel *</label>
            <select value={formData.hotel_id} onChange={e=>setFormData({...formData,hotel_id:e.target.value})} required>
              <option value="">Select hotel...</option>
              {hotels.map(h=><option key={h.id} value={h.id}>{h.name} — {h.location}</option>)}
            </select>
          </div>
          <div>
            <label>Status</label>
            <select value={formData.status} onChange={e=>setFormData({...formData,status:e.target.value})}>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
          </div>
          <div><label>Notes (optional)</label><textarea value={formData.notes} onChange={e=>setFormData({...formData,notes:e.target.value})} placeholder="Any special requests or notes..." style={{ minHeight:'70px', resize:'vertical' }} /></div>
          <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
            <button type="submit" style={{ flex:1 }} disabled={saving}>{saving?'Saving…':editingItem?'Update':'Create'}</button>
            <button type="button" onClick={()=>{setShowModal(false);setEditingItem(null);}} style={{ flex:1, background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', boxShadow:'none' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function infoBox(label, val) {
  return (
    <div>
      <label>{label}</label>
      <div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', color:'#1a2332', fontSize:'14px', fontWeight:600, border:'1px solid #c5d8f5' }}>{val}</div>
    </div>
  );
}
