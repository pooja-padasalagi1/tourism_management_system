import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { getUser } from '../auth';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

/* ── helpers ── */
function toast(msg, type = 'success') {
  const el = document.createElement('div');
  const colors = { success: '#1e8e3e', error: '#d93025', info: '#1a73e8' };
  el.style.cssText = `position:fixed;top:80px;right:24px;z-index:9999;padding:14px 20px;border-radius:8px;font-weight:700;font-size:13px;color:#fff;background:${colors[type]||colors.success};box-shadow:0 8px 24px rgba(0,0,0,0.2);animation:slideInRight .3s ease;min-width:240px;`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3000);
}

function exportCSV(data, filename) {
  if (!data.length) return toast('Nothing to export', 'info');
  const keys = Object.keys(data[0]);
  const csv = [keys.join(','), ...data.map(r => keys.map(k => `"${String(r[k]??'').replace(/"/g,'""')}"`).join(','))].join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = filename;
  a.click();
  toast(`Exported ${data.length} rows`);
}

function StarRating({ rating, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  const r = Number(rating || 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
      {[1,2,3,4,5].map(i => (
        <span key={i}
          style={{ fontSize: '18px', cursor: interactive ? 'pointer' : 'default', color: i <= (hover || r) ? '#f59e0b' : '#d1d5db', transition: 'color .15s' }}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange && onChange(i)}
        >★</span>
      ))}
      <span style={{ fontSize: '13px', fontWeight: 700, color: '#1a73e8', marginLeft: '4px' }}>{r.toFixed(1)}</span>
    </div>
  );
}

const FIELD = (label, val) => (
  <div>
    <label>{label}</label>
    <div style={{ padding: '10px 14px', background: '#f0f7ff', borderRadius: '8px', color: '#1a2332', fontSize: '14px', fontWeight: 600, border: '1px solid #c5d8f5' }}>{val}</div>
  </div>
);

