import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Dashboard(){
  const [counts,setCounts] = useState({users:0,hotels:0,tours:0,bookings:0});
  useEffect(()=>{
    async function load(){
      try{
        const [u,h,t,b] = await Promise.all([
          api.get('/users').then(r=>r.data).catch(()=>[]),
          api.get('/hotels').then(r=>r.data).catch(()=>[]),
          api.get('/tours').then(r=>r.data).catch(()=>[]),
          api.get('/bookings').then(r=>r.data).catch(()=>[])
        ]);
        setCounts({ users: u.length, hotels: h.length, tours: t.length, bookings: b.length });
      }catch(e){}
    }
    load();
  },[]);
  return (
    <div className="page">
      <h2>Dashboard</h2>
      <div className="card-list">
        <div className="card">Users: {counts.users}</div>
        <div className="card">Hotels: {counts.hotels}</div>
        <div className="card">Tours: {counts.tours}</div>
        <div className="card">Bookings: {counts.bookings}</div>
      </div>
    </div>
  );
}

