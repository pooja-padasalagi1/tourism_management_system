import React, { useEffect, useState } from 'react';
import api from '../api';
import Modal from '../components/Modal';
import EmptyState from '../components/EmptyState';
import Spinner from '../components/Spinner';

const RoleBadge = ({ role }) => {
  const roleConfig = {
    admin: { 
      gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', 
      icon: '👑', 
      label: 'Admin',
      shadow: '0 4px 12px rgba(139,92,246,0.4)'
    },
    manager: { 
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', 
      icon: '📋', 
      label: 'Manager',
      shadow: '0 4px 12px rgba(59,130,246,0.4)'
    },
    user: { 
      gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', 
      icon: '👤', 
      label: 'User',
      shadow: '0 4px 12px rgba(16,185,129,0.4)'
    }
  };
  const config = roleConfig[role] || roleConfig.user;
  
  return (
    <span style={{
      background: config.gradient,
      color: '#fff',
      padding: '8px 16px',
      borderRadius: '24px',
      fontSize: '12px',
      fontWeight: 800,
      display: 'inline-flex',
      alignItems: 'center',
      gap: '6px',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      boxShadow: config.shadow,
      border: '2px solid rgba(255,255,255,0.3)',
      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }}>
      <span style={{ fontSize: '14px' }}>{config.icon}</span>
      {config.label}
    </span>
  );
};

