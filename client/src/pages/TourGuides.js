import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import { getUser } from '../auth';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

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

const STORAGE_KEY = 'tms_guides_v1';
const SEED = [
  { id:1, name:'Aisha Khan',   phone:'+1 555-0101', bio:'Experienced city guide, speaks English and Arabic.', languages:'English, Arabic', rating:4.8, tours:23, available:true },
  { id:2, name:'Liam Smith',   phone:'+1 555-0202', bio:'Historic sites specialist with 10+ years experience.', languages:'English, French', rating:4.9, tours:41, available:true },
  { id:3, name:'Sofia Garcia', phone:'+1 555-0303', bio:'Nature and hiking tours, certified guide.', languages:'English, Spanish', rating:4.7, tours:18, available:false },
  { id:4, name:'Kenji Tanaka', phone:'+1 555-0404', bio:'Local food tours and cultural experiences.', languages:'English, Japanese', rating:4.6, tours:29, available:true },
  { id:5, name:'Maria Rossi',  phone:'+1 555-0505', bio:'Multilingual guide and photographer.', languages:'English, Italian, Spanish', rating:5.0, tours:35, available:true },
];

export default function TourGuides() {
  const [guides, setGuides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingGuide, setEditingGuide] = useState(null);
  const [form, setForm] = useState({ name:'', phone:'', bio:'', languages:'', rating:5, available:true });
  const [viewGuide, setViewGuide] = useState(null);
  const [search, setSearch] = useState('');
  const [filterAvail, setFilterAvail] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [saving, setSaving] = useState(false);
  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  function readLocal() { try { const r=localStorage.getItem(STORAGE_KEY); return r?JSON.parse(r):[]; } catch(e){ return []; } }
  function writeLocal(list) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch(e){} }

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/tour-guides').catch(()=>({data:[]}));
      const server = res.data||[];
      if (server.length>0) { setGuides(server); }
      else {
        const local = readLocal();
        if (local.length>0) setGuides(local);
        else { writeLocal(SEED); setGuides(SEED); }
      }
    } catch(e) { const local=readLocal(); setGuides(local.length?local:SEED); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = guides
    .filter(g => {
      const s=search.toLowerCase();
      return (!s || g.name.toLowerCase().includes(s) || (g.bio||'').toLowerCase().includes(s) || (g.languages||'').toLowerCase().includes(s))
        && (filterAvail==='all' || (filterAvail==='available'?g.available:!g.available));
    })
    .sort((a,b) => sortBy==='rating'?b.rating-a.rating:sortBy==='tours'?b.tours-a.tours:a.name.localeCompare(b.name));

  function openCreate() { setEditingGuide(null); setForm({name:'',phone:'',bio:'',languages:'',rating:5,available:true}); setShowModal(true); }
  function openEdit(g) { setEditingGuide(g); setForm({name:g.name,phone:g.phone||'',bio:g.bio||'',languages:g.languages||'',rating:g.rating||5,available:g.available!==false}); setShowModal(true); }

  async function save() {
    if (!form.name.trim()) { toast('Name is required','error'); return; }
    setSaving(true);
    try {
      if (editingGuide) {
        await api.put('/tour-guides/'+editingGuide.id, form).catch(()=>{
          const local=readLocal().map(g=>g.id===editingGuide.id?{...g,...form}:g); writeLocal(local);
        });
        toast('Guide updated');
      } else {
        await api.post('/tour-guides', form).catch(()=>{
          const local=readLocal(); local.unshift({id:Date.now(),...form,tours:0}); writeLocal(local);
        });
        toast('Guide added');
      }
      setShowModal(false); setEditingGuide(null); load();
    } catch(e) { toast('Error saving guide','error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(g) {
    if (!window.confirm(`Delete guide "${g.name}"?`)) return;
    try {
      await api.delete('/tour-guides/'+g.id).catch(()=>{ writeLocal(readLocal().filter(x=>x.id!==g.id)); });
      toast('Guide deleted'); load();
      if (viewGuide?.id===g.id) setViewGuide(null);
    } catch(e) { toast('Error deleting guide','error'); }
  }

  function toggleAvailability(g) {
    const updated={...g,available:!g.available};
    const local=readLocal().map(x=>x.id===g.id?updated:x); writeLocal(local);
    setGuides(prev=>prev.map(x=>x.id===g.id?updated:x));
    toast(g.available?'Marked unavailable':'Marked available');
    if (viewGuide?.id===g.id) setViewGuide(updated);
  }

  const avgRating = guides.length ? (guides.reduce((s,g)=>s+Number(g.rating||0),0)/guides.length).toFixed(1) : '0.0';

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h2 style={{ margin:0 }}>Tour Guides</h2>
          <p style={{ margin:'6px 0 0', color:'#5f6b7a', fontSize:'13px' }}>{guides.length} guides · avg rating {avgRating} ★</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={()=>exportCSV(filtered.map(g=>({ID:g.id,Name:g.name,Phone:g.phone||'',Languages:g.languages||'',Rating:g.rating||'',Tours:g.tours||0,Available:g.available})),'guides.csv')}
            style={{ padding:'9px 16px', borderRadius:'7px', background:'#e8f0fe', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
            ↓ Export CSV
          </button>
          {isAdmin && <button className="btn" onClick={openCreate} style={{ padding:'9px 18px', fontSize:'12px' }}>+ Add Guide</button>}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:'12px', marginBottom:'20px' }}>
        {[
          {label:'Total Guides',value:guides.length,color:'#1a73e8'},
          {label:'Available',value:guides.filter(g=>g.available!==false).length,color:'#1e8e3e'},
          {label:'Avg Rating',value:`${avgRating} ★`,color:'#d97706'},
          {label:'Total Tours',value:guides.reduce((s,g)=>s+(g.tours||0),0),color:'#7c3aed'},
        ].map(s=>(
          <div key={s.label} className="card" style={{ padding:'14px', borderLeft:`3px solid ${s.color}`, margin:0 }}>
            <div style={{ fontSize:'20px', fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginTop:'3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center', padding:'14px 16px', background:'#f0f7ff', borderRadius:'10px', border:'1px solid #c5d8f5' }}>
        <input type="text" placeholder="Search by name, bio, languages..." value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:'200px' }} />
        <select value={filterAvail} onChange={e=>setFilterAvail(e.target.value)} style={{ minWidth:'140px' }}>
          <option value="all">All Guides</option>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ minWidth:'140px' }}>
          <option value="name">Sort: Name</option>
          <option value="rating">Sort: Rating ↓</option>
          <option value="tours">Sort: Tours ↓</option>
        </select>
        {(search||filterAvail!=='all') && (
          <button onClick={()=>{setSearch('');setFilterAvail('all');}} style={{ padding:'9px 14px', borderRadius:'7px', background:'#fff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'11px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Clear</button>
        )}
        <span style={{ fontSize:'12px', color:'#5f6b7a', fontWeight:600 }}>{filtered.length} result{filtered.length!==1?'s':''}</span>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><Spinner /></div>
      ) : filtered.length===0 ? (
        <EmptyState icon="🧭" title="No guides found" description="Try different filters or add a new guide." action={isAdmin&&<button className="btn" onClick={openCreate}>Add Guide</button>} />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'16px' }}>
          {filtered.map((g,idx)=>(
            <div key={g.id||g.name} className="card" style={{ padding:'20px', animation:`slideInUp .3s ease ${idx*.04}s backwards`, opacity:g.available!==false?1:0.75 }}
              onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
              onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
              <div style={{ display:'flex', gap:'12px', alignItems:'flex-start', marginBottom:'12px' }}>
                <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:'#dbeafe', border:'2px solid #93c5fd', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'16px', fontWeight:900, color:'#1a73e8', flexShrink:0 }}>
                  {(g.name||'G').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}
                </div>
                <div style={{ flex:1, minWidth:0 }}>
                  <div style={{ fontWeight:800, fontSize:'14px', color:'#1a2332' }}>{g.name}</div>
                  <div style={{ fontSize:'12px', color:'#5f6b7a', marginTop:'2px' }}>{g.phone||'No phone'}</div>
                  {g.rating && (
                    <div style={{ display:'flex', alignItems:'center', gap:'4px', marginTop:'4px' }}>
                      <span style={{ color:'#f59e0b', fontSize:'12px' }}>{'★'.repeat(Math.round(g.rating))}</span>
                      <span style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700 }}>{g.rating}</span>
                    </div>
                  )}
                </div>
                {g.available===false && <span style={{ padding:'2px 6px', borderRadius:'3px', fontSize:'9px', fontWeight:800, textTransform:'uppercase', background:'#fee2e2', color:'#d93025', border:'1px solid #fca5a5', flexShrink:0 }}>Unavailable</span>}
              </div>
              {g.bio && <p style={{ margin:'0 0 10px', color:'#5f6b7a', fontSize:'13px', lineHeight:'1.5', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{g.bio}</p>}
              {g.languages && (
                <div style={{ fontSize:'12px', color:'#1a73e8', marginBottom:'10px', padding:'6px 10px', background:'#eff6ff', borderRadius:'5px', border:'1px solid #bfdbfe' }}>
                  🌐 {g.languages}
                </div>
              )}
              <div style={{ display:'flex', gap:'6px', paddingTop:'12px', borderTop:'1px solid #e8f0fe' }}>
                <button onClick={()=>setViewGuide(g)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#e8f0fe', color:'#1a73e8', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>View</button>
                {isAdmin && <>
                  <button onClick={()=>openEdit(g)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#fef3c7', color:'#d97706', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>Edit</button>
                  <button onClick={()=>toggleAvailability(g)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:g.available!==false?'#fee2e2':'#d1fae5', color:g.available!==false?'#d93025':'#1e8e3e', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>
                    {g.available!==false?'Disable':'Enable'}
                  </button>
                  <button onClick={()=>handleDelete(g)} style={{ padding:'7px 10px', borderRadius:'6px', background:'#fee2e2', color:'#d93025', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', boxShadow:'none' }}>✕</button>
                </>}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewGuide} title={viewGuide?.name||''} onClose={()=>setViewGuide(null)}>
        {viewGuide && (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'340px' }}>
            <div style={{ display:'flex', gap:'14px', alignItems:'center', padding:'14px', background:'#f0f7ff', borderRadius:'10px', border:'1px solid #c5d8f5' }}>
              <div style={{ width:'52px', height:'52px', borderRadius:'50%', background:'#dbeafe', border:'2px solid #93c5fd', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', fontWeight:900, color:'#1a73e8' }}>
                {(viewGuide.name||'G').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:'16px', color:'#1a2332' }}>{viewGuide.name}</div>
                <div style={{ fontSize:'13px', color:'#5f6b7a', marginTop:'2px' }}>{viewGuide.phone||'No phone'}</div>
                {viewGuide.rating && <div style={{ color:'#f59e0b', marginTop:'4px' }}>{'★'.repeat(Math.round(viewGuide.rating))} <span style={{ color:'#5f6b7a', fontSize:'12px' }}>{viewGuide.rating}</span></div>}
              </div>
            </div>
            {viewGuide.languages && (
              <div>
                <label>Languages</label>
                <div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', color:'#1a2332', fontSize:'14px', fontWeight:600, border:'1px solid #c5d8f5' }}>{viewGuide.languages}</div>
              </div>
            )}
            {viewGuide.bio && (
              <div>
                <label>About</label>
                <div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', color:'#5f6b7a', fontSize:'13px', lineHeight:'1.6', border:'1px solid #c5d8f5' }}>{viewGuide.bio}</div>
              </div>
            )}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              <div>
                <label>Tours Conducted</label>
                <div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', color:'#1e8e3e', fontSize:'18px', fontWeight:900, border:'1px solid #c5d8f5' }}>{viewGuide.tours||0}</div>
              </div>
              <div>
                <label>Status</label>
                <div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', border:'1px solid #c5d8f5' }}>
                  <span style={{ padding:'4px 10px', borderRadius:'4px', fontSize:'10px', fontWeight:800, textTransform:'uppercase', background:viewGuide.available!==false?'#d1fae5':'#fee2e2', color:viewGuide.available!==false?'#1e8e3e':'#d93025', border:`1px solid ${viewGuide.available!==false?'#6ee7b7':'#fca5a5'}` }}>
                    {viewGuide.available!==false?'Available':'Unavailable'}
                  </span>
                </div>
              </div>
            </div>
            <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'8px' }}>
              <button onClick={()=>setViewGuide(null)} style={{ padding:'9px 18px', borderRadius:'7px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Close</button>
              {isAdmin && <button className="btn" onClick={()=>{setViewGuide(null);openEdit(viewGuide);}}>Edit</button>}
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} title={editingGuide?'Edit Guide':'Add Guide'} onClose={()=>{setShowModal(false);setEditingGuide(null);}}>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'340px' }}>
          <div><label>Full Name *</label><input type="text" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Guide's full name" autoFocus /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <div><label>Phone</label><input type="tel" value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="+1 555-0000" /></div>
            <div><label>Rating (1–5)</label><input type="number" min="1" max="5" step="0.1" value={form.rating} onChange={e=>setForm({...form,rating:parseFloat(e.target.value)||5})} /></div>
          </div>
          <div><label>Languages</label><input type="text" value={form.languages} onChange={e=>setForm({...form,languages:e.target.value})} placeholder="e.g. English, Spanish" /></div>
          <div><label>Bio</label><textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} placeholder="Guide's experience and specialties..." style={{ minHeight:'80px', resize:'vertical' }} /></div>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <input type="checkbox" id="guideAvail" checked={form.available} onChange={e=>setForm({...form,available:e.target.checked})} style={{ width:'16px', height:'16px', cursor:'pointer' }} />
            <label htmlFor="guideAvail" style={{ cursor:'pointer', textTransform:'none', letterSpacing:0, fontSize:'14px', color:'#1a2332', fontWeight:600 }}>Available for tours</label>
          </div>
          <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
            <button onClick={save} style={{ flex:1, padding:'12px', borderRadius:'8px', background:'linear-gradient(135deg,#1557b0,#1a73e8)', color:'#fff', border:'none', fontWeight:800, fontSize:'12px', cursor:'pointer', letterSpacing:'1px', textTransform:'uppercase' }} disabled={saving}>
              {saving?'Saving…':editingGuide?'Update Guide':'Add Guide'}
            </button>
            <button onClick={()=>{setShowModal(false);setEditingGuide(null);}} style={{ flex:1, padding:'12px', borderRadius:'8px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
