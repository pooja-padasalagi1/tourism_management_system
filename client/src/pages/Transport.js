import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
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

const STORAGE_KEY = 'tms_transfers_v1';
const TYPE_CFG = {
  Car:     { color:'#1a73e8', bg:'#dbeafe', border:'#93c5fd', icon:'🚗' },
  Van:     { color:'#1e8e3e', bg:'#d1fae5', border:'#6ee7b7', icon:'🚐' },
  Bus:     { color:'#d97706', bg:'#fef3c7', border:'#fde68a', icon:'🚌' },
  Shuttle: { color:'#7c3aed', bg:'#ede9fe', border:'#c4b5fd', icon:'🚕' },
};

const SEED = [
  { id:1, provider:'City Shuttle Co', pickup:'Airport Terminal 1', dropoff:'Central Hotel Plaza', type:'Shuttle', price:35, vehicles:[{id:11,plate:'SH-1001',model:'Mercedes Sprinter',seats:16},{id:12,plate:'SH-1002',model:'Ford Transit',seats:12}] },
  { id:2, provider:'Premium Rides', pickup:'Airport VIP Lounge', dropoff:'Seaside Resort', type:'Car', price:120, vehicles:[{id:21,plate:'PR-2001',model:'Toyota Camry',seats:4}] },
  { id:3, provider:'City Bus Lines', pickup:'Central Station', dropoff:'Old Town', type:'Bus', price:15, vehicles:[{id:31,plate:'CB-3001',model:'Volvo B8R',seats:50},{id:32,plate:'CB-3002',model:'MAN Lion City',seats:45}] },
];

