import React, { useEffect, useState, useRef } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import Spinner from '../components/Spinner';

function useQuery() { return new URLSearchParams(useLocation().search); }

function ResultCard({ type, item, onClick }) {
  const configs = {
    user:  { color:'#7c3aed', bg:'#ede9fe', border:'#c4b5fd', icon:'👤', path:'/users' },
    hotel: { color:'#1e8e3e', bg:'#d1fae5', border:'#6ee7b7', icon:'🏨', path:'/hotels' },
    tour:  { color:'#d97706', bg:'#fef3c7', border:'#fde68a', icon:'✈️', path:'/tours' },
  };
  const cfg = configs[type];
  return (
    <Link to={cfg.path} onClick={onClick} style={{ textDecoration:'none' }}>
      <div className="card" style={{ padding:'14px 16px', display:'flex', alignItems:'center', gap:'12px', cursor:'pointer', margin:0 }}
        onMouseEnter={e=>e.currentTarget.style.transform='translateY(-2px)'}
        onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
        <div style={{ width:'36px', height:'36px', borderRadius:'8px', background:cfg.bg, border:`1px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'18px', flexShrink:0 }}>
          {cfg.icon}
        </div>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ fontWeight:700, color:'#1a2332', fontSize:'14px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {type==='user'?item.name:type==='hotel'?item.name:item.title}
          </div>
          <div style={{ fontSize:'12px', color:'#5f6b7a', marginTop:'2px', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
            {type==='user'?item.email:type==='hotel'?item.location:item.description?item.description.substring(0,60)+'…':''}
          </div>
        </div>
        <span style={{ padding:'3px 8px', borderRadius:'4px', fontSize:'10px', fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}`, flexShrink:0 }}>{type}</span>
      </div>
    </Link>
  );
}

