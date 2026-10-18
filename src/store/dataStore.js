// Central Data Store with localStorage persistence
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';

const STORAGE_KEY = 'tostart_data';

// Local calendar date as 'yyyy-MM-dd'. Never use toISOString() for this: it is UTC,
// so between midnight and the UTC offset it returns yesterday's date.
export const localDate = (d = new Date()) => format(d, 'yyyy-MM-dd');

const getDefaultData = () => ({
  tasks: [],
  ideas: [],
  notebooks: [],
  notes: [],
  scripts: [],
  videos: [],
  categories: [
    { id: 'personal', name: 'Personal', color: '#6366f1' },
    { id: 'work', name: 'Work', color: '#f59e0b' },
    { id: 'content', name: 'Content', color: '#ec4899' },
    { id: 'learning', name: 'Learning', color: '#10b981' },
    { id: 'editing', name: 'Editing', color: '#8b5cf6' },
    { id: 'business', name: 'Business', color: '#3b82f6' },
    { id: 'other', name: 'Other', color: '#6b7280' },
  ],
  platforms: [
    { id: 'youtube', name: 'YouTube', icon: 'youtube', color: '#FF0000' },
    { id: 'instagram', name: 'Instagram', icon: 'instagram', color: '#E1306C' },
  ],
  contentGoals: {
    daily: 1,
    weekly: 5,
    monthly: 20,
  },
  settings: {
    theme: 'light',
    userName: 'Creator',
    defaultPriority: 'medium',
    defaultCategory: 'personal',
  },
  streak: {
    current: 0,
    lastActiveDate: null,
    best: 0,
  },
  reminders: [],
});