export default function Transport() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ provider:'', pickup:'', dropoff:'', type:'Car', price:'' });
  const [viewItem, setViewItem] = useState(null);
  const [vehicleForm, setVehicleForm] = useState({ id:null, plate:'', model:'', seats:4 });
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [sortBy, setSortBy] = useState('provider');
  const [useLocal, setUseLocal] = useState(false);
  const [saving, setSaving] = useState(false);

  function readLocal() { try { const r=localStorage.getItem(STORAGE_KEY); return r?JSON.parse(r):[]; } catch(e){ return []; } }
  function writeLocal(list) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch(e){} }

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/transfers');
      if (res?.data) { setItems(res.data||[]); setUseLocal(false); return; }
    } catch(e) {}
    const local = readLocal();
    if (local.length>0) { setItems(local); } else { writeLocal(SEED); setItems(SEED); }
    setUseLocal(true);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  function saveItems(list) {
    setItems(list);
    if (useLocal) writeLocal(list);
  }

  const filtered = items
    .filter(i => {
      const q=search.toLowerCase();
      return (typeFilter==='all' || i.type===typeFilter)
        && (!q || (i.provider||'').toLowerCase().includes(q) || (i.pickup||'').toLowerCase().includes(q) || (i.dropoff||'').toLowerCase().includes(q));
    })
    .sort((a,b) => sortBy==='price-asc'?Number(a.price||0)-Number(b.price||0):sortBy==='price-desc'?Number(b.price||0)-Number(a.price||0):a.provider.localeCompare(b.provider));

  function openCreate() { setEditing(null); setForm({provider:'',pickup:'',dropoff:'',type:'Car',price:''}); setShowModal(true); }
  function openEdit(item) { setEditing(item); setForm({provider:item.provider||'',pickup:item.pickup||'',dropoff:item.dropoff||'',type:item.type||'Car',price:item.price||''}); setShowModal(true); }

  async function save() {
    if (!form.provider||!form.pickup||!form.dropoff) { toast('Provider, pickup and dropoff are required','error'); return; }
    setSaving(true);
    try {
      if (editing) {
        if (!useLocal) { await api.put('/transfers/'+editing.id, form).catch(()=>null); await load(); }
        else { saveItems(items.map(i=>i.id===editing.id?{...i,...form,price:Number(form.price)||0}:i)); }
        toast('Transport updated');
      } else {
        if (!useLocal) { await api.post('/transfers', form).catch(()=>null); await load(); }
        else { const newItem={id:Date.now(),...form,price:Number(form.price)||0,vehicles:[]}; saveItems([newItem,...items]); }
        toast('Transport added');
      }
      setShowModal(false); setEditing(null);
    } catch(e) { toast('Error saving transport','error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(item) {
    if (!window.confirm(`Delete "${item.provider}"?`)) return;
    try {
      if (!useLocal) { await api.delete('/transfers/'+item.id).catch(()=>null); await load(); }
      else { saveItems(items.filter(i=>i.id!==item.id)); }
      toast('Transport deleted');
      if (viewItem?.id===item.id) setViewItem(null);
    } catch(e) { toast('Error deleting transport','error'); }
  }

  function addVehicle() {
    if (!vehicleForm.plate||!vehicleForm.model) { toast('Plate and model are required','error'); return; }
    const updated = vehicleForm.id
      ? {...viewItem, vehicles:(viewItem.vehicles||[]).map(v=>v.id===vehicleForm.id?{...v,...vehicleForm}:v)}
      : {...viewItem, vehicles:[...(viewItem.vehicles||[]),{id:Date.now(),...vehicleForm,seats:Number(vehicleForm.seats)||4}]};
    saveItems(items.map(i=>i.id===updated.id?updated:i));
    setViewItem(updated);
    setVehicleForm({id:null,plate:'',model:'',seats:4});
    toast(vehicleForm.id?'Vehicle updated':'Vehicle added');
  }

  function deleteVehicle(v) {
    if (!window.confirm('Delete this vehicle?')) return;
    const updated={...viewItem,vehicles:(viewItem.vehicles||[]).filter(x=>x.id!==v.id)};
    saveItems(items.map(i=>i.id===updated.id?updated:i));
    setViewItem(updated);
    toast('Vehicle deleted');
  }

  const totalVehicles = items.reduce((s,i)=>s+(i.vehicles?.length||0),0);
  const avgPrice = items.length ? (items.reduce((s,i)=>s+Number(i.price||0),0)/items.length).toFixed(2) : '0.00';

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h2 style={{ margin:0 }}>Transport</h2>
          <p style={{ margin:'6px 0 0', color:'#5f6b7a', fontSize:'13px' }}>{items.length} providers · {totalVehicles} vehicles{useLocal?' (local storage)':''}</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={()=>exportCSV(filtered.map(i=>({ID:i.id,Provider:i.provider,Pickup:i.pickup,Dropoff:i.dropoff,Type:i.type,Price:i.price,Vehicles:i.vehicles?.length||0})),'transport.csv')}
            style={{ padding:'9px 16px', borderRadius:'7px', background:'#e8f0fe', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
            ↓ Export CSV
          </button>
          <button className="btn" onClick={openCreate} style={{ padding:'9px 18px', fontSize:'12px' }}>+ Add Transport</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:'12px', marginBottom:'20px' }}>
        {[
          {label:'Providers',value:items.length,color:'#1a73e8'},
          {label:'Vehicles',value:totalVehicles,color:'#1e8e3e'},
          {label:'Avg Price',value:`$${avgPrice}`,color:'#d97706'},
          {label:'Types',value:new Set(items.map(i=>i.type)).size,color:'#7c3aed'},
        ].map(s=>(
          <div key={s.label} className="card" style={{ padding:'14px', borderLeft:`3px solid ${s.color}`, margin:0 }}>
            <div style={{ fontSize:'20px', fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginTop:'3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center', padding:'14px 16px', background:'#f0f7ff', borderRadius:'10px', border:'1px solid #c5d8f5' }}>
        <input type="text" placeholder="Search provider, pickup, dropoff..." value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:'200px' }} />
        <select value={typeFilter} onChange={e=>setTypeFilter(e.target.value)} style={{ minWidth:'130px' }}>
          <option value="all">All Types</option>
          {Object.keys(TYPE_CFG).map(t=><option key={t} value={t}>{TYPE_CFG[t].icon} {t}</option>)}
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ minWidth:'160px' }}>
          <option value="provider">Sort: Provider</option>
          <option value="price-asc">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
        </select>
        {(search||typeFilter!=='all') && (
          <button onClick={()=>{setSearch('');setTypeFilter('all');}} style={{ padding:'9px 14px', borderRadius:'7px', background:'#fff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'11px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Clear</button>
        )}
        <span style={{ fontSize:'12px', color:'#5f6b7a', fontWeight:600 }}>{filtered.length} result{filtered.length!==1?'s':''}</span>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><Spinner /></div>
      ) : filtered.length===0 ? (
        <EmptyState icon="🚗" title="No transport found" description="Try different filters or add a new transport provider." action={<button className="btn" onClick={openCreate}>Add Transport</button>} />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'16px' }}>
          {filtered.map((t,idx)=>{
            const cfg=TYPE_CFG[t.type]||TYPE_CFG.Car;
            return (
              <div key={t.id} className="card" style={{ padding:'20px', animation:`slideInUp .3s ease ${idx*.04}s backwards` }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'12px' }}>
                  <div style={{ flex:1, minWidth:0 }}>
                    <div style={{ fontWeight:800, fontSize:'15px', color:'#1a2332' }}>{t.provider}</div>
                    <div style={{ fontSize:'12px', color:'#5f6b7a', marginTop:'4px' }}>📍 {t.pickup} → {t.dropoff}</div>
                  </div>
                  <span style={{ padding:'4px 10px', borderRadius:'4px', fontSize:'10px', fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, flexShrink:0, marginLeft:'8px' }}>
                    {cfg.icon} {t.type}
                  </span>
                </div>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'8px', marginBottom:'12px' }}>
                  <div style={{ padding:'8px 10px', background:'#f0f7ff', borderRadius:'6px', border:'1px solid #c5d8f5' }}>
                    <div style={{ fontSize:'10px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px' }}>Price</div>
                    <div style={{ fontSize:'16px', fontWeight:900, color:'#1a73e8', marginTop:'2px' }}>${Number(t.price||0).toFixed(2)}</div>
                  </div>
                  <div style={{ padding:'8px 10px', background:'#f0f7ff', borderRadius:'6px', border:'1px solid #c5d8f5' }}>
                    <div style={{ fontSize:'10px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'.8px' }}>Vehicles</div>
                    <div style={{ fontSize:'16px', fontWeight:900, color:'#1e8e3e', marginTop:'2px' }}>{t.vehicles?.length||0}</div>
                  </div>
                </div>
                <div style={{ display:'flex', gap:'6px', paddingTop:'12px', borderTop:'1px solid #e8f0fe' }}>
                  <button onClick={()=>{setViewItem(t);setVehicleForm({id:null,plate:'',model:'',seats:4});}} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#e8f0fe', color:'#1a73e8', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>View</button>
                  <button onClick={()=>openEdit(t)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#fef3c7', color:'#d97706', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>Edit</button>
                  <button onClick={()=>handleDelete(t)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#fee2e2', color:'#d93025', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>Delete</button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} title={editing?'Edit Transport':'Add Transport'} onClose={()=>{setShowModal(false);setEditing(null);}}>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'340px' }}>
          <div><label>Provider Name *</label><input type="text" value={form.provider} onChange={e=>setForm({...form,provider:e.target.value})} placeholder="e.g. City Shuttle Co" autoFocus /></div>
          <div><label>Pickup Location *</label><input type="text" value={form.pickup} onChange={e=>setForm({...form,pickup:e.target.value})} placeholder="e.g. Airport Terminal 1" /></div>
          <div><label>Dropoff Location *</label><input type="text" value={form.dropoff} onChange={e=>setForm({...form,dropoff:e.target.value})} placeholder="e.g. Central Hotel" /></div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <div><label>Vehicle Type</label>
              <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})}>
                {Object.keys(TYPE_CFG).map(t=><option key={t}>{t}</option>)}
              </select>
            </div>
            <div><label>Price ($)</label><input type="number" min="0" step="0.01" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="0.00" /></div>
          </div>
          <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
            <button onClick={save} style={{ flex:1, padding:'12px', borderRadius:'8px', background:'linear-gradient(135deg,#1557b0,#1a73e8)', color:'#fff', border:'none', fontWeight:800, fontSize:'12px', cursor:'pointer', letterSpacing:'1px', textTransform:'uppercase' }} disabled={saving}>
              {saving?'Saving…':editing?'Update':'Add Transport'}
            </button>
            <button onClick={()=>{setShowModal(false);setEditing(null);}} style={{ flex:1, padding:'12px', borderRadius:'8px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Cancel</button>
          </div>
        </div>
      </Modal>

      {/* View/Manage Modal */}
      <Modal isOpen={!!viewItem} title={viewItem?.provider||''} onClose={()=>{setViewItem(null);setVehicleForm({id:null,plate:'',model:'',seats:4});}} maxWidth={600}>
        {viewItem && (
          <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
            {/* Info */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {[
                {label:'Pickup',value:viewItem.pickup},
                {label:'Dropoff',value:viewItem.dropoff},
                {label:'Type',value:`${TYPE_CFG[viewItem.type]?.icon||''} ${viewItem.type}`},
                {label:'Price',value:`$${Number(viewItem.price||0).toFixed(2)}`},
              ].map(item=>(
                <div key={item.label}>
                  <label>{item.label}</label>
                  <div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', color:'#1a2332', fontSize:'13px', fontWeight:600, border:'1px solid #c5d8f5' }}>{item.value}</div>
                </div>
              ))}
            </div>

            {/* Vehicles */}
            <div>
              <h4 style={{ margin:'0 0 10px', fontSize:'13px', fontWeight:800, color:'#1a73e8', textTransform:'uppercase', letterSpacing:'1px' }}>
                Vehicles ({viewItem.vehicles?.length||0})
              </h4>
              {(viewItem.vehicles||[]).length===0 ? (
                <p style={{ color:'#5f6b7a', fontSize:'13px', padding:'12px', background:'#f8fbff', borderRadius:'8px', border:'1px dashed #c5d8f5', margin:0 }}>No vehicles yet. Add one below.</p>
              ) : (
                <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                  {viewItem.vehicles.map(v=>(
                    <div key={v.id||v.plate} style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', border:'1px solid #c5d8f5', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                      <div>
                        <div style={{ fontWeight:700, color:'#1a2332', fontSize:'13px' }}>{v.model} — <span style={{ color:'#1a73e8' }}>{v.plate}</span></div>
                        <div style={{ fontSize:'12px', color:'#5f6b7a', marginTop:'2px' }}>{v.seats} seats</div>
                      </div>
                      <div style={{ display:'flex', gap:'6px' }}>
                        <button onClick={()=>setVehicleForm({id:v.id,plate:v.plate,model:v.model,seats:v.seats})} style={{ padding:'5px 10px', borderRadius:'5px', background:'#fef3c7', color:'#d97706', border:'none', fontWeight:700, fontSize:'10px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Edit</button>
                        <button onClick={()=>deleteVehicle(v)} style={{ padding:'5px 10px', borderRadius:'5px', background:'#fee2e2', color:'#d93025', border:'none', fontWeight:700, fontSize:'10px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Delete</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Add/Edit Vehicle Form */}
            <div style={{ padding:'14px', background:'#f8fbff', borderRadius:'8px', border:'1px solid #c5d8f5' }}>
              <h4 style={{ margin:'0 0 10px', fontSize:'12px', fontWeight:800, color:'#5f6b7a', textTransform:'uppercase', letterSpacing:'1px' }}>
                {vehicleForm.id?'Edit Vehicle':'Add Vehicle'}
              </h4>
              <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
                <input placeholder="Plate *" value={vehicleForm.plate} onChange={e=>setVehicleForm({...vehicleForm,plate:e.target.value})} style={{ flex:'1 1 100px', minWidth:'80px' }} />
                <input placeholder="Model *" value={vehicleForm.model} onChange={e=>setVehicleForm({...vehicleForm,model:e.target.value})} style={{ flex:'2 1 140px', minWidth:'100px' }} />
                <input type="number" placeholder="Seats" value={vehicleForm.seats} onChange={e=>setVehicleForm({...vehicleForm,seats:Number(e.target.value)||4})} style={{ flex:'0 0 70px', width:'70px' }} />
                <button onClick={addVehicle} style={{ padding:'10px 16px', borderRadius:'7px', background:'#1a73e8', color:'#fff', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none', whiteSpace:'nowrap' }}>
                  {vehicleForm.id?'Update':'Add'}
                </button>
                {vehicleForm.id && <button onClick={()=>setVehicleForm({id:null,plate:'',model:'',seats:4})} style={{ padding:'10px 14px', borderRadius:'7px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'11px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Cancel</button>}
              </div>
            </div>

            <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end' }}>
              <button onClick={()=>{setViewItem(null);setVehicleForm({id:null,plate:'',model:'',seats:4});}} style={{ padding:'9px 18px', borderRadius:'7px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Close</button>
              <button className="btn" onClick={()=>{setViewItem(null);openEdit(viewItem);}}>Edit Provider</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
