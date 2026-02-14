import React, { useEffect, useState } from 'react';
import api from '../api';
import { getUser } from '../auth';

export default function Bookings(){
  const [items,setItems] = useState([]);
  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  useEffect(()=>{ load(); }, []);
  async function load(){
    const res = await api.get('/bookings');
    setItems(res.data || []);
  }

  async function handleCreate(){
    const user_id = parseInt(prompt('User ID')||''); if(!user_id) return;
    const tour_id = parseInt(prompt('Tour ID')||'');
    const hotel_id = parseInt(prompt('Hotel ID')||'');
    const status = prompt('Status','pending')||'pending';
    await api.post('/bookings', { user_id, tour_id, hotel_id, status });
    load();
  }

  async function handleDelete(b){
    if(!confirm('Delete booking #'+b.id+'?')) return;
    await api.delete('/bookings/' + b.id);
    load();
  }

  return (
    <div className="page">
      <h2>Bookings</h2>
      {(isAdmin || user) && <button onClick={handleCreate}>Create Booking</button>}
      <div className="card-list">
        {items.map(b=> (
          <div key={b.id} className="card">
            <h3>Booking #{b.id} - {b.status}</h3>
            <div>User: {b.user_name || b.user_id}</div>
            <div>Tour: {b.tour_title || b.tour_id}</div>
            <div>Hotel: {b.hotel_name || b.hotel_id}</div>
            {isAdmin && <button onClick={()=>handleDelete(b)}>Delete</button>}
          </div>
        ))}
      </div>
    </div>
  );
}
