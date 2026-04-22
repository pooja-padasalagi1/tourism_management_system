import React, { useEffect, useState } from 'react';
import api from '../api';
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

function BarChart({ data, color='#1a73e8', maxVal }) {
  const max = maxVal || Math.max(...data.map(d=>d.value), 1);
  return (
    <div style={{ display:'flex', alignItems:'flex-end', gap:'6px', height:'80px' }}>
      {data.map((d,i)=>(
        <div key={i} style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
          <div style={{ fontSize:'10px', color:'#5f6b7a', fontWeight:700 }}>{d.value}</div>
          <div style={{ width:'100%', background:`${color}20`, borderRadius:'3px 3px 0 0', overflow:'hidden', height:'60px', display:'flex', alignItems:'flex-end' }}>
            <div style={{ width:'100%', background:color, borderRadius:'3px 3px 0 0', height:`${(d.value/max)*100}%`, transition:'height .5s ease', minHeight:d.value>0?'4px':'0' }} />
          </div>
          <div style={{ fontSize:'9px', color:'#9ca3af', fontWeight:600, textAlign:'center', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', maxWidth:'100%' }}>{d.label}</div>
        </div>
      ))}
    </div>
  );
}

function StatCard({ label, value, color, sub }) {
  return (
    <div className="card" style={{ padding:'18px', borderLeft:`3px solid ${color}`, margin:0 }}>
      <div style={{ fontSize:'24px', fontWeight:900, color }}>{value}</div>
      <div style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginTop:'3px' }}>{label}</div>
      {sub && <div style={{ fontSize:'12px', color:'#9ca3af', marginTop:'4px' }}>{sub}</div>}
    </div>
  );
}

