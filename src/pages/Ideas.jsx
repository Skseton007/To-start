import React, { useState, useMemo } from 'react';
import { useIdeas } from "../store/useStore";
import { 
  Plus, Search, Filter, Edit2, Trash2, ArrowRight, Video, Tag, Calendar, X
} from 'lucide-react';
import { format } from 'date-fns';

export default function Ideas() {
  const { ideas, addIdea, updateIdea, deleteIdea, convertToVideo } = useIdeas();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingIdea, setEditingIdea] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    tags: '',
    status: 'new',
    notes: ''
  });

  const statuses = ['new', 'planning', 'in-progress', 'completed', 'published'];
  const statusLabels = {
    'new': 'New',
    'planning': 'Planning',
    'in-progress': 'In Progress',
    'completed': 'Completed',
    'published': 'Published'
  };

  const categories = useMemo(() => {
    const cats = new Set(ideas.map(i => i.category).filter(Boolean));
    return ['All', ...Array.from(cats)];
  }, [ideas]);

  const filteredIdeas = useMemo(() => {
    return ideas.filter(idea => {
      const matchesSearch = idea.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            idea.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === 'All' || idea.status === statusFilter.toLowerCase();
      const matchesCategory = categoryFilter === 'All' || idea.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    }).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }, [ideas, searchQuery, statusFilter, categoryFilter]);

  const handleOpenModal = (idea = null) => {
    if (idea) {
      setEditingIdea(idea);
      setFormData({
        title: idea.title,
        description: idea.description || '',
        category: idea.category || '',
        tags: (idea.tags || []).join(', '),
        status: idea.status || 'new',
        notes: idea.notes || ''
      });
    } else {
      setEditingIdea(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: '',
        status: 'new',
        notes: ''
      });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingIdea(null);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const ideaData = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };

    if (editingIdea) {
      updateIdea(editingIdea.id, ideaData);
    } else {
      addIdea(ideaData);
    }
    handleCloseModal();
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this idea?')) {
      deleteIdea(id);
    }
  };

  const handleConvertToVideo = (e, id) => {
    e.stopPropagation();
    convertToVideo(id);
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Ideas</h1>
          <p className="text-gray-500 dark:text-gray-400">Capture and organize your content concepts.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          <Plus size={20} />
          <span>Add Idea</span>
        </button>
      </div>

      <div className="filters-bar flex flex-col md:flex-row gap-4 mb-8">
        <div className="search-wrapper relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search ideas..." 
            className="input-field w-full pl-10 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <div className="filter-wrapper relative flex items-center min-w-[150px]">
            <Filter className="absolute left-3 text-gray-400" size={16} />
            <select 
              className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] w-full appearance-none outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {Object.values(statusLabels).map(label => (
                <option key={label} value={label}>{label}</option>
              ))}
            </select>
          </div>
          
          <div className="filter-wrapper relative flex items-center min-w-[150px]">
            <Tag className="absolute left-3 text-gray-400" size={16} />
            <select 
              className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] w-full appearance-none outline-none"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {filteredIdeas.length === 0 ? (
        <div className="empty-state flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <Plus className="text-gray-400" size={40} />
          </div>
          <h3 className="text-xl font-semibold mb-2">No ideas found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {searchQuery || statusFilter !== 'All' || categoryFilter !== 'All' 
              ? "Try adjusting your filters or search query." 
              : "You haven't added any ideas yet. Click 'Add Idea' to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredIdeas.map(idea => (
            <div 
              key={idea.id} 
              className="idea-card glass-card p-6 rounded-2xl cursor-pointer hover:shadow-lg transition-all border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] relative group"
              onClick={() => handleOpenModal(idea)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className={`badge badge-status-${idea.status} px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider`}>
                  {statusLabels[idea.status]}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button onClick={(e) => handleDelete(e, idea.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-2 line-clamp-2">{idea.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-4 line-clamp-3">
                {idea.description || "No description provided."}
              </p>
              
              {idea.tags && idea.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {idea.tags.map((tag, idx) => (
                    <span key={idx} className="text-xs bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-2 py-1 rounded-md">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center text-xs text-gray-400 gap-1">
                  <Calendar size={14} />
                  <span>{format(new Date(idea.createdAt), 'MMM d, yyyy')}</span>
                </div>
                
                <button 
                  onClick={(e) => handleConvertToVideo(e, idea.id)}
                  className="flex items-center gap-1 text-sm font-medium text-black dark:text-white hover:underline"
                >
                  <Video size={14} />
                  <span>To Video</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121212] rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="sticky top-0 bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-2xl font-bold">{editingIdea ? 'Edit Idea' : 'Add New Idea'}</h2>
              <button onClick={handleCloseModal} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                  placeholder="Enter idea title"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white outline-none min-h-[100px]"
                  placeholder="Describe your idea..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Category</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                    placeholder="e.g. Tutorial, Vlog"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{statusLabels[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Tags (comma-separated)</label>
                <input 
                  type="text" 
                  value={formData.tags}
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                  placeholder="tech, review, setup"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Notes</label>
                <textarea 
                  value={formData.notes}
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white outline-none min-h-[100px]"
                  placeholder="Any additional notes..."
                />
              </div>
              
              <div className="flex justify-end gap-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={handleCloseModal} className="px-6 py-2 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 rounded-lg font-medium bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  Save Idea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
