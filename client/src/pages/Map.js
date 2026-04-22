import React, { useState, useEffect, useCallback } from 'react';
import api from '../api';

const QUICK_LOCATIONS = [
  { label:'New York', query:'New York, USA' },
  { label:'Paris', query:'Paris, France' },
  { label:'Tokyo', query:'Tokyo, Japan' },
  { label:'Dubai', query:'Dubai, UAE' },
  { label:'London', query:'London, UK' },
  { label:'Sydney', query:'Sydney, Australia' },
];

export default function Map() {
  const [query, setQuery] = useState('New York, USA');
  const [inputVal, setInputVal] = useState('New York, USA');
  const [hotels, setHotels] = useState([]);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [showHotels, setShowHotels] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.get('/hotels').then(r=>setHotels(r.data||[])).catch(()=>{});
  }, []);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    const val = inputVal.trim();
    if (!val) return;
    setQuery(val);
  }, [inputVal]);

  function searchHotel(hotel) {
    const q = `${hotel.name}, ${hotel.location}`;
    setInputVal(q); setQuery(q); setSelectedHotel(hotel); setShowHotels(false);
  }

  const src = `https://www.google.com/maps?q=${encodeURIComponent(query)}&output=embed`;

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h2 style={{ margin:0 }}>Map Explorer</h2>
          <p style={{ margin:'6px 0 0', color:'#5f6b7a', fontSize:'13px' }}>Search locations and explore hotel destinations</p>
        </div>
        <button onClick={()=>setShowHotels(v=>!v)}
          style={{ padding:'9px 16px', borderRadius:'7px', background:showHotels?'#1a73e8':'#e8f0fe', color:showHotels?'#fff':'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
          {showHotels?'Hide Hotels':'Show Hotels'} ({hotels.length})
        </button>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} style={{ display:'flex', gap:'10px', marginBottom:'16px' }}>
        <input
          type="text"
          value={inputVal}
          onChange={e=>setInputVal(e.target.value)}
          placeholder="Search any place or address..."
          style={{ flex:1, fontSize:'15px' }}
        />
        <button type="submit" className="btn" style={{ padding:'12px 20px', fontSize:'12px', whiteSpace:'nowrap' }}>Search</button>
      </form>

      {/* Quick locations */}
      <div style={{ display:'flex', gap:'8px', flexWrap:'wrap', marginBottom:'16px' }}>
        {QUICK_LOCATIONS.map(loc=>(
          <button key={loc.label} onClick={()=>{setInputVal(loc.query);setQuery(loc.query);}}
            style={{ padding:'6px 14px', borderRadius:'20px', background:query===loc.query?'#1a73e8':'#f0f7ff', color:query===loc.query?'#fff':'#1a73e8', border:'1px solid #c5d8f5', fontWeight:600, fontSize:'12px', cursor:'pointer', boxShadow:'none', textTransform:'none', letterSpacing:0, transition:'all .15s ease' }}>
            {loc.label}
          </button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:showHotels?'1fr 280px':'1fr', gap:'16px', alignItems:'start' }}>
        {/* Map */}
        <div>
          {selectedHotel && (
            <div style={{ marginBottom:'12px', padding:'12px 16px', background:'#f0f7ff', borderRadius:'8px', border:'1px solid #c5d8f5', display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <div>
                <div style={{ fontWeight:800, color:'#1a2332', fontSize:'14px' }}>{selectedHotel.name}</div>
                <div style={{ fontSize:'12px', color:'#5f6b7a', marginTop:'2px' }}>📍 {selectedHotel.location} · ★ {Number(selectedHotel.rating||0).toFixed(1)}</div>
              </div>
              <button onClick={()=>setSelectedHotel(null)} style={{ padding:'4px 10px', borderRadius:'5px', background:'#fee2e2', color:'#d93025', border:'none', fontWeight:700, fontSize:'10px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>✕ Clear</button>
            </div>
          )}
          <div style={{ width:'100%', height:'560px', borderRadius:'12px', overflow:'hidden', border:'1px solid #c5d8f5', boxShadow:'0 4px 16px rgba(26,115,232,.1)' }}>
            <iframe
              title="map"
              src={src}
              width="100%"
              height="100%"
              style={{ border:0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
          <p style={{ margin:'8px 0 0', fontSize:'12px', color:'#9ca3af', textAlign:'center' }}>
            Currently showing: <strong style={{ color:'#1a73e8' }}>{query}</strong>
          </p>
        </div>

        {/* Hotels Panel */}
        {showHotels && (
          <div className="card" style={{ padding:'16px', maxHeight:'600px', overflow:'auto' }}>
            <h3 style={{ margin:'0 0 14px', fontSize:'13px', fontWeight:800, color:'#1a73e8', textTransform:'uppercase', letterSpacing:'1px' }}>
              Hotels ({hotels.length})
            </h3>
            {hotels.length===0 ? (
              <p style={{ color:'#5f6b7a', fontSize:'13px', textAlign:'center', padding:'20px 0' }}>No hotels found</p>
            ) : (
              <div style={{ display:'flex', flexDirection:'column', gap:'8px' }}>
                {hotels.map(h=>(
                  <div key={h.id}
                    onClick={()=>searchHotel(h)}
                    style={{ padding:'10px 12px', borderRadius:'8px', background:selectedHotel?.id===h.id?'#dbeafe':'#f8fbff', border:`1px solid ${selectedHotel?.id===h.id?'#93c5fd':'#e8f0fe'}`, cursor:'pointer', transition:'all .15s ease' }}
                    onMouseEnter={e=>{ if(selectedHotel?.id!==h.id) e.currentTarget.style.background='#eff6ff'; }}
                    onMouseLeave={e=>{ if(selectedHotel?.id!==h.id) e.currentTarget.style.background='#f8fbff'; }}>
                    <div style={{ fontWeight:700, color:'#1a2332', fontSize:'13px' }}>{h.name}</div>
                    <div style={{ fontSize:'11px', color:'#5f6b7a', marginTop:'2px' }}>📍 {h.location}</div>
                    <div style={{ fontSize:'11px', color:'#f59e0b', marginTop:'2px' }}>{'★'.repeat(Math.round(Number(h.rating||0)))} {Number(h.rating||0).toFixed(1)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
