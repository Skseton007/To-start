import React, { useState } from 'react';
import { Plus, X, CheckSquare, Lightbulb, FileText, BookOpen, Video } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useToast } from './Toast';

const quickOptions = [
  { type: 'task', label: 'Add Task', icon: CheckSquare },
  { type: 'idea', label: 'New Idea', icon: Lightbulb },
  { type: 'notebook', label: 'New Notebook', icon: BookOpen },
  { type: 'script', label: 'New Script', icon: FileText },
  { type: 'video', label: 'New Video', icon: Video },
];

export default function QuickAdd() {
  const [open, setOpen] = useState(false);
  const [modalType, setModalType] = useState(null);
  const [form, setForm] = useState({});
  const { store } = useStore();
  const { addToast } = useToast();

  const handleOptionClick = (type) => {
    setOpen(false);
    setModalType(type);
    setForm({});
  };

  const handleSubmit = () => {
    try {
      switch (modalType) {
        case 'task':
          if (!form.title?.trim()) return addToast('Task title is required', 'error');
          store.addTask({ title: form.title, priority: form.priority || 'medium', category: form.category || 'personal', notes: form.notes || '' });
          addToast('Task created!', 'success');
          break;
        case 'idea':
          if (!form.title?.trim()) return addToast('Idea title is required', 'error');
          store.addIdea({ title: form.title, description: form.description || '', category: form.category || 'content', tags: form.tags ? form.tags.split(',').map(t => t.trim()) : [] });
          addToast('Idea captured!', 'success');
          break;
        case 'notebook':
          if (!form.name?.trim()) return addToast('Notebook name is required', 'error');
          store.addNotebook({ name: form.name, color: form.color || '#6366f1', description: form.description || '' });
          addToast('Notebook created!', 'success');
          break;
        case 'script':
          if (!form.title?.trim()) return addToast('Script title is required', 'error');
          store.addScript({ title: form.title, platform: form.platform || 'youtube' });
          addToast('Script created!', 'success');
          break;
        case 'video':
          if (!form.title?.trim()) return addToast('Video title is required', 'error');
          store.addVideo({ title: form.title, category: form.category || 'content' });
          addToast('Video added to tracker!', 'success');
          break;
      }
      setModalType(null);
      setForm({});
    } catch (e) {
      addToast('Something went wrong', 'error');
    }
  };

  const titles = { task: 'Add Task', idea: 'New Idea', notebook: 'New Notebook', script: 'New Script', video: 'New Video' };

  return (
    <>
      <button className="fab" onClick={() => setOpen(!open)} style={{ transform: open ? 'rotate(45deg)' : '' }}>
        <Plus size={24} />
      </button>

      {open && (
        <>
          <div style={{ position: 'fixed', inset: 0, zIndex: 80 }} onClick={() => setOpen(false)} />
          <div className="fab-menu">
            {quickOptions.map(opt => (
              <div key={opt.type} className="fab-menu-item" onClick={() => handleOptionClick(opt.type)}>
                <opt.icon size={18} />
                {opt.label}
              </div>
            ))}
          </div>
        </>
      )}

      {modalType && (
        <div className="modal-overlay" onClick={() => setModalType(null)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title">{titles[modalType]}</div>
              <button className="btn btn-ghost btn-icon" onClick={() => setModalType(null)}>
                <X size={18} />
              </button>
            </div>
            <div className="modal-body">
              {(modalType === 'task' || modalType === 'idea' || modalType === 'script' || modalType === 'video') && (
                <div className="form-group">
                  <label className="label">Title</label>
                  <input className="input" placeholder="Enter title..." value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
                </div>
              )}
              {modalType === 'notebook' && (
                <div className="form-group">
                  <label className="label">Name</label>
                  <input className="input" placeholder="Notebook name..." value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
                </div>
              )}
              {(modalType === 'idea' || modalType === 'notebook') && (
                <div className="form-group">
                  <label className="label">Description</label>
                  <textarea className="input textarea" placeholder="Description..." value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
              )}
              {modalType === 'task' && (
                <div className="form-row">
                  <div className="form-group">
                    <label className="label">Priority</label>
                    <select className="input select" value={form.priority || 'medium'} onChange={e => setForm({ ...form, priority: e.target.value })}>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="label">Category</label>
                    <select className="input select" value={form.category || 'personal'} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="content">Content</option>
                      <option value="learning">Learning</option>
                      <option value="editing">Editing</option>
                      <option value="business">Business</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              )}
              {modalType === 'task' && (
                <div className="form-group">
                  <label className="label">Notes</label>
                  <textarea className="input textarea" placeholder="Additional notes..." value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              )}
              {modalType === 'idea' && (
                <div className="form-group">
                  <label className="label">Tags (comma separated)</label>
                  <input className="input" placeholder="AI, tutorial, tips..." value={form.tags || ''} onChange={e => setForm({ ...form, tags: e.target.value })} />
                </div>
              )}
              {modalType === 'script' && (
                <div className="form-group">
                  <label className="label">Platform</label>
                  <select className="input select" value={form.platform || 'youtube'} onChange={e => setForm({ ...form, platform: e.target.value })}>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setModalType(null)}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSubmit}>Create</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
