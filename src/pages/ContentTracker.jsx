import React, { useState } from 'react';
import { 
  Play, Plus, Video, Calendar, CheckCircle2, 
  Edit2, Trash2, Camera, Filter, X, Target, Clock, BarChart2
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { useVideos, useSettings, useIdeas, useScripts } from "../store/useStore";

const PIPELINE_STAGES = [
  { key: 'idea', label: 'Idea' },
  { key: 'script', label: 'Script' },
  { key: 'recording', label: 'Recording' },
  { key: 'editing', label: 'Editing' },
  { key: 'review', label: 'Review' },
  { key: 'ready', label: 'Ready' },
  { key: 'published', label: 'Published' }
];

export default function ContentTracker() {
  const { videos, addVideo, updateVideo, deleteVideo, updateStage, updatePlatform } = useVideos();
  const { contentGoals, categories } = useSettings();
  const { ideas } = useIdeas();
  const { scripts } = useScripts();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filter, setFilter] = useState('All');
  const [platformFilter, setPlatformFilter] = useState('All');
  const [editingId, setEditingId] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    type: 'Long Form',
    categoryId: categories[0]?.id || '',
    deadline: format(new Date(), 'yyyy-MM-dd'),
    platforms: ['youtube'],
    ideaId: '',
    scriptId: '',
    notes: ''
  });

  const publishedVideos = videos.filter(v => v.status === 'published').length;
  const inProduction = videos.length - publishedVideos;
  
  const getProgress = (stages) => {
    const total = PIPELINE_STAGES.length;
    let completed = 0;
    PIPELINE_STAGES.forEach(s => { if(stages[s.key]) completed++ });
    return Math.round((completed / total) * 100);
  };

  const handleEdit = (video) => {
    setEditingId(video.id);
    const platKeys = video.platforms.map(p => p.platformId);
    setFormData({
      title: video.title || '',
      type: video.contentType || 'Long Form',
      categoryId: video.category || (categories[0]?.id || ''),
      deadline: video.deadline ? video.deadline.split('T')[0] : format(new Date(), 'yyyy-MM-dd'),
      platforms: platKeys,
      ideaId: video.ideaId || '',
      scriptId: video.scriptId || '',
      notes: video.notes || ''
    });
    setIsModalOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const payload = {
      title: formData.title,
      contentType: formData.type,
      category: formData.categoryId,
      deadline: formData.deadline,
      ideaId: formData.ideaId,
      scriptId: formData.scriptId,
      notes: formData.notes,
    };

    if (editingId) {
      // Don't override existing platforms array completely, just update
      updateVideo(editingId, payload);
    } else {
      const initialPlatforms = formData.platforms.map(p => ({ platformId: p, uploaded: false, published: false }));
      addVideo({ ...payload, platforms: initialPlatforms });
    }
    setIsModalOpen(false);
    setEditingId(null);
  };

  const filteredVideos = videos.filter(v => {
    if (filter !== 'All' && v.status !== filter.toLowerCase()) return false;
    if (platformFilter !== 'All') {
      const hasPlat = v.platforms?.some(p => p.platformId === platformFilter.toLowerCase());
      if (!hasPlat) return false;
    }
    return true;
  });

  const getPlatformStatus = (video, platformId) => {
    return video.platforms?.find(p => p.platformId === platformId)?.published || false;
  };

  const togglePlatform = (videoId, platformId, currentStatus) => {
    updatePlatform(videoId, platformId, 'published', !currentStatus);
  };

  const hasPlatform = (video, platformId) => {
    return video.platforms?.some(p => p.platformId === platformId);
  };

  return (
    <div className="p-6 md:p-8 max-w-7xl mx-auto space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-500 dark:from-white dark:to-gray-400">
            Content Pipeline
          </h1>
          <p className="text-gray-500 mt-1">Track your video production</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full hover:shadow-xl transition-all hover:-translate-y-0.5 font-medium"
        >
          <Plus size={20} /> New Video
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card-3d p-6 rounded-3xl bg-white/50 dark:bg-gray-900/50 flex flex-col justify-center">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <Video size={20} /> <span className="font-medium">Total Videos</span>
          </div>
          <span className="text-3xl font-bold">{videos.length}</span>
        </div>
        <div className="card-3d p-6 rounded-3xl bg-white/50 dark:bg-gray-900/50 flex flex-col justify-center">
          <div className="flex items-center gap-3 text-blue-500 mb-2">
            <Clock size={20} /> <span className="font-medium text-gray-500">In Production</span>
          </div>
          <span className="text-3xl font-bold text-blue-500">{inProduction}</span>
        </div>
        <div className="card-3d p-6 rounded-3xl bg-white/50 dark:bg-gray-900/50 flex flex-col justify-center">
          <div className="flex items-center gap-3 text-emerald-500 mb-2">
            <CheckCircle2 size={20} /> <span className="font-medium text-gray-500">Published</span>
          </div>
          <span className="text-3xl font-bold text-emerald-500">{publishedVideos}</span>
        </div>
        <div className="card-3d p-6 rounded-3xl bg-white/50 dark:bg-gray-900/50 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-500 font-medium">
              <Target size={20} className="text-purple-500"/> Weekly Goal
            </div>
            <span className="text-sm font-bold text-purple-500">{publishedVideos} / {contentGoals?.weekly || 3}</span>
          </div>
          <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-purple-500 to-pink-500 transition-all duration-1000"
              style={{ width: \`\${Math.min((publishedVideos / (contentGoals?.weekly || 3)) * 100, 100)}%\` }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="relative">
          <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <select 
            className="pl-11 pr-8 py-3 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 focus:ring-2 outline-none appearance-none font-medium shadow-sm"
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Stages</option>
            {PIPELINE_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div className="relative">
          <Play size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
          <select 
            className="pl-11 pr-8 py-3 rounded-2xl bg-white/80 dark:bg-gray-900/80 border border-gray-100 dark:border-gray-800 focus:ring-2 outline-none appearance-none font-medium shadow-sm"
            value={platformFilter} 
            onChange={(e) => setPlatformFilter(e.target.value)}
          >
            <option value="All">All Platforms</option>
            <option value="youtube">YouTube</option>
            <option value="instagram">Instagram</option>
          </select>
        </div>
      </div>

      {/* Content List */}
      <div className="space-y-6">
        {filteredVideos.length === 0 ? (
          <div className="card-3d rounded-3xl p-16 text-center flex flex-col items-center justify-center bg-white/30 dark:bg-gray-900/30">
            <div className="w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-6">
              <Video size={40} className="text-gray-400" />
            </div>
            <h3 className="text-2xl font-bold mb-2">No videos found</h3>
            <p className="text-gray-500 mb-8 max-w-md">Start your production pipeline by adding a new video to track.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full hover:shadow-xl transition-all font-medium"
            >
              <Plus size={20} /> Add Video
            </button>
          </div>
        ) : (
          filteredVideos.map(video => {
            const category = categories.find(c => c.id === video.category);
            const progress = getProgress(video.stages);
            
            return (
              <div key={video.id} className="card-3d p-6 rounded-3xl bg-white/80 dark:bg-[#151515] hover:shadow-lg transition-all group">
                
                {/* Top Row */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold line-clamp-1">{video.title}</h3>
                      {category && (
                        <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide" style={{ backgroundColor: category.color + '22', color: category.color }}>
                          {category.name}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-full text-xs font-bold tracking-wide bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">
                        {video.contentType}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-500">
                      <div className="flex items-center gap-1.5">
                        <Calendar size={14} />
                        {format(new Date(video.deadline), 'MMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-1.5 capitalize font-medium text-indigo-500">
                        <Target size={14} /> {video.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                    <button onClick={() => handleEdit(video)} className="p-2.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-500 transition-colors">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(video.id)} className="p-2.5 rounded-full hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-500 transition-colors">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Pipeline Nodes */}
                <div className="w-full mb-8 relative px-4">
                  <div className="absolute left-6 right-6 top-1/2 -translate-y-1/2 h-1 bg-gray-100 dark:bg-gray-800 -z-10 rounded-full" />
                  <div className="flex justify-between relative z-10">
                    {PIPELINE_STAGES.map((stage) => {
                      const isCompleted = video.stages[stage.key];
                      return (
                        <div 
                          key={stage.key}
                          onClick={() => updateStage(video.id, stage.key, !isCompleted)}
                          className="flex flex-col items-center gap-2 cursor-pointer group/stage"
                        >
                          <div className={\`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-300 \${isCompleted ? 'bg-indigo-500 text-white scale-110 shadow-md shadow-indigo-500/20' : 'bg-gray-200 dark:bg-gray-700 text-transparent group-hover/stage:bg-gray-300 dark:group-hover/stage:bg-gray-600'}\`}>
                            {isCompleted && <CheckCircle2 size={14} strokeWidth={3} />}
                          </div>
                          <span className={\`text-xs font-semibold \${isCompleted ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400'}\`}>
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Row */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-gray-800/60">
                  <div className="flex-1 max-w-[200px]">
                    <div className="flex justify-between mb-1.5">
                      <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Progress</span>
                      <span className="text-xs font-bold text-indigo-500">{progress}%</span>
                    </div>
                    <div className="h-1.5 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500 rounded-full transition-all duration-500" style={{ width: \`\${progress}%\` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    {hasPlatform(video, 'youtube') && (
                      <button 
                        onClick={() => togglePlatform(video.id, 'youtube', getPlatformStatus(video, 'youtube'))}
                        className={\`flex items-center gap-1.5 text-sm font-semibold transition-colors \${getPlatformStatus(video, 'youtube') ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}\`}
                      >
                        <Play size={18} className={getPlatformStatus(video, 'youtube') ? 'fill-current' : ''} />
                      </button>
                    )}
                    {hasPlatform(video, 'instagram') && (
                      <button 
                        onClick={() => togglePlatform(video.id, 'instagram', getPlatformStatus(video, 'instagram'))}
                        className={\`flex items-center gap-1.5 text-sm font-semibold transition-colors \${getPlatformStatus(video, 'instagram') ? 'text-pink-600' : 'text-gray-400 hover:text-pink-500'}\`}
                      >
                        <Camera size={18} className={getPlatformStatus(video, 'instagram') ? 'fill-current' : ''} />
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-md animate-fade-in">
          <div className="bg-white dark:bg-[#151515] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="sticky top-0 bg-white/90 dark:bg-[#151515]/90 backdrop-blur-md flex justify-between items-center p-6 border-b border-gray-100 dark:border-gray-800 z-10">
              <h2 className="text-2xl font-bold">{editingId ? 'Edit Video' : 'New Video'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Title *</label>
                <input 
                  type="text" 
                  className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required 
                  placeholder="Awesome video idea..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Format</label>
                  <select 
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium appearance-none"
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Long Form">Long Form</option>
                    <option value="Short">Short / Reel</option>
                    <option value="Podcast">Podcast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Category</label>
                  <select 
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium appearance-none"
                    value={formData.categoryId} 
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Deadline</label>
                <input 
                  type="date" 
                  className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium"
                  value={formData.deadline} 
                  onChange={e => setFormData({...formData, deadline: e.target.value})} 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Platforms</label>
                <div className="flex gap-4">
                  <label className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] cursor-pointer flex-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded text-indigo-500 border-gray-300 focus:ring-indigo-500"
                      checked={formData.platforms.includes('youtube')}
                      onChange={e => {
                        const plats = e.target.checked 
                          ? [...formData.platforms, 'youtube'] 
                          : formData.platforms.filter(p => p !== 'youtube');
                        setFormData({...formData, platforms: plats});
                      }}
                    />
                    <Play size={20} className="text-red-500" /> <span className="font-bold">YouTube</span>
                  </label>
                  <label className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] cursor-pointer flex-1 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                    <input 
                      type="checkbox" 
                      className="w-5 h-5 rounded text-indigo-500 border-gray-300 focus:ring-indigo-500"
                      checked={formData.platforms.includes('instagram')}
                      onChange={e => {
                        const plats = e.target.checked 
                          ? [...formData.platforms, 'instagram'] 
                          : formData.platforms.filter(p => p !== 'instagram');
                        setFormData({...formData, platforms: plats});
                      }}
                    />
                    <Camera size={20} className="text-pink-600" /> <span className="font-bold">Instagram</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Link Idea</label>
                  <select 
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium appearance-none"
                    value={formData.ideaId} 
                    onChange={e => setFormData({...formData, ideaId: e.target.value})}
                  >
                    <option value="">None</option>
                    {ideas.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Link Script</label>
                  <select 
                    className="w-full px-5 py-3 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium appearance-none"
                    value={formData.scriptId} 
                    onChange={e => setFormData({...formData, scriptId: e.target.value})}
                  >
                    <option value="">None</option>
                    {scripts.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-2">Production Notes</label>
                <textarea 
                  className="w-full px-5 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-none focus:ring-2 focus:ring-indigo-500 outline-none transition-all font-medium resize-none"
                  rows="3"
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Props needed, locations, ideas..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                <button type="button" className="px-6 py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-8 py-3 rounded-full font-bold bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow-lg hover:shadow-indigo-500/30 transition-all hover:-translate-y-0.5">
                  {editingId ? 'Update Video' : 'Create Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#151515] rounded-3xl w-full max-w-sm p-8 shadow-2xl text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 size={24} className="text-red-500" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Delete Video?</h2>
            <p className="text-gray-500 mb-8">This action cannot be undone. Are you sure you want to remove this from your pipeline?</p>
            <div className="flex flex-col gap-3">
              <button 
                className="w-full py-3 rounded-full font-bold bg-red-500 text-white hover:bg-red-600 transition-all"
                onClick={() => {
                  deleteVideo(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
              >
                Yes, delete it
              </button>
              <button 
                className="w-full py-3 rounded-full font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all" 
                onClick={() => setShowDeleteConfirm(null)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
