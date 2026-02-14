import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout, getToken, getUser } from '../auth';

export default function Header() {
  const navigate = useNavigate();
  const handleLogout = () => {
    logout();
    navigate('/login');
  };
  const logged = !!getToken();
  const user = getUser();
  const isAdmin = user && user.role === 'admin';
  return (
    <header className="site-header">
      <div className="brand">TMS</div>
      <nav>
        {logged && (
          <>
            <Link to="/dashboard">Dashboard</Link>
            <Link to="/hotels">Hotels</Link>
            <Link to="/tours">Tours</Link>
            <Link to="/bookings">Bookings</Link>
            {isAdmin && <Link to="/users">Users</Link>}
            <Link to="/reports">Reports</Link>
            <button onClick={handleLogout}>Logout</button>
          </>
        )}
        {!logged && <Link to="/login">Login</Link>}
      </nav>
    </header>
  );
}
