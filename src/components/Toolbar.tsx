'use client';

import { useRef, useState } from 'react';
import { useEditorStore, useTemporalStore } from '@/store/useEditorStore';
import { exportAsZip, exportAsJar } from '@/lib/exportZip';
import { importFromFile } from '@/lib/importConfig';

interface ToolbarProps {
  onOpenSettings: () => void;
}

export function Toolbar({ onOpenSettings }: ToolbarProps) {
  const { modMeta, categories, activeCategory, importState } = useEditorStore();
  const temporalStore = useTemporalStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isExporting, setIsExporting] = useState(false);

  const handleUndo = () => {
    temporalStore.getState().undo();
  };

  const handleRedo = () => {
    temporalStore.getState().redo();
  };

  const handleExportZip = async () => {
    setIsExporting(true);
    try {
      await exportAsZip({ modMeta, categories, activeCategory });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExportJar = async () => {
    setIsExporting(true);
    try {
      await exportAsJar({ modMeta, categories, activeCategory });
    } catch (error) {
      console.error('Export failed:', error);
      alert('Export failed. Check console for details.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const state = await importFromFile(file);
      importState(state);
    } catch (error) {
      console.error('Import failed:', error);
      alert(`Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    // Reset the input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 16px',
        background: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
      }}
    >
      {/* Left side - Import/Export */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".zip,.jar"
          onChange={handleImport}
          style={{ display: 'none' }}
        />
        <button
          className="btn"
          onClick={() => fileInputRef.current?.click()}
        >
          📁 Import
        </button>
        <button
          className="btn btn-accent"
          onClick={handleExportZip}
          disabled={isExporting}
        >
          📦 Export ZIP
        </button>
        <button
          className="btn btn-accent"
          onClick={handleExportJar}
          disabled={isExporting}
        >
          ☕ Export JAR
        </button>
      </div>

      {/* Center - Project info */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: 'var(--foreground)',
          opacity: 0.8,
        }}
      >
        <span style={{ fontWeight: 600 }}>{modMeta.name}</span>
        <span style={{ fontSize: '12px', opacity: 0.6 }}>v{modMeta.version}</span>
        <button
          className="btn"
          onClick={onOpenSettings}
          style={{ padding: '6px 10px' }}
        >
          ⚙️
        </button>
      </div>

      {/* Right side - Undo/Redo */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          className="btn"
          onClick={handleUndo}
          title="Undo (Ctrl+Z)"
        >
          ↩️ Undo
        </button>
        <button
          className="btn"
          onClick={handleRedo}
          title="Redo (Ctrl+Shift+Z)"
        >
          ↪️ Redo
        </button>
      </div>
    </div>
  );
}
