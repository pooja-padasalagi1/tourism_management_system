import React, { useEffect, useState, useCallback } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
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

const ROLE_CFG = {
  admin:   { color:'#7c3aed', bg:'#ede9fe', border:'#c4b5fd', label:'Admin' },
  manager: { color:'#1a73e8', bg:'#dbeafe', border:'#93c5fd', label:'Manager' },
  user:    { color:'#1e8e3e', bg:'#d1fae5', border:'#6ee7b7', label:'User' },
};

function RoleBadge({ role }) {
  const cfg=ROLE_CFG[role]||ROLE_CFG.user;
  return <span style={{ padding:'4px 10px', borderRadius:'4px', fontSize:'10px', fontWeight:800, letterSpacing:'1px', textTransform:'uppercase', background:cfg.bg, color:cfg.color, border:`1px solid ${cfg.border}` }}>{cfg.label}</span>;
}

function Avatar({ name, email, role }) {
  const initials=(name||email||'U').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase();
  const cfg=ROLE_CFG[role]||ROLE_CFG.user;
  return (
    <div style={{ width:'44px', height:'44px', borderRadius:'50%', background:cfg.bg, border:`2px solid ${cfg.border}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'14px', fontWeight:900, color:cfg.color, flexShrink:0 }}>
      {initials}
    </div>
  );
}

export default function Users() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [sortBy, setSortBy] = useState('name');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({ name:'', email:'', role:'user', password:'' });
  const [viewUser, setViewUser] = useState(null);
  const [selected, setSelected] = useState(new Set());
  const [viewMode, setViewMode] = useState('grid'); // grid | table

  const load = useCallback(async () => {
    try { setLoading(true); const r=await api.get('/users'); setItems(r.data||[]); }
    catch(e) { toast('Failed to load users','error'); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { load(); }, [load]);

  const filtered = items
    .filter(u => roleFilter==='all' || u.role===roleFilter)
    .filter(u => {
      const s=search.toLowerCase();
      return !s || (u.name||'').toLowerCase().includes(s) || (u.email||'').toLowerCase().includes(s);
    })
    .sort((a,b) => sortBy==='email' ? a.email.localeCompare(b.email) : sortBy==='role' ? a.role.localeCompare(b.role) : (a.name||'').localeCompare(b.name||''));

  function openCreate() { setEditingItem(null); setFormData({name:'',email:'',role:'user',password:''}); setShowModal(true); }
  function openEdit(u) { setEditingItem(u); setFormData({name:u.name,email:u.email,role:u.role,password:''}); setShowModal(true); }

  async function handleSave() {
    if (!formData.name.trim()||!formData.email.trim()) { toast('Name and email are required','error'); return; }
    if (!editingItem && !formData.password.trim()) { toast('Password is required for new users','error'); return; }
    setSaving(true);
    try {
      if (editingItem) { await api.put('/users/'+editingItem.id, formData); toast('User updated'); }
      else { await api.post('/users', formData); toast('User created'); }
      load(); setShowModal(false); setEditingItem(null);
    } catch(e) { toast(e.response?.data?.error||'Error saving user','error'); }
    finally { setSaving(false); }
  }

  async function handleDelete(u) {
    if (!window.confirm(`Delete user "${u.email}"?`)) return;
    try { await api.delete('/users/'+u.id); toast('User deleted'); load(); setSelected(s=>{s.delete(u.id);return new Set(s);}); }
    catch(e) { toast('Error deleting user','error'); }
  }

  async function bulkDelete() {
    if (!selected.size) return;
    if (!window.confirm(`Delete ${selected.size} user(s)?`)) return;
    try { await Promise.all([...selected].map(id=>api.delete('/users/'+id))); toast(`Deleted ${selected.size} users`); setSelected(new Set()); load(); }
    catch(e) { toast('Error deleting users','error'); }
  }

  const toggleSelect = id => setSelected(s=>{const n=new Set(s);n.has(id)?n.delete(id):n.add(id);return n;});
  const toggleAll = () => setSelected(selected.size===filtered.length?new Set():new Set(filtered.map(u=>u.id)));

  const stats = {
    total:items.length, admins:items.filter(u=>u.role==='admin').length,
    managers:items.filter(u=>u.role==='manager').length, users:items.filter(u=>u.role==='user').length,
  };

  const infoBox = (label, val) => (
    <div>
      <label>{label}</label>
      <div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', color:'#1a2332', fontSize:'14px', fontWeight:600, border:'1px solid #c5d8f5' }}>{val}</div>
    </div>
  );

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:'24px', flexWrap:'wrap', gap:'16px' }}>
        <div>
          <h2 style={{ margin:0 }}>Users</h2>
          <p style={{ margin:'6px 0 0', color:'#5f6b7a', fontSize:'13px' }}>{items.length} registered users</p>
        </div>
        <div style={{ display:'flex', gap:'8px', flexWrap:'wrap' }}>
          <button onClick={()=>exportCSV(filtered.map(u=>({ID:u.id,Name:u.name,Email:u.email,Role:u.role})),'users.csv')}
            style={{ padding:'9px 16px', borderRadius:'7px', background:'#e8f0fe', color:'#1a73e8', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
            ↓ Export CSV
          </button>
          {selected.size>0 && (
            <button onClick={bulkDelete} style={{ padding:'9px 16px', borderRadius:'7px', background:'#fde8e8', color:'#d93025', border:'1px solid #fca5a5', fontWeight:700, fontSize:'12px', cursor:'pointer', letterSpacing:'.5px', textTransform:'uppercase', boxShadow:'none' }}>
              Delete {selected.size}
            </button>
          )}
          <button onClick={()=>setViewMode(v=>v==='grid'?'table':'grid')} style={{ padding:'9px 14px', borderRadius:'7px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>
            {viewMode==='grid'?'Table View':'Grid View'}
          </button>
          <button className="btn" onClick={openCreate} style={{ padding:'9px 18px', fontSize:'12px' }}>+ Add User</button>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))', gap:'12px', marginBottom:'20px' }}>
        {[
          {label:'Total',value:stats.total,color:'#1a73e8'},
          {label:'Admins',value:stats.admins,color:'#7c3aed'},
          {label:'Managers',value:stats.managers,color:'#1a73e8'},
          {label:'Users',value:stats.users,color:'#1e8e3e'},
        ].map(s=>(
          <div key={s.label} className="card" style={{ padding:'14px', textAlign:'center', borderLeft:`3px solid ${s.color}`, margin:0, cursor:'pointer' }}
            onClick={()=>setRoleFilter(s.label.toLowerCase()==='total'?'all':s.label.toLowerCase().replace('s',''))}>
            <div style={{ fontSize:'22px', fontWeight:900, color:s.color }}>{s.value}</div>
            <div style={{ fontSize:'11px', color:'#5f6b7a', fontWeight:700, textTransform:'uppercase', letterSpacing:'1px', marginTop:'3px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div style={{ display:'flex', gap:'10px', marginBottom:'20px', flexWrap:'wrap', alignItems:'center', padding:'14px 16px', background:'#f0f7ff', borderRadius:'10px', border:'1px solid #c5d8f5' }}>
        <input type="text" placeholder="Search by name or email..." value={search} onChange={e=>setSearch(e.target.value)} style={{ flex:1, minWidth:'200px' }} />
        <select value={roleFilter} onChange={e=>setRoleFilter(e.target.value)} style={{ minWidth:'140px' }}>
          <option value="all">All Roles</option>
          <option value="admin">Admin</option>
          <option value="manager">Manager</option>
          <option value="user">User</option>
        </select>
        <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{ minWidth:'140px' }}>
          <option value="name">Sort: Name</option>
          <option value="email">Sort: Email</option>
          <option value="role">Sort: Role</option>
        </select>
        {(search||roleFilter!=='all') && (
          <button onClick={()=>{setSearch('');setRoleFilter('all');}} style={{ padding:'9px 14px', borderRadius:'7px', background:'#fff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'11px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Clear</button>
        )}
        <span style={{ fontSize:'12px', color:'#5f6b7a', fontWeight:600 }}>{filtered.length} result{filtered.length!==1?'s':''}</span>
      </div>

      {loading ? (
        <div style={{ display:'flex', justifyContent:'center', padding:'60px 0' }}><Spinner /></div>
      ) : filtered.length===0 ? (
        <EmptyState icon="👥" title={search||roleFilter!=='all'?'No users match':'No users yet'} description={search||roleFilter!=='all'?'Try different filters.':'Add your first user.'} action={!search&&roleFilter==='all'&&<button className="btn" onClick={openCreate}>Add User</button>} />
      ) : viewMode==='table' ? (
        /* Table View */
        <div className="card" style={{ padding:0, overflow:'hidden' }}>
          <table className="table" style={{ margin:0 }}>
            <thead>
              <tr>
                <th><input type="checkbox" checked={selected.size===filtered.length&&filtered.length>0} onChange={toggleAll} style={{ width:'14px', height:'14px', cursor:'pointer' }} /></th>
                <th>Name</th><th>Email</th><th>Role</th><th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(u=>(
                <tr key={u.id}>
                  <td><input type="checkbox" checked={selected.has(u.id)} onChange={()=>toggleSelect(u.id)} style={{ width:'14px', height:'14px', cursor:'pointer' }} /></td>
                  <td style={{ fontWeight:700, color:'#1a2332' }}>{u.name||'—'}</td>
                  <td style={{ color:'#5f6b7a' }}>{u.email}</td>
                  <td><RoleBadge role={u.role} /></td>
                  <td>
                    <div style={{ display:'flex', gap:'6px' }}>
                      <button onClick={()=>setViewUser(u)} style={{ padding:'5px 10px', borderRadius:'5px', background:'#e8f0fe', color:'#1a73e8', border:'none', fontWeight:700, fontSize:'10px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>View</button>
                      <button onClick={()=>openEdit(u)} style={{ padding:'5px 10px', borderRadius:'5px', background:'#fef3c7', color:'#d97706', border:'none', fontWeight:700, fontSize:'10px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Edit</button>
                      <button onClick={()=>handleDelete(u)} style={{ padding:'5px 10px', borderRadius:'5px', background:'#fee2e2', color:'#d93025', border:'none', fontWeight:700, fontSize:'10px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        /* Grid View */
        <>
          <div style={{ display:'flex', alignItems:'center', gap:'10px', marginBottom:'12px' }}>
            <input type="checkbox" checked={selected.size===filtered.length&&filtered.length>0} onChange={toggleAll} style={{ width:'16px', height:'16px', cursor:'pointer' }} />
            <span style={{ fontSize:'12px', color:'#5f6b7a', fontWeight:600 }}>{selected.size>0?`${selected.size} selected`:'Select all'}</span>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(280px,1fr))', gap:'16px' }}>
            {filtered.map((u,idx)=>{
              const cfg=ROLE_CFG[u.role]||ROLE_CFG.user;
              return (
                <div key={u.id} className="card" style={{ padding:'20px', animation:`slideInUp .3s ease ${idx*.04}s backwards`, position:'relative', borderLeft:selected.has(u.id)?'3px solid #1a73e8':`3px solid ${cfg.color}` }}
                  onMouseEnter={e=>e.currentTarget.style.transform='translateY(-4px)'}
                  onMouseLeave={e=>e.currentTarget.style.transform='translateY(0)'}>
                  <input type="checkbox" checked={selected.has(u.id)} onChange={()=>toggleSelect(u.id)} style={{ position:'absolute', top:'14px', right:'14px', width:'16px', height:'16px', cursor:'pointer' }} />
                  <div style={{ display:'flex', gap:'12px', alignItems:'center', marginBottom:'14px' }}>
                    <Avatar name={u.name} email={u.email} role={u.role} />
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontWeight:800, fontSize:'14px', color:'#1a2332', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{u.name||'—'}</div>
                      <div style={{ fontSize:'12px', color:'#5f6b7a', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', marginTop:'2px' }}>{u.email}</div>
                    </div>
                  </div>
                  <div style={{ marginBottom:'14px' }}><RoleBadge role={u.role} /></div>
                  <div style={{ display:'flex', gap:'6px', paddingTop:'12px', borderTop:'1px solid #e8f0fe' }}>
                    <button onClick={()=>setViewUser(u)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#e8f0fe', color:'#1a73e8', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>View</button>
                    <button onClick={()=>openEdit(u)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#fef3c7', color:'#d97706', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>Edit</button>
                    <button onClick={()=>handleDelete(u)} style={{ flex:1, padding:'7px', borderRadius:'6px', background:'#fee2e2', color:'#d93025', border:'none', fontWeight:700, fontSize:'11px', cursor:'pointer', textTransform:'uppercase', letterSpacing:'.5px', boxShadow:'none' }}>Delete</button>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}

      {/* View Modal */}
      <Modal isOpen={!!viewUser} title="User Details" onClose={()=>setViewUser(null)}>
        {viewUser && (
          <div style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'340px' }}>
            <div style={{ display:'flex', gap:'14px', alignItems:'center', padding:'14px', background:'#f0f7ff', borderRadius:'10px', border:'1px solid #c5d8f5' }}>
              <Avatar name={viewUser.name} email={viewUser.email} role={viewUser.role} />
              <div>
                <div style={{ fontWeight:800, fontSize:'16px', color:'#1a2332' }}>{viewUser.name||'—'}</div>
                <div style={{ fontSize:'13px', color:'#5f6b7a', marginTop:'2px' }}>{viewUser.email}</div>
                <div style={{ marginTop:'6px' }}><RoleBadge role={viewUser.role} /></div>
              </div>
            </div>
            {infoBox('User ID', `#${viewUser.id}`)}
            <div style={{ display:'flex', gap:'8px', justifyContent:'flex-end', marginTop:'8px' }}>
              <button onClick={()=>setViewUser(null)} style={{ padding:'9px 18px', borderRadius:'7px', background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', fontWeight:700, fontSize:'12px', cursor:'pointer', boxShadow:'none', textTransform:'uppercase' }}>Close</button>
              <button className="btn" onClick={()=>{setViewUser(null);openEdit(viewUser);}}>Edit</button>
            </div>
          </div>
        )}
      </Modal>

      {/* Create/Edit Modal */}
      <Modal isOpen={showModal} title={editingItem?'Edit User':'Add User'} onClose={()=>{setShowModal(false);setEditingItem(null);}}>
        <form onSubmit={e=>{e.preventDefault();handleSave();}} style={{ display:'flex', flexDirection:'column', gap:'14px', minWidth:'340px' }}>
          <div><label>Full Name *</label><input type="text" value={formData.name} onChange={e=>setFormData({...formData,name:e.target.value})} placeholder="John Doe" required autoFocus /></div>
          <div><label>Email Address *</label><input type="email" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})} placeholder="john@example.com" required /></div>
          <div>
            <label>Role</label>
            <select value={formData.role} onChange={e=>setFormData({...formData,role:e.target.value})}>
              <option value="user">User</option>
              <option value="manager">Manager</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div><label>{editingItem?'New Password (leave blank to keep)':'Password *'}</label><input type="password" value={formData.password} onChange={e=>setFormData({...formData,password:e.target.value})} placeholder={editingItem?'Leave blank to keep current':'Min 6 characters'} required={!editingItem} /></div>
          <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
            <button type="submit" style={{ flex:1 }} disabled={saving}>{saving?'Saving…':editingItem?'Update User':'Create User'}</button>
            <button type="button" onClick={()=>{setShowModal(false);setEditingItem(null);}} style={{ flex:1, background:'#f0f7ff', color:'#5f6b7a', border:'1px solid #c5d8f5', boxShadow:'none' }}>Cancel</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

function infoBox(label, val) {
  return (
    <div>
      <label>{label}</label>
      <div style={{ padding:'10px 14px', background:'#f0f7ff', borderRadius:'8px', color:'#1a2332', fontSize:'14px', fontWeight:600, border:'1px solid #c5d8f5' }}>{val}</div>
    </div>
  );
}
