import React, { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';
import api from '../api';

function useQuery() {
  return new URLSearchParams(useLocation().search);
}

export default function Search(){
  const q = useQuery().get('q') || '';
  const [loading, setLoading] = useState(true);
  const [results, setResults] = useState({ users: [], hotels: [], tours: [] });

  useEffect(() => {
    if (!q) { setLoading(false); setResults({ users: [], hotels: [], tours: [] }); return; }
    let mounted = true;
    async function run(){
      setLoading(true);
      try{
        const [usersRes, hotelsRes, toursRes] = await Promise.all([
          api.get('/users').then(r=>r.data).catch(()=>[]),
          api.get('/hotels').then(r=>r.data).catch(()=>[]),
          api.get('/tours').then(r=>r.data).catch(()=>[])
        ]);
        if (!mounted) return;
        const term = q.toLowerCase();
        const users = (usersRes || []).filter(u => (u.name||'').toLowerCase().includes(term) || (u.email||'').toLowerCase().includes(term));
        const hotels = (hotelsRes || []).filter(h => (h.name||'').toLowerCase().includes(term) || (h.location||'').toLowerCase().includes(term));
        const tours = (toursRes || []).filter(t => (t.title||'').toLowerCase().includes(term) || (t.description||'').toLowerCase().includes(term));
        setResults({ users, hotels, tours });
      }catch(err){
        console.error('Search error', err);
      }finally{
        if (mounted) setLoading(false);
      }
    }
    run();
    return () => { mounted = false; };
  }, [q]);

  return (
    <div className="page">
      <h2>🔎 Search results for "{q}"</h2>
      {loading ? (
        <div className="card">Searching...</div>
      ) : (
        <>
          <div style={{ marginBottom: '16px' }}>
            <h3>Users ({results.users.length})</h3>
            <div className="card-list">
              {results.users.map(u => (
                <div key={u.id} className="card">
                  <div style={{ fontWeight: 700 }}>{u.name}</div>
                  <div style={{ color: 'var(--muted)' }}>{u.email}</div>
                </div>
              ))}
              {results.users.length === 0 && <div className="card">No users found</div>}
            </div>
          </div>

          <div style={{ marginBottom: '16px' }}>
            <h3>Hotels ({results.hotels.length})</h3>
            <div className="card-list">
              {results.hotels.map(h => (
                <Link key={h.id} to={`/hotels`} className="card">
                  <div style={{ fontWeight: 700 }}>{h.name}</div>
                  <div style={{ color: 'var(--muted)' }}>{h.location}</div>
                </Link>
              ))}
              {results.hotels.length === 0 && <div className="card">No hotels found</div>}
            </div>
          </div>

          <div>
            <h3>Tours ({results.tours.length})</h3>
            <div className="card-list">
              {results.tours.map(t => (
                <Link key={t.id} to={`/tours`} className="card">
                  <div style={{ fontWeight: 700 }}>{t.title}</div>
                  <div style={{ color: 'var(--muted)' }}>{t.description}</div>
                </Link>
              ))}
              {results.tours.length === 0 && <div className="card">No tours found</div>}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
