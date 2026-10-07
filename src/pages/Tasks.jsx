import React, { useState, useMemo } from 'react';
import { useTasks, useSettings } from '../store/useStore';
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';
import { Plus, Check, Clock, Edit2, Copy, Trash2, Calendar, Flag, Tag, Filter, Search } from 'lucide-react';
import { format, isToday, isFuture, parseISO } from 'date-fns';

export default function Tasks() {
  const { tasks, addTask, updateTask, deleteTask, duplicateTask, categories } = useTasks();
  const { settings } = useSettings();
  const toast = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [taskForm, setTaskForm] = useState({ title: '', priority: 'medium', category: '', time: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
  
  const [filterTab, setFilterTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTasks, setSelectedTasks] = useState([]);
  
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);

  const filteredTasks = useMemo(() => {
    let result = tasks;

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(t => t.title?.toLowerCase().includes(q) || t.notes?.toLowerCase().includes(q));
    }

    // Category
    if (selectedCategory) {
      result = result.filter(t => t.category === selectedCategory);
    }

    // Tabs
    if (filterTab === 'Today') {
      result = result.filter(t => t.date && isToday(parseISO(t.date)));
    } else if (filterTab === 'Upcoming') {
      result = result.filter(t => t.date && !isToday(parseISO(t.date)) && isFuture(parseISO(t.date)) && !t.completed);
    } else if (filterTab === 'Completed') {
      result = result.filter(t => t.completed);
    } else if (filterTab === 'High Priority') {
      result = result.filter(t => t.priority === 'high' && !t.completed);
    }

    return result.sort((a, b) => {
      // Sort by date then time
      const dateA = a.date || '9999-12-31';
      const dateB = b.date || '9999-12-31';
      if (dateA !== dateB) return dateA.localeCompare(dateB);
      return (a.time || '').localeCompare(b.time || '');
    });
  }, [tasks, filterTab, searchQuery, selectedCategory]);

  const groupedTasks = useMemo(() => {
    const groups = {};
    filteredTasks.forEach(t => {
      const d = t.date || 'No Date';
      if (!groups[d]) groups[d] = [];
      groups[d].push(t);
    });
    return groups;
  }, [filteredTasks]);

  const handleOpenModal = (task = null) => {
    if (task) {
      setEditingTask(task);
      setTaskForm({
        title: task.title || '',
        priority: task.priority || 'medium',
        category: task.category || '',
        time: task.time || '',
        date: task.date || format(new Date(), 'yyyy-MM-dd'),
        notes: task.notes || ''
      });
    } else {
      setEditingTask(null);
      setTaskForm({ title: '', priority: 'medium', category: categories?.[0]?.id || '', time: '', date: format(new Date(), 'yyyy-MM-dd'), notes: '' });
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
      addTask({ ...taskForm, completed: false });
      toast.success('Task added');
    }
    setIsModalOpen(false);
  };

  const handleToggleComplete = (task) => {
    updateTask(task.id, { completed: !task.completed });
    if (!task.completed) toast.success('Task completed!');
  };

  const handleDeleteClick = (task) => {
    setTaskToDelete(task);
    setDeleteConfirmOpen(true);
  };

  const confirmDelete = () => {
    if (taskToDelete) {
      deleteTask(taskToDelete.id);
      toast.success('Task deleted');
      setSelectedTasks(prev => prev.filter(id => id !== taskToDelete.id));
    } else if (selectedTasks.length > 0) {
      selectedTasks.forEach(id => deleteTask(id));
      toast.success(`${selectedTasks.length} tasks deleted`);
      setSelectedTasks([]);
    }
    setDeleteConfirmOpen(false);
    setTaskToDelete(null);
  };

  const handleDuplicate = (task) => {
    duplicateTask(task.id);
    toast.success('Task duplicated');
  };

  const toggleSelectTask = (id) => {
    setSelectedTasks(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };
  
  const handleBulkDelete = () => {
    setTaskToDelete(null); // Indicates bulk delete
    setDeleteConfirmOpen(true);
  };

  const formatGroupDate = (dateStr) => {
    if (dateStr === 'No Date') return dateStr;
    try {
      const d = parseISO(dateStr);
      if (isToday(d)) return 'Today';
      return format(d, 'EEEE, MMM d, yyyy');
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="page-container fade-in">
      <header className="page-header flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-gray-500 mt-1">Manage all your tasks and todos</p>
        </div>
        <button className="btn btn-primary flex items-center gap-2" onClick={() => handleOpenModal()}>
          <Plus size={20} /> Add Task
        </button>
      </header>

      {/* Toolbar */}
      <div className="card p-4 mb-6 flex flex-wrap gap-4 items-center justify-between">
        <div className="flex flex-wrap gap-2">
          {['All', 'Today', 'Upcoming', 'Completed', 'High Priority'].map(tab => (
            <button 
              key={tab}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filterTab === tab ? 'bg-black text-white dark:bg-white dark:text-black' : 'bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300'}`}
              onClick={() => setFilterTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>
        
        <div className="flex items-center gap-3 flex-1 min-w-[300px] justify-end">
          <div className="relative flex-1 max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search tasks..." 
              className="input w-full pl-9 pr-4 py-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <select 
              className="input pl-9 pr-8 py-2 border rounded-lg appearance-none bg-white dark:bg-gray-800 dark:border-gray-700"
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories?.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {selectedTasks.length > 0 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 text-blue-800 dark:text-blue-200 p-3 rounded-lg mb-4 flex items-center justify-between animate-in slide-in-from-top-2">
          <span>{selectedTasks.length} tasks selected</span>
          <button onClick={handleBulkDelete} className="flex items-center gap-2 px-3 py-1 bg-red-100 text-red-600 rounded hover:bg-red-200 dark:bg-red-900/40 dark:text-red-400">
            <Trash2 size={16} /> Delete Selected
          </button>
        </div>
      )}

      {/* Task List Grouped */}
      <div className="space-y-8">
        {Object.keys(groupedTasks).length === 0 ? (
          <div className="text-center py-12 text-gray-500 card">
            <Check size={48} className="mx-auto mb-3 opacity-20" />
            <p>No tasks found.</p>
          </div>
        ) : (
          Object.keys(groupedTasks).sort().map(dateStr => (
            <div key={dateStr} className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2 border-b pb-2 border-gray-200 dark:border-gray-800">
                <Calendar size={18} className="text-gray-400" /> {formatGroupDate(dateStr)}
              </h2>
              {groupedTasks[dateStr].map(task => (
                <div key={task.id} className={`task-item card p-4 flex flex-wrap sm:flex-nowrap items-start gap-4 group transition-all hover:shadow-md ${task.completed ? 'opacity-60' : ''} ${selectedTasks.includes(task.id) ? 'ring-2 ring-blue-500' : ''}`}>
                  <div className="mt-1 flex gap-3 items-center">
                    <input type="checkbox" checked={selectedTasks.includes(task.id)} onChange={() => toggleSelectTask(task.id)} className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" />
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
              ))}
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
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input type="date" className="input w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={taskForm.date} onChange={e => setTaskForm({...taskForm, date: e.target.value})} />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <input type="time" className="input w-full p-2 border rounded-lg dark:bg-gray-800 dark:border-gray-700" value={taskForm.time} onChange={e => setTaskForm({...taskForm, time: e.target.value})} />
                </div>
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
        title={taskToDelete ? "Delete Task" : "Delete Selected Tasks"} 
        message={taskToDelete ? `Are you sure you want to delete "${taskToDelete.title}"?` : `Are you sure you want to delete ${selectedTasks.length} tasks?`} 
        onConfirm={confirmDelete} 
        onCancel={() => setDeleteConfirmOpen(false)} 
      />
    </div>
  );
}
