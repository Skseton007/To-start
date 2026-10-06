import React, { useState, useEffect, useRef } from 'react';
import { Search, X, CheckSquare, Lightbulb, BookOpen, FileText, Video } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';

export default function SearchModal({ onClose }) {
  const [query, setQuery] = useState('');
  const { data, store } = useStore();
  const navigate = useNavigate();
  const inputRef = useRef();

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  const results = store.search ? store.search(query) : { tasks:[], ideas:[], notebooks:[], notes:[], scripts:[], videos:[] };
  const hasResults = Object.values(results).some(arr => arr.length > 0);

  const handleSelect = (type, item) => {
    onClose();
    switch (type) {
      case 'tasks': navigate('/tasks'); break;
      case 'ideas': navigate('/ideas'); break;
      case 'notebooks': navigate(`/notebooks/${item.id}`); break;
      case 'notes': navigate(`/notebooks/${item.notebookId}`); break;
      case 'scripts': navigate(`/scripts/${item.id}`); break;
      case 'videos': navigate('/content'); break;
    }
  };

  const icons = {
    tasks: CheckSquare, ideas: Lightbulb, notebooks: BookOpen,
    notes: FileText, scripts: FileText, videos: Video
  };

  const labels = {
    tasks: 'Tasks', ideas: 'Ideas', notebooks: 'Notebooks',
    notes: 'Notes', scripts: 'Scripts', videos: 'Videos'
  };

  return (
    <div className="fixed inset-0 z-[120] flex items-start justify-center pt-24 pb-4 px-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={onClose}>
      <div className="bg-white dark:bg-[#121212] rounded-3xl w-full max-w-3xl overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800" onClick={e => e.stopPropagation()}>
        
        {/* Search Input Area */}
        <div className="flex items-center p-6 border-b border-gray-100 dark:border-gray-800">
          <Search size={28} className="text-gray-400 mr-4" />
          <input
            ref={inputRef}
            className="flex-1 bg-transparent border-none outline-none font-bold text-2xl text-gray-900 dark:text-white placeholder-gray-400"
            placeholder="Search tasks, ideas, notebooks..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors ml-4" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        {/* Search Results Area */}
        <div className="max-h-[60vh] overflow-y-auto p-4 bg-gray-50 dark:bg-[#151515]">
          {query.length >= 2 && !hasResults && (
            <div className="p-12 text-center text-gray-500 font-bold text-lg">
              No results found for "{query}"
            </div>
          )}
          {query.length < 2 && (
            <div className="p-12 text-center text-gray-400 font-bold text-lg">
              Type at least 2 characters to search your entire workspace
            </div>
          )}
          
          {Object.entries(results).map(([type, items]) => {
            if (items.length === 0) return null;
            const Icon = icons[type];
            return (
              <div key={type} className="mb-6 last:mb-0">
                <div className="px-4 mb-2 text-xs font-black uppercase tracking-widest text-indigo-500">{labels[type]}</div>
                <div className="space-y-2">
                  {items.slice(0, 5).map(item => (
                    <div
                      key={item.id}
                      className="flex items-center gap-4 p-4 rounded-2xl cursor-pointer bg-white dark:bg-[#1a1a1a] hover:bg-indigo-50 dark:hover:bg-indigo-900/30 hover:scale-[1.01] transition-all border border-transparent hover:border-indigo-100 dark:hover:border-indigo-800 group"
                      onClick={() => handleSelect(type, item)}
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
                        <Icon size={18} />
                      </div>
                      <span className="font-bold text-lg text-gray-800 dark:text-gray-200">{item.title || item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