export default function Hotels() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [minRating, setMinRating] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', location: '', rating: 0 });
  const [viewHotel, setViewHotel] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  const load = useCallback(async () => {
    try { setLoading(true); const r = await api.get('/hotels'); setItems(r.data || []); }
    catch(e) { toast('Failed to load hotels', 'error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items
    .filter(h => (h.name.toLowerCase().includes(search.toLowerCase()) || h.location.toLowerCase().includes(search.toLowerCase())) && Number(h.rating||0) >= minRating)
    .sort((a,b) => sortBy === 'rating' ? b.rating - a.rating : sortBy === 'location' ? a.location.localeCompare(b.location) : a.name.localeCompare(b.name));

  function openCreate() { setEditingItem(null); setFormData({ name:'', location:'', rating:0 }); setShowModal(true); }
  function openEdit(h) { setEditingItem(h); setFormData({ name:h.name, location:h.location, rating:h.rating }); setShowModal(true); }

  async function handleSave() {
    if (!formData.name.trim()) { toast('Hotel name is required', 'error'); return; }
    setSaving(true);
    try {
      if (editingItem) { await api.put('/hotels/'+editingItem.id, formData); toast('Hotel updated'); }
      else { await api.post('/hotels', formData); toast('Hotel created'); }
      load(); setShowModal(false); setEditingItem(null);
    } catch(e) { toast('Error saving hotel', 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(h) {
    if (!window.confirm(`Delete "${h.name}"?`)) return;
    try { await api.delete('/hotels/'+h.id); toast('Hotel deleted'); load(); setSelected(s => { s.delete(h.id); return new Set(s); }); }
    catch(e) { toast('Error deleting hotel', 'error'); }
  }

  async function bulkDelete() {
    if (!selected.size) return;
    if (!window.confirm(`Delete ${selected.size} hotel(s)?`)) return;
    try {
      await Promise.all([...selected].map(id => api.delete('/hotels/'+id)));
      toast(`Deleted ${selected.size} hotels`); setSelected(new Set()); load();
    } catch(e) { toast('Error deleting hotels', 'error'); }
  }

  const toggleSelect = (id) => setSelected(s => { const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(h => h.id)));

  const avgRating = items.length ? (items.reduce((s,h) => s + Number(h.rating||0), 0) / items.length).toFixed(1) : '0.0';

  return (
    <div className="page">
      {/* Header */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h2 style={{ margin:0 }}>Hotels</h2>
          <p style={{ margin:'6px 0 0', color:'#5f6b7a', fontSize:'13px' }}>{items.length} hotels · avg rating {avgRating} ★</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={() => exportCSV(filtered.map(h=>({ID:h.id,Name:h.name,Location:h.location,Rating:h.rating})), 'hotels.csv')}
            style={{ padding:'9px 16px', borderRadius:'7px', background:'#e8f0fe', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
            ↓ Export CSV
          </button>
          {isAdmin && selected.size > 0 && (
            <button onClick={bulkDelete} style={{ padding:'9px 16px', borderRadius:'7px', background:'#fde8e8', color:'#d93025', border:'1px solid #fca5a5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
              Delete {selected.size} Selected
            </button>
          )}
          {isAdmin && <button className="btn" onClick={openCreate} style={{ padding:'9px 18px', fontSize:'12px' }}>+ Add Hotel</button>}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'12px', marginBottom:'20px' }}>
        {[
          { label:'Total Hotels', value:items.length, color:'#1a73e8' },
          { label:'Avg Rating', value:`${avgRating} ★`, color:'#f59e0b' },
          { label:'Top Rated', value:items.filter(h=>Number(h.rating||0)>=4).length, color:'#1e8e3e' },
          { label:'Locations', value:new Set(items.map(h=>h.location)).size, color:'#9333ea' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding:'16px', borderLeft:`3px solid ${s.color}`, margin:0 }}>
            <div style={{ fontSize:'22px', fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginTop:'3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center', padding:'14px 16px', background:'#f0f7ff', borderRadius:'10px', border:'1px solid #c5d8f5' }}>
        <input type="text" placeholder="Search by name or location..." value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:'180px' }} />
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ minWidth:'150px' }}>
          <option value="name">Sort: Name A–Z</option>
          <option value="rating">Sort: Rating ↓</option>
          <option value="location">Sort: Location</option>
        </select>
        <select value={minRating} onChange={e=>setMinRating(Number(e.target.value))} style={{ minWidth:'140px' }}>
          <option value={0}>All Ratings</option>
          <option value={3}>3★ & above</option>
          <option value={4}>4★ & above</option>
          <option value={4.5}>4.5★ & above</option>
        </select>
        {(search || minRating > 0) && (
          <button onClick={() => { setSearch(''); setMinRating(0); }} style={{ padding:'9px 14px', borderRadius:'7px', background:'#fff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'11px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>
            Clear
          </button>
        )}
        <span style={{ fontSize:'12px', color:'#5f6b7a', fontWeight:600 }}>{filtered.length} result{filtered.length!==1?'s':''}</span>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="🏨" title={search||minRating>0?'No hotels match':'No hotels yet'} description={search||minRating>0?'Try different filters.':'Add your first hotel.'} action={isAdmin&&!search&&<button className="btn" onClick={openCreate}>Add Hotel</button>} />
      ) : (
        <>
          {isAdmin && (
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
              <input type="checkbox" checked={selected.size===filtered.length&&filtered.length>0} onChange={toggleAll} style={{ width:'16px', height:'16px', cursor:'pointer' }} />
              <span style={{ fontSize:'12px', color:'#5f6b7a', fontWeight:600 }}>{selected.size>0?`${selected.size} selected`:'Select all'}</span>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'16px' }}>
            {filtered.map((h, idx) => (
              <div key={h.id} className="card" style={{ padding:'20px', animation:`slideInUp .3s ease ${idx*.04}s backwards`, position:'relative', borderLeft: selected.has(h.id)?'3px solid #1a73e8':'3px solid transparent' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                {isAdmin && (
                  <input type="checkbox" checked={selected.has(h.id)} onChange={()=>toggleSelect(h.id)}
                    style={{ position:'absolute', top:'14px', right:'14px', width:'16px', height:'16px', cursor:'pointer' }} />
                )}
                <div style={{ marginBottom:'10px' }}>
                  <h3 style={{ margin:'0 0 4px', fontSize:'15px', fontWeight:800, color:'#1a2332', paddingRight:'24px' }}>{h.name}</h3>
                  <div style={{ fontSize:'12px', color:'#5f6b7a', display:'flex', alignItems:'center', gap:'4px' }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/></svg>
                    {h.location}
                  </div>
                </div>
                <StarRating rating={h.rating} />
                {isAdmin && (
                  <div style={{ display:'flex', gap:'6px', marginTop:'14px', paddingTop:'12px', borderTop:'1px solid #e8f0fe' }}>
                    <button onClick={()=>setViewHotel(h)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#e8f0fe', color:'#1a73e8', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>View</button>
                    <button onClick={()=>openEdit(h)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#fef3c7', color:'#d97706', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>Edit</button>
                    <button onClick={()=>handleDelete(h)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#fee2e2', color:'#d93025', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewHotel} title={viewHotel?.name||''} onClose={()=>setViewHotel(null)}>
        {viewHotel && (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'340px' }}>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              {FIELD('Hotel ID', `#${viewHotel.id}`)}
              <div><label>Rating</label><div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', border:'1px solid #c5d8f5' }}><StarRating rating={viewHotel.rating} /></div></div>
            </div>
            {FIELD('Location', viewHotel.location)}
            <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'8px' }}>
              <button onClick={()=>setViewHotel(null)} style={{ padding:'9px 18px', borderRadius:'7px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Close</button>
              {isAdmin && <button className="btn" onClick={()=>{setViewHotel(null);openEdit(viewHotel);}}>Edit</button>}
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} title={editingItem?'Edit Hotel':'Add Hotel'} onClose={()=>{setShowModal(false);setEditingItem(null);}}>
        <form onSubmit={e=>{e.preventDefault();handleSave();}} style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'340px' }}>
          <div><label>Hotel Name *</label><input type="text" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} placeholder="e.g. Grand Palace Hotel" required autoFocus /></div>
          <div><label>Location *</label><input type="text" value={formData.location} onChange={e=>setFormData({...formData,location:e.target.value})} placeholder="City, Country" required /></div>
          <div>
            <label>Rating (click to set)</label>
            <StarRating rating={formData.rating} interactive onChange={v=>setFormData({...formData,rating:v})} />
            <input type="range" min="0" max="5" step="0.5" value={formData.rating} onChange={e=>setFormData({...formData,rating:parseFloat(e.target.value)})} style={{ width:'100%', marginTop:'8px' }} />
          </div>
          <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
            <button type="submit" style={{ flex:1 }} disabled={saving}>{saving?'Saving…':editingItem?'Update Hotel':'Create Hotel'}</button>
            <button type="button" onClick={()=>{setShowModal(false);setEditingItem(null);}} style={{ flex:1, background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', boxShadow:'none' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
