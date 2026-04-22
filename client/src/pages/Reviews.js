import React, { useEffect, useState } from 'react';
import api from '../api';
import { getUser } from '../auth';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';

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

const CATEGORY_CFG = {
  hotel:     { label:'Hotel',     color:'#1a73e8', bg:'#dbeafe', border:'#93c5fd' },
  tour:      { label:'Tour',      color:'#1e8e3e', bg:'#d1fae5', border:'#6ee7b7' },
  guide:     { label:'Guide',     color:'#7c3aed', bg:'#ede9fe', border:'#c4b5fd' },
  transport: { label:'Transport', color:'#d97706', bg:'#fef3c7', border:'#fde68a' },
};

function RatingStars({ rating=0, size=18, interactive=false, onChange }) {
  const [hover, setHover] = useState(0);
  const r = parseInt(rating)||0;
  return (
    <div style={{ display:'flex', gap:'2px' }}>
      {[1,2,3,4,5].map(i=>(
        <span key={i}
          style={{ fontSize:size, color:i<=(hover||r)?'#f59e0b':'#d1d5db', cursor:interactive?'pointer':'default', transition:'color .1s' }}
          onMouseEnter={()=>interactive&&setHover(i)}
          onMouseLeave={()=>interactive&&setHover(0)}
          onClick={()=>interactive&&onChange&&onChange(i)}
        >★</span>
      ))}
    </div>
  );
}