// Generate sample data
const generateSampleData = () => {
  const now = new Date();
  const today = localDate(now);
  const yesterday = localDate(new Date(now - 86400000));

  const tasks = [
    {
      id: uuidv4(), title: 'Edit today\'s reel', completed: false,
      priority: 'high', category: 'content', date: today,
      time: '10:00', notes: 'Use trending audio', createdAt: now.toISOString(),
    },
    {
      id: uuidv4(), title: 'Write video script - AI Tools', completed: false,
      priority: 'high', category: 'content', date: today,
      time: '11:00', notes: 'Research top 5 AI tools for creators', createdAt: now.toISOString(),
    },
    {
      id: uuidv4(), title: 'Upload YouTube video', completed: true,
      priority: 'medium', category: 'content', date: today,
      time: '14:00', notes: 'Check thumbnail before uploading', createdAt: now.toISOString(),
      completedAt: now.toISOString(),
    },
    {
      id: uuidv4(), title: 'Research new content ideas', completed: false,
      priority: 'medium', category: 'learning', date: today,
      time: '16:00', notes: 'Check trending topics', createdAt: now.toISOString(),
    },
    {
      id: uuidv4(), title: 'Reply to comments', completed: true,
      priority: 'low', category: 'content', date: today,
      time: '09:00', notes: '', createdAt: now.toISOString(),
      completedAt: now.toISOString(),
    },
    {
      id: uuidv4(), title: 'Plan next week content', completed: false,
      priority: 'medium', category: 'work', date: today,
      time: '17:00', notes: '', createdAt: now.toISOString(),
    },
    {
      id: uuidv4(), title: 'Review analytics', completed: true,
      priority: 'low', category: 'business', date: today,
      time: '08:00', notes: 'Check last 7 days performance', createdAt: now.toISOString(),
      completedAt: now.toISOString(),
    },
    {
      id: uuidv4(), title: 'Record voiceover', completed: false,
      priority: 'high', category: 'content', date: today,
      time: '15:00', notes: 'Use quiet room', createdAt: now.toISOString(),
    },
  ];

  const ideas = [
    {
      id: uuidv4(), title: '5 AI Tools Every Creator Needs',
      description: 'Showcase the best AI tools that help creators automate and improve their content creation workflow.',
      category: 'content', tags: ['AI', 'tools', 'productivity'],
      status: 'in-progress', notes: 'Research: ChatGPT, Midjourney, Runway, ElevenLabs, Descript',
      createdAt: now.toISOString(),
    },
    {
      id: uuidv4(), title: 'How Local Businesses Can Use Instagram',
      description: 'Tutorial on Instagram marketing strategies for small local businesses.',
      category: 'content', tags: ['instagram', 'marketing', 'business'],
      status: 'new', notes: 'Interview 2-3 local business owners',
      createdAt: now.toISOString(),
    },
    {
      id: uuidv4(), title: 'Day in My Life as a Creator',
      description: 'Vlog style video showing daily routine, tools, and workflow.',
      category: 'content', tags: ['vlog', 'lifestyle', 'routine'],
      status: 'planning', notes: 'Film over 2 days for variety',
      createdAt: now.toISOString(),
    },
    {
      id: uuidv4(), title: 'Beginner\'s Guide to Video Editing',
      description: 'Step by step tutorial for people starting with video editing.',
      category: 'learning', tags: ['editing', 'tutorial', 'beginner'],
      status: 'new', notes: 'Use DaVinci Resolve as example',
      createdAt: now.toISOString(),
    },
    {
      id: uuidv4(), title: 'Content Creation Setup Tour',
      description: 'Show my complete setup - camera, mic, lighting, software.',
      category: 'content', tags: ['setup', 'gear', 'tech'],
      status: 'completed', notes: 'Already filmed, need to edit',
      createdAt: yesterday + 'T10:00:00.000Z',
    },
  ];

  const nb1Id = uuidv4(), nb2Id = uuidv4(), nb3Id = uuidv4(), nb4Id = uuidv4();
  const notebooks = [
    { id: nb1Id, name: 'Content Ideas', color: '#6366f1', icon: 'lightbulb', description: 'All my content ideas and brainstorms', createdAt: now.toISOString() },
    { id: nb2Id, name: 'YouTube', color: '#ef4444', icon: 'youtube', description: 'YouTube specific content and strategy', createdAt: now.toISOString() },
    { id: nb3Id, name: 'Instagram', color: '#ec4899', icon: 'instagram', description: 'Instagram content and growth strategies', createdAt: now.toISOString() },
    { id: nb4Id, name: 'Scripts', color: '#10b981', icon: 'file-text', description: 'All my video scripts', createdAt: now.toISOString() },
  ];

  const notes = [
    {
      id: uuidv4(), notebookId: nb1Id, title: 'Video Ideas for October',
      content: '<h2>October Content Plan</h2><ul><li>AI Tools Review</li><li>Instagram Growth Hacks</li><li>Day in My Life Vlog</li><li>Setup Tour 2024</li><li>Editing Tips for Beginners</li></ul><p>Focus on <strong>short-form content</strong> this month.</p>',
      createdAt: now.toISOString(), updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(), notebookId: nb2Id, title: 'YouTube Strategy',
      content: '<h2>YouTube Growth Plan</h2><p>Focus areas:</p><ol><li>Consistent upload schedule (3x/week)</li><li>Improve thumbnails</li><li>Better hooks in first 30 seconds</li><li>End screen optimization</li></ol><p><strong>Goal:</strong> Reach 10K subscribers by end of year.</p>',
      createdAt: now.toISOString(), updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(), notebookId: nb3Id, title: 'Instagram Reels Ideas',
      content: '<h2>Reels Content</h2><ul><li>Quick tips (30 seconds)</li><li>Behind the scenes</li><li>Before/After edits</li><li>Tool showcases</li></ul><p>Post <em>at least 1 reel per day</em>.</p>',
      createdAt: now.toISOString(), updatedAt: now.toISOString(),
    },
  ];

  const scripts = [
    {
      id: uuidv4(), title: '5 AI Tools for Creators',
      hook: 'These 5 AI tools will save you 10 hours every week as a content creator...',
      content: 'Tool 1: ChatGPT - For scriptwriting and brainstorming\nTool 2: Midjourney - For thumbnail and visual creation\nTool 3: Runway ML - For video editing with AI\nTool 4: ElevenLabs - For voiceovers and dubbing\nTool 5: Descript - For podcast and video editing',
      cta: 'Follow for more creator tips! Which tool are you going to try first? Comment below.',
      notes: 'Keep it under 10 minutes for YouTube, 60 seconds version for Instagram',
      platform: 'youtube', status: 'completed',
      ideaId: ideas[0].id,
      createdAt: now.toISOString(), updatedAt: now.toISOString(),
    },
    {
      id: uuidv4(), title: 'Instagram Growth Tips',
      hook: 'Want to grow your Instagram in 2024? Here are 3 things that actually work...',
      content: 'Tip 1: Post Reels consistently - Algorithm favors short video\nTip 2: Use strong hooks in first 2 seconds\nTip 3: Engage with your niche community daily',
      cta: 'Save this for later! Follow @creator for more tips.',
      notes: 'Make this a carousel post too',
      platform: 'instagram', status: 'in-progress',
      ideaId: ideas[1].id,
      createdAt: now.toISOString(), updatedAt: now.toISOString(),
    },
  ];

  const videos = [
    {
      id: uuidv4(), title: 'AI Tools for Creators',
      ideaId: ideas[0].id, scriptId: scripts[0].id,
      contentType: 'tutorial', category: 'content',
      platforms: [
        { platformId: 'youtube', uploaded: true, published: true },
        { platformId: 'instagram', uploaded: false, published: false },
      ],
      status: 'published',
      stages: { idea: true, script: true, recording: true, editing: true, review: true, ready: true, published: true },
      deadline: localDate(new Date(now.getTime() + 86400000 * 2)),
      notes: 'Great performance on YouTube!',
      createdAt: yesterday + 'T10:00:00.000Z',
    },
    {
      id: uuidv4(), title: 'Instagram Growth Tips',
      ideaId: ideas[1].id, scriptId: scripts[1].id,
      contentType: 'tutorial', category: 'content',
      platforms: [
        { platformId: 'youtube', uploaded: false, published: false },
        { platformId: 'instagram', uploaded: false, published: false },
      ],
      status: 'editing',
      stages: { idea: true, script: true, recording: true, editing: false, review: false, ready: false, published: false },
      deadline: localDate(new Date(now.getTime() + 86400000 * 5)),
      notes: 'Need B-roll footage',
      createdAt: now.toISOString(),
    },
    {
      id: uuidv4(), title: 'Day in My Life Vlog',
      ideaId: ideas[2].id, scriptId: null,
      contentType: 'vlog', category: 'content',
      platforms: [
        { platformId: 'youtube', uploaded: false, published: false },
      ],
      status: 'recording',
      stages: { idea: true, script: true, recording: false, editing: false, review: false, ready: false, published: false },
      deadline: localDate(new Date(now.getTime() + 86400000 * 7)),
      notes: 'Film over the weekend',
      createdAt: now.toISOString(),
    },
    {
      id: uuidv4(), title: 'Setup Tour 2024',
      ideaId: ideas[4].id, scriptId: null,
      contentType: 'showcase', category: 'content',
      platforms: [
        { platformId: 'youtube', uploaded: false, published: false },
        { platformId: 'instagram', uploaded: false, published: false },
      ],
      status: 'idea',
      stages: { idea: true, script: false, recording: false, editing: false, review: false, ready: false, published: false },
      deadline: localDate(new Date(now.getTime() + 86400000 * 14)),
      notes: 'Wait for new monitor to arrive',
      createdAt: now.toISOString(),
    },
  ];

  return { tasks, ideas, notebooks, notes, scripts, videos };
};

