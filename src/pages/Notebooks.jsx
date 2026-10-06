import React, { useState, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useNotebooks } from '../store/useStore';
import {
  Book, Bookmark, Lightbulb, Star, Heart, Code, Music, Camera,
  Film, Globe, Coffee, Zap, Target, Compass, Feather, PenTool,
  Plus, Search, Edit3, Trash2, MoreVertical, X, MoreHorizontal, FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

const COLORS = [
  '#ef4444', '#f59e0b', '#22c55e', '#10b981', '#06b6d4', '#3b82f6',
  '#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#64748b', '#1e293b'
];

const ICONS = {
  book: Book, bookmark: Bookmark, lightbulb: Lightbulb, star: Star,
  heart: Heart, code: Code, music: Music, camera: Camera, film: Film,
  globe: Globe, coffee: Coffee, zap: Zap, target: Target, compass: Compass,
  feather: Feather, 'pen-tool': PenTool
};

export default function Notebooks() {
  const navigate = useNavigate();
  const { notebooks, addNotebook, updateNotebook, deleteNotebook, getNotebookNotes } = useNotebooks();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingNotebook, setEditingNotebook] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  
  // Modal state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState(COLORS[5]); // Default blue
  const [icon, setIcon] = useState('book');

  const filteredNotebooks = useMemo(() => {
    if (!searchQuery.trim()) return notebooks;
    const q = searchQuery.toLowerCase();
    return notebooks.filter(nb => 
      nb.name.toLowerCase().includes(q) || 
      (nb.description && nb.description.toLowerCase().includes(q))
    );
  }, [notebooks, searchQuery]);

  const openModal = (notebook = null) => {
    if (notebook) {
      setEditingNotebook(notebook);
      setName(notebook.name);
      setDescription(notebook.description || '');
      setColor(notebook.color || COLORS[5]);
      setIcon(notebook.icon || 'book');
    } else {
      setEditingNotebook(null);
      setName('');
      setDescription('');
      setColor(COLORS[5]);
      setIcon('book');
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingNotebook(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingNotebook) {
      updateNotebook(editingNotebook.id, { name, description, color, icon });
    } else {
      addNotebook({ name, description, color, icon });
    }
    closeModal();
  };

  const handleDelete = (id) => {
    deleteNotebook(id);
    setShowDeleteConfirm(null);
  };

  return (
    <div className="page-container p-6 pb-24 md:pb-6 fade-in h-full overflow-y-auto">
      <div className="max-w-7xl mx-auto">
        <header className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Notebooks</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Organize your thoughts and notes</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notebooks..."
                className="input-field pl-9 py-2 w-full text-sm"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn-primary py-2 px-4 whitespace-nowrap" onClick={() => openModal()}>
              <Plus className="w-4 h-4 mr-2" />
              New Notebook
            </button>
          </div>
        </header>

        {filteredNotebooks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="w-20 h-20 bg-gray-100 dark:bg-dark-border rounded-full flex items-center justify-center mb-6">
              <Book className="w-10 h-10 text-gray-400" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">No notebooks found</h2>
            <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
              {searchQuery ? "No notebooks match your search query." : "Create your first notebook to start organizing your thoughts, research, and ideas."}
            </p>
            {!searchQuery && (
              <button className="btn-primary" onClick={() => openModal()}>
                <Plus className="w-4 h-4 mr-2" />
                Create Notebook
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredNotebooks.map(notebook => {
              const IconComponent = ICONS[notebook.icon] || Book;
              const noteCount = getNotebookNotes(notebook.id).length;
              
              return (
                <div 
                  key={notebook.id}
                  className="notebook-card bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-xl p-5 relative group cursor-pointer transition-all hover:shadow-lg dark:hover:shadow-none hover:-translate-y-1 flex flex-col h-full"
                  style={{ '--notebook-color': notebook.color || COLORS[5] }}
                  onClick={() => navigate(`/notebooks/${notebook.id}`)}
                >
                  <div className="absolute top-0 left-0 right-0 h-1 rounded-t-xl" style={{ backgroundColor: notebook.color || COLORS[5] }} />
                  
                  <div className="flex justify-between items-start mb-4 mt-2">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-sm" style={{ backgroundColor: notebook.color || COLORS[5] }}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    
                    <div className="relative" onClick={e => e.stopPropagation()}>
                      <button 
                        className="p-1.5 rounded-md text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-dark-hover transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          // In a real app this would be a dropdown menu, for simplicity here it's inline
                          const isActionMenuOpen = document.getElementById(`actions-${notebook.id}`)?.classList.contains('hidden');
                          document.querySelectorAll('.action-menu').forEach(el => el.classList.add('hidden'));
                          if (isActionMenuOpen) {
                            document.getElementById(`actions-${notebook.id}`)?.classList.remove('hidden');
                          }
                        }}
                      >
                        <MoreHorizontal className="w-5 h-5" />
                      </button>
                      
                      <div id={`actions-${notebook.id}`} className="action-menu hidden absolute right-0 top-full mt-1 w-36 bg-white dark:bg-dark-card border border-gray-200 dark:border-dark-border rounded-lg shadow-lg z-10 py-1">
                        <button 
                          className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-dark-hover flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById(`actions-${notebook.id}`)?.classList.add('hidden');
                            openModal(notebook);
                          }}
                        >
                          <Edit3 className="w-4 h-4 mr-2" /> Edit
                        </button>
                        <button 
                          className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                          onClick={(e) => {
                            e.stopPropagation();
                            document.getElementById(`actions-${notebook.id}`)?.classList.add('hidden');
                            setShowDeleteConfirm(notebook.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4 mr-2" /> Delete
                        </button>
                      </div>
                    </div>
                  </div>
                  
                  <h3 className="font-semibold text-lg text-gray-900 dark:text-white mb-1 line-clamp-1">{notebook.name}</h3>
                  <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-2 mb-4 flex-grow">
                    {notebook.description || 'No description'}
                  </p>
                  
                  <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-dark-border">
                    <span className="text-xs font-medium text-gray-500 dark:text-gray-400 flex items-center">
                      <FileText className="w-3.5 h-3.5 mr-1" />
                      {noteCount} {noteCount === 1 ? 'note' : 'notes'}
                    </span>
                    <span className="text-xs text-gray-400 dark:text-gray-500">
                      {formatDistanceToNow(new Date(notebook.updatedAt || notebook.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-md rounded-2xl shadow-xl border border-gray-200 dark:border-dark-border overflow-hidden transform animate-scale-in">
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-dark-border">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                {editingNotebook ? 'Edit Notebook' : 'Create Notebook'}
              </h3>
              <button onClick={closeModal} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-5">
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                  <input
                    type="text"
                    required
                    className="input-field w-full"
                    placeholder="e.g., Project Ideas"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    autoFocus
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                  <textarea
                    className="input-field w-full min-h-[80px] resize-y"
                    placeholder="What's this notebook about?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Color</label>
                  <div className="grid grid-cols-6 gap-2">
                    {COLORS.map(c => (
                      <button
                        key={c}
                        type="button"
                        className={`color-swatch w-8 h-8 rounded-full shadow-sm transition-transform ${color === c ? 'ring-2 ring-offset-2 ring-gray-900 dark:ring-white scale-110' : 'hover:scale-110'}`}
                        style={{ backgroundColor: c }}
                        onClick={() => setColor(c)}
                      />
                    ))}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Icon</label>
                  <div className="icon-picker grid grid-cols-8 gap-2">
                    {Object.entries(ICONS).map(([key, IconComp]) => (
                      <button
                        key={key}
                        type="button"
                        className={`icon-option flex items-center justify-center p-2 rounded-lg transition-colors ${icon === key ? 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white' : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-dark-hover'}`}
                        onClick={() => setIcon(key)}
                      >
                        <IconComp className="w-5 h-5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex justify-end gap-3 pt-4 border-t border-gray-200 dark:border-dark-border">
                <button type="button" className="btn-secondary py-2 px-4" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary py-2 px-4" disabled={!name.trim()}>
                  {editingNotebook ? 'Save Changes' : 'Create Notebook'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-2xl shadow-xl border border-gray-200 dark:border-dark-border p-6 transform animate-scale-in">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Notebook?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this notebook? All notes inside it will also be deleted. This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary py-2 px-4" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="bg-red-600 hover:bg-red-700 text-white rounded-xl py-2 px-4 font-medium transition-colors" onClick={() => handleDelete(showDeleteConfirm)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
