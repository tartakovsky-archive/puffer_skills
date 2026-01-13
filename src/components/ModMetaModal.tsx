'use client';

import { useState, useEffect } from 'react';
import { useEditorStore } from '@/store/useEditorStore';

interface ModMetaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ModMetaModal({ isOpen, onClose }: ModMetaModalProps) {
  const { modMeta, setModMeta } = useEditorStore();
  
  const [id, setId] = useState(modMeta.id);
  const [name, setName] = useState(modMeta.name);
  const [version, setVersion] = useState(modMeta.version);
  const [description, setDescription] = useState(modMeta.description);
  const [authors, setAuthors] = useState(modMeta.authors.join(', '));

  useEffect(() => {
    setId(modMeta.id);
    setName(modMeta.name);
    setVersion(modMeta.version);
    setDescription(modMeta.description);
    setAuthors(modMeta.authors.join(', '));
  }, [modMeta, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setModMeta({
      id: id.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      name,
      version,
      description,
      authors: authors.split(',').map((a) => a.trim()).filter(Boolean),
    });
    onClose();
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <div className="modal-overlay" onClick={handleOverlayClick}>
      <div className="modal">
        <h2>Mod Settings</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>
              Mod ID
            </label>
            <input
              type="text"
              className="input"
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="e.g., my_skill_trees"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>
              Mod Name
            </label>
            <input
              type="text"
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., My Skill Trees"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>
              Version
            </label>
            <input
              type="text"
              className="input"
              value={version}
              onChange={(e) => setVersion(e.target.value)}
              placeholder="e.g., 1.0"
              style={{ width: '100%' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>
              Description
            </label>
            <textarea
              className="input"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your mod..."
              style={{ width: '100%', minHeight: '80px', resize: 'vertical' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px', opacity: 0.7 }}>
              Authors (comma-separated)
            </label>
            <input
              type="text"
              className="input"
              value={authors}
              onChange={(e) => setAuthors(e.target.value)}
              placeholder="e.g., Author1, Author2"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
            <button className="btn" onClick={onClose}>
              Cancel
            </button>
            <button className="btn btn-accent" onClick={handleSave}>
              Save
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
