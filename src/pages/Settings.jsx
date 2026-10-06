import React, { useState } from 'react';
import { 
  User, Moon, Sun, Target, Tag, Globe, 
  Database, AlertTriangle, Plus, Trash2 
} from 'lucide-react';
import { useSettings } from "../store/useStore";
import { v4 as uuidv4 } from 'uuid';

export default function Settings() {
  const { settings, updateSettings, contentGoals, updateContentGoals, categories, addCategory, deleteCategory, platforms, clearData, addSampleData } = useSettings();

  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#ffffff');
  
  const handleThemeToggle = () => {
    const newTheme = settings.theme === 'dark' ? 'light' : 'dark';
    updateSettings({ theme: newTheme });
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  const handleAddCategory = (e) => {
    e.preventDefault();
    if (!newCategoryName.trim()) return;
    addCategory({
      id: uuidv4(),
      name: newCategoryName,
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

      <div className="settings-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '24px' }}>
        
        {/* Profile & Theme */}
        <div className="settings-section card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
            <button className="icon-btn" onClick={handleThemeToggle} style={{ width: '40px', height: '40px', background: 'var(--bg-secondary)' }}>
              {settings.theme === 'dark' ? <Moon size={20} /> : <Sun size={20} />}
            </button>
          </div>
        </div>

        {/* Content Goals */}
        <div className="settings-section card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
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
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Tag size={20} /> Categories
          </h3>
          
          <ul style={{ listStyle: 'none', padding: 0, marginBottom: '20px' }}>
            {categories.map(cat => (
              <li key={cat.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px', background: 'var(--bg-secondary)', borderRadius: '8px', marginBottom: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: cat.color }} />
                  <span>{cat.name}</span>
                </div>
                <button className="icon-btn danger" onClick={() => deleteCategory(cat.id)}><Trash2 size={16} /></button>
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
            <button type="submit" className="btn-primary" style={{ padding: '8px' }}>
              <Plus size={20} />
            </button>
          </form>
        </div>

        {/* Data Management */}
        <div className="settings-section card" style={{ padding: '24px' }}>
          <h3 style={{ marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Database size={20} /> Data Management
          </h3>
          
          <p style={{ color: 'var(--text-secondary)', marginBottom: '20px', fontSize: '14px' }}>
            Manage your app data. Resetting will clear all tasks, ideas, scripts, and content.
          </p>

          <div style={{ display: 'flex', gap: '15px', flexDirection: 'column' }}>
            <button 
              className="btn-secondary" 
              onClick={() => {
                if(window.confirm('Add sample data? This will overwrite current data.')) addSampleData();
              }}
              style={{ justifyContent: 'center' }}
            >
              Add Sample Data
            </button>
            <button 
              className="btn-primary danger" 
              onClick={() => {
                if(window.confirm('Are you sure you want to delete ALL data? This cannot be undone.')) clearData();
              }}
              style={{ justifyContent: 'center', background: 'rgba(255, 59, 48, 0.1)', color: '#ff3b30' }}
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
    </div>
  );
}

