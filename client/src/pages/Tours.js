import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { getUser } from '../auth';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

function toast(msg, type='success') {
  const el = document.createElement('div');
  const c = {success:'#1e8e3e',error:'#d93025',info:'#1a73e8'};
  el.style.cssText=`position:fixed;top:80px;right:24px;z-index:9999;padding:14px 20px;border-radius:8px;font-weight:700;font-size:13px;color:#fff;background:${c[type]||c.success};box-shadow:0 8px 24px rgba(0,0,0,.2);animation:slideInRight .3s ease;min-width:240px;`;
  el.textContent=msg; document.body.appendChild(el); setTimeout(()=>el.remove(),3000);
}

function exportCSV(data, filename) {
  if (!data.length) return toast('Nothing to export','info');
  const keys = Object.keys(data[0]);
  const csv = [keys.join(','),...data.map(r=>keys.map(k=>`"${String(r[k]??'').replace(/"/g,'""')}"`).join(','))].join('\n');
  const a = document.createElement('a'); a.href=URL.createObjectURL(new Blob([csv],{type:'text/csv'})); a.download=filename; a.click();
  toast(`Exported ${data.length} rows`);
}

function PriceTier({ price }) {
  const p = Number(price||0);
  const [label,color] = p<500?['Budget','#1e8e3e']:p<1500?['Mid-Range','#d97706']:['Luxury','#7c3aed'];
  return <span style={{ padding:'3px 10px', borderRadius:'4px', fontSize:'10px', fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', background:`${color}18`, color, border:`1px solid ${color}30` }}>{label}</span>;
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
  const [formData, setFormData] = useState({ title:'', description:'', price:0 });
  const [viewTour, setViewTour] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  const load = useCallback(async () => {
    try { setLoading(true); const r = await api.get('/tours'); setItems(r.data||[]); }
    catch(e) { toast('Failed to load tours','error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items
    .filter(t => t.title.toLowerCase().includes(search.toLowerCase()) || (t.description||'').toLowerCase().includes(search.toLowerCase()))
    .filter(t => { const p=Number(t.price||0); if(priceFilter==='budget') return p<500; if(priceFilter==='mid') return p>=500&&p<1500; if(priceFilter==='luxury') return p>=1500; return true; })
    .sort((a,b) => sortBy==='price'?Number(a.price||0)-Number(b.price||0):sortBy==='price-desc'?Number(b.price||0)-Number(a.price||0):a.title.localeCompare(b.title));

  function openCreate() { setEditingItem(null); setFormData({title:'',description:'',price:0}); setShowModal(true); }
  function openEdit(t) { setEditingItem(t); setFormData({title:t.title,description:t.description||'',price:Number(t.price)||0}); setShowModal(true); }

  async function handleSave() {
    if (!formData.title.trim()) { toast('Tour title is required','error'); return; }
    setSaving(true);
    try {
      if (editingItem) { await api.put('/tours/'+editingItem.id, formData); toast('Tour updated'); }
      else { await api.post('/tours', formData); toast('Tour created'); }
      load(); setShowModal(false); setEditingItem(null);
    } catch(e) { toast('Error saving tour','error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(t) {
    if (!window.confirm(`Delete "${t.title}"?`)) return;
    try { await api.delete('/tours/'+t.id); toast('Tour deleted'); load(); setSelected(s=>{s.delete(t.id);return new Set(s);}); }
    catch(e) { toast('Error deleting tour','error'); }
  }

  async function bulkDelete() {
    if (!selected.size) return;
    if (!window.confirm(`Delete ${selected.size} tour(s)?`)) return;
    try { await Promise.all([...selected].map(id=>api.delete('/tours/'+id))); toast(`Deleted ${selected.size} tours`); setSelected(new Set()); load(); }
    catch(e) { toast('Error deleting tours','error'); }
  }

  const toggleSelect = id => setSelected(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});
  const toggleAll = () => setSelected(selected.size===filtered.length?new Set():new Set(filtered.map(t=>t.id)));

  const totalRevenue = items.reduce((s,t)=>s+Number(t.price||0),0);
  const avgPrice = items.length ? (totalRevenue/items.length).toFixed(0) : 0;

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h2 style={{ margin:0 }}>Tours</h2>
          <p style={{ margin:'6px 0 0', color:'#5f6b7a', fontSize:'13px' }}>{items.length} tours · avg price ${avgPrice}</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={()=>exportCSV(filtered.map(t=>({ID:t.id,Title:t.title,Description:t.description||'',Price:t.price})),'tours.csv')}
            style={{ padding:'9px 16px', borderRadius:'7px', background:'#e8f0fe', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
            ↓ Export CSV
          </button>
          {isAdmin && selected.size>0 && (
            <button onClick={bulkDelete} style={{ padding:'9px 16px', borderRadius:'7px', background:'#fde8e8', color:'#d93025', border:'1px solid #fca5a5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
              Delete {selected.size} Selected
            </button>
          )}
          {isAdmin && <button className="btn" onClick={openCreate} style={{ padding:'9px 18px', fontSize:'12px' }}>+ Add Tour</button>}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'12px', marginBottom:'20px' }}>
        {[
          { label:'Total Tours', value:items.length, color:'#1a73e8' },
          { label:'Total Revenue', value:`$${totalRevenue.toLocaleString()}`, color:'#1e8e3e' },
          { label:'Avg Price', value:`$${avgPrice}`, color:'#d97706' },
          { label:'Luxury Tours', value:items.filter(t=>Number(t.price||0)>=1500).length, color:'#7c3aed' },
        ].map(s=>(
          <div key={s.label} className="card" style={{ padding:'16px', borderLeft:`3px solid ${s.color}`, margin:0 }}>
            <div style={{ fontSize:'20px', fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginTop:'3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center', padding:'14px 16px', background:'#f0f7ff', borderRadius:'10px', border:'1px solid #c5d8f5' }}>
        <input type="text" placeholder="Search tours..." value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:'180px' }} />
        <select value={priceFilter} onChange={e=>setPriceFilter(e.target.value)} style={{ minWidth:'150px' }}>
          <option value="all">All Prices</option>
          <option value="budget">Budget (&lt;$500)</option>
          <option value="mid">Mid ($500–$1500)</option>
          <option value="luxury">Luxury ($1500+)</option>
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ minWidth:'160px' }}>
          <option value="title">Sort: Title A–Z</option>
          <option value="price">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
        {(search||priceFilter!=='all') && (
          <button onClick={()=>{setSearch('');setPriceFilter('all');}} style={{ padding:'9px 14px', borderRadius:'7px', background:'#fff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'11px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Clear</button>
        )}
        <span style={{ fontSize:'12px', color:'#5f6b7a', fontWeight:600 }}>{filtered.length} result{filtered.length!==1?'s':''}</span>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><Spinner /></div>
      ) : filtered.length===0 ? (
        <EmptyState icon="✈️" title={search||priceFilter!=='all'?'No tours match':'No tours yet'} description={search||priceFilter!=='all'?'Try different filters.':'Create your first tour.'} action={isAdmin&&!search&&priceFilter==='all'&&<button className="btn" onClick={openCreate}>Add Tour</button>} />
      ) : (
        <>
          {isAdmin && (
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
              <input type="checkbox" checked={selected.size===filtered.length&&filtered.length>0} onChange={toggleAll} style={{ width:'16px', height:'16px', cursor:'pointer' }} />
              <span style={{ fontSize:'12px', color:'#5f6b7a', fontWeight:600 }}>{selected.size>0?`${selected.size} selected`:'Select all'}</span>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'16px' }}>
            {filtered.map((t,idx)=>(
              <div key={t.id} className="card" style={{ padding:'20px', display:'flex', flexDirection:'column', animation:`slideInUp .3s ease ${idx*.04}s backwards`, position:'relative', borderLeft:selected.has(t.id)?'3px solid #1a73e8':'3px solid transparent' }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                {isAdmin && <input type="checkbox" checked={selected.has(t.id)} onChange={()=>toggleSelect(t.id)} style={{ position:'absolute', top:'14px', right:'14px', width:'16px', height:'16px', cursor:'pointer' }} />}
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                  <h3 style={{ margin:0, fontSize:'15px', fontWeight:800, color:'#1a2332', flex:1, paddingRight:'24px', lineHeight:'1.3' }}>{t.title}</h3>
                </div>
                <PriceTier price={t.price} />
                {t.description && <p style={{ margin:'10px 0', color:'#5f6b7a', fontSize:'13px', lineHeight:'1.5', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{t.description}</p>}
                <div style={{ marginTop:'auto', padding:'10px 12px', background:'#f0f7ff', borderRadius:'6px', border:'1px solid #c5d8f5', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                  <span style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>Price</span>
                  <span style={{ fontSize:'20px', fontWeight:900, color:'#1a73e8' }}>${Number(t.price||0).toLocaleString()}</span>
                </div>
                {isAdmin && (
                  <div style={{ display:'flex', gap:'6px', paddingTop:'12px', borderTop:'1px solid #e8f0fe' }}>
                    <button onClick={()=>setViewTour(t)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#e8f0fe', color:'#1a73e8', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>View</button>
                    <button onClick={()=>openEdit(t)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#fef3c7', color:'#d97706', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>Edit</button>
                    <button onClick={()=>handleDelete(t)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#fee2e2', color:'#d93025', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>Delete</button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewTour} title={viewTour?.title||''} onClose={()=>setViewTour(null)}>
        {viewTour && (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'340px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <PriceTier price={viewTour.price} />
              <span style={{ fontSize:'24px', fontWeight:900, color:'#1a73e8' }}>${Number(viewTour.price||0).toLocaleString()}</span>
            </div>
            {viewTour.description && (
              <div>
                <label>Description</label>
                <div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', color:'#1a2332', fontSize:'14px', lineHeight:'1.6', border:'1px solid #c5d8f5' }}>{viewTour.description}</div>
              </div>
            )}
            <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'8px' }}>
              <button onClick={()=>setViewTour(null)} style={{ padding:'9px 18px', borderRadius:'7px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Close</button>
              {isAdmin && <button className="btn" onClick={()=>{setViewTour(null);openEdit(viewTour);}}>Edit</button>}
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} title={editingItem?'Edit Tour':'Add Tour'} onClose={()=>setShowModal(false)}>
        <form onSubmit={e=>{e.preventDefault();handleSave();}} style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'340px' }}>
          <div><label>Tour Title *</label><input type="text" value={formData.title} onChange={e=>setFormData({...formData,title:e.target.value})} placeholder="e.g. Bali Adventure Trek" required autoFocus /></div>
          <div><label>Description</label><textarea value={formData.description} onChange={e=>setFormData({...formData,description:e.target.value})} placeholder="Describe the tour experience..." style={{ minHeight:'90px', resize:'vertical' }} /></div>
          <div>
            <label>Price (USD) *</label>
            <input type="number" step="1" min="0" value={formData.price} onChange={e=>setFormData({...formData,price:parseFloat(e.target.value)||0})} placeholder="0" required />
            <div style={{ marginTop:'6px' }}><PriceTier price={formData.price} /></div>
          </div>
          <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
            <button type="submit" style={{ flex:1 }} disabled={saving}>{saving?'Saving…':editingItem?'Update Tour':'Create Tour'}</button>
            <button type="button" onClick={()=>setShowModal(false)} style={{ flex:1, background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', boxShadow:'none' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
