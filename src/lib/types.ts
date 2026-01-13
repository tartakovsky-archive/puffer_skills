import type { Node, Edge } from '@xyflow/react';

// ============================
// Core Application Types
// ============================

export interface ModMeta {
  id: string;
  name: string;
  version: string;
  description: string;
  authors: string[];
}

export interface SkillNode {
  id: string;
  x: number; // grid steps (not pixels)
  y: number; // grid steps (not pixels)
  definition: string;
  color: string; // hex color
}

export interface Connection {
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type: 'normal' | 'exclusive';
  bidirectional: boolean;
}

export interface Category {
  name: string; // folder name, tab label
  title: string; // display title in category.json
  nodes: SkillNode[];
  connections: Connection[];
}

export interface AppState {
  modMeta: ModMeta;
  categories: Category[];
  activeCategory: string;
}

// ============================
// React Flow Types
// ============================

export interface SkillNodeData {
  id: string;
  definition: string;
  color: string;
}

export type SkillFlowNode = Node<SkillNodeData, 'skill'>;

export interface ConnectionEdgeData {
  connectionType: 'normal' | 'exclusive';
  bidirectional: boolean;
}

export type ConnectionFlowEdge = Edge<ConnectionEdgeData>;

// ============================
// Store Types
// ============================

export interface EditorActions {
  // Mod Meta
  setModMeta: (meta: Partial<ModMeta>) => void;
  
  // Categories
  addCategory: (name: string) => void;
  removeCategory: (name: string) => void;
  renameCategory: (oldName: string, newName: string, newTitle: string) => void;
  setActiveCategory: (name: string) => void;
  
  // Nodes
  addNode: (categoryName: string, node: SkillNode) => void;
  updateNode: (categoryName: string, nodeId: string, updates: Partial<SkillNode>) => void;
  removeNode: (categoryName: string, nodeId: string) => void;
  
  // Connections
  addConnection: (categoryName: string, connection: Connection) => void;
  updateConnection: (categoryName: string, source: string, target: string, updates: Partial<Connection>) => void;
  removeConnection: (categoryName: string, source: string, target: string) => void;
  
  // Import/Export
  importState: (state: AppState) => void;
  resetState: () => void;
}

export type EditorStore = AppState & EditorActions;

// ============================
// Export File Types
// ============================

export interface ConfigJson {
  version: number;
  categories: string[];
}

export interface CategoryJson {
  unlocked_by_default: boolean;
  title: string;
  icon: {
    type: string;
    data: {
      item: string;
    };
  };
  background: string;
}

export interface SkillsJson {
  [nodeId: string]: {
    x: number;
    y: number;
    definition: string;
  };
}

export interface ConnectionsJson {
  normal: {
    bidirectional: [string, string][];
  };
  exclusive: {
    bidirectional: [string, string][];
  };
}

export interface FabricModJson {
  schemaVersion: number;
  id: string;
  version: string;
  name: string;
  description: string;
  authors: string[];
  license: string;
  environment: string;
}

export interface PackMcmeta {
  pack: {
    pack_format: number;
    supported_formats: number[];
    description: string;
  };
}