export default function Search() {
  const q = useQuery().get('q') || '';
  const nav = useNavigate();
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState({ users:[], hotels:[], tours:[] });
  const [activeFilter, setActiveFilter] = useState('all');
  const [localQ, setLocalQ] = useState(q);
  const [history, setHistory] = useState(() => { try { return JSON.parse(localStorage.getItem('tms_search_history')||'[]'); } catch(e){ return []; } });
  const inputRef = useRef(null);

  useEffect(() => {
    if (!q) { setLoading(false); setResults({users:[],hotels:[],tours:[]}); return; }
    setLocalQ(q);
    let mounted = true;
    async function run() {
      setLoading(true);
      try {
        const [usersRes, hotelsRes, toursRes] = await Promise.all([
          api.get('/users').then(r=>r.data).catch(()=>[]),
          api.get('/hotels').then(r=>r.data).catch(()=>[]),
          api.get('/tours').then(r=>r.data).catch(()=>[]),
        ]);
        if (!mounted) return;
        const term = q.toLowerCase();
        setResults({
          users:  (usersRes||[]).filter(u=>(u.name||'').toLowerCase().includes(term)||(u.email||'').toLowerCase().includes(term)),
          hotels: (hotelsRes||[]).filter(h=>(h.name||'').toLowerCase().includes(term)||(h.location||'').toLowerCase().includes(term)),
          tours:  (toursRes||[]).filter(t=>(t.title||'').toLowerCase().includes(term)||(t.description||'').toLowerCase().includes(term)),
        });
        // Save to history
        const newHistory = [q, ...history.filter(h=>h!==q)].slice(0,8);
        setHistory(newHistory);
        localStorage.setItem('tms_search_history', JSON.stringify(newHistory));
      } catch(err) { console.error('Search error', err); }
      finally { if (mounted) setLoading(false); }
    }
    run();
    return () => { mounted = false; };
  }, [q]);

  function handleSearch(e) {
    e.preventDefault();
    const term = localQ.trim();
    if (!term) return;
    nav('/search?q='+encodeURIComponent(term));
  }

  function clearHistory() {
    setHistory([]); localStorage.removeItem('tms_search_history');
  }

  const allResults = [
    ...results.users.map(u=>({type:'user',item:u})),
    ...results.hotels.map(h=>({type:'hotel',item:h})),
    ...results.tours.map(t=>({type:'tour',item:t})),
  ];

  const filtered = activeFilter==='all' ? allResults : allResults.filter(r=>r.type===activeFilter);
  const total = allResults.length;

  return (
    <div className="page">
      <h2 style={{ margin:'0 0 24px' }}>Search</h2>

      {/* Search Bar */}
      <form onSubmit={handleSearch} style={{ marginBottom:'24px' }}>
        <div style={{ display:'flex', gap:'10px' }}>
          <input
            ref={inputRef}
            type="text"
            value={localQ}
            onChange={e=>setLocalQ(e.target.value)}
            placeholder="Search users, hotels, tours..."
            style={{ flex:1, fontSize:'16px', padding:'14px 18px' }}
            autoFocus
          />
          <button type="submit" className="btn" style={{ padding:'14px 24px', fontSize:'13px', whiteSpace:'nowrap' }}>Search</button>
          {localQ && <button type="button" onClick={()=>{setLocalQ('');nav('/search');inputRef.current?.focus();}} style={{ padding:'14px 16px', borderRadius:'8px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'13px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Clear</button>}
        </div>
      </form>

      {/* Search History (when no query) */}
      {!q && history.length>0 && (
        <div className="card" style={{ padding:'20px', marginBottom:'20px' }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'12px' }}>
            <h3 style={{ margin:0, fontSize:'13px', fontWeight:800, color:'#1a73e8', textTransform:'uppercase', letterSpacing:'1px' }}>Recent Searches</h3>
            <button onClick={clearHistory} style={{ padding:'4px 10px', borderRadius:'5px', background:'#fee2e2', color:'#d93025', border:'none', fontWeight:700, fontSize:'10px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Clear</button>
          </div>
          <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
            {history.map((h,i)=>(
              <button key={i} onClick={()=>nav('/search?q='+encodeURIComponent(h))}
                style={{ padding:'6px 14px', borderRadius:'20px', background:'#f0f7ff', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:600, fontSize:'13px', cursor:'pointer', boxShadow:'none', textTransform:'none', letterSpacing:0 }}>
                🔍 {h}
              </button>
            ))}
          </div>
        </div>
      )}

      {!q && (
        <div style={{ textAlign:'center', padding:'60px 20px', color:'#5f6b7a' }}>
          <div style={{ fontSize:'48px', marginBottom:'16px', opacity:.3 }}>🔍</div>
          <p style={{ fontSize:'16px', fontWeight:600, margin:0 }}>Type something to search across users, hotels, and tours</p>
        </div>
      )}

      {q && loading && (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><Spinner /></div>
      )}

      {q && !loading && (
        <>
          {/* Results summary + filter tabs */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px', flexWrap:'wrap', gap:'12px' }}>
            <p style={{ margin:0, color:'#5f6b7a', fontSize:'14px', fontWeight:600 }}>
              {total>0 ? <><strong style={{ color:'#1a2332' }}>{total}</strong> result{total!==1?'s':''} for "<strong style={{ color:'#1a73e8' }}>{q}</strong>"</> : `No results for "${q}"`}
            </p>
            {total>0 && (
              <div style={{ display:'flex', gap:'4px', background:'#f0f7ff', padding:'4px', borderRadius:'8px', border:'1px solid #c5d8f5' }}>
                {[
                  {key:'all',label:`All (${total})`},
                  {key:'user',label:`Users (${results.users.length})`},
                  {key:'hotel',label:`Hotels (${results.hotels.length})`},
                  {key:'tour',label:`Tours (${results.tours.length})`},
                ].map(f=>(
                  <button key={f.key} onClick={()=>setActiveFilter(f.key)}
                    style={{ padding:'6px 12px', borderRadius:'6px', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', transition:'all .15s ease',
                      background:activeFilter===f.key?'#1a73e8':'transparent', color:activeFilter===f.key?'#fff':'#5f6b7a', boxShadow:'none' }}>
                    {f.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {filtered.length===0 ? (
            <div style={{ textAlign:'center', padding:'48px', color:'#5f6b7a', border:'1px dashed #c5d8f5', borderRadius:'10px', background:'#f8fbff' }}>
              <div style={{ fontSize:'36px', marginBottom:'12px', opacity:.3 }}>🔍</div>
              <p style={{ margin:0, fontWeight:600 }}>No {activeFilter==='all'?'results':activeFilter+'s'} found for "{q}"</p>
            </div>
          ) : (
            <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
              {filtered.map((r,i)=>(
                <ResultCard key={`${r.type}-${r.item.id||i}`} type={r.type} item={r.item} onClick={()=>{}} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
