'use client';

import { useEffect, useState } from 'react';
import { useEditorStore, MOD_GRID_STEP } from '@/store/useEditorStore';
import type { SkillNode, Connection } from '@/lib/types';

interface PropertiesPanelProps {
  selectedNodeId: string | null;
  selectedEdge: { source: string; target: string } | null;
}

export function PropertiesPanel({ selectedNodeId, selectedEdge }: PropertiesPanelProps) {
  const { categories, activeCategory, updateNode, updateConnection, removeNode, removeConnection } = useEditorStore();
  
  const category = categories.find((c) => c.name === activeCategory);
  const selectedNode = category?.nodes.find((n) => n.id === selectedNodeId) ?? null;
  const selectedConnection = selectedEdge
    ? category?.connections.find(
        (c) =>
          (c.source === selectedEdge.source && c.target === selectedEdge.target) ||
          (c.source === selectedEdge.target && c.target === selectedEdge.source)
      ) ?? null
    : null;

  const [nodeId, setNodeId] = useState('');
  const [nodeDefinition, setNodeDefinition] = useState('');
  const [nodeColor, setNodeColor] = useState('#4b5563');

  // Sync local state with selected node
  useEffect(() => {
    if (selectedNode) {
      setNodeId(selectedNode.id);
      setNodeDefinition(selectedNode.definition);
      setNodeColor(selectedNode.color);
    }
  }, [selectedNode]);

  const handleNodeUpdate = (updates: Partial<SkillNode>) => {
    if (selectedNodeId && activeCategory) {
      updateNode(activeCategory, selectedNodeId, updates);
    }
  };

  const handleIdChange = (newId: string) => {
    setNodeId(newId);
    // Only update if the new ID is valid and different
    if (newId.trim() && newId !== selectedNodeId) {
      // Check for duplicate IDs
      const isDuplicate = category?.nodes.some((n) => n.id === newId && n.id !== selectedNodeId);
      if (!isDuplicate) {
        handleNodeUpdate({ id: newId });
      }
    }
  };

  const handleConnectionTypeToggle = () => {
    if (selectedConnection && activeCategory && selectedEdge) {
      const newType = selectedConnection.type === 'normal' ? 'exclusive' : 'normal';
      updateConnection(activeCategory, selectedEdge.source, selectedEdge.target, { type: newType });
    }
  };

  const handleDeleteNode = () => {
    if (selectedNodeId && activeCategory) {
      if (confirm(`Delete node "${selectedNodeId}"?`)) {
        removeNode(activeCategory, selectedNodeId);
      }
    }
  };

  const handleDeleteConnection = () => {
    if (selectedEdge && activeCategory) {
      removeConnection(activeCategory, selectedEdge.source, selectedEdge.target);
    }
  };

  // Calculate mod coordinates from grid steps
  const modX = selectedNode ? selectedNode.x * MOD_GRID_STEP : 0;
  const modY = selectedNode ? selectedNode.y * MOD_GRID_STEP : 0;

  // Show node properties
  if (selectedNode) {
    return (
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
          flexWrap: 'wrap',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '13px' }}>Node:</span>
        
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '12px', opacity: 0.7 }}>ID</label>
          <input
            type="text"
            className="input"
            value={nodeId}
            onChange={(e) => handleIdChange(e.target.value)}
            onBlur={() => handleIdChange(nodeId)}
            style={{ width: '100px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '12px', opacity: 0.7 }}>Definition</label>
          <input
            type="text"
            className="input"
            value={nodeDefinition}
            onChange={(e) => {
              setNodeDefinition(e.target.value);
              handleNodeUpdate({ definition: e.target.value });
            }}
            placeholder="e.g., health+2"
            style={{ width: '120px' }}
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <label style={{ fontSize: '12px', opacity: 0.7 }}>Color</label>
          <input
            type="color"
            value={nodeColor}
            onChange={(e) => {
              setNodeColor(e.target.value);
              handleNodeUpdate({ color: e.target.value });
            }}
          />
        </div>

        {/* Mod Coordinates Display */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '6px 12px',
            background: 'var(--background)',
            borderRadius: '6px',
            border: '1px solid var(--border)',
          }}
        >
          <span style={{ fontSize: '12px', opacity: 0.7 }}>Mod Coords:</span>
          <code style={{ fontSize: '12px', color: 'var(--accent)' }}>
            x={modX}, y={modY}
          </code>
          <span style={{ fontSize: '11px', opacity: 0.5 }}>
            (grid: {selectedNode.x}, {selectedNode.y})
          </span>
        </div>

        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-danger" onClick={handleDeleteNode}>
            🗑️ Delete
          </button>
        </div>
      </div>
    );
  }

  // Show connection properties
  if (selectedConnection) {
    return (
      <div
        style={{
          padding: '12px 16px',
          background: 'var(--surface)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <span style={{ fontWeight: 600, fontSize: '13px' }}>Connection:</span>
        
        <span style={{ fontSize: '12px', opacity: 0.7 }}>
          {selectedConnection.source} → {selectedConnection.target}
        </span>

        <button
          className="btn"
          onClick={handleConnectionTypeToggle}
          style={{
            background: selectedConnection.type === 'exclusive' ? 'var(--danger)' : 'var(--surface)',
          }}
        >
          Type: {selectedConnection.type}
        </button>

        <div style={{ marginLeft: 'auto' }}>
          <button className="btn btn-danger" onClick={handleDeleteConnection}>
            🗑️ Delete
          </button>
        </div>
      </div>
    );
  }

  // Default state - no selection
  return (
    <div
      style={{
        padding: '12px 16px',
        background: 'var(--surface)',
        borderTop: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        color: 'rgba(255,255,255,0.5)',
        fontSize: '13px',
      }}
    >
      <span>Double-click canvas to create a node • Click to select • Drag handles to connect</span>
    </div>
  );
}
