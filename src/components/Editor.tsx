'use client';

import { useState, useEffect, useCallback } from 'react';
import { Toolbar } from './Toolbar';
import { TabBar } from './TabBar';
import { GridCanvas } from './GridCanvas';
import { PropertiesPanel } from './PropertiesPanel';
import { ModMetaModal } from './ModMetaModal';
import { useTemporalStore } from '@/store/useEditorStore';

export function Editor() {
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<{ source: string; target: string } | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const temporalStore = useTemporalStore();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Undo: Ctrl+Z / Cmd+Z
      if ((e.ctrlKey || e.metaKey) && key === 'z' && !e.shiftKey) {
        e.preventDefault();
        temporalStore.getState().undo();
      }
      
      // Redo: Ctrl+Shift+Z / Cmd+Shift+Z
      if ((e.ctrlKey || e.metaKey) && key === 'z' && e.shiftKey) {
        e.preventDefault();
        temporalStore.getState().redo();
      }
      
      // Also support Ctrl+Y for redo
      if ((e.ctrlKey || e.metaKey) && key === 'y') {
        e.preventDefault();
        temporalStore.getState().redo();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [temporalStore]);

  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
  }, []);

  const handleEdgeSelect = useCallback((edge: { source: string; target: string } | null) => {
    setSelectedEdge(edge);
  }, []);

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        width: '100vw',
        overflow: 'hidden',
        background: 'var(--background)',
      }}
    >
      {/* Top toolbar */}
      <Toolbar onOpenSettings={() => setIsSettingsOpen(true)} />
      
      {/* Category tabs */}
      <TabBar />
      
      {/* Main canvas area */}
      <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
        <GridCanvas
          onNodeSelect={handleNodeSelect}
          onEdgeSelect={handleEdgeSelect}
        />
      </div>
      
      {/* Bottom properties panel */}
      <PropertiesPanel
        selectedNodeId={selectedNodeId}
        selectedEdge={selectedEdge}
      />
      
      {/* Mod settings modal */}
      <ModMetaModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
}
