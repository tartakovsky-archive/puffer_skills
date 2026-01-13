'use client';

import { useState, useRef, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

export function TabBar() {
  const { categories, activeCategory, setActiveCategory, addCategory, removeCategory, renameCategory } = useEditorStore();
  
  const [editingTab, setEditingTab] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [showAddInput, setShowAddInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  
  const inputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editingTab && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingTab]);

  useEffect(() => {
    if (showAddInput && addInputRef.current) {
      addInputRef.current.focus();
    }
  }, [showAddInput]);

  const handleDoubleClick = (categoryName: string, title: string) => {
    setEditingTab(categoryName);
    setEditValue(title);
  };

  const handleRename = (oldName: string) => {
    if (editValue.trim()) {
      const newName = editValue.trim().toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      const newTitle = editValue.trim();
      renameCategory(oldName, newName, newTitle);
    }
    setEditingTab(null);
    setEditValue('');
  };

  const handleContextMenu = (e: React.MouseEvent, categoryName: string) => {
    e.preventDefault();
    if (categories.length > 1) {
      if (confirm(`Delete category "${categoryName}"? This cannot be undone.`)) {
        removeCategory(categoryName);
      }
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim()) {
      addCategory(newCategoryName.trim());
      setNewCategoryName('');
    }
    setShowAddInput(false);
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        gap: '4px',
        padding: '0 16px',
        borderBottom: '1px solid var(--border)',
        background: 'var(--surface)',
        minHeight: '42px',
      }}
    >
      {categories.map((category) => (
        <div
          key={category.name}
          className={`tab ${activeCategory === category.name ? 'active' : ''}`}
          onClick={() => setActiveCategory(category.name)}
          onDoubleClick={() => handleDoubleClick(category.name, category.title)}
          onContextMenu={(e) => handleContextMenu(e, category.name)}
          style={{ marginBottom: '-1px' }}
        >
          {editingTab === category.name ? (
            <input
              ref={inputRef}
              type="text"
              value={editValue}
              onChange={(e) => setEditValue(e.target.value)}
              onBlur={() => handleRename(category.name)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleRename(category.name);
                if (e.key === 'Escape') {
                  setEditingTab(null);
                  setEditValue('');
                }
              }}
              style={{
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'inherit',
                font: 'inherit',
                width: '80px',
              }}
            />
          ) : (
            category.title
          )}
        </div>
      ))}
      
      {showAddInput ? (
        <div className="tab" style={{ marginBottom: '-1px' }}>
          <input
            ref={addInputRef}
            type="text"
            placeholder="Category name"
            value={newCategoryName}
            onChange={(e) => setNewCategoryName(e.target.value)}
            onBlur={handleAddCategory}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleAddCategory();
              if (e.key === 'Escape') {
                setShowAddInput(false);
                setNewCategoryName('');
              }
            }}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'inherit',
              font: 'inherit',
              width: '100px',
            }}
          />
        </div>
      ) : (
        <button
          className="tab"
          onClick={() => setShowAddInput(true)}
          style={{
            marginBottom: '-1px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px 12px',
          }}
        >
          + Add
        </button>
      )}
    </div>
  );
}
