'use client';

import { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import type { SkillFlowNode } from '@/lib/types';

// Node size - should be square and fit nicely on grid
const NODE_SIZE = 60;

// Handle style
const handleStyle = {
  background: 'var(--accent)',
  border: '2px solid var(--background)',
  width: 12,
  height: 12,
};

function SkillNodeComponent({ data, selected }: NodeProps<SkillFlowNode>) {
  return (
    <div
      className="skill-node"
      style={{
        background: data.color || '#4b5563',
        border: selected ? '3px solid var(--accent)' : '2px solid rgba(0,0,0,0.3)',
        borderRadius: '8px',
        width: NODE_SIZE,
        height: NODE_SIZE,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: selected
          ? '0 0 0 2px var(--accent), 0 4px 12px rgba(0,0,0,0.4)'
          : '0 2px 8px rgba(0,0,0,0.3)',
        transition: 'box-shadow 0.15s ease, border-color 0.15s ease',
        cursor: 'grab',
      }}
    >
      {/* Top handles - both source and target at same position */}
      <Handle
        type="target"
        position={Position.Top}
        id="top"
        style={{ ...handleStyle, top: -6 }}
      />
      <Handle
        type="source"
        position={Position.Top}
        id="top-source"
        style={{ ...handleStyle, top: -6 }}
      />
      
      {/* Right handles */}
      <Handle
        type="target"
        position={Position.Right}
        id="right"
        style={{ ...handleStyle, right: -6 }}
      />
      <Handle
        type="source"
        position={Position.Right}
        id="right-source"
        style={{ ...handleStyle, right: -6 }}
      />
      
      {/* Bottom handles */}
      <Handle
        type="target"
        position={Position.Bottom}
        id="bottom"
        style={{ ...handleStyle, bottom: -6 }}
      />
      <Handle
        type="source"
        position={Position.Bottom}
        id="bottom-source"
        style={{ ...handleStyle, bottom: -6 }}
      />
      
      {/* Left handles */}
      <Handle
        type="target"
        position={Position.Left}
        id="left"
        style={{ ...handleStyle, left: -6 }}
      />
      <Handle
        type="source"
        position={Position.Left}
        id="left-source"
        style={{ ...handleStyle, left: -6 }}
      />
      
      {/* Node content */}
      <div
        style={{
          fontSize: '10px',
          fontWeight: 600,
          color: '#fff',
          textShadow: '0 1px 2px rgba(0,0,0,0.5)',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: NODE_SIZE - 10,
          textAlign: 'center',
          padding: '0 4px',
        }}
      >
        {data.id}
      </div>
      {data.definition && (
        <div
          style={{
            fontSize: '8px',
            color: 'rgba(255,255,255,0.7)',
            marginTop: '2px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: NODE_SIZE - 10,
            textAlign: 'center',
            padding: '0 4px',
          }}
        >
          {data.definition}
        </div>
      )}
    </div>
  );
}

export const SkillNode = memo(SkillNodeComponent);

// Export node size for centering calculations
export const SKILL_NODE_SIZE = NODE_SIZE;
