import React, { useState } from 'react';
import { 
  Play, Plus, Video, Calendar, CheckCircle2, 
  Edit2, Trash2, Camera, Filter, X, Target, Clock,
  Lightbulb, FileText, Scissors, Eye, ThumbsUp, Rocket
} from 'lucide-react';
import { format } from 'date-fns';
import { useVideos, useSettings, useIdeas, useScripts } from "../store/useStore";

const PIPELINE_STAGES = [
  { key: 'idea', label: 'Ideation', Icon: Lightbulb },
  { key: 'script', label: 'Scripting', Icon: FileText },
  { key: 'recording', label: 'Recording', Icon: Video },
  { key: 'editing', label: 'Editing', Icon: Scissors },
  { key: 'review', label: 'Review', Icon: Eye },
  { key: 'ready', label: 'Ready', Icon: ThumbsUp },
  { key: 'published', label: 'Published', Icon: Rocket }
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
  
  // Track which nodes are currently animating their 3D pop
  const [animatingNodes, setAnimatingNodes] = useState({});

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

  const handleToggleStage = (videoId, stageKey, isCurrentlyCompleted) => {
    updateStage(videoId, stageKey, !isCurrentlyCompleted);
    if (!isCurrentlyCompleted) {
      // Trigger the 3D pop animation
      const animKey = `${videoId}-\${stageKey}`;
      setAnimatingNodes(prev => ({ ...prev, [animKey]: true }));
      setTimeout(() => {
        setAnimatingNodes(prev => ({ ...prev, [animKey]: false }));
      }, 500); // matches the 0.5s CSS animation
    }
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
    <div className="p-6 md:p-8 max-w-[1400px] mx-auto space-y-8 animate-fade-in pb-24">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white/50 dark:bg-gray-900/50 p-6 rounded-3xl card-3d">
        <div>
          <h1 className="text-4xl font-extrabold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-pink-500">
            Content Engine
          </h1>
          <p className="text-gray-500 mt-2 font-medium">Track your video production with 3D progress</p>
        </div>
        <button 
          onClick={() => {
            setEditingId(null);
            setIsModalOpen(true);
          }}
          className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-4 rounded-2xl hover:shadow-[0_10px_20px_rgba(99,102,241,0.4)] transition-all hover:-translate-y-1 font-bold text-lg"
        >
          <Plus size={24} /> New Video
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card-3d p-6 rounded-3xl bg-white/80 dark:bg-gray-900/80 flex flex-col justify-center border-t-4 border-indigo-500">
          <div className="flex items-center gap-3 text-gray-500 mb-2">
            <Video size={20} className="text-indigo-500" /> <span className="font-bold">Total Videos</span>
          </div>
          <span className="text-4xl font-black text-gray-900 dark:text-white">{videos.length}</span>
        </div>
        <div className="card-3d p-6 rounded-3xl bg-white/80 dark:bg-gray-900/80 flex flex-col justify-center border-t-4 border-blue-500">
          <div className="flex items-center gap-3 mb-2">
            <Clock size={20} className="text-blue-500" /> <span className="font-bold text-gray-500">In Production</span>
          </div>
          <span className="text-4xl font-black text-blue-500">{inProduction}</span>
        </div>
        <div className="card-3d p-6 rounded-3xl bg-white/80 dark:bg-gray-900/80 flex flex-col justify-center border-t-4 border-emerald-500">
          <div className="flex items-center gap-3 mb-2">
            <CheckCircle2 size={20} className="text-emerald-500" /> <span className="font-bold text-gray-500">Published</span>
          </div>
          <span className="text-4xl font-black text-emerald-500">{publishedVideos}</span>
        </div>
        <div className="card-3d p-6 rounded-3xl bg-white/80 dark:bg-gray-900/80 flex flex-col justify-center border-t-4 border-pink-500">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-gray-500 font-bold">
              <Target size={20} className="text-pink-500"/> Weekly Goal
            </div>
            <span className="text-lg font-black text-pink-500">{publishedVideos} / {contentGoals?.weekly || 3}</span>
          </div>
          <div className="h-3 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
            <div 
              className="h-full bg-gradient-to-r from-pink-500 to-rose-500 transition-all duration-1000"
              style={{ width: `${Math.min((publishedVideos / (contentGoals?.weekly || 3)) * 100, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center bg-white/40 dark:bg-gray-900/40 p-4 rounded-3xl card-3d">
        <div className="relative">
          <Filter size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-500" />
          <select 
            className="pl-12 pr-10 py-3 rounded-2xl bg-white dark:bg-gray-800 border-none focus:ring-2 focus:ring-indigo-500 outline-none appearance-none font-bold shadow-sm"
            value={filter} 
            onChange={(e) => setFilter(e.target.value)}
          >
            <option value="All">All Stages</option>
            {PIPELINE_STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>
        </div>
        <div className="relative">
          <Play size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-pink-500" />
          <select 
            className="pl-12 pr-10 py-3 rounded-2xl bg-white dark:bg-gray-800 border-none focus:ring-2 focus:ring-pink-500 outline-none appearance-none font-bold shadow-sm"
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
      <div className="space-y-8">
        {filteredVideos.length === 0 ? (
          <div className="card-3d rounded-3xl p-20 text-center flex flex-col items-center justify-center bg-white/50 dark:bg-gray-900/50 border-dashed border-2 border-indigo-200 dark:border-indigo-900">
            <div className="w-28 h-28 bg-indigo-50 dark:bg-indigo-900/30 rounded-full flex items-center justify-center mb-6 shadow-inner">
              <Video size={48} className="text-indigo-500" />
            </div>
            <h3 className="text-3xl font-black mb-3 text-gray-800 dark:text-gray-100">No videos found</h3>
            <p className="text-gray-500 mb-8 max-w-md text-lg">Your pipeline is empty. Start producing your first piece of content!</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-black dark:bg-white text-white dark:text-black px-8 py-4 rounded-2xl hover:shadow-xl transition-all font-bold"
            >
              <Plus size={20} /> Create Video
            </button>
          </div>
        ) : (
          filteredVideos.map(video => {
            const category = categories.find(c => c.id === video.category);
            const progress = getProgress(video.stages);
            
            return (
              <div key={video.id} className="card-3d p-8 rounded-[2rem] bg-white/90 dark:bg-[#121212]/90 hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                
                {/* Dynamic Background Gradient based on progress */}
                <div 
                  className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] pointer-events-none transition-all duration-1000"
                  style={{ background: \`linear-gradient(90deg, #6366f1 0%, transparent \${progress}%)\` }}
                />

                {/* Top Row */}
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8 relative z-10">
                  <div className="flex-1">
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <h3 className="text-2xl font-black text-gray-900 dark:text-white line-clamp-1">{video.title}</h3>
                      {category && (
                        <span className="px-4 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase shadow-sm" style={{ backgroundColor: category.color + '22', color: category.color, border: \`1px solid \${category.color}44\` }}>
                          {category.name}
                        </span>
                      )}
                      <span className="px-4 py-1.5 rounded-xl text-xs font-black tracking-widest uppercase bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 shadow-sm">
                        {video.contentType}
                      </span>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-gray-500 font-medium">
                      <div className="flex items-center gap-2 bg-gray-50 dark:bg-gray-800/50 px-3 py-1.5 rounded-lg">
                        <Calendar size={16} className="text-gray-400" />
                        {format(new Date(video.deadline), 'MMMM d, yyyy')}
                      </div>
                      <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 px-3 py-1.5 rounded-lg capitalize">
                        <Target size={16} /> {video.status}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button onClick={() => handleEdit(video)} className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md text-gray-500 hover:text-indigo-500 transition-all border border-gray-100 dark:border-gray-700">
                      <Edit2 size={18} />
                    </button>
                    <button onClick={() => setShowDeleteConfirm(video.id)} className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm hover:shadow-md text-gray-400 hover:text-red-500 transition-all border border-gray-100 dark:border-gray-700">
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                {/* Pipeline Nodes (The visually rich 3D progress bar) */}
                <div className="pipeline-track-container mb-10 relative z-10 hidden sm:block">
                  <div className="pipeline-bg-track"></div>
                  <div className="pipeline-fill-track" style={{ width: \`calc(\${progress}% - 2rem)\` }}></div>
                  
                  <div className="flex justify-between relative px-8">
                    {PIPELINE_STAGES.map((stage) => {
                      const isCompleted = video.stages[stage.key];
                      const isAnimating = animatingNodes[`${video.id}-\${stage.key}`];
                      
                      const IconComp = stage.Icon;

                      return (
                        <div 
                          key={stage.key}
                          onClick={() => handleToggleStage(video.id, stage.key, isCompleted)}
                          className="flex flex-col items-center gap-3 cursor-pointer group/stage relative"
                        >
                          {/* The 3D Node */}
                          <div className={`
                            w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-300 z-10
                            \${isCompleted 
                              ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-[0_8px_15px_rgba(99,102,241,0.4)] scale-110 border-2 border-white/20' 
                              : 'bg-white dark:bg-gray-800 text-gray-400 shadow-md border border-gray-200 dark:border-gray-700 group-hover/stage:shadow-lg group-hover/stage:scale-110'}
                            \${isAnimating ? 'animate-pop3d' : ''}
                          `}>
                            <IconComp size={20} strokeWidth={isCompleted ? 2.5 : 2} className={isCompleted ? '' : 'group-hover/stage:text-indigo-400'} />
                          </div>
                          
                          <span className={`text-xs font-black tracking-wide uppercase transition-colors \${isCompleted ? 'text-indigo-600 dark:text-indigo-400' : 'text-gray-400 group-hover/stage:text-gray-600 dark:group-hover/stage:text-gray-300'}`}>
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mobile Fallback for Pipeline (Simplified for small screens) */}
                <div className="sm:hidden mb-8 grid grid-cols-4 gap-4">
                   {PIPELINE_STAGES.map((stage) => {
                      const isCompleted = video.stages[stage.key];
                      const IconComp = stage.Icon;
                      return (
                         <div 
                          key={stage.key}
                          onClick={() => handleToggleStage(video.id, stage.key, isCompleted)}
                          className={`
                            flex flex-col items-center justify-center p-3 rounded-2xl gap-2 shadow-sm border transition-all
                            \${isCompleted ? 'bg-indigo-500 border-indigo-600 text-white shadow-indigo-500/30' : 'bg-gray-50 dark:bg-gray-800 border-gray-100 dark:border-gray-700 text-gray-400'}
                          `}
                         >
                           <IconComp size={18} />
                           <span className="text-[10px] font-bold uppercase">{stage.label}</span>
                         </div>
                      )
                   })}
                </div>

                {/* Bottom Row */}
                <div className="flex flex-col md:flex-row items-center justify-between pt-6 border-t border-gray-100 dark:border-gray-800/60 relative z-10 gap-6">
                  <div className="flex-1 w-full max-w-[300px]">
                    <div className="flex justify-between mb-2">
                      <span className="text-sm font-black text-gray-500 uppercase tracking-widest">Master Progress</span>
                      <span className="text-sm font-black text-indigo-500 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded-md">{progress}%</span>
                    </div>
                    <div className="h-3 w-full bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden shadow-inner">
                      <div className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full transition-all duration-700 ease-out shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${progress}%` }} />
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto">
                    {hasPlatform(video, 'youtube') && (
                      <button 
                        onClick={() => togglePlatform(video.id, 'youtube', getPlatformStatus(video, 'youtube'))}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black transition-all border shadow-sm \${getPlatformStatus(video, 'youtube') ? 'bg-red-50 dark:bg-red-900/20 text-red-600 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 hover:border-red-300 hover:text-red-500'}`}
                      >
                        <Play size={20} className={getPlatformStatus(video, 'youtube') ? 'fill-current' : ''} /> 
                        <span className="hidden sm:inline">YouTube</span>
                      </button>
                    )}
                    {hasPlatform(video, 'instagram') && (
                      <button 
                        onClick={() => togglePlatform(video.id, 'instagram', getPlatformStatus(video, 'instagram'))}
                        className={`flex items-center gap-2 px-5 py-3 rounded-2xl font-black transition-all border shadow-sm \${getPlatformStatus(video, 'instagram') ? 'bg-pink-50 dark:bg-pink-900/20 text-pink-600 border-pink-200 dark:border-pink-800' : 'bg-white dark:bg-gray-800 text-gray-400 border-gray-200 dark:border-gray-700 hover:border-pink-300 hover:text-pink-500'}`}
                      >
                        <Camera size={20} className={getPlatformStatus(video, 'instagram') ? 'fill-current' : ''} />
                        <span className="hidden sm:inline">Instagram</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#151515] rounded-[2rem] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-200 dark:border-gray-800">
            <div className="sticky top-0 bg-white/90 dark:bg-[#151515]/90 backdrop-blur-md flex justify-between items-center p-8 border-b border-gray-100 dark:border-gray-800 z-10">
              <h2 className="text-3xl font-black">{editingId ? 'Edit Video' : 'New Video'}</h2>
              <button onClick={() => setIsModalOpen(false)} className="p-3 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              <div>
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Title *</label>
                <input 
                  type="text" 
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-lg"
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required 
                  placeholder="Awesome video idea..."
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Format</label>
                  <select 
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-lg appearance-none"
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Long Form">Long Form</option>
                    <option value="Short">Short / Reel</option>
                    <option value="Podcast">Podcast</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Category</label>
                  <select 
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-lg appearance-none"
                    value={formData.categoryId} 
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Deadline</label>
                <input 
                  type="date" 
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-lg"
                  value={formData.deadline} 
                  onChange={e => setFormData({...formData, deadline: e.target.value})} 
                  required 
                />
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Platforms</label>
                <div className="flex gap-4">
                  <label className={`flex items-center gap-3 p-5 rounded-2xl cursor-pointer flex-1 transition-all border-2 \${formData.platforms.includes('youtube') ? 'bg-red-50 dark:bg-red-900/20 border-red-500' : 'bg-gray-50 dark:bg-[#1a1a1a] border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={formData.platforms.includes('youtube')}
                      onChange={e => {
                        const plats = e.target.checked 
                          ? [...formData.platforms, 'youtube'] 
                          : formData.platforms.filter(p => p !== 'youtube');
                        setFormData({...formData, platforms: plats});
                      }}
                    />
                    <Play size={24} className={formData.platforms.includes('youtube') ? "text-red-500 fill-current" : "text-gray-400"} /> 
                    <span className={`font-bold text-lg \${formData.platforms.includes('youtube') ? 'text-red-600 dark:text-red-400' : 'text-gray-500'}`}>YouTube</span>
                  </label>
                  <label className={`flex items-center gap-3 p-5 rounded-2xl cursor-pointer flex-1 transition-all border-2 \${formData.platforms.includes('instagram') ? 'bg-pink-50 dark:bg-pink-900/20 border-pink-500' : 'bg-gray-50 dark:bg-[#1a1a1a] border-transparent hover:border-gray-300 dark:hover:border-gray-600'}`}>
                    <input 
                      type="checkbox" 
                      className="hidden"
                      checked={formData.platforms.includes('instagram')}
                      onChange={e => {
                        const plats = e.target.checked 
                          ? [...formData.platforms, 'instagram'] 
                          : formData.platforms.filter(p => p !== 'instagram');
                        setFormData({...formData, platforms: plats});
                      }}
                    />
                    <Camera size={24} className={formData.platforms.includes('instagram') ? "text-pink-600 fill-current" : "text-gray-400"} /> 
                    <span className={`font-bold text-lg \${formData.platforms.includes('instagram') ? 'text-pink-600 dark:text-pink-400' : 'text-gray-500'}`}>Instagram</span>
                  </label>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Link Idea</label>
                  <select 
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-lg appearance-none"
                    value={formData.ideaId} 
                    onChange={e => setFormData({...formData, ideaId: e.target.value})}
                  >
                    <option value="">None</option>
                    {ideas.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Link Script</label>
                  <select 
                    className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-lg appearance-none"
                    value={formData.scriptId} 
                    onChange={e => setFormData({...formData, scriptId: e.target.value})}
                  >
                    <option value="">None</option>
                    {scripts.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-black text-gray-700 dark:text-gray-300 mb-3 uppercase tracking-wider">Production Notes</label>
                <textarea 
                  className="w-full px-6 py-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none transition-all font-bold text-lg resize-none"
                  rows="3"
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                  placeholder="Props needed, locations, ideas..."
                ></textarea>
              </div>

              <div className="flex justify-end gap-4 pt-6 border-t border-gray-100 dark:border-gray-800">
                <button type="button" className="px-8 py-4 rounded-2xl font-bold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all text-lg" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="px-10 py-4 rounded-2xl font-bold bg-indigo-500 text-white hover:bg-indigo-600 hover:shadow-[0_10px_20px_rgba(99,102,241,0.3)] transition-all hover:-translate-y-1 text-lg">
                  {editingId ? 'Update Video' : 'Create Video'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-[#151515] rounded-[2rem] w-full max-w-sm p-8 shadow-2xl text-center border border-gray-200 dark:border-gray-800">
            <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
              <Trash2 size={32} className="text-red-500" />
            </div>
            <h2 className="text-3xl font-black mb-3">Delete Video?</h2>
            <p className="text-gray-500 mb-8 font-medium">This action cannot be undone. Are you sure you want to remove this from your pipeline?</p>
            <div className="flex flex-col gap-3">
              <button 
                className="w-full py-4 rounded-2xl font-bold bg-red-500 text-white hover:bg-red-600 hover:shadow-[0_10px_20px_rgba(239,68,68,0.3)] transition-all text-lg hover:-translate-y-1"
                onClick={() => {
                  deleteVideo(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
              >
                Yes, delete it
              </button>
              <button 
                className="w-full py-4 rounded-2xl font-bold text-gray-500 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-all text-lg" 
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

