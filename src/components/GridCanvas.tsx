'use client';

import { useCallback, useMemo, useEffect } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  addEdge,
  useReactFlow,
  ConnectionMode,
  type OnConnect,
  type OnNodesChange,
  type OnEdgesChange,
  type EdgeChange,
  type Node,
  type Edge,
  ReactFlowProvider,
  useViewport,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { SkillNode } from './SkillNode';
import { ConnectionEdge } from './ConnectionEdge';
import { useEditorStore, VISUAL_GRID_SPACING } from '@/store/useEditorStore';
import type { SkillFlowNode, ConnectionFlowEdge, SkillNodeData, ConnectionEdgeData } from '@/lib/types';

// Node types registration
const nodeTypes = {
  skill: SkillNode,
};

// Edge types registration
const edgeTypes = {
  connection: ConnectionEdge,
};

// Node origin set to center - position represents center of node
const nodeOrigin: [number, number] = [0.5, 0.5];

interface GridCanvasProps {
  onNodeSelect: (nodeId: string | null) => void;
  onEdgeSelect: (edge: { source: string; target: string } | null) => void;
}

// Origin marker component that renders at (0,0) in flow coordinates
function OriginMarkerOverlay() {
  const { x, y, zoom } = useViewport();
  
  // Calculate where (0,0) is in screen coordinates
  const originScreenX = x;
  const originScreenY = y;
  const markerSize = 20;
  const lineLength = 60;
  
  return (
    <div
      style={{
        position: 'absolute',
        left: originScreenX - markerSize / 2,
        top: originScreenY - markerSize / 2,
        width: markerSize,
        height: markerSize,
        background: 'rgba(34, 197, 94, 0.7)',
        border: '2px solid rgba(34, 197, 94, 1)',
        borderRadius: '3px',
        pointerEvents: 'none',
        zIndex: 10,
        transform: `scale(${1 / zoom})`,
        transformOrigin: 'center',
      }}
    >
      {/* Axis lines */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: '100%',
          width: 2,
          height: lineLength,
          background: 'rgba(34, 197, 94, 0.5)',
          transform: 'translateX(-50%)',
        }}
      />
      <div
        style={{
          position: 'absolute',
          left: '100%',
          top: '50%',
          width: lineLength,
          height: 2,
          background: 'rgba(34, 197, 94, 0.5)',
          transform: 'translateY(-50%)',
        }}
      />
      {/* Y axis arrow (pointing up) */}
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: `calc(100% + ${lineLength - 8}px)`,
          transform: 'translateX(-50%)',
          width: 0,
          height: 0,
          borderLeft: '6px solid transparent',
          borderRight: '6px solid transparent',
          borderBottom: '10px solid rgba(34, 197, 94, 0.7)',
        }}
      />
      {/* X axis arrow (pointing right) */}
      <div
        style={{
          position: 'absolute',
          left: `calc(100% + ${lineLength - 8}px)`,
          top: '50%',
          transform: 'translateY(-50%)',
          width: 0,
          height: 0,
          borderTop: '6px solid transparent',
          borderBottom: '6px solid transparent',
          borderLeft: '10px solid rgba(34, 197, 94, 0.7)',
        }}
      />
      {/* Labels */}
      <div
        style={{
          position: 'absolute',
          left: `calc(100% + ${lineLength + 5}px)`,
          top: '50%',
          transform: 'translateY(-50%)',
          fontSize: 10,
          color: 'rgba(34, 197, 94, 0.9)',
          fontWeight: 600,
        }}
      >
        +X
      </div>
      <div
        style={{
          position: 'absolute',
          left: '50%',
          bottom: `calc(100% + ${lineLength + 5}px)`,
          transform: 'translateX(-50%)',
          fontSize: 10,
          color: 'rgba(34, 197, 94, 0.9)',
          fontWeight: 600,
        }}
      >
        +Y
      </div>
    </div>
  );
}

