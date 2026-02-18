import React from 'react';

export default function Footer(){
  return (
    <footer className="site-footer">
      <div>
        <p style={{ margin: '0 0 8px 0' }}>© {new Date().getFullYear()} Tourism Management System</p>
        <p style={{ margin: 0, fontSize: '12px', color: '#9ca3af' }}>Built with ❤️ for seamless tourism management</p>
      </div>
    </footer>
  );
}
