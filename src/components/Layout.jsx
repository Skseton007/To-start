import React, { useEffect, useRef, useState } from 'react';
import { Outlet, NavLink, Link, useLocation } from 'react-router-dom';
import QuickAdd from './QuickAdd';
import SearchModal from './SearchModal';
import NotificationToggle from './NotificationToggle';
import NotificationManager from './NotificationManager';
import { useStore, useSettings } from '../store/useStore';
import { useToast } from './Toast';
import {
  Home, Target, CheckCircle2, Lightbulb, Video, Search, LayoutGrid,
  BookOpen, FileText, CalendarDays, BarChart3, Settings as SettingsIcon, Moon, Sun
} from 'lucide-react';

const MORE_LINKS = [
  { to: '/notebooks', label: 'Notebooks', Icon: BookOpen },
  { to: '/scripts', label: 'Scripts', Icon: FileText },
  { to: '/calendar', label: 'Calendar', Icon: CalendarDays },
  { to: '/history', label: 'History', Icon: BarChart3 },
  { to: '/settings', label: 'Settings', Icon: SettingsIcon },
];

// Tilts any .card-3d toward the pointer. One delegated listener for the whole app,
// only for a real mouse, and never when the OS asks for reduced motion.
function useCardTilt() {
  useEffect(() => {
    const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)');
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let current = null;
    let frame = 0;

    const reset = (el) => {
      if (!el) return;
      el.classList.remove('is-tilting');
      el.style.removeProperty('--rx');
      el.style.removeProperty('--ry');
    };

    const onMove = (e) => {
      if (!finePointer.matches || reduceMotion.matches) return;
      const el = e.target.closest?.('.card-3d') || null;
      if (el !== current) {
        reset(current);
        current = el;
      }
      if (!el) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const r = el.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width;
        const py = (e.clientY - r.top) / r.height;
        // Wide cards tilt less so the far edge doesn't swing too much
        const max = Math.min(6, 1800 / Math.max(r.width, 300));
        el.classList.add('is-tilting');
        el.style.setProperty('--ry', `${((px - 0.5) * 2 * max).toFixed(2)}deg`);
        el.style.setProperty('--rx', `${(-(py - 0.5) * 2 * max).toFixed(2)}deg`);
        el.style.setProperty('--mx', `${(px * 100).toFixed(1)}%`);
        el.style.setProperty('--my', `${(py * 100).toFixed(1)}%`);
      });
    };

    const onLeave = () => { reset(current); current = null; };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onLeave);
    window.addEventListener('blur', onLeave);
    return () => {
      cancelAnimationFrame(frame);
      document.removeEventListener('pointermove', onMove);
      document.documentElement.removeEventListener('pointerleave', onLeave);
      window.removeEventListener('blur', onLeave);
    };
  }, []);
}

function MoreMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const location = useLocation();
  const { settings, updateSettings } = useSettings();
  const isDark = settings.theme === 'dark';

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => { if (!ref.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const isMoreActive = MORE_LINKS.some(l => location.pathname.startsWith(l.to));

  return (
    <div className="relative" ref={ref}>
      <button
        className={`icon-btn ${isMoreActive ? 'text-[var(--text-main)] bg-[var(--bg-hover)]' : ''}`}
        onClick={() => setOpen(o => !o)}
        aria-label="More pages"
        aria-expanded={open}
        title="More"
      >
        <LayoutGrid size={20} />
      </button>
      {open && (
        <div className="more-menu" role="menu">
          {MORE_LINKS.map(({ to, label, Icon }) => (
            <NavLink key={to} to={to} role="menuitem" onClick={() => setOpen(false)}>
              <Icon size={18} /> {label}
            </NavLink>
          ))}
          <div className="my-1 border-t border-[var(--border)]" />
          <a
            href="#"
            role="menuitem"
            onClick={(e) => { e.preventDefault(); updateSettings({ theme: isDark ? 'light' : 'dark' }); }}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />} {isDark ? 'Light mode' : 'Dark mode'}
          </a>
        </div>
      )}
    </div>
  );
}

export default function Layout() {
  const [searchOpen, setSearchOpen] = useState(false);
  const { store } = useStore();
  const toast = useToast();
  const location = useLocation();

  useCardTilt();

  // Tell the user when a change could not be saved (e.g. storage full)
  useEffect(() => store.subscribeErrors((message) => toast.error(message)), [store, toast]);

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
            alt="TO START logo"
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

        <div className="nav-actions flex items-center gap-1 md:gap-2">
          <NotificationToggle />
          <button className="btn-dark hidden md:inline-flex" onClick={() => setSearchOpen(true)}>
            <Search size={16} /> Search
          </button>
          <button className="icon-btn md:hidden" onClick={() => setSearchOpen(true)} aria-label="Search">
            <Search size={20} />
          </button>
          <MoreMenu />
        </div>
      </nav>

      {/* key restarts the page entrance animation on every navigation */}
      <main key={location.pathname} className="flex-1 max-w-[1200px] w-full mx-auto px-4 pt-4 pb-28 md:px-8 md:pt-8 md:pb-10 animate-fade-in">
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
