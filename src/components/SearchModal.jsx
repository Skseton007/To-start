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

  const results = store.search(query);
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
    <div className="search-overlay" onClick={onClose}>
      <div className="search-container" onClick={e => e.stopPropagation()}>
        <div className="search-input-wrapper">
          <Search size={20} style={{ color: 'var(--text-tertiary)' }} />
          <input
            ref={inputRef}
            className="search-input"
            placeholder="Search tasks, ideas, notebooks, scripts, videos..."
            value={query}
            onChange={e => setQuery(e.target.value)}
          />
          <button className="btn btn-ghost btn-icon" onClick={onClose}>
            <X size={18} />
          </button>
        </div>
        <div className="search-results">
          {query.length >= 2 && !hasResults && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              No results found for "{query}"
            </div>
          )}
          {query.length < 2 && (
            <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
              Type at least 2 characters to search
            </div>
          )}
          {Object.entries(results).map(([type, items]) => {
            if (items.length === 0) return null;
            const Icon = icons[type];
            return (
              <div key={type}>
                <div className="search-result-group">{labels[type]}</div>
                {items.slice(0, 5).map(item => (
                  <div
                    key={item.id}
                    className="search-result-item"
                    onClick={() => handleSelect(type, item)}
                  >
                    <Icon size={16} style={{ color: 'var(--text-tertiary)', flexShrink: 0 }} />
                    <span style={{ fontSize: '14px' }}>{item.title || item.name}</span>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
