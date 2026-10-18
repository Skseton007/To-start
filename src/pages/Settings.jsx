import React, { useState } from 'react';
import {
  User, Moon, Sun, Target, Tag,
  Database, AlertTriangle, Plus, Trash2, Cloud
} from 'lucide-react';
import { SyncPanel } from '../components/SyncButton';
import { useSettings } from "../store/useStore";
import ConfirmDialog from '../components/ConfirmDialog';
import { useToast } from '../components/Toast';

export default function Settings() {
  const { settings, updateSettings, contentGoals, updateContentGoals, categories, addCategory, deleteCategory, clearData, addSampleData } = useSettings();
  const toast = useToast();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#6366f1');
  const [confirm, setConfirm] = useState(null); // 'sample' | 'reset'

  // StoreProvider applies the theme to the page
  const handleThemeToggle = () => {
    updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' });
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory({
      name: newCategoryName.trim(),
      color: newCategoryColor
    });
    setNewCategoryName('');
  };

  return (
    <div className="page-container settings-page animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Settings</h1>
          <p className="page-subtitle">Manage your app preferences</p>
        </div>
      </div>

      <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: '24px' }}>

        {/* Profile & Theme */}
        <div className="settings-section card" style={{ padding: '24px' }}>
          <h3 className="font-bold" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <User size={20} /> Profile & Appearance
          </h3>

          <div className="form-group" style={{ marginBottom: '20px' }}>
            <label>Your Name</label>
            <input
              type="text"
              className="input-field"
              value={settings.userName}
              onChange={(e) => updateSettings({ userName: e.target.value })}
            />
          </div>

          <div className="form-group" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <label>Theme</label>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>Toggle dark or light mode</p>
            </div>
            <button className="btn-outline" onClick={handleThemeToggle} aria-label="Toggle theme">
              {settings.theme === 'dark' ? <><Moon size={18} /> Dark</> : <><Sun size={18} /> Light</>}
            </button>
          </div>
        </div>

        {/* Cloud sync */}
        <div className="settings-section card" style={{ padding: '24px' }}>
          <h3 className="font-bold" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cloud size={20} /> Sync Across Devices
          </h3>
          <SyncPanel />
        </div>

        {/* Content Goals */}
        <div className="settings-section card" style={{ padding: '24px' }}>
          <h3 className="font-bold" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Target size={20} /> Content Goals
          </h3>

          <div className="form-row" style={{ display: 'flex', gap: '15px' }}>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Daily</label>
              <input
                type="number"
                className="input-field"
                value={contentGoals.daily}
                onChange={(e) => updateContentGoals({ daily: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Weekly</label>
              <input
                type="number"
                className="input-field"
                value={contentGoals.weekly}
                onChange={(e) => updateContentGoals({ weekly: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
            <div className="form-group" style={{ flex: 1 }}>
              <label>Monthly</label>
              <input
                type="number"
                className="input-field"
                value={contentGoals.monthly}
                onChange={(e) => updateContentGoals({ monthly: parseInt(e.target.value) || 0 })}
                min="0"
              />
            </div>
          </div>
        </div>

        {/* Categories */}
        <div className="settings-section card" style={{ padding: '24px' }}>
          <h3 className="font-bold" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Tag size={20} /> Categories
          </h3>

          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
            {categories.map(cat => (
              <li key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </div>
                <button className="icon-btn danger" onClick={() => deleteCategory(cat.id)} aria-label={`Delete ${cat.name}`}><Trash2 size={16} /></button>
              </li>
            ))}
          </ul>

          <form onSubmit={handleAddCategory} style={{ display: 'flex', gap: '10px' }}>
            <input
              type="text"
              className="input-field"
              placeholder="New category..."
              value={newCategoryName}
              onChange={e => setNewCategoryName(e.target.value)}
              style={{ flex: 1 }}
            />
            <input
              type="color"
              value={newCategoryColor}
              onChange={e => setNewCategoryColor(e.target.value)}
              style={{ width: '40px', height: '40px', padding: '0', border: 'none', borderRadius: '8px', cursor: 'pointer', background: 'transparent' }}
            />
            <button type="submit" className="btn-primary" style={{ padding: '8px 12px' }} aria-label="Add category">
              <Plus size={20} />
            </button>
          </form>
        </div>

        {/* Data Management */}
        <div className="settings-section card" style={{ padding: '24px' }}>
          <h3 className="font-bold" style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} /> Data Management
          </h3>

          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
            Resetting deletes all tasks, ideas, notebooks, scripts and videos (on every synced device when you're signed in).
          </p>

          <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
            <button
              className="btn-secondary"
              onClick={() => setConfirm('sample')}
              style={{ justifyContent: 'center' }}
            >
              Add Sample Data
            </button>
            <button
              className="btn-primary danger"
              onClick={() => setConfirm('reset')}
              style={{ justifyContent: 'center' }}
            >
              <AlertTriangle size={18} /> Reset All Data
            </button>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '40px', color: 'var(--text-secondary)', fontSize: '14px' }}>
        <p>TO START v1.0</p>
        <p>Built with React & LocalStorage</p>
      </div>

      <ConfirmDialog
        isOpen={!!confirm}
        title={confirm === 'sample' ? 'Load sample data?' : 'Delete ALL data?'}
        message={confirm === 'sample'
          ? 'This replaces everything you have now with demo content.'
          : 'Every task, idea, notebook, script and video will be deleted. This cannot be undone.'}
        confirmText={confirm === 'sample' ? 'Load sample data' : 'Delete everything'}
        onConfirm={() => {
          if (confirm === 'sample') { addSampleData(); toast.success('Sample data loaded'); }
          else { clearData(); toast.success('All data deleted'); }
          setConfirm(null);
        }}
        onCancel={() => setConfirm(null)}
      />
    </div>
  );
}

