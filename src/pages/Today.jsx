import React, { useState, useMemo } from 'react';
import { useTasks, useSettings } from '../store/useStore';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { Plus, Check, Clock, Edit2, Copy, Trash2, Calendar, Flag, Tag } from 'lucide-react';
import { format, isToday, parseISO } from 'date-fns';

export default function Today() {
  const { tasks, addTask, updateTask, deleteTask, duplicateTask, categories } = useTasks();
  const { settings } = useSettings();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'medium', category: '', time: '', notes: '' });
  
  const [filter, setFilter] = useState('All');
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const todayDateStr = format(new Date(), 'yyyy-MM-dd');
  
  const todayTasks = useMemo(() => {
    return tasks.filter(task => {
      if (!task.date) return false;
      try {
        return isToday(parseISO(task.date));
      } catch (e) {
        return false;
      }
    });
  }, [tasks]);

  const filteredTasks = useMemo(() => {
    let filtered = todayTasks;
    if (filter === 'Pending') filtered = filtered.filter(t => !t.completed);
    if (filter === 'Completed') filtered = filtered.filter(t => t.completed);
    return filtered.sort((a, b) => (a.time || '').localeCompare(b.time || ''));
  }, [todayTasks, filter]);

  const completedCount = todayTasks.filter(t => t.completed).length;
  const totalCount = todayTasks.length;
  const progressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title || '',
        priority: task.priority || 'medium',
        category: task.category || '',
        time: task.time || '',
        notes: task.notes || ''
      });
    } else {
      setEditingTask(null);
      setTaskForm({ title: '', priority: 'medium', category: categories?.[0]?.id || '', time: '', notes: '' });
    }
    setIsModalOpen(true);
  };

  const handleSaveTask = (e) => {
    e.preventDefault();
    if (!taskForm.title.trim()) return;
    
    if (editingTask) {
      updateTask(editingTask.id, { ...taskForm });
      toast.success('Task updated');
    } else {
      addTask({ ...taskForm, date: todayDateStr, completed: false });
      toast.success('Task added');
    }
    setIsModalOpen(false);
  };

  const handleToggleComplete = (task) => {
    updateTask(task.id, { completed: !task.completed });
    if (!task.completed) {
      toast.success('Task completed!');
    }
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      toast.success('Task deleted');
    }
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  const handleDuplicate = (task) => {
    duplicateTask(task.id);
    toast.success('Task duplicated');
  };

  return (
    <div className="page-container fade-in">
      <header className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Today</h1>
          <p className="text-gray-500 flex items-center gap-2 mt-1">
            <Calendar size={16} /> {format(new Date(), 'EEEE, MMMM d, yyyy')}
          </p>
        </div>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Add Task
        </button>
      </header>

      {/* Progress Bar */}
      <div className="card mb-6 p-4">
        <div className="flex justify-between text-sm mb-2">
          <span>Daily Progress</span>
          <span>{completedCount} / {totalCount} completed ({progressPercent}%)</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
          <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-4">
        {['All', 'Pending', 'Completed'].map(f => (
          <button 
            key={f}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${filter === f ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'}`}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="task-list space-y-3">
        {filteredTasks.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            <Check size={48} className="mx-auto mb-3 opacity-20" />
            <p>No tasks found for {filter.toLowerCase()}.</p>
          </div>
        ) : (
          filteredTasks.map(task => (
            <div key={task.id} onDoubleClick={() => handleDuplicate(task)} className={`task-item card p-4 flex flex-wrap sm:flex-nowrap items-start gap-4 group transition-all hover:shadow-md cursor-pointer ${task.completed ? 'opacity-60' : ''}`} title="Double-click to duplicate this task">
              <div className="mt-1">
                <label className="checkbox-custom flex items-center cursor-pointer">
                  <input type="checkbox" className="hidden" checked={!!task.completed} onChange={() => handleToggleComplete(task)} />
                  <div className={`w-6 h-6 border-2 rounded-full flex items-center justify-center transition-colors ${task.completed ? 'bg-black border-black dark:bg-white dark:border-white' : 'border-gray-400 hover:border-black dark:hover:border-white'}`}>
                    {task.completed && <Check size={14} className="text-white dark:text-black" />}
                  </div>
                </label>
              </div>
              
              <div className="flex-1 min-w-0">
                <h3 className={`font-semibold text-lg truncate ${task.completed ? 'line-through' : ''}`}>{task.title}</h3>
                <div className="flex flex-wrap items-center gap-3 mt-1 text-xs text-gray-500">
                  {task.time && <span className="flex items-center gap-1"><Clock size={12} /> {task.time}</span>}
                  {task.priority && (
                    <span className={`badge-priority-${task.priority} px-2 py-0.5 rounded-full flex items-center gap-1 border`}>
                      <Flag size={10} /> {task.priority}
                    </span>
                  )}
                  {task.category && <span className="flex items-center gap-1 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full"><Tag size={10} /> {categories?.find(c => c.id === task.category)?.name || task.category}</span>}
                </div>
                {task.notes && <p className="text-sm text-gray-500 mt-2 truncate">{task.notes}</p>}
              </div>

              <div className="opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity flex gap-2 ml-auto mt-2 sm:mt-0">
                <button className="p-2 text-gray-500 hover:text-blue-500 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20" onClick={() => handleOpenModal(task)}>
                  <Edit2 size={16} />
                </button>
                <button className="p-2 text-gray-500 hover:text-green-500 rounded-lg hover:bg-green-50 dark:hover:bg-green-900/20" onClick={() => handleDuplicate(task)}>
                  <Copy size={16} />
                </button>
                <button className="p-2 text-gray-500 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20" onClick={() => handleDeleteClick(task)}>
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Task Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 animate-in fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-xl font-bold mb-4">{editingTask ? 'Edit Task' : 'New Task'}</h2>
            <form onSubmit={handleSaveTask} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Title</label>
                <input required type="text" className="input w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={taskForm.title} onChange={e => setTaskForm({...taskForm, title: e.target.value})} autoFocus />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Priority</label>
                  <select className="input w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={taskForm.priority} onChange={e => setTaskForm({...taskForm, priority: e.target.value})}>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Category</label>
                  <select className="input w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={taskForm.category} onChange={e => setTaskForm({...taskForm, category: e.target.value})}>
                    <option value="">None</option>
                    {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Time</label>
                <input type="time" className="input w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={taskForm.time} onChange={e => setTaskForm({...taskForm, time: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea className="input w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700 h-24 resize-none" value={taskForm.notes} onChange={e => setTaskForm({...taskForm, notes: e.target.value})} />
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg dark:text-gray-300 dark:hover:bg-gray-800" onClick={() => setIsModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary px-4 py-2 bg-black text-white rounded-lg dark:bg-white dark:text-black">{editingTask ? 'Save Changes' : 'Add Task'}</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      <ConfirmDialog 
        isOpen={deleteConfirmOpen} 
        title="Delete Task" 
        message={`Are you sure you want to delete "${taskToDelete?.title}"?`} 
        onConfirm={confirmDelete} 
        onCancel={() => setDeleteConfirmOpen(false)} 
      />
    </div>
  );
}

