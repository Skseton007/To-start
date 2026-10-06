import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks, useIdeas, useVideos, useSettings } from '../store/useStore';
import { Activity, Edit3, Target, Video, Plus, CheckCircle2, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';

export default function Dashboard() {
  const navigate = useNavigate();
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
          <button className="btn-dark cursor-pointer hover:scale-105 transition-all" onClick={() => navigate('/today')}>Get started &rarr;</button>
          <button className="btn-outline cursor-pointer hover:scale-105 transition-all" onClick={() => navigate('/content')}><PlayCircle className="w-5 h-5"/> Content Engine</button>
        </div>

        <div className="hero-3d-scene">
          <div className="center-portrait-wrapper">
            <img src={import.meta.env.BASE_URL + 'user-photo.jpg'} alt="User" className="center-portrait" />
          </div>

          <div className="glass-card float-1 cursor-pointer hover:scale-110 transition-transform" onClick={() => navigate('/today')}>
            <div className="flex items-center gap-3">
              <div className="icon-wrapper bg-green"><Target size={16}/></div>
            </div>
            <h4>Today's Focus</h4>
            <div className="progress-track mt-3">
               <div className="progress-fill" style={{width: `${progress}%`}}></div>
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
               <button className="btn-mini cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); navigate('/today'); }}><Plus size={14}/> Task</button>
               <button className="btn-mini cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700" onClick={(e) => { e.stopPropagation(); navigate('/ideas'); }}><Plus size={14}/> Idea</button>
            </div>
          </div>

          <div className="glass-card float-3 task-preview-card cursor-pointer hover:scale-110 transition-transform" onClick={() => navigate('/tasks')}>
            <div className="flex items-center gap-3">
              <div className="icon-wrapper bg-orange"><CheckCircle2 size={16}/></div>
            </div>
            <h4>Up Next</h4>
            <div className="mini-task-list">
              {todayTasks.filter(t => !t.completed).slice(0,3).map(task => (
                <div key={task.id} className="mini-task hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors p-1 rounded cursor-pointer" onClick={(e) => { e.stopPropagation(); toggleTask(task.id); }}>
                  <div className="mini-checkbox cursor-pointer"></div>
                  <span className="truncate" style={{maxWidth:'150px'}}>{task.title}</span>
                </div>
              ))}
              {todayTasks.filter(t => !t.completed).length === 0 && (
                <p className="text-xs text-muted mt-2">All caught up!</p>
              )}
            </div>
          </div>

          <div className="glass-card float-4 cursor-pointer hover:scale-110 transition-transform" onClick={() => navigate('/content')}>
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
