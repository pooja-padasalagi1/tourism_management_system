import React, { useEffect, useState } from 'react';
import api from '../api';
import { getUser } from '../auth';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';
import Modal from '../components/Modal';
import { toast, exportCSV } from '../utils/helpers';
import { Icon, Icons } from '../utils/icons';

const CATEGORY_CFG = {
  hotel:     { label: 'Hotel',     color: '#2563eb', bg: '#dbeafe', border: '#93c5fd' },
  tour:      { label: 'Tour',      color: '#16a34a', bg: '#dcfce7', border: '#86efac' },
  guide:     { label: 'Guide',     color: '#7c3aed', bg: '#ede9fe', border: '#c4b5fd' },
  transport: { label: 'Transport', color: '#d97706', bg: '#fef3c7', border: '#fde68a' },
};

function RatingStars({ rating = 0, size = 18, interactive = false, onChange }) {
  const [hover, setHover] = useState(0);
  const r = parseInt(rating) || 0;
  return (
    <div style={{ display: 'flex', gap: 2 }}>
      {[1,2,3,4,5].map(i => (
        <span key={i}
          style={{ fontSize: size, color: i <= (hover || r) ? '#f59e0b' : '#d1d5db', cursor: interactive ? 'pointer' : 'default', transition: 'color .1s' }}
          onMouseEnter={() => interactive && setHover(i)}
          onMouseLeave={() => interactive && setHover(0)}
          onClick={() => interactive && onChange && onChange(i)}
        >★</span>
      ))}
    </div>
  );
}

const STORAGE_KEY = 'tms_reviews_v1';
const SEED = [
  { id: 1, author: 'John Doe',     category: 'hotel',     rating: 5, comment: 'Excellent service and beautiful location! Highly recommend to everyone.', date: '2024-02-15', helpful: 12 },
  { id: 2, author: 'Sarah Wilson', category: 'tour',      rating: 4, comment: 'Great tour guide and very informative. Would definitely go again!', date: '2024-02-16', helpful: 8 },
  { id: 3, author: 'Mike Johnson', category: 'guide',     rating: 5, comment: 'Very knowledgeable and friendly guide. Perfect day out with the family!', date: '2024-02-17', helpful: 15 },
  { id: 4, author: 'Emma Brown',   category: 'hotel',     rating: 4, comment: 'Clean rooms, great amenities, minor issues with WiFi but overall great stay.', date: '2024-02-18', helpful: 6 },
  { id: 5, author: 'Carlos Ruiz',  category: 'transport', rating: 3, comment: 'Driver was on time but the vehicle was a bit old. Acceptable for the price.', date: '2024-02-19', helpful: 3 },
];

