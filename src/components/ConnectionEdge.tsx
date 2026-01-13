'use client';

import { memo } from 'react';
import { BaseEdge, getBezierPath, type EdgeProps } from '@xyflow/react';
import type { ConnectionFlowEdge } from '@/lib/types';

function ConnectionEdgeComponent({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}: EdgeProps<ConnectionFlowEdge>) {
  // Use bezier path for smooth direct connections
  const [edgePath] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const isExclusive = data?.connectionType === 'exclusive';
  const strokeColor = isExclusive ? 'var(--edge-exclusive)' : 'var(--edge-normal)';
  const strokeWidth = selected ? 3 : 2;

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: strokeColor,
          strokeWidth,
          strokeDasharray: isExclusive ? '5,5' : undefined,
        }}
      />
      {/* Invisible wider path for easier selection */}
      <path
        d={edgePath}
        fill="none"
        stroke="transparent"
        strokeWidth={20}
        style={{ cursor: 'pointer' }}
      />
    </>
  );
}

export const ConnectionEdge = memo(ConnectionEdgeComponent);
