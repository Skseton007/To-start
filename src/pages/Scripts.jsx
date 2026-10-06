import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useScripts } from "../store/useStore";
import { 
  Plus, Search, Filter, Edit2, Trash2, ArrowRight, 
  FileText, Calendar, Clock, X, Play, Camera 
} from 'lucide-react';
import { format } from 'date-fns';

export default function Scripts() {
  const { scripts, addScript, deleteScript } = useScripts();
  const navigate = useNavigate();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [formData, setFormData] = useState({
    title: '',
    platform: 'youtube',
    status: 'draft',
    hook: '',
    content: '',
    cta: '',
    notes: ''
  });

  const filteredScripts = useMemo(() => {
    return scripts.filter(script => {
      const matchesSearch = script.title.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesPlatform = platformFilter === 'All' || script.platform === platformFilter.toLowerCase();
      const matchesStatus = statusFilter === 'All' || script.status === statusFilter.toLowerCase();
      
      return matchesSearch && matchesPlatform && matchesStatus;
    }).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
  }, [scripts, searchQuery, platformFilter, statusFilter]);

  const handleOpenModal = () => {
    setFormData({
      title: '',
      platform: 'youtube',
      status: 'draft',
      hook: '',
      content: '',
      cta: '',
      notes: ''
    });
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    const newScript = addScript(formData);
    setIsModalOpen(false);
    navigate(`/scripts/${newScript.id}`);
  };

  const handleDelete = (e, id) => {
    e.stopPropagation();
    if (window.confirm('Are you sure you want to delete this script?')) {
      deleteScript(id);
    }
  };

  const navigateToEditor = (id) => {
    navigate(`/scripts/${id}`);
  };

  return (
    <div className="page-container fade-in">
      <div className="page-header flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold mb-2">Scripts</h1>
          <p className="text-gray-500 dark:text-gray-400">Write and organize your video scripts.</p>
        </div>
        <button 
          onClick={handleOpenModal}
          className="btn-primary flex items-center gap-2 px-4 py-2 rounded-lg bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
        >
          <Plus size={20} />
          <span>New Script</span>
        </button>
      </div>

      <div className="filters-bar flex flex-col md:flex-row gap-4 mb-8">
        <div className="search-wrapper relative flex-grow">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input 
            type="text" 
            placeholder="Search scripts..." 
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
              value={platformFilter}
              onChange={(e) => setPlatformFilter(e.target.value)}
            >
              <option value="All">All Platforms</option>
              <option value="youtube">YouTube</option>
              <option value="instagram">Camera</option>
              <option value="tiktok">TikTok</option>
            </select>
          </div>
          
          <div className="filter-wrapper relative flex items-center min-w-[150px]">
            <Filter className="absolute left-3 text-gray-400" size={16} />
            <select 
              className="pl-9 pr-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] w-full appearance-none outline-none"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All Statuses</option>
              <option value="draft">Draft</option>
              <option value="in-progress">In Progress</option>
              <option value="completed">Completed</option>
            </select>
          </div>
        </div>
      </div>

      {filteredScripts.length === 0 ? (
        <div className="empty-state flex flex-col items-center justify-center py-20 text-center">
          <div className="w-24 h-24 mb-6 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
            <FileText className="text-gray-400" size={40} />
          </div>
          <h3 className="text-xl font-semibold mb-2">No scripts found</h3>
          <p className="text-gray-500 dark:text-gray-400 max-w-md">
            {searchQuery || platformFilter !== 'All' || statusFilter !== 'All' 
              ? "Try adjusting your filters or search query." 
              : "You haven't written any scripts yet. Click 'New Script' to start writing."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredScripts.map(script => (
            <div 
              key={script.id} 
              className="script-card glass-card p-6 rounded-2xl cursor-pointer hover:shadow-lg transition-all border border-gray-100 dark:border-gray-800 bg-white dark:bg-[#121212] relative group flex flex-col h-full"
              onClick={() => navigateToEditor(script.id)}
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg ${script.platform === 'youtube' ? 'bg-red-100 text-red-600 dark:bg-red-900/30' : 'bg-pink-100 text-pink-600 dark:bg-pink-900/30'}`}>
                    {script.platform === 'youtube' ? <Play size={16} /> : <Camera size={16} />}
                  </div>
                  <span className={`badge badge-status-${script.status} px-3 py-1 rounded-full text-xs font-medium uppercase tracking-wider`}>
                    {script.status.replace('-', ' ')}
                  </span>
                </div>
                
                <div className="opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={(e) => handleDelete(e, script.id)} className="p-1.5 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
              
              <h3 className="text-xl font-bold mb-3 line-clamp-2">{script.title || 'Untitled Script'}</h3>
              
              <div className="mb-4 flex-grow">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Hook Preview:</p>
                <p className="text-sm text-gray-700 dark:text-gray-300 italic line-clamp-3 bg-gray-50 dark:bg-[#1a1a1a] p-3 rounded-lg border-l-2 border-black dark:border-white">
                  "{script.hook || 'No hook written yet...'}"
                </p>
              </div>
              
              <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100 dark:border-gray-800">
                <div className="flex items-center text-xs text-gray-400 gap-1">
                  <Clock size={14} />
                  <span>Edited {format(new Date(script.updatedAt), 'MMM d')}</span>
                </div>
                
                <div className="flex items-center text-sm font-medium gap-1 group-hover:translate-x-1 transition-transform">
                  <span>Edit</span>
                  <ArrowRight size={16} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-[#121212] rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800">
              <h2 className="text-xl font-bold">Create New Script</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium mb-2">Title *</label>
                <input 
                  required
                  type="text" 
                  value={formData.title}
                  onChange={e => setFormData({...formData, title: e.target.value})}
                  className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                  placeholder="Script title"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Platform</label>
                  <select 
                    value={formData.platform}
                    onChange={e => setFormData({...formData, platform: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                  >
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Camera</option>
                    <option value="tiktok">TikTok</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Status</label>
                  <select 
                    value={formData.status}
                    onChange={e => setFormData({...formData, status: e.target.value})}
                    className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-transparent focus:ring-2 focus:ring-black dark:focus:ring-white outline-none"
                  >
                    <option value="draft">Draft</option>
                    <option value="in-progress">In Progress</option>
                    <option value="completed">Completed</option>
                  </select>
                </div>
              </div>
              
              <div className="flex justify-end gap-4 pt-4 mt-6 border-t border-gray-100 dark:border-gray-800">
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg font-medium hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 rounded-lg font-medium bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors">
                  Start Writing
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