export default function Reports() {
  const [data, setData] = useState({ users:[], hotels:[], tours:[], bookings:[] });
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [refreshing, setRefreshing] = useState(false);

  async function load(showRefresh=false) {
    try {
      if (showRefresh) setRefreshing(true); else setLoading(true);
      const [users, hotels, tours, bookings] = await Promise.all([
        api.get('/users').then(r=>r.data).catch(()=>[]),
        api.get('/hotels').then(r=>r.data).catch(()=>[]),
        api.get('/tours').then(r=>r.data).catch(()=>[]),
        api.get('/bookings').then(r=>r.data).catch(()=>[]),
      ]);
      setData({ users, hotels, tours, bookings });
      if (showRefresh) toast('Reports refreshed');
    } catch(e) { toast('Error loading reports','error'); }
    finally { setLoading(false); setRefreshing(false); }
  }

  useEffect(() => { load(); }, []);

  const stats = {
    totalUsers: data.users.length,
    adminUsers: data.users.filter(u=>u.role==='admin').length,
    managerUsers: data.users.filter(u=>u.role==='manager').length,
    regularUsers: data.users.filter(u=>u.role==='user').length,
    totalHotels: data.hotels.length,
    avgHotelRating: data.hotels.length ? (data.hotels.reduce((s,h)=>s+Number(h.rating||0),0)/data.hotels.length).toFixed(1) : '0.0',
    topRatedHotels: data.hotels.filter(h=>Number(h.rating||0)>=4).length,
    totalTours: data.tours.length,
    totalTourRevenue: data.tours.reduce((s,t)=>s+Number(t.price||0),0),
    avgTourPrice: data.tours.length ? (data.tours.reduce((s,t)=>s+Number(t.price||0),0)/data.tours.length).toFixed(0) : 0,
    totalBookings: data.bookings.length,
    pendingBookings: data.bookings.filter(b=>b.status==='pending').length,
    confirmedBookings: data.bookings.filter(b=>b.status==='confirmed').length,
    completedBookings: data.bookings.filter(b=>b.status==='completed').length,
    cancelledBookings: data.bookings.filter(b=>b.status==='cancelled').length,
    completionRate: data.bookings.length ? ((data.bookings.filter(b=>b.status==='completed').length/data.bookings.length)*100).toFixed(0) : 0,
  };

  const topHotels = [...data.hotels].sort((a,b)=>Number(b.rating||0)-Number(a.rating||0)).slice(0,5);
  const topTours = [...data.tours].sort((a,b)=>Number(b.price||0)-Number(a.price||0)).slice(0,5);

  const TABS = ['overview','bookings','hotels','tours','users'];

  if (loading) return (
    <div className="page" style={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:'60vh' }}>
      <div style={{ textAlign:'center' }}><Spinner size="lg" /><p style={{ marginTop:'16px', color:'#5f6b7a', fontSize:'13px', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px' }}>Loading Reports</p></div>
    </div>
  );

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h2 style={{ margin:0 }}>Analytics & Reports</h2>
          <p style={{ margin:'6px 0 0', color:'#5f6b7a', fontSize:'13px' }}>System-wide performance overview</p>
        </div>
        <div style={{ display:'flex', gap:'8px' }}>
          <button onClick={()=>exportCSV([
            {Metric:'Total Users',Value:stats.totalUsers},{Metric:'Total Hotels',Value:stats.totalHotels},
            {Metric:'Total Tours',Value:stats.totalTours},{Metric:'Total Bookings',Value:stats.totalBookings},
            {Metric:'Tour Revenue',Value:`$${stats.totalTourRevenue}`},{Metric:'Completion Rate',Value:`${stats.completionRate}%`},
          ],'report-summary.csv')}
            style={{ padding:'9px 16px', borderRadius:'7px', background:'#e8f0fe', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
            ↓ Export Summary
          </button>
          <button onClick={()=>load(true)} disabled={refreshing}
            style={{ padding:'9px 16px', borderRadius:'7px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
            {refreshing?'Refreshing…':'↻ Refresh'}
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display:'flex', gap:'4px', marginBottom:'24px', background:'#f0f7ff', padding:'4px', borderRadius:'10px', border:'1px solid #c5d8f5', flexWrap:'wrap' }}>
        {TABS.map(tab=>(
          <button key={tab} onClick={()=>setActiveTab(tab)}
            style={{ padding:'8px 16px', borderRadius:'7px', border:'none', fontWeight:700, fontSize:'12px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', transition:'all .2s ease',
              background:activeTab===tab?'#1a73e8':'transparent', color:activeTab===tab?'#fff':'#5f6b7a', boxShadow:activeTab===tab?'0 2px 8px rgba(26,115,232,.3)':'none' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* Overview Tab */}
      {activeTab==='overview' && (
        <>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(150px,1fr))', gap:'12px', marginBottom:'24px' }}>
            <StatCard label="Total Users" value={stats.totalUsers} color="#1a73e8" />
            <StatCard label="Total Hotels" value={stats.totalHotels} color="#1e8e3e" sub={`Avg ${stats.avgHotelRating} ★`} />
            <StatCard label="Total Tours" value={stats.totalTours} color="#d97706" sub={`Avg $${stats.avgTourPrice}`} />
            <StatCard label="Total Bookings" value={stats.totalBookings} color="#7c3aed" sub={`${stats.completionRate}% completed`} />
            <StatCard label="Tour Revenue" value={`$${stats.totalTourRevenue.toLocaleString()}`} color="#0891b2" />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(300px,1fr))', gap:'16px' }}>
            <div className="card" style={{ padding:'20px' }}>
              <h3 style={{ margin:'0 0 16px', fontSize:'13px', fontWeight:800, color:'#1a73e8', textTransform:'uppercase', letterSpacing:'1px' }}>Booking Status</h3>
              <BarChart color="#1a73e8" data={[
                {label:'Pending',value:stats.pendingBookings},
                {label:'Confirmed',value:stats.confirmedBookings},
                {label:'Completed',value:stats.completedBookings},
                {label:'Cancelled',value:stats.cancelledBookings},
              ]} />
            </div>
            <div className="card" style={{ padding:'20px' }}>
              <h3 style={{ margin:'0 0 16px', fontSize:'13px', fontWeight:800, color:'#1a73e8', textTransform:'uppercase', letterSpacing:'1px' }}>User Roles</h3>
              <BarChart color="#7c3aed" data={[
                {label:'Admins',value:stats.adminUsers},
                {label:'Managers',value:stats.managerUsers},
                {label:'Users',value:stats.regularUsers},
              ]} />
            </div>
          </div>
        </>
      )}

      {/* Bookings Tab */}
      {activeTab==='bookings' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'12px' }}>
            {[
              {label:'Total',value:stats.totalBookings,color:'#1a73e8'},
              {label:'Pending',value:stats.pendingBookings,color:'#d97706'},
              {label:'Confirmed',value:stats.confirmedBookings,color:'#1e8e3e'},
              {label:'Completed',value:stats.completedBookings,color:'#7c3aed'},
              {label:'Cancelled',value:stats.cancelledBookings,color:'#d93025'},
              {label:'Completion Rate',value:`${stats.completionRate}%`,color:'#0891b2'},
            ].map(s=><StatCard key={s.label} {...s} />)}
          </div>
          <div className="card" style={{ padding:'20px' }}>
            <h3 style={{ margin:'0 0 16px', fontSize:'13px', fontWeight:800, color:'#1a73e8', textTransform:'uppercase', letterSpacing:'1px' }}>Booking Status Distribution</h3>
            <BarChart color="#1a73e8" data={[
              {label:'Pending',value:stats.pendingBookings},
              {label:'Confirmed',value:stats.confirmedBookings},
              {label:'Completed',value:stats.completedBookings},
              {label:'Cancelled',value:stats.cancelledBookings},
            ]} />
          </div>
          <div style={{ display:'flex', justifyContent:'flex-end' }}>
            <button onClick={()=>exportCSV(data.bookings.map(b=>({ID:b.id,User:b.user_name||b.user_id,Tour:b.tour_title||b.tour_id,Hotel:b.hotel_name||b.hotel_id,Status:b.status})),'bookings-report.csv')}
              style={{ padding:'9px 16px', borderRadius:'7px', background:'#e8f0fe', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
              ↓ Export Bookings
            </button>
          </div>
        </div>
      )}

      {/* Hotels Tab */}
      {activeTab==='hotels' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'12px' }}>
            <StatCard label="Total Hotels" value={stats.totalHotels} color="#1e8e3e" />
            <StatCard label="Avg Rating" value={`${stats.avgHotelRating} ★`} color="#d97706" />
            <StatCard label="4★ & Above" value={stats.topRatedHotels} color="#7c3aed" />
            <StatCard label="Locations" value={new Set(data.hotels.map(h=>h.location)).size} color="#0891b2" />
          </div>
          <div className="card" style={{ padding:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <h3 style={{ margin:0, fontSize:'13px', fontWeight:800, color:'#1a73e8', textTransform:'uppercase', letterSpacing:'1px' }}>Top Rated Hotels</h3>
              <button onClick={()=>exportCSV(data.hotels.map(h=>({ID:h.id,Name:h.name,Location:h.location,Rating:h.rating})),'hotels-report.csv')}
                style={{ padding:'6px 12px', borderRadius:'6px', background:'#e8f0fe', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'11px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>
                ↓ Export
              </button>
            </div>
            {topHotels.map((h,i)=>(
              <div key={h.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:i<topHotels.length-1?'1px solid #e8f0fe':'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'6px', background:'#dbeafe', border:'1px solid #93c5fd', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:900, color:'#1a73e8' }}>{i+1}</div>
                  <div>
                    <div style={{ fontWeight:700, color:'#1a2332', fontSize:'14px' }}>{h.name}</div>
                    <div style={{ fontSize:'12px', color:'#5f6b7a' }}>{h.location}</div>
                  </div>
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:'4px' }}>
                  <span style={{ color:'#f59e0b' }}>{'★'.repeat(Math.round(Number(h.rating||0)))}</span>
                  <span style={{ fontWeight:700, color:'#1a73e8', fontSize:'13px' }}>{Number(h.rating||0).toFixed(1)}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tours Tab */}
      {activeTab==='tours' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'12px' }}>
            <StatCard label="Total Tours" value={stats.totalTours} color="#d97706" />
            <StatCard label="Total Revenue" value={`$${stats.totalTourRevenue.toLocaleString()}`} color="#1e8e3e" />
            <StatCard label="Avg Price" value={`$${stats.avgTourPrice}`} color="#1a73e8" />
            <StatCard label="Luxury Tours" value={data.tours.filter(t=>Number(t.price||0)>=1500).length} color="#7c3aed" />
          </div>
          <div className="card" style={{ padding:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <h3 style={{ margin:0, fontSize:'13px', fontWeight:800, color:'#1a73e8', textTransform:'uppercase', letterSpacing:'1px' }}>Premium Tours by Price</h3>
              <button onClick={()=>exportCSV(data.tours.map(t=>({ID:t.id,Title:t.title,Description:t.description||'',Price:t.price})),'tours-report.csv')}
                style={{ padding:'6px 12px', borderRadius:'6px', background:'#e8f0fe', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'11px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>
                ↓ Export
              </button>
            </div>
            {topTours.map((t,i)=>(
              <div key={t.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:i<topTours.length-1?'1px solid #e8f0fe':'none' }}>
                <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
                  <div style={{ width:'28px', height:'28px', borderRadius:'6px', background:'#fef3c7', border:'1px solid #fde68a', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'12px', fontWeight:900, color:'#d97706' }}>{i+1}</div>
                  <div>
                    <div style={{ fontWeight:700, color:'#1a2332', fontSize:'14px' }}>{t.title}</div>
                    {t.description && <div style={{ fontSize:'12px', color:'#5f6b7a' }}>{t.description.substring(0,50)}{t.description.length>50?'…':''}</div>}
                  </div>
                </div>
                <div style={{ fontWeight:800, color:'#1a73e8', fontSize:'15px' }}>${Number(t.price||0).toLocaleString()}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Users Tab */}
      {activeTab==='users' && (
        <div style={{ display:'flex', flexDirection:'column', gap:'16px' }}>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(140px,1fr))', gap:'12px' }}>
            <StatCard label="Total Users" value={stats.totalUsers} color="#1a73e8" />
            <StatCard label="Admins" value={stats.adminUsers} color="#7c3aed" />
            <StatCard label="Managers" value={stats.managerUsers} color="#1a73e8" />
            <StatCard label="Regular Users" value={stats.regularUsers} color="#1e8e3e" />
          </div>
          <div className="card" style={{ padding:'20px' }}>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'16px' }}>
              <h3 style={{ margin:0, fontSize:'13px', fontWeight:800, color:'#1a73e8', textTransform:'uppercase', letterSpacing:'1px' }}>User Role Distribution</h3>
              <button onClick={()=>exportCSV(data.users.map(u=>({ID:u.id,Name:u.name,Email:u.email,Role:u.role})),'users-report.csv')}
                style={{ padding:'6px 12px', borderRadius:'6px', background:'#e8f0fe', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'11px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>
                ↓ Export
              </button>
            </div>
            <BarChart color="#7c3aed" data={[
              {label:'Admins',value:stats.adminUsers},
              {label:'Managers',value:stats.managerUsers},
              {label:'Users',value:stats.regularUsers},
            ]} />
          </div>
        </div>
      )}
    </div>
  );
}