function GridCanvasInner({ onNodeSelect, onEdgeSelect }: GridCanvasProps) {
  const { screenToFlowPosition } = useReactFlow();
  const { categories, activeCategory, addNode, updateNode, removeNode, addConnection, removeConnection } = useEditorStore();
  
  const category = categories.find((c) => c.name === activeCategory);

  // Convert store nodes to React Flow nodes
  // Y axis is inverted: positive Y in mod = up on screen = negative visual Y
  const initialNodes: SkillFlowNode[] = useMemo(() => {
    if (!category) return [];
    return category.nodes.map((node) => ({
      id: node.id,
      type: 'skill',
      position: {
        x: node.x * VISUAL_GRID_SPACING,
        // Invert Y: positive mod Y = up = negative screen Y
        y: -node.y * VISUAL_GRID_SPACING,
      },
      data: {
        id: node.id,
        definition: node.definition,
        color: node.color,
      },
    }));
  }, [category]);

  // Convert store connections to React Flow edges
  const initialEdges: ConnectionFlowEdge[] = useMemo(() => {
    if (!category) return [];
    return category.connections.map((conn) => ({
      id: `${conn.source}-${conn.target}`,
      source: conn.source,
      target: conn.target,
      sourceHandle: conn.sourceHandle,
      targetHandle: conn.targetHandle,
      type: 'connection',
      data: {
        connectionType: conn.type,
        bidirectional: conn.bidirectional,
      },
    }));
  }, [category]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<ConnectionFlowEdge>(initialEdges);

  // Sync nodes from store when category changes
  useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle node position changes (drag)
  const handleNodesChange: OnNodesChange = useCallback(
    (changes) => {
      onNodesChange(changes);
      
      // Sync position changes to store
      for (const change of changes) {
        if (change.type === 'position' && change.position && activeCategory) {
          // Convert back from visual position to grid steps
          // Invert Y back: negative screen Y = positive mod Y
          const gridX = Math.round(change.position.x / VISUAL_GRID_SPACING);
          const gridY = Math.round(-change.position.y / VISUAL_GRID_SPACING);
          updateNode(activeCategory, change.id, { x: gridX, y: gridY });
        }
        
        if (change.type === 'remove' && activeCategory) {
          removeNode(activeCategory, change.id);
        }
      }
    },
    [activeCategory, onNodesChange, removeNode, updateNode]
  );

  // Handle edge changes
  const handleEdgesChange: OnEdgesChange<ConnectionFlowEdge> = useCallback(
    (changes: EdgeChange<ConnectionFlowEdge>[]) => {
      onEdgesChange(changes);
      
      // Sync edge removals to store
      for (const change of changes) {
        if (change.type === 'remove' && activeCategory) {
          const [source, target] = change.id.split('-');
          if (source && target) {
            removeConnection(activeCategory, source, target);
          }
        }
      }
    },
    [activeCategory, onEdgesChange, removeConnection]
  );

  // Handle new connections - preserve handle information
  const handleConnect: OnConnect = useCallback(
    (params) => {
      if (!params.source || !params.target || !activeCategory) return;
      
      // Don't connect to self
      if (params.source === params.target) return;
      
      // Check if connection already exists
      const exists = category?.connections.some(
        (c) =>
          (c.source === params.source && c.target === params.target) ||
          (c.source === params.target && c.target === params.source)
      );
      
      if (!exists) {
        // Add to React Flow - preserve sourceHandle and targetHandle
        setEdges((eds) =>
          addEdge(
            {
              id: `${params.source}-${params.target}`,
              source: params.source,
              target: params.target,
              sourceHandle: params.sourceHandle,
              targetHandle: params.targetHandle,
              type: 'connection',
              data: { connectionType: 'normal', bidirectional: true } as ConnectionEdgeData,
            },
            eds
          )
        );
        
        // Add to store with handle info
        addConnection(activeCategory, {
          source: params.source,
          target: params.target,
          sourceHandle: params.sourceHandle ?? undefined,
          targetHandle: params.targetHandle ?? undefined,
          type: 'normal',
          bidirectional: true,
        });
      }
    },
    [activeCategory, addConnection, category?.connections, setEdges]
  );

  // Handle double-click to create node
  const handlePaneDoubleClick = useCallback(
    (event: React.MouseEvent) => {
      if (!activeCategory) return;
      
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });
      
      // Snap to nearest grid dot
      const gridX = Math.round(position.x / VISUAL_GRID_SPACING);
      // Invert Y for mod coordinates
      const gridY = Math.round(-position.y / VISUAL_GRID_SPACING);
      
      // Generate unique ID
      const existingIds = category?.nodes.map((n) => n.id) ?? [];
      let counter = 1;
      let newId = `skill_${counter}`;
      while (existingIds.includes(newId)) {
        counter++;
        newId = `skill_${counter}`;
      }
      
      // Create the node
      const newNode = {
        id: newId,
        x: gridX,
        y: gridY,
        definition: '',
        color: '#4b5563',
      };
      
      addNode(activeCategory, newNode);
      
      // Add to React Flow immediately for responsiveness
      setNodes((nds) => [
        ...nds,
        {
          id: newId,
          type: 'skill',
          position: {
            x: gridX * VISUAL_GRID_SPACING,
            y: -gridY * VISUAL_GRID_SPACING,
          },
          data: {
            id: newId,
            definition: '',
            color: '#4b5563',
          },
        } as SkillFlowNode,
      ]);
      
      // Select the new node
      onNodeSelect(newId);
    },
    [activeCategory, category?.nodes, screenToFlowPosition, addNode, setNodes, onNodeSelect]
  );

  // Handle node selection
  const handleSelectionChange = useCallback(
    ({ nodes, edges }: { nodes: Node<SkillNodeData>[]; edges: Edge<ConnectionEdgeData>[] }) => {
      if (nodes.length > 0) {
        onNodeSelect(nodes[0].id);
        onEdgeSelect(null);
      } else if (edges.length > 0) {
        onNodeSelect(null);
        onEdgeSelect({
          source: edges[0].source,
          target: edges[0].target,
        });
      } else {
        onNodeSelect(null);
        onEdgeSelect(null);
      }
    },
    [onNodeSelect, onEdgeSelect]
  );

  // Handle click on empty space
  const handlePaneClick = useCallback(() => {
    onNodeSelect(null);
    onEdgeSelect(null);
  }, [onNodeSelect, onEdgeSelect]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={handleEdgesChange}
        onConnect={handleConnect}
        onDoubleClick={handlePaneDoubleClick}
        onPaneClick={handlePaneClick}
        onSelectionChange={handleSelectionChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        snapToGrid
        snapGrid={[VISUAL_GRID_SPACING, VISUAL_GRID_SPACING]}
        defaultViewport={{ x: 400, y: 300, zoom: 1 }}
        minZoom={0.2}
        maxZoom={4}
        fitView={false}
        deleteKeyCode={['Backspace', 'Delete']}
        multiSelectionKeyCode="Shift"
        selectionOnDrag
        panOnDrag
        zoomOnDoubleClick={false}
        nodeOrigin={nodeOrigin}
        connectionLineStyle={{ stroke: 'var(--accent)', strokeWidth: 2 }}
        defaultEdgeOptions={{
          type: 'connection',
        }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={VISUAL_GRID_SPACING}
          size={2}
          color="#333"
        />
        <OriginMarkerOverlay />
      </ReactFlow>
    </div>
  );
}

export function GridCanvas(props: GridCanvasProps) {
  return (
    <ReactFlowProvider>
      <GridCanvasInner {...props} />
    </ReactFlowProvider>
  );
}
