
import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import QuickAdd from './QuickAdd';
import SearchModal from './SearchModal';

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    const handler = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  return (
    <div className="app-container">
      <nav className="top-nav">
        <Link to="/" className="nav-brand">
          <div style={{width:'32px',height:'32px',background:'#111',color:'#fff',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>TS</div>
          TO START
          </Link>
        
        <div className="nav-pill hidden md:flex">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/today">Today</NavLink>
          <NavLink to="/tasks">Tasks</NavLink>
          <NavLink to="/ideas">Ideas</NavLink>
          <NavLink to="/content">Content</NavLink>
        </div>

        <div className="nav-actions">
          <button className="btn-dark" onClick={() => setSearchOpen(true)}>Search</button>
        </div>
      </nav>

      <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 md:p-8">
        <Outlet />
      </main>
      
      <QuickAdd />
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  );
}


