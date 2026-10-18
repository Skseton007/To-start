import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useNotebooks } from '../store/useStore';
import {
  ArrowLeft, Plus, Trash2,
  Search, FileText, Clock, FilePlus, Save
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import RichTextEditor from '../components/RichTextEditor';

export default function NotebookDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    notebooks,
    notes,
    addNote,
    updateNote,
    deleteNote
  } = useNotebooks();

  const notebook = useMemo(() => notebooks.find(n => n.id === id), [notebooks, id]);
  const notebookNotes = useMemo(() => notes.filter(n => n.notebookId === id), [notes, id]);

  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isMobileListVisible, setIsMobileListVisible] = useState(true);

  // Note editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [noteTitle, setNoteTitle] = useState('');

  const selectedNote = useMemo(() =>
    notebookNotes.find(n => n.id === selectedNoteId),
  [notebookNotes, selectedNoteId]);

  const filteredNotes = useMemo(() => {
    // updatedAt is an ISO string, so compare as text (subtracting strings gave NaN = no sorting)
    const newestFirst = (a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || '');
    if (!searchQuery.trim()) return [...notebookNotes].sort(newestFirst);
    const q = searchQuery.toLowerCase();
    return notebookNotes
      .filter(n =>
        (n.title || '').toLowerCase().includes(q) ||
        (n.content && n.content.replace(/<[^>]*>?/gm, '').toLowerCase().includes(q))
      )
      .sort(newestFirst);
  }, [notebookNotes, searchQuery]);

  useEffect(() => {
    if (!notebook) {
      navigate('/notebooks');
    }
  }, [notebook, navigate]);

  useEffect(() => {
    if (selectedNote) {
      setNoteTitle(selectedNote.title);
    }
  }, [selectedNoteId, selectedNote]);

  const handleCreateNote = () => {
    const newNote = addNote({
      notebookId: id,
      title: 'Untitled Note',
      content: ''
    });
    setSelectedNoteId(newNote.id);
    setNoteTitle(newNote.title);
    setEditingTitle(true);
    if (window.innerWidth < 768) {
      setIsMobileListVisible(false);
    }
  };

  const handleDeleteNote = (noteId) => {
    deleteNote(noteId);
    if (selectedNoteId === noteId) {
      setSelectedNoteId(null);
      setIsMobileListVisible(true);
    }
    setShowDeleteConfirm(null);
  };

  const handleNoteContentChange = (content) => {
    if (selectedNoteId) {
      updateNote(selectedNoteId, { content });
    }
  };

  const handleTitleSave = () => {
    if (selectedNoteId && noteTitle.trim()) {
      updateNote(selectedNoteId, { title: noteTitle });
    } else if (selectedNoteId && !noteTitle.trim()) {
      setNoteTitle(selectedNote?.title || 'Untitled Note');
    }
    setEditingTitle(false);
  };

  const handleTitleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    }
  };

  const stripHtml = (html) => {
    if (!html) return 'No content';
    const tmp = document.createElement('DIV');
    // Put a space before each block tag so "<li>A</li><li>B</li>" reads "A B", not "AB"
    tmp.innerHTML = html.replace(/<(\/?)(p|h[1-6]|li|div|br|blockquote)\b/gi, ' <$1$2');
    const text = tmp.textContent || tmp.innerText || '';
    return text.replace(/\s+/g, ' ').trim() || 'No content';
  };

  if (!notebook) return null;

  return (
    <div className="page-container flex flex-col h-[calc(100dvh-var(--nav-h)-8rem)] md:h-[calc(100dvh-var(--nav-h)-4.5rem)] min-h-[420px] rounded-2xl overflow-hidden border border-[var(--border)] bg-gray-50 dark:bg-dark-bg fade-in">
      {/* Header */}
      <header className="bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border shrink-0 z-10 px-4 py-3 flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => {
              if (!isMobileListVisible && window.innerWidth < 768) {
                setIsMobileListVisible(true);
              } else {
                navigate('/notebooks');
              }
            }}
            className="mr-3 p-2 rounded-full hover:bg-gray-100 dark:hover:bg-dark-hover text-gray-600 dark:text-gray-300 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white mr-3 shadow-sm"
              style={{ backgroundColor: notebook.color }}
            >
              <FileText className="w-4 h-4" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900 dark:text-white line-clamp-1">
                {notebook.name}
              </h1>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="btn-primary py-1.5 px-3 text-sm flex items-center"
            onClick={handleCreateNote}
          >
            <Plus className="w-4 h-4 md:mr-1.5" />
            <span className="hidden md:inline">New Note</span>
          </button>
        </div>
      </header>

      {/* Main Content - Split View */}
      <div className="flex-1 flex overflow-hidden relative">

        {/* Left Side: Note List */}
        <div
          className={`
            w-full md:w-80 lg:w-96 shrink-0 flex flex-col bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border
            transition-transform duration-300 ease-in-out absolute md:relative z-10 h-full
            ${isMobileListVisible ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
          `}
        >
          <div className="p-4 border-b border-gray-200 dark:border-dark-border shrink-0">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search notes..."
                className="w-full bg-gray-100 dark:bg-dark-bg border-transparent focus:border-gray-300 dark:focus:border-gray-700 text-gray-900 dark:text-white text-sm rounded-lg pl-9 pr-4 py-2 outline-none transition-colors"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {filteredNotes.length === 0 ? (
              <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                {searchQuery ? 'No notes match your search' : 'This notebook is empty'}
              </div>
            ) : (
              <div className="divide-y divide-gray-100 dark:divide-dark-border/50">
                {filteredNotes.map(note => (
                  <div
                    key={note.id}
                    className={`
                      p-4 cursor-pointer transition-colors group relative
                      ${selectedNoteId === note.id ? 'bg-blue-50/50 dark:bg-blue-900/10' : 'hover:bg-gray-50 dark:hover:bg-dark-hover'}
                    `}
                    onClick={() => {
                      setSelectedNoteId(note.id);
                      if (window.innerWidth < 768) {
                        setIsMobileListVisible(false);
                      }
                    }}
                  >
                    <div
                      className={`absolute left-0 top-0 bottom-0 w-1 rounded-r-full transition-opacity ${selectedNoteId === note.id ? 'opacity-100' : 'opacity-0'}`}
                      style={{ backgroundColor: notebook.color }}
                    />

                    <div className="flex justify-between items-start mb-1">
                      <h3 className={`font-medium line-clamp-1 pr-6 ${selectedNoteId === note.id ? 'text-gray-900 dark:text-white' : 'text-gray-700 dark:text-gray-300'}`}>
                        {note.title}
                      </h3>

                      <button
                        className="opacity-100 md:opacity-0 md:group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all rounded"
                        onClick={(e) => {
                          e.stopPropagation();
                          setShowDeleteConfirm(note.id);
                        }}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 mb-2 min-h-[2rem]">
                      {stripHtml(note.content)}
                    </p>

                    <div className="flex items-center text-[10px] text-gray-400 dark:text-gray-500">
                      <Clock className="w-3 h-3 mr-1" />
                      {formatDistanceToNow(new Date(note.updatedAt), { addSuffix: true })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Editor */}
        <div className={`
          flex-1 flex flex-col bg-gray-50 dark:bg-dark-bg
          transition-transform duration-300 ease-in-out absolute md:relative w-full h-full
          ${!isMobileListVisible ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}
        `}>
          {selectedNote ? (
            <div className="flex-1 flex flex-col overflow-hidden max-w-4xl mx-auto w-full bg-white dark:bg-dark-card md:my-4 md:rounded-xl md:shadow-sm md:border border-gray-200 dark:border-dark-border">
              <div className="p-6 pb-2 border-b border-gray-100 dark:border-dark-border/50 shrink-0 group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: `${notebook.color}20`, color: notebook.color }}>
                    {format(new Date(selectedNote.updatedAt), 'MMM d, yyyy • h:mm a')}
                  </span>
                  <span className="text-xs text-gray-400 ml-auto flex items-center opacity-100 md:opacity-0 transition-opacity md:group-hover:opacity-100">
                    <Save className="w-3 h-3 mr-1" /> Auto-saved
                  </span>
                </div>

                {editingTitle ? (
                  <input
                    type="text"
                    value={noteTitle}
                    onChange={(e) => setNoteTitle(e.target.value)}
                    onBlur={handleTitleSave}
                    onKeyDown={handleTitleKeyDown}
                    className="w-full text-2xl md:text-3xl font-bold bg-transparent outline-none text-gray-900 dark:text-white border-b-2 border-blue-500 pb-1"
                    autoFocus
                  />
                ) : (
                  <h2
                    className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white cursor-text hover:bg-gray-50 dark:hover:bg-dark-hover rounded inline-block w-full transition-colors"
                    onClick={() => setEditingTitle(true)}
                  >
                    {selectedNote.title}
                  </h2>
                )}
              </div>

              <div className="flex-1 overflow-hidden">
                <RichTextEditor
                  key={selectedNote.id}
                  value={selectedNote.content}
                  onChange={handleNoteContentChange}
                  placeholder="Start writing..."
                />
              </div>
            </div>
          ) : (
            <div className="hidden md:flex flex-1 flex-col items-center justify-center text-gray-400">
              <FilePlus className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
              <p className="text-lg font-medium text-gray-500">Select a note or create a new one</p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4 backdrop-blur-sm animate-fade-in" onClick={() => setShowDeleteConfirm(null)}>
          <div className="bg-white dark:bg-dark-card w-full max-w-sm rounded-2xl shadow-xl border border-gray-200 dark:border-dark-border p-6 animate-scale-in" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Delete Note?</h3>
            <p className="text-gray-500 dark:text-gray-400 mb-6">
              Are you sure you want to delete this note? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-3">
              <button className="btn-secondary py-2 px-4" onClick={() => setShowDeleteConfirm(null)}>Cancel</button>
              <button className="bg-red-600 hover:bg-red-700 text-white rounded-xl py-2 px-4 font-medium transition-colors" onClick={() => handleDeleteNote(showDeleteConfirm)}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
