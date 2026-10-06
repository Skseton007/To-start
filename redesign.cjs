const fs = require('fs');

const css = `
@import "tailwindcss";
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;1,400;1,600&display=swap');

:root {
  --bg-page: #fbfbfd;
  --bg-card: #ffffff;
  --text-main: #111111;
  --text-muted: #737373;
  --text-light: #a3a3a3;
  
  --glass-bg: rgba(255, 255, 255, 0.7);
  --glass-border: rgba(255, 255, 255, 0.8);
  --glass-shadow: 0 20px 40px rgba(0,0,0,0.06), inset 0 0 0 1px rgba(255,255,255,1);
  
  --font-serif: 'Playfair Display', serif;
  --font-sans: 'Inter', sans-serif;
}

body {
  background-color: var(--bg-page);
  color: var(--text-main);
  font-family: var(--font-sans);
  -webkit-font-smoothing: antialiased;
  background-image: 
    radial-gradient(circle at 10% 40%, rgba(99, 102, 241, 0.04) 0%, transparent 60%),
    radial-gradient(circle at 90% 60%, rgba(236, 72, 153, 0.04) 0%, transparent 60%);
  background-attachment: fixed;
}

/* OVERRIDE ALL TAILWIND DARK MODES AND BLACK/WHITE STYLES FROM SUBAGENTS */
.text-white { color: var(--text-main) !important; }
.bg-gray-900, .bg-gray-800 { background: var(--bg-card) !important; color: var(--text-main) !important; border: 1px solid #eaeaea !important; }
.dark\\:bg-gray-900, .dark\\:bg-gray-800 { background: var(--bg-card) !important; }
.dark\\:text-white { color: var(--text-main) !important; }
.text-gray-400 { color: var(--text-muted) !important; }
.border-gray-800, .dark\\:border-gray-800 { border-color: #eaeaea !important; }
.card, .glass-panel { background: var(--bg-card) !important; border: 1px solid #eaeaea !important; box-shadow: 0 4px 20px rgba(0,0,0,0.03) !important; }

/* TOP NAV PILL */
.app-container { min-height: 100vh; display: flex; flex-direction: column; }
.top-nav {
  position: sticky; top: 0; z-index: 100; padding: 20px 40px;
  display: flex; justify-content: space-between; align-items: center;
}
.nav-brand { font-family: var(--font-sans); font-weight: 800; font-size: 20px; letter-spacing: -0.5px; display: flex; align-items: center; gap: 8px; }
.nav-pill {
  display: flex; background: #f0f0f0; border-radius: 100px; padding: 4px; gap: 4px;
}
.nav-pill a {
  padding: 8px 24px; border-radius: 100px; color: #555; font-size: 13px; font-weight: 500; text-decoration: none; transition: 0.3s;
}
.nav-pill a.active { background: #fff; color: #000; box-shadow: 0 2px 10px rgba(0,0,0,0.08); font-weight: 600; }
.btn-dark { background: #111; color: white !important; padding: 10px 24px; border-radius: 100px; font-size: 14px; font-weight: 500; border: none; cursor: pointer; transition: 0.3s; display: inline-flex; justify-content: center;}
.btn-dark:hover { background: #000; transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.1); }
.btn-outline { background: white; color: #111; padding: 10px 24px; border-radius: 100px; font-size: 14px; font-weight: 500; border: 1px solid #e5e5e5; cursor: pointer; display: inline-flex; align-items: center; justify-content: center; gap: 8px; transition: 0.3s; }
.btn-outline:hover { background: #fafafa; border-color: #ccc; }

/* HERO SECTION (MINDLY STYLE) */
.hero-section { text-align: center; padding-top: 40px; overflow-x: hidden; }
.hero-title {
  font-family: var(--font-serif); font-size: 5.5rem; font-weight: 400;
  letter-spacing: -0.03em; line-height: 1.05; margin-bottom: 20px; color: #111;
}
.serif-italic { font-style: italic; font-weight: 500; }
.hero-subtitle { font-size: 1.15rem; color: var(--text-muted); line-height: 1.6; margin-bottom: 32px; max-width: 600px; margin-inline: auto; }
.hero-actions { display: flex; justify-content: center; gap: 16px; margin-bottom: 60px; }

/* 3D SCENE */
.hero-3d-scene {
  position: relative; max-width: 1000px; margin: 0 auto; height: 550px;
  perspective: 1200px; display: flex; justify-content: center; align-items: center;
}
.center-portrait-wrapper { position: relative; z-index: 10; }
.center-portrait {
  width: 320px; height: 420px; object-fit: cover; border-radius: 20px;
  filter: grayscale(100%) contrast(1.1);
  -webkit-mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  mask-image: linear-gradient(to bottom, black 60%, transparent 100%);
  box-shadow: 0 20px 50px rgba(0,0,0,0.1);
}

.glass-card {
  position: absolute; background: var(--glass-bg); backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px); border: 1px solid var(--glass-border);
  border-radius: 24px; padding: 20px; box-shadow: var(--glass-shadow);
  text-align: left; z-index: 20; animation: float 6s ease-in-out infinite;
  min-width: 220px;
}
.glass-card h4 { font-size: 15px; font-weight: 600; margin: 0; color: #111; }
.glass-card p { font-size: 13px; color: var(--text-muted); margin: 0; line-height: 1.4; margin-top: 4px; }
.icon-wrapper { width: 32px; height: 32px; border-radius: 10px; display: flex; align-items: center; justify-content: center; color: white; margin-bottom: 12px; }
.bg-gray { background: #333; }
.bg-green { background: #d9f99d; color: #166534; }
.bg-purple { background: #e9d5ff; color: #581c87; }
.bg-orange { background: #fed7aa; color: #9a3412; }

.float-1 { --rot: -6deg; --tz: 20px; top: 10%; left: 2%; }
.float-2 { --rot: 4deg; --tz: 40px; top: 5%; right: 2%; animation-delay: -1s; }
.float-3 { --rot: 5deg; --tz: 60px; bottom: 25%; left: 8%; z-index: 30; animation-delay: -2s; }
.float-4 { --rot: -5deg; --tz: 80px; bottom: 20%; right: 2%; z-index: 30; animation-delay: -3s; }

@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(var(--rot)) translateZ(var(--tz)); }
  50% { transform: translateY(-12px) rotate(var(--rot)) translateZ(var(--tz)); }
}

.progress-track { background: #eaeaea; height: 6px; border-radius: 10px; overflow: hidden; }
.progress-fill { background: #111; height: 100%; border-radius: 10px; }
.btn-mini { background: #f4f4f5; border: 1px solid #e4e4e7; color: #111 !important; border-radius: 8px; padding: 6px 12px; font-size: 12px; font-weight: 600; display: inline-flex; align-items: center; gap: 4px; cursor: pointer; transition: 0.2s;}
.btn-mini:hover { background: #fff; border-color: #d4d4d8; }

.mini-task-list { margin-top: 12px; display: flex; flex-direction: column; gap: 8px; }
.mini-task { display: flex; align-items: center; gap: 8px; font-size: 13px; color: #444; cursor: pointer; }
.mini-checkbox { width: 14px; height: 14px; border: 1px solid #ccc; border-radius: 4px; }
.mini-task:hover .mini-checkbox { border-color: #888; }
`;

