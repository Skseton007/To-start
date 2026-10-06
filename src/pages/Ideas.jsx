import React, { useState, useMemo } from 'react';
import { useIdeas } from "../store/useStore";
import { 
  Plus, Search, Filter, Edit2, Trash2, ArrowRight, Video, Tag, Calendar, X, Image as ImageIcon
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
    notes: '',
    coverImage: ''
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
                            (idea.description && idea.description.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === 'All' || idea.status === statusFilter.toLowerCase();
      const matchesCategory = categoryFilter === 'All' || idea.category === categoryFilter;
      
      return matchesSearch && matchesStatus && matchesCategory;
    }).sort((a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now()));
  }, [ideas, searchQuery, statusFilter, categoryFilter]);

  const handleOpenModal = (idea = null) => {
    if (idea) {
      setEditingIdea(idea);
      setFormData({
        title: idea.title,
        description: idea.description,
        category: idea.category,
        tags: idea.tags ? idea.tags.join(', ') : '',
        status: idea.status,
        notes: idea.notes,
        coverImage: idea.coverImage || ''
      });
    } else {
      setEditingIdea(null);
      setFormData({
        title: '',
        description: '',
        category: '',
        tags: '',
        status: 'new',
        notes: '',
        coverImage: ''
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
    const payload = {
      ...formData,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean)
    };
    
    if (editingIdea) {
      updateIdea(editingIdea.id, payload);
    } else {
      addIdea(payload);
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
    alert('Idea converted to Video and moved to Content Pipeline!');
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, coverImage: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-gray-900/50 p-6 rounded-3xl card-3d">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-purple-500 to-indigo-600">
            Ideas Hub
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Capture and organize your content concepts with image references.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-8 py-4 rounded-2xl hover:shadow-[0_10px_20px_rgba(139,92,246,0.4)] transition-all hover:-translate-y-1 font-bold text-lg"
        >
          <Plus size={24} /> Add Idea
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <input 
            type="text" 
            placeholder="Search ideas..." 
            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border-none focus:ring-2 focus:ring-purple-500 outline-none font-bold text-lg shadow-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex gap-4">
          <div className="relative">
            <Filter size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-500" />
            <select 
              className="pl-12 pr-10 py-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border-none focus:ring-2 focus:ring-purple-500 outline-none appearance-none font-bold text-lg shadow-sm"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              {statuses.map(s => <option key={s} value={s}>{statusLabels[s]}</option>)}
            </select>
          </div>
          
          <div className="relative">
            <Tag size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
            <select 
              className="pl-12 pr-10 py-4 rounded-2xl bg-white dark:bg-[#1a1a1a] border-none focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold text-lg shadow-sm"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Content Grid */}
      {filteredIdeas.length === 0 ? (
        <div className="card-3d rounded-3xl p-20 text-center flex flex-col items-center justify-center bg-white/50 dark:bg-gray-900/50 border-dashed border-2 border-purple-200 dark:border-purple-900">
          <div className="w-28 h-28 bg-purple-50 dark:bg-purple-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner">
            <Lightbulb size={48} className="text-purple-500" />
          </div>
          <h3 className="text-3xl font-black mb-3 text-gray-800 dark:text-gray-100">No ideas found</h3>
          <p className="text-gray-500 mb-8 max-w-md text-lg">
            {searchQuery || statusFilter !== 'All' 
              ? "Try adjusting your filters or search query." 
              : "You haven't added any ideas yet. Click 'Add Idea' to get started."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
          {filteredIdeas.map((idea, idx) => (
            <div 
              key={idea.id} 
              className="animate-slide-in-right card-3d bg-white/90 dark:bg-[#121212]/90 backdrop-blur-md p-6 rounded-[2rem] cursor-pointer hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 border border-gray-100 dark:border-gray-800 group overflow-hidden flex flex-col"
              style={{ animationDelay: (idx * 150) + 'ms' }}
              onClick={() => handleOpenModal(idea)}
            >
              {/* Cover Image */}
              {idea.coverImage && (
                <div className="w-full h-48 mb-4 rounded-xl overflow-hidden shadow-inner flex-shrink-0">
                  <img src={idea.coverImage} alt="Idea Cover" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                </div>
              )}
              
              <div className="flex justify-between items-start mb-4">
                <div className={"px-4 py-1.5 rounded-xl text-xs font-black uppercase tracking-widest text-purple-700 bg-purple-100 dark:bg-purple-900/30 dark:text-purple-300 border border-purple-200 dark:border-purple-800"}>
                  {statusLabels[idea.status]}
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                  <button onClick={(e) => handleDelete(e, idea.id)} className="p-2.5 text-gray-400 hover:text-red-500 rounded-xl bg-white dark:bg-gray-800 shadow-sm border border-gray-100 dark:border-gray-700 hover:shadow-md transition-all">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-2xl font-black mb-3 line-clamp-2 text-gray-900 dark:text-white group-hover:text-purple-600 transition-colors">{idea.title}</h3>
              <p className="text-gray-500 dark:text-gray-400 text-base mb-6 line-clamp-3 font-medium flex-grow">
                {idea.description || "No description provided."}
              </p>
              
              {idea.tags && idea.tags.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-6">
                  {idea.tags.map((tag, i) => (
                    <span key={i} className="text-xs font-bold bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700">
                      #{tag}
                    </span>
                  ))}
                </div>
              )}
              
              <div className="flex items-center justify-between mt-auto pt-5 border-t border-gray-100 dark:border-gray-800/60">
                <div className="flex items-center text-sm font-bold text-gray-400 gap-2">
                  <Calendar size={16} />
                  <span>{format(new Date(idea.createdAt), 'MMM d, yyyy')}</span>
                </div>
                
                <button 
                  onClick={(e) => handleConvertToVideo(e, idea.id)}
                  className="flex items-center gap-2 text-sm font-black text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/20 px-4 py-2 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-colors"
                >
                  <Video size={16} />
                  <span>To Video</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE/EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#121212] rounded-[2rem] w-full max-w-3xl max-h-[90vh] overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 flex flex-col">
            <div className="bg-gradient-to-r from-purple-500 to-indigo-600 p-8 flex justify-between items-center text-white shrink-0">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-sm">
                  <Lightbulb size={32} />
                </div>
                <h2 className="text-3xl font-black">{editingIdea ? 'Edit Idea' : 'Add New Idea'}</h2>
              </div>
              <button onClick={handleCloseModal} className="p-2 rounded-full hover:bg-white/20 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-8 overflow-y-auto flex-1 space-y-8 bg-white dark:bg-[#121212]">
              
              {/* Image Upload Area */}
              <div>
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Reference Image</label>
                {formData.coverImage ? (
                  <div className="relative w-full h-64 rounded-2xl overflow-hidden group">
                    <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <label className="cursor-pointer bg-white text-black px-6 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-100">
                        <ImageIcon size={20}/> Change Image
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="w-full h-40 border-2 border-dashed border-purple-300 dark:border-purple-800 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:bg-purple-50 dark:hover:bg-purple-900/10 transition-colors">
                    <ImageIcon size={40} className="text-purple-400 mb-2" />
                    <span className="font-bold text-gray-500">Click to upload a reference image</span>
                    <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                  </label>
                )}
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Title *</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-purple-500 outline-none transition-all font-bold text-lg"
                  placeholder="The next viral hit..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Description</label>
                <textarea 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                  className="w-full h-32 px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-purple-500 outline-none transition-all font-bold text-lg resize-none shadow-inner"
                  placeholder="What's this idea about?"
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Category</label>
                  <input 
                    type="text" 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-purple-500 outline-none transition-all font-bold text-lg"
                    placeholder="e.g. Tutorial, Vlog"
                  />
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-purple-500 outline-none transition-all font-bold text-lg appearance-none"
                  >
                    {statuses.map(s => (
                      <option key={s} value={s}>{statusLabels[s]}</option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Tags</label>
                <input 
                  type="text" 
                  value={formData.tags}
                  onChange={e => setFormData({...formData, tags: e.target.value})}
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-purple-500 outline-none transition-all font-bold text-lg"
                  placeholder="tech, review, setup (comma separated)"
                />
              </div>
              
              <div className="p-6 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-[#151515] shrink-0 rounded-2xl flex justify-end gap-4 mt-8">
                <button type="button" onClick={handleCloseModal} className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all text-lg">
                  Cancel
                </button>
                <button type="submit" className="px-10 py-4 rounded-2xl font-bold bg-purple-600 text-white hover:bg-purple-700 hover:shadow-[0_10px_20px_rgba(147,51,234,0.3)] transition-all hover:-translate-y-1 text-lg">
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
