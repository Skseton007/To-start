import React, { useState } from 'react';
import { 
  Play, Plus, Video, Calendar, Clock, CheckCircle2, 
  MoreVertical, Edit2, Trash2, Camera,
  Filter, Search, BarChart2, X, Target
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { format } from 'date-fns';
import { useStore } from "../store/useStore";

const PIPELINE_STAGES = [
  'Idea', 'Script', 'Recording', 'Editing', 'Review', 'Ready', 'Published'
];

export default function ContentTracker() {
  const { 
    videos, addVideo, updateVideo, deleteVideo, 
    updateStage, updatePlatform, contentGoals,
    categories, ideas, scripts
  } = useStore();

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
    platforms: { youtube: false, instagram: false },
    ideaId: '',
    scriptId: '',
    notes: ''
  });

  const totalVideos = videos.length;
  const publishedVideos = videos.filter(v => v.status === 'Published').length;
  const inProduction = totalVideos - publishedVideos;
  
  const getProgress = (stages) => {
    const total = PIPELINE_STAGES.length;
    let completed = 0;
    for (const stage of PIPELINE_STAGES) {
      if (stages[stage]) completed++;
      else break; 
    }
    return Math.round((completed / total) * 100);
  };

  const filteredVideos = videos.filter(v => {
    if (filter !== 'All' && v.status !== filter) return false;
    if (platformFilter === 'Play' && !v.platforms.youtube) return false;
    if (platformFilter === 'Camera' && !v.platforms.instagram) return false;
    return true;
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingId) {
      updateVideo(editingId, formData);
    } else {
      addVideo({
        id: uuidv4(),
        ...formData,
        stages: Object.fromEntries(PIPELINE_STAGES.map(s => [s, false])),
        status: 'Idea',
        platformStatus: {
          youtube: { uploaded: false, published: false },
          instagram: { uploaded: false, published: false }
        },
        createdAt: new Date().toISOString()
      });
    }
    setIsModalOpen(false);
    setEditingId(null);
    setFormData({
      title: '', type: 'Long Form', categoryId: categories[0]?.id || '',
      deadline: format(new Date(), 'yyyy-MM-dd'), platforms: { youtube: false, instagram: false },
      ideaId: '', scriptId: '', notes: ''
    });
  };

  const handleEdit = (video) => {
    setFormData(video);
    setEditingId(video.id);
    setIsModalOpen(true);
  };

  return (
    <div className="page-container content-tracker animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Content Pipeline</h1>
          <p className="page-subtitle">Track your video production</p>
        </div>
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          <span>New Video</span>
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
            <Video size={24} />
          </div>
          <div className="stat-info">
            <h3>Total Videos</h3>
            <p className="stat-value">{totalVideos}</p>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
            <Clock size={24} />
          </div>
          <div className="stat-info">
            <h3>In Production</h3>
            <p className="stat-value">{inProduction}</p>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
            <CheckCircle2 size={24} />
          </div>
          <div className="stat-info">
            <h3>Published</h3>
            <p className="stat-value">{publishedVideos}</p>
          </div>
        </div>
        <div className="stat-card card">
          <div className="stat-icon" style={{ background: 'rgba(255, 255, 255, 0.1)' }}>
            <Target size={24} />
          </div>
          <div className="stat-info">
            <h3>Weekly Goal</h3>
            <div className="goal-progress">
              <div className="progress-text">
                <span>{publishedVideos} / {contentGoals.weekly}</span>
                <span>{Math.round((publishedVideos / contentGoals.weekly) * 100) || 0}%</span>
              </div>
              <div className="progress-bar-bg">
                <div 
                  className="progress-bar-fill"
                  style={{ width: `${Math.min((publishedVideos / contentGoals.weekly) * 100, 100)}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="filters-section card" style={{ padding: '15px', marginBottom: '24px', display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
        <div className="filter-group">
          <Filter size={18} />
          <select value={filter} onChange={(e) => setFilter(e.target.value)} className="input-field" style={{ width: 'auto' }}>
            <option value="All">All Stages</option>
            {PIPELINE_STAGES.map(stage => <option key={stage} value={stage}>{stage}</option>)}
          </select>
        </div>
        <div className="filter-group">
          <Play size={18} />
          <select value={platformFilter} onChange={(e) => setPlatformFilter(e.target.value)} className="input-field" style={{ width: 'auto' }}>
            <option value="All">All Platforms</option>
            <option value="Play">YouTube</option>
            <option value="Camera">Camera</option>
          </select>
        </div>
      </div>

      <div className="content-list">
        {filteredVideos.length === 0 ? (
          <div className="empty-state card">
            <Video size={48} className="empty-icon" />
            <h3>No videos found</h3>
            <p>Start your first production pipeline!</p>
            <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={20} /> Add Video
            </button>
          </div>
        ) : (
          filteredVideos.map(video => {
            const category = categories.find(c => c.id === video.categoryId);
            const progress = getProgress(video.stages);
            
            return (
              <div key={video.id} className="content-card card">
                <div className="content-header">
                  <div className="content-title-group">
                    <h3>{video.title}</h3>
                    <div className="content-badges">
                      {category && (
                        <span className="badge" style={{ backgroundColor: category.color + '33', color: category.color }}>
                          {category.name}
                        </span>
                      )}
                      <span className="badge badge-outline">{video.type}</span>
                      <span className="badge badge-status">{video.status}</span>
                    </div>
                  </div>
                  <div className="content-actions">
                    <button className="icon-btn" onClick={() => handleEdit(video)}><Edit2 size={16} /></button>
                    <button className="icon-btn danger" onClick={() => setShowDeleteConfirm(video.id)}><Trash2 size={16} /></button>
                  </div>
                </div>

                <div className="pipeline">
                  {PIPELINE_STAGES.map((stage, idx) => (
                    <div 
                      key={stage} 
                      className={`pipeline-stage ${video.stages[stage] ? 'completed' : ''}`}
                      onClick={() => updateStage(video.id, stage, !video.stages[stage])}
                    >
                      <div className="stage-node">
                        {video.stages[stage] && <CheckCircle2 size={14} />}
                      </div>
                      <span className="stage-label">{stage}</span>
                      {idx < PIPELINE_STAGES.length - 1 && <div className="stage-line" />}
                    </div>
                  ))}
                </div>

                <div className="content-footer">
                  <div className="progress-section" style={{ flex: 1, marginRight: '20px' }}>
                    <div className="progress-bar-bg">
                      <div className="progress-bar-fill" style={{ width: `${progress}%` }} />
                    </div>
                  </div>
                  
                  <div className="platforms-status">
                    {video.platforms.youtube && (
                      <label className="platform-checkbox">
                        <input 
                          type="checkbox" 
                          checked={video.platformStatus.youtube.published}
                          onChange={(e) => updatePlatform(video.id, 'youtube', 'published', e.target.checked)}
                        />
                        <Play size={18} color={video.platformStatus.youtube.published ? "#ff0000" : "currentColor"} />
                      </label>
                    )}
                    {video.platforms.instagram && (
                      <label className="platform-checkbox">
                        <input 
                          type="checkbox"
                          checked={video.platformStatus.instagram.published}
                          onChange={(e) => updatePlatform(video.id, 'instagram', 'published', e.target.checked)}
                        />
                        <Camera size={18} color={video.platformStatus.instagram.published ? "#E1306C" : "currentColor"} />
                      </label>
                    )}
                  </div>

                  <div className="deadline-badge">
                    <Calendar size={14} />
                    {format(new Date(video.deadline), 'MMM d, yyyy')}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content card">
            <div className="modal-header">
              <h2>{editingId ? 'Edit Video' : 'New Video'}</h2>
              <button className="icon-btn" onClick={() => setIsModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label>Title</label>
                <input 
                  type="text" 
                  className="input-field"
                  value={formData.title} 
                  onChange={e => setFormData({...formData, title: e.target.value})} 
                  required 
                />
              </div>
              
              <div className="form-row">
                <div className="form-group">
                  <label>Type</label>
                  <select 
                    className="input-field"
                    value={formData.type} 
                    onChange={e => setFormData({...formData, type: e.target.value})}
                  >
                    <option value="Long Form">Long Form</option>
                    <option value="Short">Short</option>
                    <option value="Reel">Reel</option>
                    <option value="Podcast">Podcast</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Category</label>
                  <select 
                    className="input-field"
                    value={formData.categoryId} 
                    onChange={e => setFormData({...formData, categoryId: e.target.value})}
                  >
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Deadline</label>
                <input 
                  type="date" 
                  className="input-field"
                  value={formData.deadline} 
                  onChange={e => setFormData({...formData, deadline: e.target.value})} 
                  required 
                />
              </div>

              <div className="form-group platforms-group">
                <label>Platforms</label>
                <div className="checkbox-row" style={{ display: 'flex', gap: '15px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.platforms.youtube}
                      onChange={e => setFormData({
                        ...formData, 
                        platforms: {...formData.platforms, youtube: e.target.checked}
                      })}
                    />
                    <Play size={18} /> YouTube
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                    <input 
                      type="checkbox" 
                      checked={formData.platforms.instagram}
                      onChange={e => setFormData({
                        ...formData, 
                        platforms: {...formData.platforms, instagram: e.target.checked}
                      })}
                    />
                    <Camera size={18} /> Camera
                  </label>
                </div>
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Link Idea (Optional)</label>
                  <select 
                    className="input-field"
                    value={formData.ideaId} 
                    onChange={e => setFormData({...formData, ideaId: e.target.value})}
                  >
                    <option value="">None</option>
                    {ideas.map(i => <option key={i.id} value={i.id}>{i.title}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>Link Script (Optional)</label>
                  <select 
                    className="input-field"
                    value={formData.scriptId} 
                    onChange={e => setFormData({...formData, scriptId: e.target.value})}
                  >
                    <option value="">None</option>
                    {scripts.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Notes</label>
                <textarea 
                  className="input-field"
                  rows="3"
                  value={formData.notes} 
                  onChange={e => setFormData({...formData, notes: e.target.value})}
                ></textarea>
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingId ? 'Update' : 'Create'} Video
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showDeleteConfirm && (
        <div className="modal-overlay">
          <div className="modal-content card" style={{ maxWidth: '400px' }}>
            <h2>Delete Video?</h2>
            <p>Are you sure you want to delete this video? This cannot be undone.</p>
            <div className="modal-actions" style={{ marginTop: '20px' }}>
              <button className="btn-secondary" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button 
                className="btn-primary danger" 
                onClick={() => {
                  deleteVideo(showDeleteConfirm);
                  setShowDeleteConfirm(null);
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