// Bump when stored data needs a one-time migration in migrate()
const SCHEMA_VERSION = 2;

const emptyResults = () => ({ tasks: [], ideas: [], notebooks: [], notes: [], scripts: [], videos: [] });

const statusFromStages = (stages) => {
  if (stages.published) return 'published';
  if (stages.ready) return 'ready';
  if (stages.review) return 'review';
  if (stages.editing) return 'editing';
  if (stages.recording) return 'recording';
  if (stages.script) return 'script';
  return 'idea';
};

// Week starts on Sunday, matching the calendar
const startOfWeekStr = (d = new Date()) => {
  const s = new Date(d);
  s.setDate(s.getDate() - s.getDay());
  return localDate(s);
};

class DataStore {
  constructor() {
    this.listeners = new Set();
    this.errorListeners = new Set();
    this.data = this.load();
    // Catch the day changing while the app stays open (e.g. left open overnight)
    if (typeof window !== 'undefined') {
      setInterval(() => this.rollover(), 60000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') this.rollover();
      });
    }
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        const data = this.migrate({ ...getDefaultData(), ...parsed });
        const rolled = this.applyRollover(data);
        this.save(rolled);
        return rolled;
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    }
    // First time: start with sample data so the app isn't empty
    const data = this.buildSampleData();
    this.save(data);
    return data;
  }

  migrate(data) {
    if ((data.schemaVersion || 1) >= SCHEMA_VERSION) return data;
    const today = localDate();
    return {
      ...data,
      // v1 reset every task each day, so tasks already in use (today or earlier) were
      // effectively daily routines. Future-dated tasks were scheduled, not routines.
      tasks: data.tasks.map(t => ({ recurring: !t.date || t.date <= today, ...t })),
      // v1 stored 'dark' but never applied it; keep the light look users actually saw
      settings: { ...data.settings, theme: 'light' },
      completionLog: data.completionLog || [],
      schemaVersion: SCHEMA_VERSION,
    };
  }

  // Daily routine reset: only recurring tasks are reset and moved to today.
  // Their completion is logged first so history and stats keep it.
  applyRollover(data) {
    const today = localDate();
    if (data.lastLoginDate === today) return data;

    const log = [...(data.completionLog || [])];
    const tasks = data.tasks.map(task => {
      // Leave one-off tasks alone, and never pull a routine scheduled for later into today
      if (!task.recurring || (task.date && task.date >= today)) return task;
      if (task.completed) {
        log.push({
          id: uuidv4(), taskId: task.id, title: task.title,
          date: task.completedAt ? localDate(new Date(task.completedAt)) : task.date,
        });
      }
      return { ...task, completed: false, completedAt: null, date: today };
    });

    return { ...data, tasks, completionLog: log, lastLoginDate: today };
  }

  rollover() {
    const next = this.applyRollover(this.data);
    if (next !== this.data) {
      this.data = next;
      this.notify();
    }
  }

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data || this.data));
      return true;
    } catch (e) {
      console.error('Failed to save data:', e);
      const message = e?.name === 'QuotaExceededError'
        ? 'Storage is full — your last change was NOT saved. Remove some images or old items.'
        : 'Could not save your data. Your last change was NOT saved.';
      this.errorListeners.forEach(l => l(message));
      return false;
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  subscribeErrors(listener) {
    this.errorListeners.add(listener);
    return () => this.errorListeners.delete(listener);
  }

  notify() {
    this.save();
    this.listeners.forEach(l => l(this.data));
  }

  getData() {
    return this.data;
  }

  // Replace one top-level collection immutably so React sees a new reference
  set(key, value) {
    this.data = { ...this.data, [key]: value };
  }

  updateIn(key, id, updater) {
    let found = null;
    const list = this.data[key].map(item => {
      if (item.id !== id) return item;
      found = updater(item);
      return found;
    });
    if (found) this.set(key, list);
    return found;
  }

  // Update streak
  updateStreak() {
    const today = localDate();
    const streak = this.data.streak;
    if (streak.lastActiveDate === today) return;

    const yesterday = localDate(new Date(Date.now() - 86400000));
    const current = streak.lastActiveDate === yesterday ? streak.current + 1 : 1;
    this.set('streak', { current, lastActiveDate: today, best: Math.max(streak.best, current) });
  }

  // ============ TASKS ============
  addTask(task) {
    const newTask = {
      id: uuidv4(),
      title: task.title || '',
      completed: false,
      priority: task.priority || 'medium',
      category: task.category || '',
      date: task.date || localDate(),
      time: task.time || '',
      notes: task.notes || '',
      recurring: !!task.recurring,
      reminder: task.reminder || null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    this.set('tasks', [newTask, ...this.data.tasks]);
    this.updateStreak();
    this.notify();
    return newTask;
  }

  updateTask(id, updates) {
    if (this.updateIn('tasks', id, t => ({ ...t, ...updates }))) this.notify();
  }

  toggleTask(id) {
    const task = this.updateIn('tasks', id, t => ({
      ...t,
      completed: !t.completed,
      completedAt: !t.completed ? new Date().toISOString() : null,
    }));
    if (task) {
      if (task.completed) this.updateStreak();
      this.notify();
    }
  }

  deleteTask(id) {
    this.set('tasks', this.data.tasks.filter(t => t.id !== id));
    this.notify();
  }

  deleteTasks(ids) {
    const remove = new Set(ids);
    this.set('tasks', this.data.tasks.filter(t => !remove.has(t.id)));
    this.notify();
  }

  duplicateTask(id) {
    const task = this.data.tasks.find(t => t.id === id);
    if (task) {
      const newTask = { ...task, id: uuidv4(), completed: false, completedAt: null, createdAt: new Date().toISOString() };
      this.set('tasks', [newTask, ...this.data.tasks]);
      this.notify();
      return newTask;
    }
  }

  getTodayTasks() {
    const today = localDate();
    return this.data.tasks.filter(t => t.date === today);
  }

  // Number of tasks completed on each local date between start and end (inclusive, 'yyyy-MM-dd')
  getCompletionsByDate(start, end) {
    const counts = {};
    const add = (date) => {
      if (date && date >= start && date <= end) counts[date] = (counts[date] || 0) + 1;
    };
    this.data.tasks.forEach(t => {
      if (t.completed) add(t.completedAt ? localDate(new Date(t.completedAt)) : t.date);
    });
    (this.data.completionLog || []).forEach(entry => add(entry.date));
    return counts;
  }

  // ============ IDEAS ============
  addIdea(idea) {
    const newIdea = {
      id: uuidv4(),
      title: idea.title || '',
      description: idea.description || '',
      category: idea.category || 'content',
      tags: idea.tags || [],
      status: idea.status || 'new',
      notes: idea.notes || '',
      script: idea.script || '',
      coverImage: idea.coverImage || '',
      createdAt: new Date().toISOString(),
    };
    this.set('ideas', [newIdea, ...this.data.ideas]);
    this.notify();
    return newIdea;
  }

  updateIdea(id, updates) {
    if (this.updateIn('ideas', id, i => ({ ...i, ...updates }))) this.notify();
  }

  deleteIdea(id) {
    this.set('ideas', this.data.ideas.filter(i => i.id !== id));
    this.notify();
  }

  convertIdeaToVideo(ideaId) {
    const idea = this.data.ideas.find(i => i.id === ideaId);
    if (!idea) return null;
    this.updateIn('ideas', ideaId, i => ({ ...i, status: 'in-progress' }));
    // addVideo saves and notifies once for both changes
    return this.addVideo({
      title: idea.title,
      ideaId: idea.id,
      category: idea.category,
      notes: idea.description,
    });
  }

  // ============ NOTEBOOKS ============
  addNotebook(notebook) {
    const newNotebook = {
      id: uuidv4(),
      name: notebook.name || 'Untitled Notebook',
      color: notebook.color || '#6366f1',
      icon: notebook.icon || 'book',
      description: notebook.description || '',
      createdAt: new Date().toISOString(),
    };
    this.set('notebooks', [...this.data.notebooks, newNotebook]);
    this.notify();
    return newNotebook;
  }

  updateNotebook(id, updates) {
    if (this.updateIn('notebooks', id, n => ({ ...n, ...updates, updatedAt: new Date().toISOString() }))) this.notify();
  }

  deleteNotebook(id) {
    this.set('notebooks', this.data.notebooks.filter(n => n.id !== id));
    this.set('notes', this.data.notes.filter(n => n.notebookId !== id));
    this.notify();
  }

  getNotebookNotes(notebookId) {
    return this.data.notes.filter(n => n.notebookId === notebookId);
  }

  // ============ NOTES ============
  addNote(note) {
    const now = new Date().toISOString();
    const newNote = {
      id: uuidv4(),
      notebookId: note.notebookId,
      title: note.title || 'Untitled Note',
      content: note.content || '',
      createdAt: now,
      updatedAt: now,
    };
    this.set('notes', [newNote, ...this.data.notes]);
    this.notify();
    return newNote;
  }

  updateNote(id, updates) {
    if (this.updateIn('notes', id, n => ({ ...n, ...updates, updatedAt: new Date().toISOString() }))) this.notify();
  }

  deleteNote(id) {
    this.set('notes', this.data.notes.filter(n => n.id !== id));
    this.notify();
  }

  // ============ SCRIPTS ============
  addScript(script) {
    const now = new Date().toISOString();
    const newScript = {
      id: uuidv4(),
      title: script.title || 'Untitled Script',
      hook: script.hook || '',
      content: script.content || '',
      cta: script.cta || '',
      notes: script.notes || '',
      platform: script.platform || 'youtube',
      status: script.status || 'draft',
      ideaId: script.ideaId || null,
      createdAt: now,
      updatedAt: now,
    };
    this.set('scripts', [newScript, ...this.data.scripts]);
    this.notify();
    return newScript;
  }

  updateScript(id, updates) {
    if (this.updateIn('scripts', id, s => ({ ...s, ...updates, updatedAt: new Date().toISOString() }))) this.notify();
  }

  deleteScript(id) {
    this.set('scripts', this.data.scripts.filter(s => s.id !== id));
    this.notify();
  }

  // ============ VIDEOS ============
  addVideo(video) {
    const newVideo = {
      id: uuidv4(),
      title: video.title || 'Untitled Video',
      ideaId: video.ideaId || null,
      scriptId: video.scriptId || null,
      contentType: video.contentType || 'Long Form',
      category: video.category || 'content',
      platforms: video.platforms || [
        { platformId: 'youtube', uploaded: false, published: false },
        { platformId: 'instagram', uploaded: false, published: false },
      ],
      status: 'idea',
      stages: { idea: true, script: false, recording: false, editing: false, review: false, ready: false, published: false },
      deadline: video.deadline || null,
      notes: video.notes || '',
      publishedAt: null,
      createdAt: new Date().toISOString(),
    };
    this.set('videos', [newVideo, ...this.data.videos]);
    this.notify();
    return newVideo;
  }

  updateVideo(id, updates) {
    if (this.updateIn('videos', id, v => ({ ...v, ...updates }))) this.notify();
  }

  updateVideoStage(id, stage, value) {
    const updated = this.updateIn('videos', id, v => {
      const stages = { ...v.stages, [stage]: value };
      let publishedAt = v.publishedAt || null;
      if (stage === 'published') publishedAt = value ? new Date().toISOString() : null;
      return { ...v, stages, status: statusFromStages(stages), publishedAt };
    });
    if (updated) this.notify();
  }

  updateVideoPlatform(videoId, platformId, field, value) {
    const updated = this.updateIn('videos', videoId, v => ({
      ...v,
      platforms: v.platforms.map(p => (p.platformId === platformId ? { ...p, [field]: value } : p)),
    }));
    if (updated) this.notify();
  }

  deleteVideo(id) {
    this.set('videos', this.data.videos.filter(v => v.id !== id));
    this.notify();
  }

  getVideoProgress(id) {
    const video = this.data.videos.find(v => v.id === id);
    if (!video) return 0;
    const stages = Object.values(video.stages);
    const completed = stages.filter(Boolean).length;
    return Math.round((completed / stages.length) * 100);
  }

  // ============ CATEGORIES ============
  deleteCategory(id) {
    this.set('categories', this.data.categories.filter(c => c.id !== id));
    this.notify();
  }

  addCategory(category) {
    const newCat = {
      id: uuidv4(),
      name: category.name,
      color: category.color || '#6b7280',
    };
    this.set('categories', [...this.data.categories, newCat]);
    this.notify();
    return newCat;
  }

  // ============ SETTINGS ============
  updateSettings(updates) {
    this.set('settings', { ...this.data.settings, ...updates });
    this.notify();
  }

  updateContentGoals(goals) {
    this.set('contentGoals', { ...this.data.contentGoals, ...goals });
    this.notify();
  }

  // ============ REMINDERS ============
  addReminder(reminder) {
    const newReminder = {
      id: uuidv4(),
      title: reminder.title,
      date: reminder.date,
      time: reminder.time,
      type: reminder.type || 'task',
      referenceId: reminder.referenceId || null,
      dismissed: false,
      createdAt: new Date().toISOString(),
    };
    this.set('reminders', [...this.data.reminders, newReminder]);
    this.notify();
    return newReminder;
  }

  // ============ ANALYTICS ============
  periodStart(period) {
    if (period === 'day') return localDate();
    if (period === 'week') return startOfWeekStr();
    return localDate().slice(0, 7) + '-01';
  }

  getStats(period = 'day') {
    const startDate = this.periodStart(period);
    const today = localDate();
    // createdAt is a UTC timestamp, so compare it by its local date
    const inPeriod = (iso) => !!iso && localDate(new Date(iso)) >= startDate;

    const tasksInPeriod = this.data.tasks.filter(t => t.date >= startDate && t.date <= today);
    const completedCounts = this.getCompletionsByDate(startDate, today);
    const completedTasks = Object.values(completedCounts).reduce((a, b) => a + b, 0);
    const videosInPeriod = this.data.videos.filter(v => inPeriod(v.createdAt));

    return {
      totalTasks: tasksInPeriod.length,
      completedTasks,
      taskProgress: tasksInPeriod.length ? Math.min(100, Math.round((tasksInPeriod.filter(t => t.completed).length / tasksInPeriod.length) * 100)) : 0,
      ideasCreated: this.data.ideas.filter(i => inPeriod(i.createdAt)).length,
      scriptsWritten: this.data.scripts.filter(s => inPeriod(s.createdAt)).length,
      videosTotal: videosInPeriod.length,
      videosPublished: this.data.videos.filter(v => v.status === 'published' && inPeriod(v.publishedAt || v.createdAt)).length,
      videosInProgress: videosInPeriod.filter(v => !['published', 'idea'].includes(v.status)).length,
    };
  }

  getContentGoalProgress() {
    const publishedSince = (start) => this.data.videos.filter(v =>
      v.status === 'published' && localDate(new Date(v.publishedAt || v.createdAt)) >= start
    ).length;

    return {
      daily: { current: publishedSince(this.periodStart('day')), goal: this.data.contentGoals.daily },
      weekly: { current: publishedSince(this.periodStart('week')), goal: this.data.contentGoals.weekly },
      monthly: { current: publishedSince(this.periodStart('month')), goal: this.data.contentGoals.monthly },
    };
  }

  // ============ SEARCH ============
  search(query) {
    if (!query || query.length < 2) return emptyResults();
    const q = query.toLowerCase();
    const has = (text) => (text || '').toLowerCase().includes(q);
    return {
      tasks: this.data.tasks.filter(t => has(t.title) || has(t.notes)),
      ideas: this.data.ideas.filter(i => has(i.title) || has(i.description)),
      notebooks: this.data.notebooks.filter(n => has(n.name)),
      notes: this.data.notes.filter(n => has(n.title) || has(n.content)),
      scripts: this.data.scripts.filter(s => has(s.title) || has(s.content)),
      videos: this.data.videos.filter(v => has(v.title)),
    };
  }

  // ============ RESET ============
  buildSampleData() {
    return {
      ...getDefaultData(),
      ...generateSampleData(),
      settings: { ...getDefaultData().settings, ...(this.data?.settings || {}) },
      schemaVersion: SCHEMA_VERSION,
      lastLoginDate: localDate(),
    };
  }

  // Replaces everything with the demo content (keeps settings)
  loadSampleData() {
    this.data = this.buildSampleData();
    this.notify();
  }

  // Deletes everything and starts empty (keeps theme and name)
  resetAll() {
    const defaults = getDefaultData();
    this.data = {
      ...defaults,
      settings: { ...defaults.settings, theme: this.data.settings.theme, userName: this.data.settings.userName },
      schemaVersion: SCHEMA_VERSION,
      lastLoginDate: localDate(),
    };
    this.notify();
  }
}

// Singleton
const store = new DataStore();
export default store;