const STORAGE_KEY = 'tms_reviews_v1';
const SEED = [
  { id:1, author:'John Doe',     category:'hotel',     rating:5, comment:'Excellent service and beautiful location! Highly recommend to everyone.', date:'2024-02-15', helpful:12 },
  { id:2, author:'Sarah Wilson', category:'tour',      rating:4, comment:'Great tour guide and very informative. Would definitely go again!', date:'2024-02-16', helpful:8 },
  { id:3, author:'Mike Johnson', category:'guide',     rating:5, comment:'Very knowledgeable and friendly guide. Perfect day out with the family!', date:'2024-02-17', helpful:15 },
  { id:4, author:'Emma Brown',   category:'hotel',     rating:4, comment:'Clean rooms, great amenities, minor issues with WiFi but overall great stay.', date:'2024-02-18', helpful:6 },
  { id:5, author:'Carlos Ruiz',  category:'transport', rating:3, comment:'Driver was on time but the vehicle was a bit old. Acceptable for the price.', date:'2024-02-19', helpful:3 },
];

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rating:5, comment:'', category:'hotel', author:'' });
  const [viewReview, setViewReview] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [saving, setSaving] = useState(false);
  const user = getUser();

  function readLocal() { try { const r=localStorage.getItem(STORAGE_KEY); return r?JSON.parse(r):[]; } catch(e){ return []; } }
  function writeLocal(list) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch(e){} }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.get('/reviews').catch(()=>null);
        if (res?.data && Array.isArray(res.data) && res.data.length>0) { setReviews(res.data); }
        else {
          const local=readLocal();
          if (local.length>0) setReviews(local);
          else { writeLocal(SEED); setReviews(SEED); }
        }
      } catch(e) { const local=readLocal(); setReviews(local.length?local:SEED); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = reviews
    .filter(r => {
      const s=search.toLowerCase();
      return (!s || (r.author||'').toLowerCase().includes(s) || (r.comment||'').toLowerCase().includes(s))
        && (filterCategory==='all' || r.category===filterCategory)
        && (filterRating==='all' || parseInt(r.rating)===parseInt(filterRating));
    })
    .sort((a,b) => sortBy==='rating-desc'?b.rating-a.rating:sortBy==='rating-asc'?a.rating-b.rating:sortBy==='helpful'?(b.helpful||0)-(a.helpful||0):sortBy==='oldest'?a.id-b.id:b.id-a.id);

  async function submit() {
    if (!form.comment.trim()) { toast('Please add a comment','error'); return; }
    setSaving(true);
    try {
      const payload = { ...form, author:form.author.trim()||(user?.name)||'Anonymous', date:new Date().toLocaleDateString(), rating:parseInt(form.rating)||5, helpful:0 };
      if (editingReview) {
        await api.put('/reviews/'+editingReview.id, payload).catch(()=>{
          writeLocal(readLocal().map(r=>r.id===editingReview.id?{...r,...payload}:r));
        });
        toast('Review updated');
      } else {
        await api.post('/reviews', payload).catch(()=>{
          const local=readLocal(); local.unshift({id:Date.now(),...payload}); writeLocal(local);
        });
        toast('Review submitted');
      }
      setForm({rating:5,comment:'',category:'hotel',author:''}); setShowModal(false); setEditingReview(null);
      const local=readLocal(); setReviews(local.length?local:SEED);
    } catch(e) { toast('Error submitting review','error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(r) {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete('/reviews/'+r.id).catch(()=>{ writeLocal(readLocal().filter(x=>x.id!==r.id)); });
      toast('Review deleted');
      const local=readLocal(); setReviews(local.length?local:SEED);
      if (viewReview?.id===r.id) setViewReview(null);
    } catch(e) { toast('Error deleting review','error'); }
  }

  function markHelpful(r) {
    const updated=reviews.map(x=>x.id===r.id?{...x,helpful:(x.helpful||0)+1}:x);
    setReviews(updated); writeLocal(updated); toast('Marked as helpful');
  }

  function openEdit(r) { setEditingReview(r); setForm({rating:r.rating,comment:r.comment||'',category:r.category||'hotel',author:r.author||''}); setShowModal(true); }

  const avgRating = reviews.length ? (reviews.reduce((s,r)=>s+Number(r.rating||0),0)/reviews.length).toFixed(1) : '0.0';
  const canEdit = r => user && (user.role==='admin' || user.name===r.author);

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h2 style={{ margin:0 }}>Reviews</h2>
          <p style={{ margin:'6px 0 0', color:'#5f6b7a', fontSize:'13px' }}>{reviews.length} reviews · avg {avgRating} ★</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={()=>exportCSV(filtered.map(r=>({ID:r.id,Author:r.author,Category:r.category,Rating:r.rating,Comment:r.comment,Date:r.date,Helpful:r.helpful||0})),'reviews.csv')}
            style={{ padding:'9px 16px', borderRadius:'7px', background:'#e8f0fe', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
            ↓ Export CSV
          </button>
          <button className="btn" onClick={()=>{setEditingReview(null);setForm({rating:5,comment:'',category:'hotel',author:''});setShowModal(true);}} style={{ padding:'9px 18px', fontSize:'12px' }}>
            + Write Review
          </button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:'12px', marginBottom:'20px' }}>
        {[
          {label:'Total Reviews',value:reviews.length,color:'#1a73e8'},
          {label:'Avg Rating',value:`${avgRating} ★`,color:'#d97706'},
          {label:'5-Star',value:reviews.filter(r=>parseInt(r.rating)===5).length,color:'#1e8e3e'},
          {label:'Needs Attention',value:reviews.filter(r=>parseInt(r.rating)<=2).length,color:'#d93025'},
        ].map(s=>(
          <div key={s.label} className="card" style={{ padding:'14px', borderLeft:`3px solid ${s.color}`, margin:0 }}>
            <div style={{ fontSize:'20px', fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginTop:'3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center', padding:'14px 16px', background:'#f0f7ff', borderRadius:'10px', border:'1px solid #c5d8f5' }}>
        <input type="text" placeholder="Search by author or comment..." value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:'200px' }} />
        <select value={filterCategory} onChange={e=>setFilterCategory(e.target.value)} style={{ minWidth:'140px' }}>
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterRating} onChange={e=>setFilterRating(e.target.value)} style={{ minWidth:'130px' }}>
          <option value="all">All Ratings</option>
          {[5,4,3,2,1].map(r=><option key={r} value={r}>{r} Star{r!==1?'s':''}</option>)}
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ minWidth:'160px' }}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="rating-desc">Rating: High → Low</option>
          <option value="rating-asc">Rating: Low → High</option>
          <option value="helpful">Most Helpful</option>
        </select>
        {(search||filterCategory!=='all'||filterRating!=='all') && (
          <button onClick={()=>{setSearch('');setFilterCategory('all');setFilterRating('all');}} style={{ padding:'9px 14px', borderRadius:'7px', background:'#fff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'11px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Clear</button>
        )}
        <span style={{ fontSize:'12px', color:'#5f6b7a', fontWeight:600 }}>{filtered.length} result{filtered.length!==1?'s':''}</span>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><Spinner /></div>
      ) : filtered.length===0 ? (
        <EmptyState icon="⭐" title="No reviews found" description="Be the first to share your experience!" action={<button className="btn" onClick={()=>setShowModal(true)}>Write Review</button>} />
      ) : (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(300px,1fr))', gap:'16px' }}>
          {filtered.map((r,idx)=>{
            const cat=CATEGORY_CFG[r.category]||CATEGORY_CFG.hotel;
            return (
              <div key={r.id||idx} className="card" style={{ padding:'18px', display:'flex', flexDirection:'column', animation:`slideInUp .3s ease ${idx*.04}s backwards` }}
                onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'10px' }}>
                  <div>
                    <div style={{ fontWeight:800, fontSize:'14px', color:'#1a2332' }}>{r.author||'Anonymous'}</div>
                    <div style={{ marginTop:'4px' }}><RatingStars rating={r.rating} size={14} /></div>
                  </div>
                  <span style={{ padding:'3px 8px', borderRadius:'4px', fontSize:'10px', fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', background:cat.bg, color:cat.color, border:`1px solid ${cat.border}` }}>{cat.label}</span>
                </div>
                <p style={{ margin:'0 0 10px', color:'#5f6b7a', fontSize:'13px', lineHeight:'1.5', flex:1, display:'-webkit-box', WebkitLineClamp:3, WebkitBoxOrient:'vertical', overflow:'hidden' }}>{r.comment}</p>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'10px' }}>
                  <span style={{ fontSize:'11px', color:'#9ca3af' }}>{r.date}</span>
                  <button onClick={()=>markHelpful(r)} style={{ padding:'4px 10px', borderRadius:'5px', background:'#f0f7ff', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'10px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>
                    👍 {r.helpful||0}
                  </button>
                </div>
                <div style={{ display:'flex', gap:'6px', paddingTop:'10px', borderTop:'1px solid #e8f0fe' }}>
                  <button onClick={()=>setViewReview(r)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#e8f0fe', color:'#1a73e8', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>View</button>
                  {canEdit(r) && <>
                    <button onClick={()=>openEdit(r)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#fef3c7', color:'#d97706', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>Edit</button>
                    <button onClick={()=>handleDelete(r)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#fee2e2', color:'#d93025', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>Delete</button>
                  </>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewReview} title={`Review by ${viewReview?.author||'Anonymous'}`} onClose={()=>setViewReview(null)}>
        {viewReview && (() => {
          const cat=CATEGORY_CFG[viewReview.category]||CATEGORY_CFG.hotel;
          return (
            <div style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'360px' }}>
              <div style={{ display:'flex', gap:'12px', alignItems:'center' }}>
                <RatingStars rating={viewReview.rating} size={22} />
                <span style={{ padding:'4px 10px', borderRadius:'4px', fontSize:'11px', fontWeight:800, textTransform:'uppercase', background:cat.bg, color:cat.color, border:`1px solid ${cat.border}` }}>{cat.label}</span>
              </div>
              <div>
                <label>Comment</label>
                <div style={{ padding:'12px 14px', background:'#f0f7ff', borderRadius:'8px', color:'#5f6b7a', fontSize:'14px', lineHeight:'1.6', border:'1px solid #c5d8f5' }}>{viewReview.comment}</div>
              </div>
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div><label>Date</label><div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', color:'#1a2332', fontSize:'13px', fontWeight:600, border:'1px solid #c5d8f5' }}>{viewReview.date}</div></div>
                <div><label>Helpful Votes</label><div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', color:'#1a73e8', fontSize:'16px', fontWeight:900, border:'1px solid #c5d8f5' }}>👍 {viewReview.helpful||0}</div></div>
              </div>
              <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'8px' }}>
                <button onClick={()=>setViewReview(null)} style={{ padding:'9px 18px', borderRadius:'7px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Close</button>
                {canEdit(viewReview) && <button className="btn" onClick={()=>{setViewReview(null);openEdit(viewReview);}}>Edit</button>}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Write/Edit Modal */}
      <Modal isOpen={showModal} title={editingReview?'Edit Review':'Write a Review'} onClose={()=>{setShowModal(false);setEditingReview(null);}}>
        <div style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'380px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
            <div><label>Your Name</label><input type="text" value={form.author} onChange={e=>setForm({...form,author:e.target.value})} placeholder="Anonymous" autoFocus /></div>
            <div><label>Category</label>
              <select value={form.category} onChange={e=>setForm({...form,category:e.target.value})}>
                {Object.entries(CATEGORY_CFG).map(([k,v])=><option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label>Rating — click to set</label>
            <RatingStars rating={form.rating} size={28} interactive onChange={v=>setForm({...form,rating:v})} />
          </div>
          <div><label>Your Comment *</label><textarea value={form.comment} onChange={e=>setForm({...form,comment:e.target.value})} placeholder="Share your experience in detail..." style={{ minHeight:'100px', resize:'vertical' }} /></div>
          <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
            <button onClick={submit} style={{ flex:1, padding:'12px', borderRadius:'8px', background:'linear-gradient(135deg,#1557b0,#1a73e8)', color:'#fff', border:'none', fontWeight:800, fontSize:'12px', cursor:'pointer', letterSpacing:'1px', textTransform:'uppercase' }} disabled={saving}>
              {saving?'Saving…':editingReview?'Update Review':'Submit Review'}
            </button>
            <button onClick={()=>{setShowModal(false);setEditingReview(null);}} style={{ flex:1, padding:'12px', borderRadius:'8px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Cancel</button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
