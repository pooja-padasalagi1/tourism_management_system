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

function DifficultyBadge({ level }) {
  const levels = {
    easy: { label: 'Easy', color: '#1e8e3e' },
    moderate: { label: 'Moderate', color: '#d97706' },
    hard: { label: 'Hard', color: '#d93025' }
  };
  const { label, color } = levels[level] || levels.moderate;
  return <span style={{ padding:'3px 10px', borderRadius:'4px', fontSize:'10px', fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', background:`${color}18`, color, border:`1px solid ${color}30` }}>{label}</span>;
}

function PriceTier({ price }) {
  const p = Number(price||0);
  const [label,color] = p<1000?['Budget','#1e8e3e']:p<3000?['Mid-Range','#d97706']:['Premium','#7c3aed'];
  return <span style={{ padding:'3px 10px', borderRadius:'4px', fontSize:'10px', fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', background:`${color}18`, color, border:`1px solid ${color}30` }}>{label}</span>;
}

function RatingStars({ rating, onRate, disabled=false }) {
  return (
    <div style={{ display:'flex', gap:'4px', cursor: disabled ? 'default' : 'pointer' }}>
      {[1,2,3,4,5].map(i => (
        <span
          key={i}
          onClick={() => !disabled && onRate && onRate(i)}
          style={{ fontSize:'18px', opacity: i <= rating ? 1 : 0.3, transition:'opacity .2s' }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function TourPackages() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('name');
  const [difficultyFilter, setDifficultyFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [viewPkg, setViewPkg] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    duration_days: 0,
    price: 0,
    destination: '',
    included_activities: '',
    max_participants: 0,
    difficulty_level: 'moderate',
    rating: 0
  });

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const r = await api.get('/tour-packages');
      setItems(r.data || []);
    } catch(e) {
      toast('Failed to load tour packages', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = items
    .filter(p => 
      p.name.toLowerCase().includes(search.toLowerCase()) || 
      (p.description||'').toLowerCase().includes(search.toLowerCase()) ||
      (p.destination||'').toLowerCase().includes(search.toLowerCase())
    )
    .filter(p => {
      if (difficultyFilter !== 'all') return p.difficulty_level === difficultyFilter;
      return true;
    })
    .filter(p => {
      const pr = Number(p.price||0);
      if (priceFilter === 'budget') return pr < 1000;
      if (priceFilter === 'mid') return pr >= 1000 && pr < 3000;
      if (priceFilter === 'premium') return pr >= 3000;
      return true;
    })
    .sort((a, b) => {
      if (sortBy === 'price') return Number(a.price||0) - Number(b.price||0);
      if (sortBy === 'price-desc') return Number(b.price||0) - Number(a.price||0);
      if (sortBy === 'rating') return (b.rating||0) - (a.rating||0);
      if (sortBy === 'duration') return Number(a.duration_days||0) - Number(b.duration_days||0);
      return a.name.localeCompare(b.name);
    });

  function openCreate() {
    setEditingItem(null);
    setFormData({
      name: '',
      description: '',
      duration_days: 0,
      price: 0,
      destination: '',
      included_activities: '',
      max_participants: 0,
      difficulty_level: 'moderate',
      rating: 0
    });
    setShowModal(true);
  }

  function openEdit(pkg) {
    setEditingItem(pkg);
    setFormData({
      name: pkg.name,
      description: pkg.description || '',
      duration_days: Number(pkg.duration_days) || 0,
      price: Number(pkg.price) || 0,
      destination: pkg.destination || '',
      included_activities: pkg.included_activities || '',
      max_participants: Number(pkg.max_participants) || 0,
      difficulty_level: pkg.difficulty_level || 'moderate',
      rating: Number(pkg.rating) || 0
    });
    setShowModal(true);
  }

  async function handleSave() {
    if (!formData.name.trim()) {
      toast('Package name is required', 'error');
      return;
    }
    setSaving(true);
    try {
      if (editingItem) {
        await api.put('/tour-packages/' + editingItem.id, formData);
        toast('Tour package updated');
      } else {
        await api.post('/tour-packages', formData);
        toast('Tour package created');
      }
      load();
      setShowModal(false);
      setEditingItem(null);
    } catch(e) {
      toast('Error saving tour package', 'error');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(pkg) {
    if (!window.confirm(`Delete "${pkg.name}"?`)) return;
    try {
      await api.delete('/tour-packages/' + pkg.id);
      toast('Tour package deleted');
      load();
      setSelected(s => { s.delete(pkg.id); return new Set(s); });
    } catch(e) {
      toast('Error deleting tour package', 'error');
    }
  }

  async function handleRating(pkg, newRating) {
    try {
      await api.put('/tour-packages/' + pkg.id, { ...pkg, rating: newRating });
      toast('Rating updated');
      load();
    } catch(e) {
      toast('Error updating rating', 'error');
    }
  }

  async function bulkDelete() {
    if (!selected.size) return;
    if (!window.confirm(`Delete ${selected.size} package(s)?`)) return;
    try {
      await Promise.all([...selected].map(id => api.delete('/tour-packages/' + id)));
      toast(`Deleted ${selected.size} packages`);
      setSelected(new Set());
      load();
    } catch(e) {
      toast('Error deleting packages', 'error');
    }
  }

  const toggleSelect = id => setSelected(s => {const n = new Set(s); n.has(id) ? n.delete(id) : n.add(id); return n;});
  const toggleAll = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map(p => p.id)));

  const totalValue = items.reduce((s, p) => s + Number(p.price||0), 0);
  const avgPrice = items.length ? (totalValue / items.length).toFixed(0) : 0;
  const premiumCount = items.filter(p => Number(p.price||0) >= 3000).length;
  const totalDays = items.reduce((s, p) => s + Number(p.duration_days||0), 0);

  if (loading) return <Spinner />;

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h2 style={{ margin:0 }}>Tour Packages</h2>
          <p style={{ margin:'6px 0 0', color:'#5f6b7a', fontSize:'13px' }}>{items.length} packages · avg price ${avgPrice}</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={() => exportCSV(filtered.map(p => ({ID: p.id, Name: p.name, Destination: p.destination||'', Duration: p.duration_days, Price: p.price, Difficulty: p.difficulty_level, Rating: p.rating})), 'tour-packages.csv')}
            style={{ padding:'9px 16px', borderRadius:'7px', background:'#e8f0fe', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
            ↓ Export CSV
          </button>
          {isAdmin && selected.size > 0 && (
            <button onClick={bulkDelete}
              style={{ padding:'9px 16px', borderRadius:'7px', background:'#fde8e8', color:'#d93025', border:'1px solid #fca5a5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
              Delete {selected.size} Selected
            </button>
          )}
          {isAdmin && (
            <button onClick={openCreate}
              className="btn btn-success-vibrant"
              style={{ padding:'9px 18px', borderRadius:'7px', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
              + Add Package
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'12px', marginBottom:'20px' }}>
        {[
          { label:'Total Packages', value:items.length, color:'#1a73e8' },
          { label:'Total Value', value:`$${totalValue.toLocaleString()}`, color:'#1e8e3e' },
          { label:'Avg Price', value:`$${avgPrice}`, color:'#d97706' },
          { label:'Premium Tours', value:premiumCount, color:'#7c3aed' },
        ].map(s=>(
          <div key={s.label} className="card" style={{ padding:'16px', borderLeft:`3px solid ${s.color}`, margin:0 }}>
            <div style={{ fontSize:'20px', fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginTop:'3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center', padding:'14px 16px', background:'#f0f7ff', borderRadius:'10px', border:'1px solid #c5d8f5' }}>
        <input type="text" placeholder="Search packages..." value={search} onChange={(e) => setSearch(e.target.value)}
          style={{ flex:1, minWidth:'180px', padding:'9px 12px', borderRadius:'6px', border:'1px solid #c5d8f5', fontSize:'14px', background:'#fff' }} />
        
        <select value={difficultyFilter} onChange={(e) => setDifficultyFilter(e.target.value)}
          style={{ minWidth:'140px', padding:'9px 12px', borderRadius:'6px', border:'1px solid #c5d8f5', fontSize:'14px', background:'#fff', cursor:'pointer' }}>
          <option value="all">All Difficulty</option>
          <option value="easy">Easy</option>
          <option value="moderate">Moderate</option>
          <option value="hard">Hard</option>
        </select>

        <select value={priceFilter} onChange={(e) => setPriceFilter(e.target.value)}
          style={{ minWidth:'150px', padding:'9px 12px', borderRadius:'6px', border:'1px solid #c5d8f5', fontSize:'14px', background:'#fff', cursor:'pointer' }}>
          <option value="all">All Prices</option>
          <option value="budget">Budget (&lt;$1000)</option>
          <option value="mid">Mid ($1000–$2999)</option>
          <option value="premium">Premium ($3000+)</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}
          style={{ minWidth:'160px', padding:'9px 12px', borderRadius:'6px', border:'1px solid #c5d8f5', fontSize:'14px', background:'#fff', cursor:'pointer' }}>
          <option value="name">Sort: Name A–Z</option>
          <option value="price">Price: Low → High</option>
          <option value="price-desc">Price: High → Low</option>
          <option value="duration">Duration: Short → Long</option>
          <option value="rating">Rating: High → Low</option>
        </select>

        {(search || difficultyFilter !== 'all' || priceFilter !== 'all') && (
          <button onClick={() => { setSearch(''); setDifficultyFilter('all'); setPriceFilter('all'); }}
            style={{ padding:'9px 14px', borderRadius:'7px', background:'#fff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'11px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Clear</button>
        )}
        <span style={{ fontSize:'12px', color:'#5f6b7a', fontWeight:600 }}>{filtered.length} result{filtered.length!==1?'s':''}</span>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState icon="📦" title={search || difficultyFilter !== 'all' || priceFilter !== 'all' ? 'No packages match' : 'No packages yet'} description={search || difficultyFilter !== 'all' || priceFilter !== 'all' ? 'Try different filters.' : 'Create your first tour package.'} action={isAdmin && !search && difficultyFilter === 'all' && priceFilter === 'all' && <button onClick={openCreate} style={{ padding:'9px 18px', borderRadius:'7px', background:'#1a73e8', color:'#fff', border:'none', fontWeight:700, fontSize:'12px', cursor:'pointer' }}>Add Package</button>} />
      ) : (
        <>
          {isAdmin && (
            <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
              <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} style={{ width:'16px', height:'16px', cursor:'pointer' }} />
              <span style={{ fontSize:'12px', color:'#5f6b7a', fontWeight:600 }}>{selected.size > 0 ? `${selected.size} selected` : 'Select all'}</span>
            </div>
          )}
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(340px,1fr))', gap:'16px' }}>
            {filtered.map((pkg, idx) => (
              <div key={pkg.id} className="card" style={{ 
                padding:'20px', 
                display:'flex', 
                flexDirection:'column', 
                animation:`slideInUp .3s ease ${idx*.04}s backwards`, 
                position:'relative', 
                borderLeft: selected.has(pkg.id) ? '3px solid #1a73e8' : '3px solid transparent',
                transition: 'all .2s ease'
              }}
              onMouseEnter={(e) => {e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.12)';}}
              onMouseLeave={(e) => {e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';}}>
                
                {isAdmin && (
                  <input type="checkbox" checked={selected.has(pkg.id)} onChange={() => toggleSelect(pkg.id)}
                    style={{ position:'absolute', top:'14px', right:'14px', width:'16px', height:'16px', cursor:'pointer' }} />
                )}

                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                  <h3 style={{ margin:0, fontSize:'15px', fontWeight:800, color:'#1a2332', flex:1, paddingRight:'24px', lineHeight:'1.3' }}>{pkg.name}</h3>
                </div>

                {pkg.destination && (
                  <p style={{ margin:'6px 0 10px 0', fontSize:'12px', color:'#5f6b7a' }}>📍 {pkg.destination}</p>
                )}

                <div style={{ display:'flex', gap:'6px', marginBottom:'10px', flexWrap:'wrap' }}>
                  <DifficultyBadge level={pkg.difficulty_level} />
                  <PriceTier price={pkg.price} />
                </div>

                {pkg.description && (
                  <p style={{ margin:'10px 0', color:'#5f6b7a', fontSize:'13px', lineHeight:'1.5', display:'-webkit-box', WebkitLineClamp:2, WebkitBoxOrient:'vertical', overflow:'hidden' }}>
                    {pkg.description}
                  </p>
                )}

                <div style={{ marginTop:'auto', padding:'10px 12px', background:'#f0f7ff', borderRadius:'6px', border:'1px solid #c5d8f5', display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
                  <span style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>Price</span>
                  <span style={{ fontSize:'20px', fontWeight:900, color:'#1a73e8' }}>${Number(pkg.price||0).toLocaleString()}</span>
                </div>

                <div style={{ display:'flex', gap:'6px', paddingTop:'12px', borderTop:'1px solid #e8f0fe', alignItems:'center', justifyContent:'space-between' }}>
                  <div onClick={(e) => e.stopPropagation()}>
                    {isAdmin ? (
                      <RatingStars rating={Number(pkg.rating||0)} onRate={(r) => handleRating(pkg, r)} />
                    ) : (
                      <RatingStars rating={Number(pkg.rating||0)} disabled={true} />
                    )}
                  </div>
                  {!isAdmin && (
                    <button onClick={() => setViewPkg(pkg)}
                      style={{ padding:'7px 14px', borderRadius:'6px', background:'#e8f0fe', color:'#1a73e8', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>
                      View
                    </button>
                  )}
                </div>

                {isAdmin && (
                  <div style={{ display:'flex', gap:'6px', paddingTop:'12px' }}>
                    <button onClick={() => setViewPkg(pkg)}
                      style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#e8f0fe', color:'#1a73e8', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>
                      View
                    </button>
                    <button onClick={() => openEdit(pkg)}
                      style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#fef3c7', color:'#d97706', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>
                      Edit
                    </button>
                    <button onClick={() => handleDelete(pkg)}
                      style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#fee2e2', color:'#d93025', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>
                      Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewPkg} title={viewPkg?.name || ''} onClose={() => setViewPkg(null)}>
        {viewPkg && (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'340px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:'12px', flexWrap:'wrap' }}>
              <div style={{ display:'flex', gap:'6px', flexWrap:'wrap' }}>
                <DifficultyBadge level={viewPkg.difficulty_level} />
                <PriceTier price={viewPkg.price} />
              </div>
              <span style={{ fontSize:'20px', fontWeight:900, color:'#1a73e8' }}>${Number(viewPkg.price||0).toLocaleString()}</span>
            </div>

            {viewPkg.destination && (
              <div>
                <label style={{ display:'block', marginBottom:'6px', fontSize:'11px', fontWeight:700, color:'#5f6b7a', textTransform:'uppercase', letterSpacing:'.5px' }}>Destination</label>
                <div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', color:'#1a2332', fontSize:'14px', border:'1px solid #c5d8f5' }}>📍 {viewPkg.destination}</div>
              </div>
            )}

            {viewPkg.description && (
              <div>
                <label style={{ display:'block', marginBottom:'6px', fontSize:'11px', fontWeight:700, color:'#5f6b7a', textTransform:'uppercase', letterSpacing:'.5px' }}>Description</label>
                <div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', color:'#1a2332', fontSize:'14px', lineHeight:'1.6', border:'1px solid #c5d8f5' }}>{viewPkg.description}</div>
              </div>
            )}

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
              {viewPkg.duration_days > 0 && (
                <div>
                  <label style={{ display:'block', marginBottom:'4px', fontSize:'11px', fontWeight:700, color:'#5f6b7a', textTransform:'uppercase', letterSpacing:'.5px' }}>Duration</label>
                  <div style={{ padding:'8px 12px', background:'#f0f7ff', borderRadius:'6px', fontSize:'14px', fontWeight:700, color:'#1a2332', border:'1px solid #c5d8f5' }}>{viewPkg.duration_days} days</div>
                </div>
              )}
              {viewPkg.max_participants > 0 && (
                <div>
                  <label style={{ display:'block', marginBottom:'4px', fontSize:'11px', fontWeight:700, color:'#5f6b7a', textTransform:'uppercase', letterSpacing:'.5px' }}>Max Participants</label>
                  <div style={{ padding:'8px 12px', background:'#f0f7ff', borderRadius:'6px', fontSize:'14px', fontWeight:700, color:'#1a2332', border:'1px solid #c5d8f5' }}>{viewPkg.max_participants} people</div>
                </div>
              )}
            </div>

            {viewPkg.included_activities && (
              <div>
                <label style={{ display:'block', marginBottom:'6px', fontSize:'11px', fontWeight:700, color:'#5f6b7a', textTransform:'uppercase', letterSpacing:'.5px' }}>Included Activities</label>
                <div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', color:'#1a2332', fontSize:'14px', whiteSpace:'pre-wrap', border:'1px solid #c5d8f5' }}>{viewPkg.included_activities}</div>
              </div>
            )}

            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', paddingTop:'12px', borderTop:'1px solid #c5d8f5' }}>
              <div>
                <label style={{ display:'block', marginBottom:'4px', fontSize:'11px', fontWeight:700, color:'#5f6b7a', textTransform:'uppercase', letterSpacing:'.5px' }}>Rating</label>
                <RatingStars rating={Number(viewPkg.rating||0)} />
              </div>
              <div style={{ display:'flex', gap:'8px' }}>
                <button onClick={() => setViewPkg(null)} style={{ padding:'9px 18px', borderRadius:'7px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Close</button>
                {isAdmin && (
                  <button onClick={() => { setViewPkg(null); openEdit(viewPkg); }} className="btn btn-info-vibrant" style={{ padding:'9px 18px', borderRadius:'7px', fontWeight:700, fontSize:'12px', cursor:'pointer', textTransform:'uppercase' }}>Edit</button>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} title={editingItem ? 'Edit Tour Package' : 'Add Tour Package'} onClose={() => setShowModal(false)}>
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'340px' }}>
          <div>
            <label>Package Name *</label>
            <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} placeholder="e.g. Bali Adventure Trek" required autoFocus />
          </div>
          <div>
            <label>Description</label>
            <textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Describe the tour package..." style={{ minHeight:'90px', resize:'vertical' }} />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label>Destination</label>
              <input type="text" value={formData.destination} onChange={(e) => setFormData({...formData, destination: e.target.value})} placeholder="e.g. Bali, Paris" />
            </div>
            <div>
              <label>Price (USD) *</label>
              <input type="number" step="1" min="0" value={formData.price} onChange={(e) => setFormData({...formData, price: parseFloat(e.target.value) || 0})} placeholder="0" required />
              <div style={{ marginTop:'6px' }}><PriceTier price={formData.price} /></div>
            </div>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
            <div>
              <label>Duration (Days)</label>
              <input type="number" min="0" value={formData.duration_days} onChange={(e) => setFormData({...formData, duration_days: parseInt(e.target.value) || 0})} />
            </div>
            <div>
              <label>Max Participants</label>
              <input type="number" min="0" value={formData.max_participants} onChange={(e) => setFormData({...formData, max_participants: parseInt(e.target.value) || 0})} />
            </div>
          </div>
          <div>
            <label>Difficulty Level</label>
            <select value={formData.difficulty_level} onChange={(e) => setFormData({...formData, difficulty_level: e.target.value})} style={{ width:'100%' }}>
              <option value="easy">Easy</option>
              <option value="moderate">Moderate</option>
              <option value="hard">Hard</option>
            </select>
          </div>
          <div>
            <label>Included Activities</label>
            <textarea value={formData.included_activities} onChange={(e) => setFormData({...formData, included_activities: e.target.value})} placeholder="e.g. Breakfast, Guided tour, Hiking" style={{ minHeight:'70px', resize:'vertical' }} />
          </div>
          <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
            <button type="submit" style={{ flex:1 }} disabled={saving}>{saving ? 'Saving…' : editingItem ? 'Update Package' : 'Create Package'}</button>
            <button type="button" onClick={() => setShowModal(false)} style={{ flex:1, background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', boxShadow:'none' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

