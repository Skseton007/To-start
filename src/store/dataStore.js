// Central Data Store with localStorage persistence
import { v4 as uuidv4 } from 'uuid';

const STORAGE_KEY = 'tostart_data';

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
    theme: 'dark',
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
  const today = now.toISOString().split('T')[0];
  const yesterday = new Date(now - 86400000).toISOString().split('T')[0];

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
      deadline: new Date(now.getTime() + 86400000 * 2).toISOString().split('T')[0],
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
      deadline: new Date(now.getTime() + 86400000 * 5).toISOString().split('T')[0],
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
      deadline: new Date(now.getTime() + 86400000 * 7).toISOString().split('T')[0],
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
      deadline: new Date(now.getTime() + 86400000 * 14).toISOString().split('T')[0],
      notes: 'Wait for new monitor to arrive',
      createdAt: now.toISOString(),
    },
  ];

  return { tasks, ideas, notebooks, notes, scripts, videos };
};

class DataStore {
  constructor() {
    this.listeners = new Set();
    this.data = this.load();
  }

  load() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Merge with defaults to handle new fields
        const defaults = getDefaultData();
        return { ...defaults, ...parsed };
      }
    } catch (e) {
      console.error('Failed to load data:', e);
    }
    // First time: generate with sample data
    const defaults = getDefaultData();
    const sampleData = generateSampleData();
    const data = { ...defaults, ...sampleData };
    this.save(data);
    return data;
  }

  save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data || this.data));
    } catch (e) {
      console.error('Failed to save data:', e);
    }
  }

  subscribe(listener) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  notify() {
    this.save();
    this.listeners.forEach(l => l(this.data));
  }

  getData() {
    return this.data;
  }

  // Update streak
  updateStreak() {
    const today = new Date().toISOString().split('T')[0];
    const streak = this.data.streak;
    if (streak.lastActiveDate === today) return;
    
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    if (streak.lastActiveDate === yesterday) {
      streak.current += 1;
    } else if (streak.lastActiveDate !== today) {
      streak.current = 1;
    }
    streak.lastActiveDate = today;
    if (streak.current > streak.best) streak.best = streak.current;
    this.notify();
  }

  // ============ TASKS ============
  addTask(task) {
    const newTask = {
      id: uuidv4(),
      title: task.title || '',
      completed: false,
      priority: task.priority || 'medium',
      category: task.category || 'personal',
      date: task.date || new Date().toISOString().split('T')[0],
      time: task.time || '',
      notes: task.notes || '',
      reminder: task.reminder || null,
      createdAt: new Date().toISOString(),
      completedAt: null,
    };
    this.data.tasks.unshift(newTask);
    this.updateStreak();
    this.notify();
    return newTask;
  }

  updateTask(id, updates) {
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      this.data.tasks[idx] = { ...this.data.tasks[idx], ...updates };
      this.notify();
    }
  }

  toggleTask(id) {
    const idx = this.data.tasks.findIndex(t => t.id === id);
    if (idx !== -1) {
      const task = this.data.tasks[idx];
      task.completed = !task.completed;
      task.completedAt = task.completed ? new Date().toISOString() : null;
      this.updateStreak();
      this.notify();
    }
  }

  deleteTask(id) {
    this.data.tasks = this.data.tasks.filter(t => t.id !== id);
    this.notify();
  }

  duplicateTask(id) {
    const task = this.data.tasks.find(t => t.id === id);
    if (task) {
      const newTask = { ...task, id: uuidv4(), completed: false, completedAt: null, createdAt: new Date().toISOString() };
      this.data.tasks.unshift(newTask);
      this.notify();
      return newTask;
    }
  }

  getTodayTasks() {
    const today = new Date().toISOString().split('T')[0];
    return this.data.tasks.filter(t => t.date === today);
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
      createdAt: new Date().toISOString(),
    };
    this.data.ideas.unshift(newIdea);
    this.notify();
    return newIdea;
  }

  updateIdea(id, updates) {
    const idx = this.data.ideas.findIndex(i => i.id === id);
    if (idx !== -1) {
      this.data.ideas[idx] = { ...this.data.ideas[idx], ...updates };
      this.notify();
    }
  }

  deleteIdea(id) {
    this.data.ideas = this.data.ideas.filter(i => i.id !== id);
    this.notify();
  }

  convertIdeaToVideo(ideaId) {
    const idea = this.data.ideas.find(i => i.id === ideaId);
    if (idea) {
      idea.status = 'in-progress';
      const video = this.addVideo({
        title: idea.title,
        ideaId: idea.id,
        category: idea.category,
        notes: idea.description,
      });
      this.notify();
      return video;
    }
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
    this.data.notebooks.push(newNotebook);
    this.notify();
    return newNotebook;
  }

  updateNotebook(id, updates) {
    const idx = this.data.notebooks.findIndex(n => n.id === id);
    if (idx !== -1) {
      this.data.notebooks[idx] = { ...this.data.notebooks[idx], ...updates };
      this.notify();
    }
  }

  deleteNotebook(id) {
    this.data.notebooks = this.data.notebooks.filter(n => n.id !== id);
    this.data.notes = this.data.notes.filter(n => n.notebookId !== id);
    this.notify();
  }

  getNotebookNotes(notebookId) {
    return this.data.notes.filter(n => n.notebookId === notebookId);
  }

  // ============ NOTES ============
  addNote(note) {
    const newNote = {
      id: uuidv4(),
      notebookId: note.notebookId,
      title: note.title || 'Untitled Note',
      content: note.content || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.notes.unshift(newNote);
    this.notify();
    return newNote;
  }

  updateNote(id, updates) {
    const idx = this.data.notes.findIndex(n => n.id === id);
    if (idx !== -1) {
      this.data.notes[idx] = { ...this.data.notes[idx], ...updates, updatedAt: new Date().toISOString() };
      this.notify();
    }
  }

  deleteNote(id) {
    this.data.notes = this.data.notes.filter(n => n.id !== id);
    this.notify();
  }

  // ============ SCRIPTS ============
  addScript(script) {
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
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.data.scripts.unshift(newScript);
    this.notify();
    return newScript;
  }

  updateScript(id, updates) {
    const idx = this.data.scripts.findIndex(s => s.id === id);
    if (idx !== -1) {
      this.data.scripts[idx] = { ...this.data.scripts[idx], ...updates, updatedAt: new Date().toISOString() };
      this.notify();
    }
  }

  deleteScript(id) {
    this.data.scripts = this.data.scripts.filter(s => s.id !== id);
    this.notify();
  }

  // ============ VIDEOS ============
  addVideo(video) {
    const newVideo = {
      id: uuidv4(),
      title: video.title || 'Untitled Video',
      ideaId: video.ideaId || null,
      scriptId: video.scriptId || null,
      contentType: video.contentType || 'video',
      category: video.category || 'content',
      platforms: video.platforms || [
        { platformId: 'youtube', uploaded: false, published: false },
        { platformId: 'instagram', uploaded: false, published: false },
      ],
      status: 'idea',
      stages: { idea: true, script: false, recording: false, editing: false, review: false, ready: false, published: false },
      deadline: video.deadline || null,
      notes: video.notes || '',
      createdAt: new Date().toISOString(),
    };
    this.data.videos.unshift(newVideo);
    this.notify();
    return newVideo;
  }

  updateVideo(id, updates) {
    const idx = this.data.videos.findIndex(v => v.id === id);
    if (idx !== -1) {
      this.data.videos[idx] = { ...this.data.videos[idx], ...updates };
      this.notify();
    }
  }

  updateVideoStage(id, stage, value) {
    const idx = this.data.videos.findIndex(v => v.id === id);
    if (idx !== -1) {
      this.data.videos[idx].stages[stage] = value;
      // Auto-update status based on stages
      const stages = this.data.videos[idx].stages;
      if (stages.published) this.data.videos[idx].status = 'published';
      else if (stages.ready) this.data.videos[idx].status = 'ready';
      else if (stages.review) this.data.videos[idx].status = 'review';
      else if (stages.editing) this.data.videos[idx].status = 'editing';
      else if (stages.recording) this.data.videos[idx].status = 'recording';
      else if (stages.script) this.data.videos[idx].status = 'script';
      else this.data.videos[idx].status = 'idea';
      this.notify();
    }
  }

  updateVideoPlatform(videoId, platformId, field, value) {
    const idx = this.data.videos.findIndex(v => v.id === videoId);
    if (idx !== -1) {
      const pIdx = this.data.videos[idx].platforms.findIndex(p => p.platformId === platformId);
      if (pIdx !== -1) {
        this.data.videos[idx].platforms[pIdx][field] = value;
        this.notify();
      }
    }
  }

  deleteVideo(id) {
    this.data.videos = this.data.videos.filter(v => v.id !== id);
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
    this.data.categories = this.data.categories.filter(c => c.id !== id);
    this.notify();
  }

  addCategory(category) {
    const newCat = {
      id: uuidv4(),
      name: category.name,
      color: category.color || '#6b7280',
    };
    this.data.categories.push(newCat);
    this.notify();
    return newCat;
  }

  // ============ SETTINGS ============
  updateSettings(updates) {
    this.data.settings = { ...this.data.settings, ...updates };
    this.notify();
  }

  updateContentGoals(goals) {
    this.data.contentGoals = { ...this.data.contentGoals, ...goals };
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
    this.data.reminders.push(newReminder);
    this.notify();
    return newReminder;
  }

  // ============ ANALYTICS ============
  getStats(period = 'day') {
    const now = new Date();
    const today = now.toISOString().split('T')[0];
    
    let startDate;
    if (period === 'day') {
      startDate = today;
    } else if (period === 'week') {
      const d = new Date(now);
      d.setDate(d.getDate() - d.getDay());
      startDate = d.toISOString().split('T')[0];
    } else {
      startDate = now.toISOString().slice(0, 7) + '-01';
    }

    const tasksInPeriod = this.data.tasks.filter(t => t.date >= startDate);
    const completedTasks = tasksInPeriod.filter(t => t.completed);
    const ideasInPeriod = this.data.ideas.filter(i => i.createdAt >= startDate);
    const scriptsInPeriod = this.data.scripts.filter(s => s.createdAt >= startDate);
    const videosInPeriod = this.data.videos.filter(v => v.createdAt >= startDate);
    const publishedVideos = videosInPeriod.filter(v => v.status === 'published');

    return {
      totalTasks: tasksInPeriod.length,
      completedTasks: completedTasks.length,
      taskProgress: tasksInPeriod.length ? Math.round((completedTasks.length / tasksInPeriod.length) * 100) : 0,
      ideasCreated: ideasInPeriod.length,
      scriptsWritten: scriptsInPeriod.length,
      videosTotal: videosInPeriod.length,
      videosPublished: publishedVideos.length,
      videosInProgress: videosInPeriod.filter(v => !['published', 'idea'].includes(v.status)).length,
    };
  }

  getContentGoalProgress() {
    const today = new Date().toISOString().split('T')[0];
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(weekStart.getDate() - weekStart.getDay());
    const monthStart = now.toISOString().slice(0, 7) + '-01';

    const publishedToday = this.data.videos.filter(v => v.status === 'published' && v.createdAt?.startsWith(today)).length;
    const publishedWeek = this.data.videos.filter(v => v.status === 'published' && v.createdAt >= weekStart.toISOString()).length;
    const publishedMonth = this.data.videos.filter(v => v.status === 'published' && v.createdAt >= monthStart).length;

    return {
      daily: { current: publishedToday, goal: this.data.contentGoals.daily },
      weekly: { current: publishedWeek, goal: this.data.contentGoals.weekly },
      monthly: { current: publishedMonth, goal: this.data.contentGoals.monthly },
    };
  }

  // ============ SEARCH ============
  search(query) {
    if (!query || query.length < 2) return { tasks: [], ideas: [], notebooks: [], notes: [], scripts: [], videos: [] };
    const q = query.toLowerCase();
    return {
      tasks: this.data.tasks.filter(t => t.title.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q)),
      ideas: this.data.ideas.filter(i => i.title.toLowerCase().includes(q) || i.description?.toLowerCase().includes(q)),
      notebooks: this.data.notebooks.filter(n => n.name.toLowerCase().includes(q)),
      notes: this.data.notes.filter(n => n.title.toLowerCase().includes(q) || n.content?.toLowerCase().includes(q)),
      scripts: this.data.scripts.filter(s => s.title.toLowerCase().includes(q) || s.content?.toLowerCase().includes(q)),
      videos: this.data.videos.filter(v => v.title.toLowerCase().includes(q)),
    };
  }

  // ============ RESET ============
  clearSampleData() {
    this.data = getDefaultData();
    this.notify();
  }

  resetAll() {
    localStorage.removeItem(STORAGE_KEY);
    this.data = this.load();
    this.notify();
  }
}

// Singleton
const store = new DataStore();
export default store;
