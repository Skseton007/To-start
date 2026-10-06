import React, { useState } from 'react';
import { Plus, X, CheckSquare, Lightbulb, BookOpen, FileText, Video } from 'lucide-react';
import { useStore } from '../store/useStore';
import { useToast } from './Toast';

const quickOptions = [
  { type: 'task', label: 'Add Task', icon: CheckSquare, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
  { type: 'idea', label: 'New Idea', icon: Lightbulb, color: 'text-purple-500', bg: 'bg-purple-50 dark:bg-purple-900/20' },
  { type: 'notebook', label: 'New Notebook', icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
  { type: 'script', label: 'New Script', icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
  { type: 'video', label: 'New Video', icon: Video, color: 'text-indigo-500', bg: 'bg-indigo-50 dark:bg-indigo-900/20' },
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
      {/* FAB Button */}
      <div className="fixed bottom-8 right-8 z-[100] flex flex-col items-end">
        {open && (
          <div className="flex flex-col gap-3 mb-4 items-end animate-slide-in-right">
            {quickOptions.map(opt => (
              <button 
                key={opt.type} 
                className="flex items-center gap-3 bg-white dark:bg-gray-800 p-3 pr-5 rounded-full shadow-lg hover:shadow-xl hover:-translate-x-1 transition-all border border-gray-100 dark:border-gray-700 font-bold"
                onClick={() => handleOptionClick(opt.type)}
              >
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${opt.bg} ${opt.color}`}>
                  <opt.icon size={20} />
                </div>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        )}
        <button 
          className="w-16 h-16 bg-black text-white rounded-full flex items-center justify-center shadow-[0_10px_25px_rgba(0,0,0,0.3)] hover:scale-110 transition-all duration-300" 
          onClick={() => setOpen(!open)} 
          style={{ transform: open ? 'rotate(135deg)' : 'rotate(0deg)' }}
        >
          <Plus size={32} />
        </button>
      </div>

      {open && <div className="fixed inset-0 z-[90] bg-black/10 backdrop-blur-[2px]" onClick={() => setOpen(false)} />}

      {/* Creation Modal */}
      {modalType && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md animate-fade-in" onClick={() => setModalType(null)}>
          <div className="bg-white dark:bg-[#121212] rounded-[2rem] w-full max-w-lg p-8 shadow-2xl border border-gray-200 dark:border-gray-800" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-3xl font-black">{titles[modalType]}</h2>
              <button className="p-3 bg-gray-100 dark:bg-gray-800 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" onClick={() => setModalType(null)}>
                <X size={24} />
              </button>
            </div>
            
            <div className="space-y-6">
              {['task', 'idea', 'script', 'video'].includes(modalType) && (
                <div>
                  <label className="block text-sm font-black mb-2 uppercase text-gray-500">Title</label>
                  <input className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-lg" placeholder="Enter title..." value={form.title || ''} onChange={e => setForm({ ...form, title: e.target.value })} autoFocus />
                </div>
              )}
              
              {modalType === 'notebook' && (
                <div>
                  <label className="block text-sm font-black mb-2 uppercase text-gray-500">Name</label>
                  <input className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none font-bold text-lg" placeholder="Notebook name..." value={form.name || ''} onChange={e => setForm({ ...form, name: e.target.value })} autoFocus />
                </div>
              )}
              
              {['idea', 'notebook'].includes(modalType) && (
                <div>
                  <label className="block text-sm font-black mb-2 uppercase text-gray-500">Description</label>
                  <textarea className="w-full p-4 h-24 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none font-bold resize-none" placeholder="Description..." value={form.description || ''} onChange={e => setForm({ ...form, description: e.target.value })} />
                </div>
              )}
              
              {modalType === 'task' && (
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-black mb-2 uppercase text-gray-500">Priority</label>
                    <select className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none font-bold appearance-none" value={form.priority || 'medium'} onChange={e => setForm({ ...form, priority: e.target.value })}>
                      <option value="high">High</option>
                      <option value="medium">Medium</option>
                      <option value="low">Low</option>
                    </select>
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-black mb-2 uppercase text-gray-500">Category</label>
                    <select className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none font-bold appearance-none" value={form.category || 'personal'} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="personal">Personal</option>
                      <option value="work">Work</option>
                      <option value="content">Content</option>
                    </select>
                  </div>
                </div>
              )}
              
              {modalType === 'task' && (
                <div>
                  <label className="block text-sm font-black mb-2 uppercase text-gray-500">Notes</label>
                  <textarea className="w-full p-4 h-24 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none font-bold resize-none" placeholder="Additional notes..." value={form.notes || ''} onChange={e => setForm({ ...form, notes: e.target.value })} />
                </div>
              )}
              
              {modalType === 'idea' && (
                <div>
                  <label className="block text-sm font-black mb-2 uppercase text-gray-500">Tags (comma separated)</label>
                  <input className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none font-bold" placeholder="AI, tutorial, tips..." value={form.tags || ''} onChange={e => setForm({ ...form, tags: e.target.value })} />
                </div>
              )}
              
              {modalType === 'script' && (
                <div>
                  <label className="block text-sm font-black mb-2 uppercase text-gray-500">Platform</label>
                  <select className="w-full p-4 rounded-2xl bg-gray-50 dark:bg-[#1a1a1a] border-2 border-transparent focus:border-indigo-500 outline-none font-bold appearance-none" value={form.platform || 'youtube'} onChange={e => setForm({ ...form, platform: e.target.value })}>
                    <option value="youtube">YouTube</option>
                    <option value="instagram">Instagram</option>
                  </select>
                </div>
              )}
            </div>
            
            <div className="flex gap-4 mt-8 pt-6 border-t border-gray-100 dark:border-gray-800">
              <button className="flex-1 py-4 rounded-2xl font-bold bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors" onClick={() => setModalType(null)}>Cancel</button>
              <button className="flex-1 py-4 rounded-2xl font-bold bg-black text-white dark:bg-white dark:text-black hover:scale-105 transition-transform" onClick={handleSubmit}>Create</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