export default function Reviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ rating: 5, comment: '', category: 'hotel', author: '' });
  const [viewReview, setViewReview] = useState(null);
  const [editingReview, setEditingReview] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch] = useState('');
  const [filterCategory, setFilterCategory] = useState('all');
  const [filterRating, setFilterRating] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [saving, setSaving] = useState(false);
  const user = getUser();

  function readLocal() { try { const r = localStorage.getItem(STORAGE_KEY); return r ? JSON.parse(r) : []; } catch { return []; } }
  function writeLocal(list) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(list)); } catch {} }

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await api.get('/reviews').catch(() => null);
        if (res?.data && Array.isArray(res.data) && res.data.length > 0) { setReviews(res.data); }
        else { const local = readLocal(); setReviews(local.length > 0 ? local : SEED); if (!local.length) writeLocal(SEED); }
      } catch { const local = readLocal(); setReviews(local.length > 0 ? local : SEED); }
      finally { setLoading(false); }
    }
    load();
  }, []);

  const filtered = reviews
    .filter(r => { const s = search.toLowerCase(); return (!s || (r.author || '').toLowerCase().includes(s) || (r.comment || '').toLowerCase().includes(s)) && (filterCategory === 'all' || r.category === filterCategory) && (filterRating === 'all' || parseInt(r.rating) === parseInt(filterRating)); })
    .sort((a, b) => sortBy === 'rating-desc' ? b.rating - a.rating : sortBy === 'rating-asc' ? a.rating - b.rating : sortBy === 'helpful' ? (b.helpful || 0) - (a.helpful || 0) : sortBy === 'oldest' ? a.id - b.id : b.id - a.id);

  async function submit(e) {
    e.preventDefault();
    if (!form.comment.trim()) return toast('Please add a comment', 'error');
    setSaving(true);
    try {
      const payload = { ...form, author: form.author.trim() || (user?.name) || 'Anonymous', date: new Date().toLocaleDateString(), rating: parseInt(form.rating) || 5, helpful: 0 };
      if (editingReview) {
        await api.put('/reviews/' + editingReview.id, payload).catch(() => { writeLocal(readLocal().map(r => r.id === editingReview.id ? { ...r, ...payload } : r)); });
        toast('Review updated');
      } else {
        await api.post('/reviews', payload).catch(() => { const local = readLocal(); local.unshift({ id: Date.now(), ...payload }); writeLocal(local); });
        toast('Review submitted');
      }
      setForm({ rating: 5, comment: '', category: 'hotel', author: '' }); setShowModal(false); setEditingReview(null);
      const local = readLocal(); setReviews(local.length > 0 ? local : SEED);
    } catch { toast('Error submitting review', 'error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(r) {
    if (!window.confirm('Delete this review?')) return;
    try {
      await api.delete('/reviews/' + r.id).catch(() => { writeLocal(readLocal().filter(x => x.id !== r.id)); });
      toast('Review deleted');
      const local = readLocal(); setReviews(local.length > 0 ? local : SEED);
      if (viewReview?.id === r.id) setViewReview(null);
    } catch { toast('Error deleting review', 'error'); }
  }

  function markHelpful(r) {
    const updated = reviews.map(x => x.id === r.id ? { ...x, helpful: (x.helpful || 0) + 1 } : x);
    setReviews(updated); writeLocal(updated); toast('Marked as helpful');
  }

  function openEdit(r) { setEditingReview(r); setForm({ rating: r.rating, comment: r.comment || '', category: r.category || 'hotel', author: r.author || '' }); setShowModal(true); }
  const canEdit = r => user && (user.role === 'admin' || user.name === r.author);
  const avgRating = reviews.length ? (reviews.reduce((s, r) => s + Number(r.rating || 0), 0) / reviews.length).toFixed(1) : '0.0';

  return (
    <div className="page">
      <div className="page-header-bar">
        <div className="page-title-block">
          <h1>⭐ Reviews</h1>
          <p>{reviews.length} reviews · avg {avgRating} ★</p>
        </div>
        <div className="action-bar">
          <button className="btn-icon btn-icon-ghost" onClick={() => exportCSV(filtered.map(r => ({ ID: r.id, Author: r.author, Category: r.category, Rating: r.rating, Comment: r.comment, Date: r.date, Helpful: r.helpful || 0 })), 'reviews.csv')}>
            <Icon d={Icons.download} size={15} /> Export CSV
          </button>
          <button className="btn-icon btn-icon-primary" onClick={() => { setEditingReview(null); setForm({ rating: 5, comment: '', category: 'hotel', author: '' }); setShowModal(true); }}>
            <Icon d={Icons.plus} size={15} /> Write Review
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {[
          { label: 'Total Reviews', value: reviews.length, color: 'var(--primary)' },
          { label: 'Avg Rating', value: `${avgRating} ★`, color: '#f59e0b' },
          { label: '5-Star', value: reviews.filter(r => parseInt(r.rating) === 5).length, color: 'var(--success)' },
          { label: 'Needs Attention', value: reviews.filter(r => parseInt(r.rating) <= 2).length, color: '#dc2626' },
        ].map(s => (
          <div key={s.label} className="stat-mini" style={{ borderLeft: `3px solid ${s.color}` }}>
            <div className="stat-mini-value" style={{ color: s.color }}>{s.value}</div>
            <div className="stat-mini-label">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="filter-bar">
        <Icon d={Icons.search} size={16} style={{ color: 'var(--text-muted)', flexShrink: 0 }} />
        <input placeholder="Search by author or comment…" value={search} onChange={e => setSearch(e.target.value)} />
        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)}>
          <option value="all">All Categories</option>
          {Object.entries(CATEGORY_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <select value={filterRating} onChange={e => setFilterRating(e.target.value)}>
          <option value="all">All Ratings</option>
          {[5,4,3,2,1].map(r => <option key={r} value={r}>{r} Star{r !== 1 ? 's' : ''}</option>)}
        </select>
        <select value={sortBy} onChange={e => setSortBy(e.target.value)}>
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="rating-desc">Rating: High → Low</option>
          <option value="rating-asc">Rating: Low → High</option>
          <option value="helpful">Most Helpful</option>
        </select>
        {(search || filterCategory !== 'all' || filterRating !== 'all') && <button className="btn-icon btn-icon-ghost" onClick={() => { setSearch(''); setFilterCategory('all'); setFilterRating('all'); }}><Icon d={Icons.x} size={14} /> Clear</button>}
        <span className="filter-count">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</span>
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '3rem' }}><Spinner size="lg" /></div>
      ) : filtered.length === 0 ? (
        <div className="card"><EmptyState icon="⭐" title="No reviews found" description="Be the first to share your experience!" action={<button className="btn-icon btn-icon-primary" onClick={() => setShowModal(true)}><Icon d={Icons.plus} size={14} /> Write Review</button>} /></div>
      ) : (
        <div className="data-grid">
          {filtered.map((r, idx) => {
            const cat = CATEGORY_CFG[r.category] || CATEGORY_CFG.hotel;
            return (
              <div key={r.id || idx} className="data-card" style={{ animation: `slideInUp .3s ease ${idx * .04}s backwards` }}>
                <div className="data-card-header">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.95rem', color: 'var(--text)' }}>{r.author || 'Anonymous'}</div>
                      <div style={{ marginTop: 4 }}><RatingStars rating={r.rating} size={14} /></div>
                    </div>
                    <span className="badge" style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}>{cat.label}</span>
                  </div>
                </div>
                <div className="data-card-body">
                  <p style={{ margin: '0 0 8px', color: 'var(--text-muted)', fontSize: '0.875rem', lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.comment}</p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{r.date}</span>
                    <button className="btn-icon btn-icon-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => markHelpful(r)}>
                      <Icon d={Icons.trending} size={12} /> {r.helpful || 0} helpful
                    </button>
                  </div>
                </div>
                <div className="data-card-footer">
                  <button className="btn-icon btn-icon-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => setViewReview(r)}><Icon d={Icons.eye} size={14} /> View</button>
                  {canEdit(r) && <button className="btn-icon btn-icon-warning" style={{ flex: 1, justifyContent: 'center' }} onClick={() => openEdit(r)}><Icon d={Icons.edit} size={14} /> Edit</button>}
                  {canEdit(r) && <button className="btn-icon btn-icon-outline-danger" style={{ flex: 1, justifyContent: 'center' }} onClick={() => handleDelete(r)}><Icon d={Icons.trash} size={14} /> Delete</button>}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewReview} title={`⭐ Review by ${viewReview?.author || 'Anonymous'}`} onClose={() => setViewReview(null)}>
        {viewReview && (() => {
          const cat = CATEGORY_CFG[viewReview.category] || CATEGORY_CFG.hotel;
          return (
            <div>
              <div style={{ display: 'flex', gap: 10, alignItems: 'center', marginBottom: 14 }}>
                <RatingStars rating={viewReview.rating} size={22} />
                <span className="badge" style={{ background: cat.bg, color: cat.color, borderColor: cat.border }}>{cat.label}</span>
              </div>
              <div className="info-row"><label>Comment</label><div className="info-row-value" style={{ lineHeight: 1.6 }}>{viewReview.comment}</div></div>
              <div className="form-grid-2">
                <div className="info-row"><label>Date</label><div className="info-row-value">{viewReview.date}</div></div>
                <div className="info-row"><label>Helpful Votes</label><div className="info-row-value" style={{ fontWeight: 900, color: 'var(--primary)' }}>👍 {viewReview.helpful || 0}</div></div>
              </div>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 16 }}>
                <button className="btn-icon btn-icon-ghost" onClick={() => setViewReview(null)}><Icon d={Icons.x} size={14} /> Close</button>
                {canEdit(viewReview) && <button className="btn-icon btn-icon-primary" onClick={() => { setViewReview(null); openEdit(viewReview); }}><Icon d={Icons.edit} size={14} /> Edit</button>}
              </div>
            </div>
          );
        })()}
      </Modal>

      {/* Write/Edit Modal */}
      <Modal isOpen={showModal} title={editingReview ? '✏️ Edit Review' : '⭐ Write a Review'} onClose={() => { setShowModal(false); setEditingReview(null); }}>
        <form onSubmit={submit}>
          <div className="form-grid-2">
            <div className="form-group"><label>Your Name</label><input type="text" value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="Anonymous" autoFocus /></div>
            <div className="form-group"><label>Category</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                {Object.entries(CATEGORY_CFG).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label>Rating — click to set</label>
            <RatingStars rating={form.rating} size={28} interactive onChange={v => setForm({ ...form, rating: v })} />
          </div>
          <div className="form-group"><label>Your Comment *</label><textarea value={form.comment} onChange={e => setForm({ ...form, comment: e.target.value })} placeholder="Share your experience in detail…" rows={4} required /></div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button type="submit" className="btn-icon btn-icon-primary" style={{ flex: 1, justifyContent: 'center' }} disabled={saving}>
              <Icon d={Icons.star} size={15} /> {saving ? 'Saving…' : editingReview ? 'Update Review' : 'Submit Review'}
            </button>
            <button type="button" className="btn-icon btn-icon-ghost" style={{ flex: 1, justifyContent: 'center' }} onClick={() => { setShowModal(false); setEditingReview(null); }}>
              <Icon d={Icons.x} size={15} /> Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