const layout = `
import React, { useEffect, useState } from 'react';
import { Outlet, NavLink } from 'react-router-dom';
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
        <div className="nav-brand">
          <div style={{width:'32px',height:'32px',background:'#111',color:'#fff',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px'}}>TS</div>
          TO START
        </div>
        
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
`;

const dashboard = `
import React from 'react';
import { useTasks, useIdeas, useVideos, useSettings } from '../store/useStore';
import { Activity, Edit3, Target, Video, Plus, CheckCircle2, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const { todayTasks, toggleTask } = useTasks();
  const { ideas } = useIdeas();
  const { videos } = useVideos();
  const { settings } = useSettings();
  
  const completed = todayTasks.filter(t => t.completed).length;
  const progress = todayTasks.length ? Math.round((completed / todayTasks.length) * 100) : 0;
  
  const pendingIdeas = ideas.filter(i => i.status === 'new' || i.status === 'planning').length;
  const inPipeline = videos.filter(v => v.status !== 'published').length;

  return (
    <div className="dashboard-page">
      <div className="hero-section">
        <h1 className="hero-title">
          Good {new Date().getHours() < 12 ? 'morning' : 'afternoon'},<br/>
          <span className="serif-italic">{settings?.userName?.split(' ')[0] || 'Creator'}</span>.
        </h1>
        <p className="hero-subtitle">
          {format(new Date(), 'EEEE, MMMM do')} — All your ideas and tasks in one beautiful space.
        </p>

        <div className="hero-actions">
          <button className="btn-dark">Get started free &rarr;</button>
          <button className="btn-outline"><PlayCircle className="w-5 h-5"/> Watch overview</button>
        </div>

        <div className="hero-3d-scene">
          <div className="center-portrait-wrapper">
            <img src="/user-photo.jpg" alt="User" className="center-portrait" onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80'; }} />
          </div>

          <div className="glass-card float-1">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper bg-green"><Target size={16}/></div>
            </div>
            <h4>Today's Focus</h4>
            <div className="progress-track mt-3">
               <div className="progress-fill" style={{width: \`\${progress}%\`}}></div>
            </div>
            <p className="mt-2 text-right text-xs font-bold">{completed} / {todayTasks.length} DONE</p>
          </div>

          <div className="glass-card float-2">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper bg-gray"><Activity size={16}/></div>
            </div>
            <h4>Capture</h4>
            <p>Turn thoughts into progress.</p>
            <div className="flex gap-2 mt-3">
               <button className="btn-mini"><Plus size={14}/> Task</button>
               <button className="btn-mini"><Plus size={14}/> Idea</button>
            </div>
          </div>

          <div className="glass-card float-3 task-preview-card">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper bg-orange"><CheckCircle2 size={16}/></div>
            </div>
            <h4>Up Next</h4>
            <div className="mini-task-list">
              {todayTasks.filter(t => !t.completed).slice(0,3).map(task => (
                <div key={task.id} className="mini-task" onClick={() => toggleTask(task.id)}>
                  <div className="mini-checkbox"></div>
                  <span className="truncate" style={{maxWidth:'150px'}}>{task.title}</span>
                </div>
              ))}
              {todayTasks.filter(t => !t.completed).length === 0 && (
                <p className="text-xs text-muted">All caught up!</p>
              )}
            </div>
          </div>

          <div className="glass-card float-4">
            <div className="flex items-center gap-3">
              <div className="icon-wrapper bg-purple"><Video size={16}/></div>
            </div>
            <h4>Content Engine</h4>
            <p className="mt-2"><b>{pendingIdeas}</b> ideas pending.</p>
            <p><b>{inPipeline}</b> videos in pipeline.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
`;

fs.writeFileSync('src/index.css', css);
fs.writeFileSync('src/components/Layout.jsx', layout);
fs.writeFileSync('src/pages/Dashboard.jsx', dashboard);

console.log('Files successfully written.');
