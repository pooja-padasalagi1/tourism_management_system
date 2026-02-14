import React, { useEffect, useState } from 'react';
import api from '../api';
import { getUser } from '../auth';

export default function Tours(){
  const [items,setItems] = useState([]);
  const user = getUser();
  const isAdmin = user && user.role === 'admin';

  useEffect(()=>{ load(); }, []);
  async function load(){
    const res = await api.get('/tours');
    setItems(res.data || []);
  }

  async function handleCreate(){
    const title = prompt('Title'); if(!title) return;
    const description = prompt('Description')||'';
    const price = parseFloat(prompt('Price')||'0');
    await api.post('/tours', { title, description, price });
    load();
  }

  async function handleEdit(t){
    const title = prompt('Title', t.title); if(!title) return;
    const description = prompt('Description', t.description)||'';
    const price = parseFloat(prompt('Price', String(t.price))||String(t.price));
    await api.put('/tours/' + t.id, { title, description, price });
    load();
  }

  async function handleDelete(t){
    if(!confirm('Delete tour '+t.title+'?')) return;
    await api.delete('/tours/' + t.id);
    load();
  }

  return (
    <div className="page">
      <h2>Tours</h2>
      {isAdmin && <button onClick={handleCreate}>Create Tour</button>}
      <div className="card-list">
        {items.map(t=> (
          <div key={t.id} className="card">
            <h3>{t.title}</h3>
            <div>Price: ${t.price}</div>
            {isAdmin && (
              <div>
                <button onClick={()=>handleEdit(t)}>Edit</button>
                <button onClick={()=>handleDelete(t)}>Delete</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
