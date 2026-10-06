import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTasks, useIdeas, useVideos, useSettings } from '../store/useStore';
import { Activity, Target, Video, Plus, CheckCircle2, PlayCircle } from 'lucide-react';
import { format } from 'date-fns';

const PHILOSOPHY_QUOTES = [
  { text: "We are what we repeatedly do. Excellence, then, is not an act, but a habit.", author: "Aristotle" },
  { text: "You have power over your mind - not outside events. Realize this, and you will find strength.", author: "Marcus Aurelius" },
  { text: "The secret of change is to focus all of your energy, not on fighting the old, but on building the new.", author: "Socrates" },
  { text: "It is not because things are difficult that we do not dare; it is because we do not dare that they are difficult.", author: "Seneca" },
  { text: "First say to yourself what you would be; and then do what you have to do.", author: "Epictetus" },
  { text: "Opportunities multiply as they are seized.", author: "Sun Tzu" },
  { text: "The journey of a thousand miles begins with one step.", author: "Lao Tzu" },
  { text: "He who has a why to live for can bear almost any how.", author: "Friedrich Nietzsche" },
  { text: "Excellence is never an accident. It is always the result of high intention, sincere effort, and intelligent execution.", author: "Aristotle" },
  { text: "Waste no more time arguing about what a good man should be. Be one.", author: "Marcus Aurelius" },
  { text: "Luck is what happens when preparation meets opportunity.", author: "Seneca" },
  { text: "It does not matter how slowly you go as long as you do not stop.", author: "Confucius" },
  { text: "Wealth consists not in having great possessions, but in having few wants.", author: "Epictetus" },
  { text: "In the midst of chaos, there is also opportunity.", author: "Sun Tzu" },
  { text: "Knowing yourself is the beginning of all wisdom.", author: "Aristotle" },
  { text: "To dare is to lose one's footing momentarily. Not to dare is to lose oneself.", author: "Søren Kierkegaard" },
  { text: "Don't explain your philosophy. Embody it.", author: "Epictetus" }
];

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

  const [currentQuote, setCurrentQuote] = useState(PHILOSOPHY_QUOTES[0]);

  useEffect(() => {
    const updateQuote = () => {
      // Calculate a stable index based on the current time chunk (3 hours = 10800000 ms)
      const index = Math.floor(Date.now() / (1000 * 60 * 60 * 3)) % PHILOSOPHY_QUOTES.length;
      setCurrentQuote(PHILOSOPHY_QUOTES[index]);
    };
    
    updateQuote();
    // Check every minute if we crossed a 3-hour boundary
    const interval = setInterval(updateQuote, 60000); 
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="dashboard-page">
      <div className="hero-section">
        <h1 className="hero-title" style={{ maxWidth: '900px', lineHeight: '1.2' }}>
          "{currentQuote.text}"<br/>
          <span className="serif-italic" style={{ fontSize: '0.65em', color: 'var(--text-secondary)', display: 'inline-block', marginTop: '12px' }}>
            — {currentQuote.author}
          </span>
        </h1>
        <p className="hero-subtitle">
          {format(new Date(), 'EEEE, MMMM do')} - All your ideas and tasks in one beautiful space.
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