export default function Users(){
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', role: 'user', password: '' });

  useEffect(() => { load(); }, []);

  async function load(){
    try {
      setLoading(true);
      const res = await api.get('/users');
      setItems(res.data || []);
    } catch(e) {
      console.error('Error loading users:', e);
    } finally {
      setLoading(false);
    }
  }

  const filteredItems = items
    .filter(u => roleFilter === 'all' || u.role === roleFilter)
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()));

  function openCreateModal() {
    setEditingItem(null);
    setFormData({ name: '', email: '', role: 'user', password: '' });
    setShowModal(true);
  }

  function openEditModal(u) {
    setEditingItem(u);
    setFormData({ name: u.name, email: u.email, role: u.role, password: '' });
    setShowModal(true);
  }

  async function handleSave() {
    if (!formData.name.trim() || !formData.email.trim()) {
      alert('Name and email are required');
      return;
    }
    try {
      if (editingItem) {
        await api.put('/users/' + editingItem.id, formData);
      } else {
        await api.post('/users', formData);
      }
      load();
      setShowModal(false);
    } catch(e) {
      alert('Error saving user');
    }
  }

  async function handleDelete(u){
    if (!confirm('Delete user ' + u.email + '?')) return;
    try {
      await api.delete('/users/' + u.id);
      load();
    } catch(e) {
      alert('Error deleting user');
    }
  }

  const stats = {
    total: items.length,
    admins: items.filter(u => u.role === 'admin').length,
    managers: items.filter(u => u.role === 'manager').length,
    users: items.filter(u => u.role === 'user').length
  };

  return (
    <div className="page">
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'space-between',
        marginBottom: '40px',
        flexWrap: 'wrap',
        gap: '20px'
      }}>
        <div>
          <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span style={{ 
              fontSize: '42px',
              filter: 'drop-shadow(0 4px 8px rgba(99,102,241,0.3))'
            }}>👥</span>
            <span>Users</span>
          </h2>
          <p style={{ 
            margin: '8px 0 0 0', 
            color: 'var(--muted)', 
            fontSize: '15px',
            fontWeight: 500
          }}>
            Manage user accounts and permissions
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="btn"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '14px 28px',
            fontSize: '14px'
          }}
        >
          <span style={{ fontSize: '18px' }}>✨</span>
          <span>Add User</span>
        </button>
      </div>
      
      {/* Stats Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '28px 20px',
          background: 'linear-gradient(135deg, rgba(99,102,241,0.08) 0%, rgba(99,102,241,0.02) 100%)',
          border: '2px solid rgba(99,102,241,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '32px',
            opacity: 0.2
          }}>👥</div>
          <div style={{ 
            fontSize: '42px', 
            fontWeight: 900,
            background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px'
          }}>
            {stats.total}
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: 'var(--muted)', 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Total Users
          </div>
        </div>

        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '28px 20px',
          background: 'linear-gradient(135deg, rgba(139,92,246,0.08) 0%, rgba(139,92,246,0.02) 100%)',
          border: '2px solid rgba(139,92,246,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '32px',
            opacity: 0.2
          }}>👑</div>
          <div style={{ 
            fontSize: '42px', 
            fontWeight: 900,
            background: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px'
          }}>
            {stats.admins}
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: 'var(--muted)', 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Admins
          </div>
        </div>

        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '28px 20px',
          background: 'linear-gradient(135deg, rgba(59,130,246,0.08) 0%, rgba(59,130,246,0.02) 100%)',
          border: '2px solid rgba(59,130,246,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '32px',
            opacity: 0.2
          }}>📋</div>
          <div style={{ 
            fontSize: '42px', 
            fontWeight: 900,
            background: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px'
          }}>
            {stats.managers}
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: 'var(--muted)', 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Managers
          </div>
        </div>

        <div className="card" style={{ 
          textAlign: 'center', 
          padding: '28px 20px',
          background: 'linear-gradient(135deg, rgba(16,185,129,0.08) 0%, rgba(16,185,129,0.02) 100%)',
          border: '2px solid rgba(16,185,129,0.2)',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute',
            top: '10px',
            right: '10px',
            fontSize: '32px',
            opacity: 0.2
          }}>👤</div>
          <div style={{ 
            fontSize: '42px', 
            fontWeight: 900,
            background: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            marginBottom: '8px'
          }}>
            {stats.users}
          </div>
          <div style={{ 
            fontSize: '13px', 
            color: 'var(--muted)', 
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            Regular Users
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ 
        display: 'flex', 
        gap: '16px', 
        marginBottom: '32px', 
        flexWrap: 'wrap', 
        alignItems: 'center',
        padding: '20px',
        background: 'linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0.7) 100%)',
        borderRadius: '16px',
        border: '2px solid rgba(99,102,241,0.1)',
        boxShadow: '0 4px 20px rgba(99,102,241,0.08)'
      }}>
        <input
          type="text"
          placeholder="🔍 Search by name or email..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            minWidth: '250px',
            padding: '14px 20px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#8b5cf6';
            e.target.style.boxShadow = '0 0 0 4px rgba(139,92,246,0.15), 0 4px 12px rgba(0,0,0,0.08)';
            e.target.style.transform = 'translateY(-2px)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
            e.target.style.transform = 'translateY(0)';
          }}
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          style={{
            padding: '14px 20px',
            border: '2px solid #e2e8f0',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            background: '#fff',
            boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
            minWidth: '160px'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#8b5cf6';
            e.target.style.boxShadow = '0 0 0 4px rgba(139,92,246,0.15), 0 4px 12px rgba(0,0,0,0.08)';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e2e8f0';
            e.target.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
          }}
        >
          <option value="all">👥 All Roles</option>
          <option value="admin">👑 Admin</option>
          <option value="manager">📋 Manager</option>
          <option value="user">👤 User</option>
        </select>
      </div>

      {loading ? (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '400px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.5) 0%, rgba(255,255,255,0.3) 100%)',
          borderRadius: '20px',
          border: '2px dashed rgba(99,102,241,0.2)'
        }}>
          <div style={{ textAlign: 'center' }}>
            <Spinner size="md" />
            <p style={{ 
              marginTop: '20px', 
              color: 'var(--muted)',
              fontSize: '16px',
              fontWeight: 600
            }}>
              Loading users...
            </p>
          </div>
        </div>
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon="👥"
          title={search || roleFilter !== 'all' ? "No users found" : "No users yet"}
          description={search || roleFilter !== 'all' ? "Try adjusting your search or filters." : "Start by creating your first user!"}
          action={!search && roleFilter === 'all' && (
            <button
              onClick={openCreateModal}
              className="btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                margin: '0 auto'
              }}
            >
              <span style={{ fontSize: '18px' }}>✨</span>
              <span>Create First User</span>
            </button>
          )}
        />
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '24px'
        }}>
          {filteredItems.map((u, idx) => {
            const roleColors = {
              admin: { gradient: 'linear-gradient(135deg, #8b5cf6 0%, #a855f7 100%)', border: '#8b5cf6' },
              manager: { gradient: 'linear-gradient(135deg, #3b82f6 0%, #60a5fa 100%)', border: '#3b82f6' },
              user: { gradient: 'linear-gradient(135deg, #10b981 0%, #34d399 100%)', border: '#10b981' }
            };
            const roleColor = roleColors[u.role] || roleColors.user;
            
            return (
              <div 
                key={u.id} 
                className="card" 
                style={{
                  animation: `slideInUp 0.5s ease ${idx * 0.08}s backwards`,
                  position: 'relative',
                  overflow: 'hidden',
                  borderLeft: `5px solid ${roleColor.border}`,
                  transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-12px) scale(1.02)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0) scale(1)';
                }}
              >
                <div style={{ display: 'flex', gap: '16px', alignItems: 'flex-start', marginBottom: '20px' }}>
                  <div style={{
                    width: '64px',
                    height: '64px',
                    borderRadius: '50%',
                    background: roleColor.gradient,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '24px',
                    fontWeight: 900,
                    color: '#fff',
                    boxShadow: '0 8px 20px rgba(0,0,0,0.15)',
                    border: '3px solid rgba(255,255,255,0.3)',
                    flexShrink: 0
                  }}>
                    {(u.name || u.email || '').split(' ').map(s=>s[0]).slice(0,2).join('').toUpperCase()}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ 
                      fontWeight: 800, 
                      color: 'var(--text)', 
                      fontSize: '18px',
                      marginBottom: '6px',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      {u.name || '—'}
                    </div>
                    <div style={{ 
                      fontSize: '13px', 
                      color: 'var(--muted)', 
                      marginBottom: '8px',
                      fontWeight: 600,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap'
                    }}>
                      📧 {u.email}
                    </div>
                    <div style={{ 
                      fontSize: '11px', 
                      color: 'var(--muted)',
                      fontWeight: 700,
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px'
                    }}>
                      ID: <span style={{ color: 'var(--text)' }}>{u.id}</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <RoleBadge role={u.role} />
                </div>

                <div style={{ 
                  display: 'flex', 
                  gap: '10px',
                  paddingTop: '16px',
                  borderTop: '2px solid rgba(99,102,241,0.1)'
                }}>
                  <button
                    onClick={() => openEditModal(u)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(99,102,241,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(99,102,241,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(99,102,241,0.3)';
                    }}
                  >
                    <span>✏️</span> Edit
                  </button>
                  <button
                    onClick={() => handleDelete(u)}
                    style={{
                      flex: 1,
                      padding: '12px 16px',
                      background: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 100%)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '10px',
                      cursor: 'pointer',
                      fontSize: '14px',
                      fontWeight: 700,
                      transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                      boxShadow: '0 4px 12px rgba(244,63,94,0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = 'translateY(-2px)';
                      e.target.style.boxShadow = '0 8px 20px rgba(244,63,94,0.4)';
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = 'translateY(0)';
                      e.target.style.boxShadow = '0 4px 12px rgba(244,63,94,0.3)';
                    }}
                  >
                    <span>🗑️</span> Delete
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Modal
        isOpen={showModal}
        title={editingItem ? '✏️ Edit User' : '✨ Add New User'}
        onClose={() => setShowModal(false)}
      >
        <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 700, 
              fontSize: '14px',
              color: 'var(--text)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              👤 Full Name *
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter full name"
              required
              style={{
                width: '100%',
                padding: '14px 18px',
                fontSize: '14px',
                fontWeight: 600
              }}
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 700, 
              fontSize: '14px',
              color: 'var(--text)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              📧 Email Address *
            </label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Enter email address"
              required
              style={{
                width: '100%',
                padding: '14px 18px',
                fontSize: '14px',
                fontWeight: 600
              }}
            />
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 700, 
              fontSize: '14px',
              color: 'var(--text)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              🎭 Role
            </label>
            <select
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              style={{
                width: '100%',
                padding: '14px 18px',
                fontSize: '14px',
                fontWeight: 600
              }}
            >
              <option value="user">👤 User</option>
              <option value="manager">📋 Manager</option>
              <option value="admin">👑 Admin</option>
            </select>
          </div>
          <div>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 700, 
              fontSize: '14px',
              color: 'var(--text)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}>
              🔒 {editingItem ? 'New Password (optional)' : 'Password *'}
            </label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              placeholder={editingItem ? 'Leave blank to keep current' : 'Enter password'}
              required={!editingItem}
              style={{
                width: '100%',
                padding: '14px 18px',
                fontSize: '14px',
                fontWeight: 600
              }}
            />
          </div>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
            <button
              type="submit"
              className="btn"
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px'
              }}
            >
              <span>💾</span> Save User
            </button>
            <button
              type="button"
              onClick={() => setShowModal(false)}
              style={{
                flex: 1,
                padding: '14px 20px',
                background: 'linear-gradient(135deg, #e5e7eb 0%, #d1d5db 100%)',
                color: '#374151',
                border: 'none',
                borderRadius: '10px',
                fontWeight: 700,
                cursor: 'pointer',
                fontSize: '14px',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                textTransform: 'uppercase',
                letterSpacing: '0.5px'
              }}
              onMouseEnter={(e) => {
                e.target.style.transform = 'translateY(-2px)';
                e.target.style.boxShadow = '0 8px 20px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.target.style.transform = 'translateY(0)';
                e.target.style.boxShadow = 'none';
              }}
            >
              Cancel
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
