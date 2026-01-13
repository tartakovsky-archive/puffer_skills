'use client';

import { create } from 'zustand';
import { temporal } from 'zundo';
import type { AppState, EditorStore, SkillNode, Connection, ModMeta } from '@/lib/types';

// Grid step size in mod coordinates
export const MOD_GRID_STEP = 32;

// Visual grid spacing in pixels (for React Flow)
export const VISUAL_GRID_SPACING = 40;

// Default state
const defaultModMeta: ModMeta = {
  id: 'default_skill_trees',
  name: 'Default Skill Trees',
  version: '1.0',
  description: 'Custom skill trees created with Pufferfish Skills Editor',
  authors: ['Anonymous'],
};

const defaultState: AppState = {
  modMeta: defaultModMeta,
  categories: [
    {
      name: 'combat',
      title: 'Combat',
      nodes: [],
      connections: [],
    },
  ],
  activeCategory: 'combat',
};

// Create the store with temporal middleware for undo/redo
export const useEditorStore = create<EditorStore>()(
  temporal(
    (set, get) => ({
      ...defaultState,

      // ============================
      // Mod Meta Actions
      // ============================
      setModMeta: (meta: Partial<ModMeta>) => {
        set((state) => ({
          modMeta: { ...state.modMeta, ...meta },
        }));
      },

      // ============================
      // Category Actions
      // ============================
      addCategory: (name: string) => {
        const sanitizedName = name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        const title = name.charAt(0).toUpperCase() + name.slice(1);
        
        set((state) => {
          // Check if category already exists
          if (state.categories.some((c) => c.name === sanitizedName)) {
            return state;
          }
          
          return {
            categories: [
              ...state.categories,
              {
                name: sanitizedName,
                title,
                nodes: [],
                connections: [],
              },
            ],
            activeCategory: sanitizedName,
          };
        });
      },

      removeCategory: (name: string) => {
        set((state) => {
          const newCategories = state.categories.filter((c) => c.name !== name);
          const newActiveCategory =
            state.activeCategory === name
              ? newCategories[0]?.name ?? ''
              : state.activeCategory;
          
          return {
            categories: newCategories,
            activeCategory: newActiveCategory,
          };
        });
      },

      renameCategory: (oldName: string, newName: string, newTitle: string) => {
        const sanitizedName = newName.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
        
        set((state) => ({
          categories: state.categories.map((c) =>
            c.name === oldName
              ? { ...c, name: sanitizedName, title: newTitle }
              : c
          ),
          activeCategory:
            state.activeCategory === oldName ? sanitizedName : state.activeCategory,
        }));
      },

      setActiveCategory: (name: string) => {
        set({ activeCategory: name });
      },

      // ============================
      // Node Actions
      // ============================
      addNode: (categoryName: string, node: SkillNode) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.name === categoryName
              ? { ...c, nodes: [...c.nodes, node] }
              : c
          ),
        }));
      },

      updateNode: (categoryName: string, nodeId: string, updates: Partial<SkillNode>) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.name === categoryName
              ? {
                  ...c,
                  nodes: c.nodes.map((n) =>
                    n.id === nodeId ? { ...n, ...updates } : n
                  ),
                }
              : c
          ),
        }));
      },

      removeNode: (categoryName: string, nodeId: string) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.name === categoryName
              ? {
                  ...c,
                  nodes: c.nodes.filter((n) => n.id !== nodeId),
                  // Also remove connections involving this node
                  connections: c.connections.filter(
                    (conn) => conn.source !== nodeId && conn.target !== nodeId
                  ),
                }
              : c
          ),
        }));
      },

      // ============================
      // Connection Actions
      // ============================
      addConnection: (categoryName: string, connection: Connection) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.name === categoryName
              ? { ...c, connections: [...c.connections, connection] }
              : c
          ),
        }));
      },

      updateConnection: (
        categoryName: string,
        source: string,
        target: string,
        updates: Partial<Connection>
      ) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.name === categoryName
              ? {
                  ...c,
                  connections: c.connections.map((conn) =>
                    (conn.source === source && conn.target === target) ||
                    (conn.source === target && conn.target === source)
                      ? { ...conn, ...updates }
                      : conn
                  ),
                }
              : c
          ),
        }));
      },

      removeConnection: (categoryName: string, source: string, target: string) => {
        set((state) => ({
          categories: state.categories.map((c) =>
            c.name === categoryName
              ? {
                  ...c,
                  connections: c.connections.filter(
                    (conn) =>
                      !(
                        (conn.source === source && conn.target === target) ||
                        (conn.source === target && conn.target === source)
                      )
                  ),
                }
              : c
          ),
        }));
      },

      // ============================
      // Import/Export Actions
      // ============================
      importState: (state: AppState) => {
        set(state);
      },

      resetState: () => {
        set(defaultState);
      },
    }),
    {
      // Zundo options - track only data state, not UI state
      partialize: (state) => ({
        modMeta: state.modMeta,
        categories: state.categories,
        activeCategory: state.activeCategory,
      }),
      limit: 50, // Keep 50 history entries
    }
  )
);

// Helper hook to get the active category data
export function useActiveCategory() {
  return useEditorStore((state) => {
    const category = state.categories.find((c) => c.name === state.activeCategory);
    return category ?? null;
  });
}

// Helper hook to get temporal store for undo/redo
export function useTemporalStore() {
  return useEditorStore.temporal;
}
