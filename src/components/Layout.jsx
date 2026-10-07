import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, Link } from 'react-router-dom';
import QuickAdd from './QuickAdd';
import SearchModal from './SearchModal';
import NotificationToggle from './NotificationToggle';
import NotificationManager from './NotificationManager';
import { Home, Target, CheckCircle2, Lightbulb, Video, Search } from 'lucide-react';

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
          <img 
            src={import.meta.env.BASE_URL + 'logo.jpg'} 
            alt="Logo" 
            className="brand-logo"
          />
          <span className="brand-text hidden sm:inline-block">TO START</span>
        </Link>
        
        <div className="nav-pill hidden md:flex">
          <NavLink to="/" end>Dashboard</NavLink>
          <NavLink to="/today">Today</NavLink>
          <NavLink to="/tasks">Tasks</NavLink>
          <NavLink to="/ideas">Ideas</NavLink>
          <NavLink to="/content">Content</NavLink>
        </div>

        <div className="nav-actions flex items-center gap-2">
          <NotificationToggle />
          <button className="btn-dark hidden md:inline-flex" onClick={() => setSearchOpen(true)}>Search</button>
          <button className="md:hidden p-2 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 transition-colors" onClick={() => setSearchOpen(true)}>
             <Search size={20} />
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-[1200px] w-full mx-auto p-4 pb-24 md:p-8 md:pb-8">
        <Outlet />
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav md:hidden">
        <NavLink to="/" end className="bottom-nav-item">
          <Home size={20} className="mb-1" />
          <span>Home</span>
        </NavLink>
        <NavLink to="/today" className="bottom-nav-item">
          <Target size={20} className="mb-1" />
          <span>Today</span>
        </NavLink>
        <NavLink to="/tasks" className="bottom-nav-item">
          <CheckCircle2 size={20} className="mb-1" />
          <span>Tasks</span>
        </NavLink>
        <NavLink to="/ideas" className="bottom-nav-item">
          <Lightbulb size={20} className="mb-1" />
          <span>Ideas</span>
        </NavLink>
        <NavLink to="/content" className="bottom-nav-item">
          <Video size={20} className="mb-1" />
          <span>Content</span>
        </NavLink>
      </nav>
      
      <NotificationManager />
      <QuickAdd />
      {searchOpen && <SearchModal onClose={() => setSearchOpen(false)} />}
    </div>
  );
}
