import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useScripts } from "../store/useStore";
import { useIdeas } from "../store/useStore";
import { 
  ChevronLeft, Save, Trash2, Clock, 
  Play, Camera, FileText
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function ScriptEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { scripts, updateScript, deleteScript } = useScripts();
  const { ideas } = useIdeas();
  
  const script = scripts.find(s => s.id === id);
  
  const [formData, setFormData] = useState({
    title: '',
    platform: 'youtube',
    status: 'draft',
    ideaId: '',
    hook: '',
    content: '',
    cta: '',
    notes: ''
  });
  
  const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
  const [lastSaved, setLastSaved] = useState(null);
  
  const debounceTimerRef = useRef(null);
  const isFirstRender = useRef(true);

  // Initialize form data
  useEffect(() => {
    if (script && isFirstRender.current) {
      setFormData({
        title: script.title || '',
        platform: script.platform || 'youtube',
        status: script.status || 'draft',
        ideaId: script.ideaId || '',
        hook: script.hook || '',
        content: script.content || '',
        cta: script.cta || '',
        notes: script.notes || ''
      });
      setLastSaved(new Date(script.updatedAt));
      isFirstRender.current = false;
    }
  }, [script]);

  // Handle auto-save
  useEffect(() => {
    if (isFirstRender.current || !script) return;

    setSaveStatus('saving');
    
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      try {
        updateScript(id, formData);
        setSaveStatus('saved');
        setLastSaved(new Date());
      } catch (error) {
        console.error("Failed to save script:", error);
        setSaveStatus('error');
      }
    }, 500);

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    };
  }, [formData, id, updateScript, script]);

  if (!script) {
    return (
      <div className="flex flex-col items-center justify-center h-full py-20">
        <h2 className="text-2xl font-bold mb-4">Script not found</h2>
        <button onClick={() => navigate('/scripts')} className="text-blue-500 hover:underline">
          Return to Scripts
        </button>
      </div>
    );
  }

  const handleDelete = () => {
    if (window.confirm('Are you sure you want to delete this script? This action cannot be undone.')) {
      deleteScript(id);
      navigate('/scripts');
    }
  };

  const handleTextareaHeight = (e) => {
    e.target.style.height = 'auto';
    e.target.style.height = (e.target.scrollHeight) + 'px';
  };

  return (
    <div className="script-editor-container fade-in max-w-5xl mx-auto pb-24">
      {/* Top Bar */}
      <div className="sticky top-0 z-10 bg-white/80 dark:bg-[#0f0f0f]/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800 py-4 mb-8 -mx-6 px-6 sm:-mx-8 sm:px-8">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/scripts')}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors text-gray-500"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              {saveStatus === 'saving' && <span className="animate-pulse">Saving...</span>}
              {saveStatus === 'saved' && lastSaved && (
                <span className="flex items-center gap-1">
                  <Save size={14} /> Saved {formatDistanceToNow(lastSaved, { addSuffix: true })}
                </span>
              )}
              {saveStatus === 'error' && <span className="text-red-500">Error saving!</span>}
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={handleDelete}
              className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              title="Delete Script"
            >
              <Trash2 size={20} />
            </button>
            <button 
              onClick={() => { updateScript(id, formData); setSaveStatus('saved'); setLastSaved(new Date()); }}
              className="px-4 py-2 rounded-lg font-medium bg-black text-white dark:bg-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors text-sm"
            >
              Save Now
            </button>
          </div>
        </div>
      </div>

      {/* Title & Metadata */}
      <div className="mb-10">
        <input
          type="text"
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          placeholder="Script Title..."
          className="text-4xl font-bold bg-transparent w-full outline-none mb-6 text-black dark:text-white placeholder-gray-300 dark:placeholder-gray-700"
        />
        
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex items-center bg-gray-50 dark:bg-[#1a1a1a] rounded-lg p-1 border border-gray-200 dark:border-gray-800">
            <button 
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${formData.platform === 'youtube' ? 'bg-white dark:bg-black shadow-sm' : 'text-gray-500'}`}
              onClick={() => setFormData({...formData, platform: 'youtube'})}
            >
              <Play size={16} className={formData.platform === 'youtube' ? 'text-red-600' : ''} />
              YouTube
            </button>
            <button 
              className={`px-3 py-1.5 rounded-md text-sm font-medium flex items-center gap-2 transition-all ${formData.platform === 'instagram' ? 'bg-white dark:bg-black shadow-sm' : 'text-gray-500'}`}
              onClick={() => setFormData({...formData, platform: 'instagram'})}
            >
              <Camera size={16} className={formData.platform === 'instagram' ? 'text-pink-600' : ''} />
              Camera
            </button>
          </div>

          <select 
            value={formData.status}
            onChange={(e) => setFormData({...formData, status: e.target.value})}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] outline-none"
          >
            <option value="draft">Draft</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
          
          <select 
            value={formData.ideaId || ''}
            onChange={(e) => setFormData({...formData, ideaId: e.target.value})}
            className="px-4 py-2 rounded-lg text-sm border border-gray-200 dark:border-gray-800 bg-white dark:bg-[#1a1a1a] outline-none flex-grow max-w-xs"
          >
            <option value="">Link to an Idea...</option>
            {ideas.map(idea => (
              <option key={idea.id} value={idea.id}>{idea.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Editor Sections */}
      <div className="space-y-8">
        {/* Hook */}
        <div className="editor-section">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xl font-bold">1. Hook</h3>
            <span className="text-sm px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">First 5 seconds</span>
          </div>
          <textarea
            value={formData.hook}
            onChange={(e) => { setFormData({...formData, hook: e.target.value}); handleTextareaHeight(e); }}
            onFocus={handleTextareaHeight}
            placeholder="Grab attention immediately. What is the video about and why should they care?"
            className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#222] focus:ring-2 focus:ring-black dark:focus:ring-white outline-none resize-none overflow-hidden transition-colors text-lg"
          />
        </div>

        {/* Main Content */}
        <div className="editor-section">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xl font-bold">2. Main Content</h3>
          </div>
          <textarea
            value={formData.content}
            onChange={(e) => { setFormData({...formData, content: e.target.value}); handleTextareaHeight(e); }}
            onFocus={handleTextareaHeight}
            placeholder="The meat of your video. Break it down into clear, digestible points."
            className="w-full min-h-[300px] p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#222] focus:ring-2 focus:ring-black dark:focus:ring-white outline-none resize-y transition-colors text-lg"
          />
        </div>

        {/* CTA */}
        <div className="editor-section">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-xl font-bold">3. Call to Action (CTA)</h3>
          </div>
          <textarea
            value={formData.cta}
            onChange={(e) => { setFormData({...formData, cta: e.target.value}); handleTextareaHeight(e); }}
            onFocus={handleTextareaHeight}
            placeholder="What do you want them to do next? (Subscribe, comment, click link)"
            className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#222] focus:ring-2 focus:ring-black dark:focus:ring-white outline-none resize-none overflow-hidden transition-colors text-lg"
          />
        </div>

        {/* Notes */}
        <div className="editor-section">
          <div className="flex items-center gap-2 mb-3">
            <h3 className="text-lg font-bold text-gray-500">Production Notes</h3>
          </div>
          <textarea
            value={formData.notes}
            onChange={(e) => { setFormData({...formData, notes: e.target.value}); handleTextareaHeight(e); }}
            onFocus={handleTextareaHeight}
            placeholder="B-roll ideas, location, props, mood..."
            className="w-full min-h-[100px] p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-[#1a1a1a] focus:bg-white dark:focus:bg-[#222] focus:ring-2 focus:ring-black dark:focus:ring-white outline-none resize-none overflow-hidden transition-colors"
          />
        </div>
      </div>
    </div>
  );
}
