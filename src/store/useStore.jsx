import { createContext, useContext, useState, useEffect } from 'react';
import store from './dataStore';

const StoreContext = createContext(null);

export function StoreProvider({ children }) {
  const [data, setData] = useState(store.getData());

  useEffect(() => {
    // The store replaces collections immutably, so the new object can be used as-is
    const unsubscribe = store.subscribe(setData);
    return unsubscribe;
  }, []);

  // Apply the theme setting to the page (CSS tokens and Tailwind `dark:` key off data-theme)
  const theme = data.settings.theme === 'dark' ? 'dark' : 'light';
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', theme === 'dark' ? '#0b0b0d' : '#fbfbfd');
  }, [theme]);

  return (
    <StoreContext.Provider value={{ data, store }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const context = useContext(StoreContext);
  if (!context) throw new Error('useStore must be used within StoreProvider');
  return context;
}

// Convenience hooks
export function useTasks() {
  const { data, store: s } = useStore();
  return {
    tasks: data.tasks,
    categories: data.categories,
    todayTasks: s.getTodayTasks(),
    addTask: (t) => s.addTask(t),
    updateTask: (id, u) => s.updateTask(id, u),
    toggleTask: (id) => s.toggleTask(id),
    deleteTask: (id) => s.deleteTask(id),
    deleteTasks: (ids) => s.deleteTasks(ids),
    duplicateTask: (id) => s.duplicateTask(id),
    getCompletionsByDate: (start, end) => s.getCompletionsByDate(start, end),
  };
}

export function useIdeas() {
  const { data, store: s } = useStore();
  return {
    ideas: data.ideas,
    addIdea: (i) => s.addIdea(i),
    updateIdea: (id, u) => s.updateIdea(id, u),
    deleteIdea: (id) => s.deleteIdea(id),
    convertToVideo: (id) => s.convertIdeaToVideo(id),
  };
}

export function useNotebooks() {
  const { data, store: s } = useStore();
  return {
    notebooks: data.notebooks,
    notes: data.notes,
    addNotebook: (n) => s.addNotebook(n),
    updateNotebook: (id, u) => s.updateNotebook(id, u),
    deleteNotebook: (id) => s.deleteNotebook(id),
    getNotebookNotes: (id) => s.getNotebookNotes(id),
    addNote: (n) => s.addNote(n),
    updateNote: (id, u) => s.updateNote(id, u),
    deleteNote: (id) => s.deleteNote(id),
  };
}

export function useScripts() {
  const { data, store: s } = useStore();
  return {
    scripts: data.scripts,
    addScript: (sc) => s.addScript(sc),
    updateScript: (id, u) => s.updateScript(id, u),
    deleteScript: (id) => s.deleteScript(id),
  };
}

export function useVideos() {
  const { data, store: s } = useStore();
  return {
    videos: data.videos,
    addVideo: (v) => s.addVideo(v),
    updateVideo: (id, u) => s.updateVideo(id, u),
    updateStage: (id, stage, val) => s.updateVideoStage(id, stage, val),
    updatePlatform: (vid, pid, field, val) => s.updateVideoPlatform(vid, pid, field, val),
    deleteVideo: (id) => s.deleteVideo(id),
    getProgress: (id) => s.getVideoProgress(id),
  };
}

export function useSettings() {
  const { data, store: s } = useStore();
  return {
    settings: data.settings,
    categories: data.categories,
    platforms: data.platforms,
    contentGoals: data.contentGoals,
    streak: data.streak,
    updateSettings: (u) => s.updateSettings(u),
    updateContentGoals: (g) => s.updateContentGoals(g),
    addCategory: (c) => s.addCategory(c),
    deleteCategory: (id) => s.deleteCategory(id),
    clearData: () => s.resetAll(),
    addSampleData: () => s.loadSampleData(),
  };
}

export function useAnalytics() {
  const { store: s } = useStore();
  return {
    getStats: (period) => s.getStats(period),
    getContentGoalProgress: () => s.getContentGoalProgress(),
  };
}

export function useSearch() {
  const { store: s } = useStore();
  return {
    search: (query) => s.search(query),
  };
}
