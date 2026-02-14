import React, { useEffect, useState } from 'react';
import api from '../api';

export default function Users(){
  const [items,setItems] = useState([]);

  useEffect(()=>{ load(); }, []);
  async function load(){
    const res = await api.get('/users');
    setItems(res.data || []);
  }

  async function handleCreate(){
    const name = prompt('Name'); if(!name) return;
    const email = prompt('Email')||''; if(!email) return;
    const role = prompt('Role (admin/manager/user)','user')||'user';
    const password = prompt('Password (optional)')||undefined;
    await api.post('/users', { name, email, role, password });
    load();
  }

  async function handleEdit(u){
    const name = prompt('Name', u.name); if(!name) return;
    const email = prompt('Email', u.email)||''; if(!email) return;
    const role = prompt('Role', u.role)||u.role;
    const password = prompt('Password (leave blank to keep)')||undefined;
    await api.put('/users/' + u.id, { name, email, role, password });
    load();
  }

  async function handleDelete(u){
    if(!confirm('Delete user '+u.email+'?')) return;
    await api.delete('/users/' + u.id);
    load();
  }

  return (
    <div className="page">
      <h2>Users</h2>
      <button onClick={handleCreate}>Create User</button>
      <table className="table">
        <thead><tr><th>ID</th><th>Name</th><th>Email</th><th>Role</th><th></th></tr></thead>
        <tbody>
          {items.map(u => (
            <tr key={u.id}><td>{u.id}</td><td>{u.name}</td><td>{u.email}</td><td>{u.role}</td>
              <td>
                <button onClick={()=>handleEdit(u)}>Edit</button>
                <button onClick={()=>handleDelete(u)}>Delete</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
