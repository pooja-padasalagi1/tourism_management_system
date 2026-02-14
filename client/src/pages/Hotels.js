import React, { useEffect, useState } from 'react';
import api from '../api';
import { getUser } from '../auth';

export default function Hotels(){
  const [items,setItems] = useState([]);
  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  useEffect(()=>{ load(); }, []);
  async function load(){
    const res = await api.get('/hotels');
    setItems(res.data || []);
  }

  async function handleCreate(){
    const name = prompt('Hotel name'); if(!name) return;
    const location = prompt('Location')||'';
    const rating = parseInt(prompt('Rating (1-5)')||'0');
    await api.post('/hotels', { name, location, rating });
    load();
  }

  async function handleEdit(h){
    const name = prompt('Hotel name', h.name); if(!name) return;
    const location = prompt('Location', h.location)||'';
    const rating = parseInt(prompt('Rating (1-5)', String(h.rating))||String(h.rating));
    await api.put('/hotels/' + h.id, { name, location, rating });
    load();
  }

  async function handleDelete(h){
    if(!confirm('Delete hotel '+h.name+'?')) return;
    await api.delete('/hotels/' + h.id);
    load();
  }

  return (
    <div className="page">
      <h2>Hotels</h2>
      {isAdmin && <button onClick={handleCreate}>Create Hotel</button>}
      <div className="card-list">
        {items.map(h=> (
          <div key={h.id} className="card">
            <h3>{h.name}</h3>
            <div>{h.location}</div>
            <div>Rating: {h.rating}</div>
            {isAdmin && (
              <div>
                <button onClick={()=>handleEdit(h)}>Edit</button>
                <button onClick={()=>handleDelete(h)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
