import React, { useRef, useEffect } from 'react';
import { 
  Bold, Italic, Underline, Strikethrough, 
  Heading1, Heading2, Heading3, 
  List, ListOrdered, CheckSquare, 
  Quote, Link as LinkIcon, Highlighter,
  AlignLeft, AlignCenter, AlignRight
} from 'lucide-react';

export default function RichTextEditor({ value, onChange, placeholder }) {
  const editorRef = useRef(null);
  const isInternalChange = useRef(false);

  useEffect(() => {
    if (editorRef.current && value !== editorRef.current.innerHTML && !isInternalChange.current) {
      editorRef.current.innerHTML = value || '';
    }
    isInternalChange.current = false;
  }, [value]);

  const handleInput = () => {
    if (editorRef.current) {
      isInternalChange.current = true;
      onChange(editorRef.current.innerHTML);
    }
  };

  const execCommand = (command, value = null) => {
    document.execCommand(command, false, value);
    editorRef.current.focus();
    handleInput();
  };

  const handleFormatBlock = (tag) => {
    execCommand('formatBlock', tag);
  };

  const handleLink = () => {
    const url = prompt('Enter link URL:');
    if (url) {
      execCommand('createLink', url);
    }
  };

  // Very basic check list implementation for visual purposes
  const handleChecklist = () => {
    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    
    // Fallback: insert a unicode checkbox and some space
    const checkboxHtml = '&#9744; '; // Unchecked box
    execCommand('insertHTML', checkboxHtml);
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-dark-card">
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-gray-200 dark:border-dark-border bg-gray-50 dark:bg-dark-bg/50 shrink-0">
        
        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2 mr-1">
          <ToolbarButton icon={<Bold className="w-4 h-4" />} onClick={() => execCommand('bold')} title="Bold" />
          <ToolbarButton icon={<Italic className="w-4 h-4" />} onClick={() => execCommand('italic')} title="Italic" />
          <ToolbarButton icon={<Underline className="w-4 h-4" />} onClick={() => execCommand('underline')} title="Underline" />
          <ToolbarButton icon={<Strikethrough className="w-4 h-4" />} onClick={() => execCommand('strikeThrough')} title="Strikethrough" />
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2 mr-1">
          <ToolbarButton icon={<Heading1 className="w-4 h-4" />} onClick={() => handleFormatBlock('H1')} title="Heading 1" />
          <ToolbarButton icon={<Heading2 className="w-4 h-4" />} onClick={() => handleFormatBlock('H2')} title="Heading 2" />
          <ToolbarButton icon={<Heading3 className="w-4 h-4" />} onClick={() => handleFormatBlock('H3')} title="Heading 3" />
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2 mr-1">
          <ToolbarButton icon={<List className="w-4 h-4" />} onClick={() => execCommand('insertUnorderedList')} title="Bullet List" />
          <ToolbarButton icon={<ListOrdered className="w-4 h-4" />} onClick={() => execCommand('insertOrderedList')} title="Numbered List" />
          <ToolbarButton icon={<CheckSquare className="w-4 h-4" />} onClick={handleChecklist} title="Checklist" />
        </div>

        <div className="flex items-center gap-1 border-r border-gray-300 dark:border-gray-700 pr-2 mr-1">
          <ToolbarButton icon={<AlignLeft className="w-4 h-4" />} onClick={() => execCommand('justifyLeft')} title="Align Left" />
          <ToolbarButton icon={<AlignCenter className="w-4 h-4" />} onClick={() => execCommand('justifyCenter')} title="Align Center" />
          <ToolbarButton icon={<AlignRight className="w-4 h-4" />} onClick={() => execCommand('justifyRight')} title="Align Right" />
        </div>

        <div className="flex items-center gap-1">
          <ToolbarButton icon={<Quote className="w-4 h-4" />} onClick={() => handleFormatBlock('BLOCKQUOTE')} title="Quote" />
          <ToolbarButton icon={<LinkIcon className="w-4 h-4" />} onClick={handleLink} title="Link" />
          <ToolbarButton icon={<Highlighter className="w-4 h-4" />} onClick={() => execCommand('hiliteColor', 'yellow')} title="Highlight" />
        </div>
      </div>

      <div 
        ref={editorRef}
        className="editor-content flex-1 overflow-y-auto p-6 md:p-8 outline-none text-gray-800 dark:text-gray-200"
        contentEditable
        onInput={handleInput}
        onBlur={handleInput}
        style={{ minHeight: '300px' }}
        data-placeholder={placeholder || 'Start typing...'}
      />
      
      <style dangerouslySetInnerHTML={{__html: `
        .editor-content:empty:before {
          content: attr(data-placeholder);
          color: #9ca3af;
          cursor: text;
        }
        .editor-content h1 { font-size: 2em; font-weight: bold; margin-top: 0.67em; margin-bottom: 0.67em; }
        .editor-content h2 { font-size: 1.5em; font-weight: bold; margin-top: 0.83em; margin-bottom: 0.83em; }
        .editor-content h3 { font-size: 1.17em; font-weight: bold; margin-top: 1em; margin-bottom: 1em; }
        .editor-content ul { list-style-type: disc; margin-left: 1.5em; margin-top: 1em; margin-bottom: 1em; }
        .editor-content ol { list-style-type: decimal; margin-left: 1.5em; margin-top: 1em; margin-bottom: 1em; }
        .editor-content blockquote { border-left: 4px solid #e5e7eb; padding-left: 1em; color: #6b7280; margin: 1em 0; }
        .dark .editor-content blockquote { border-left-color: #374151; color: #9ca3af; }
        .editor-content a { color: #3b82f6; text-decoration: underline; }
      `}} />
    </div>
  );
}

function ToolbarButton({ icon, onClick, title }) {
  return (
    <button
      type="button"
      className="editor-toolbar-btn p-1.5 rounded text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
      onClick={(e) => {
        e.preventDefault();
        onClick();
      }}
      title={title}
    >
      {icon}
    </button>
  );
}
