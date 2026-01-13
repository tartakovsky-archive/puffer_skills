import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import type { AppState, ConfigJson, CategoryJson, SkillsJson, ConnectionsJson, FabricModJson, PackMcmeta } from './types';
import { LICENSE_CONTENT, DEFINITIONS_JSON, DEFAULT_EXPERIENCE_JSON, DEFAULT_CATEGORY_ICON, DEFAULT_BACKGROUND, generateModsToml, generateNeoForgeModsToml } from './templates';
import { MOD_GRID_STEP } from '@/store/useEditorStore';

// Convert grid step coordinates to mod coordinates
function gridStepToModCoord(step: number): number {
  return step * MOD_GRID_STEP;
}

// Generate config.json
function generateConfigJson(state: AppState): ConfigJson {
  return {
    version: 3,
    categories: state.categories.map(c => c.name),
  };
}

// Generate category.json for a category
function generateCategoryJson(title: string): CategoryJson {
  return {
    unlocked_by_default: true,
    title,
    icon: DEFAULT_CATEGORY_ICON,
    background: DEFAULT_BACKGROUND,
  };
}

// Generate skills.json for a category
function generateSkillsJson(nodes: AppState['categories'][0]['nodes']): SkillsJson {
  const skills: SkillsJson = {};
  
  for (const node of nodes) {
    skills[node.id] = {
      x: gridStepToModCoord(node.x),
      y: gridStepToModCoord(node.y),
      definition: node.definition,
    };
  }
  
  return skills;
}

// Generate connections.json for a category
function generateConnectionsJson(connections: AppState['categories'][0]['connections']): ConnectionsJson {
  const normalConnections: [string, string][] = [];
  const exclusiveConnections: [string, string][] = [];
  
  for (const conn of connections) {
    const pair: [string, string] = [conn.source, conn.target];
    if (conn.type === 'exclusive') {
      exclusiveConnections.push(pair);
    } else {
      normalConnections.push(pair);
    }
  }
  
  return {
    normal: {
      bidirectional: normalConnections,
    },
    exclusive: {
      bidirectional: exclusiveConnections,
    },
  };
}

// Generate fabric.mod.json
function generateFabricModJson(meta: AppState['modMeta']): FabricModJson {
  return {
    schemaVersion: 1,
    id: meta.id,
    version: meta.version,
    name: meta.name,
    description: meta.description,
    authors: meta.authors,
    license: "Unlicense",
    environment: "*",
  };
}

// Generate pack.mcmeta
function generatePackMcmeta(description: string): PackMcmeta {
  return {
    pack: {
      pack_format: 8,
      supported_formats: [0, 999],
      description,
    },
  };
}

// Export as ZIP (datapack structure)
export async function exportAsZip(state: AppState): Promise<void> {
  const zip = new JSZip();
  
  // Root files
  zip.file('LICENSE', LICENSE_CONTENT);
  zip.file('pack.mcmeta', JSON.stringify(generatePackMcmeta(state.modMeta.description), null, 2));
  
  // Data structure
  const dataPath = 'data/puffish_skills/puffish_skills';
  
  // config.json
  zip.file(`${dataPath}/config.json`, JSON.stringify(generateConfigJson(state), null, 2));
  
  // Categories
  for (const category of state.categories) {
    const categoryPath = `${dataPath}/categories/${category.name}`;
    
    zip.file(`${categoryPath}/category.json`, JSON.stringify(generateCategoryJson(category.title), null, 2));
    zip.file(`${categoryPath}/skills.json`, JSON.stringify(generateSkillsJson(category.nodes), null, 2));
    zip.file(`${categoryPath}/connections.json`, JSON.stringify(generateConnectionsJson(category.connections), null, 2));
    zip.file(`${categoryPath}/definitions.json`, JSON.stringify(DEFINITIONS_JSON, null, 2));
    zip.file(`${categoryPath}/experience.json`, JSON.stringify(DEFAULT_EXPERIENCE_JSON, null, 2));
  }
  
  // Generate and save
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${state.modMeta.id}.zip`);
}

// Export as JAR (mod structure with fabric.mod.json and META-INF)
export async function exportAsJar(state: AppState): Promise<void> {
  const zip = new JSZip();
  
  // Root files
  zip.file('LICENSE', LICENSE_CONTENT);
  zip.file('pack.mcmeta', JSON.stringify(generatePackMcmeta(state.modMeta.description), null, 2));
  zip.file('fabric.mod.json', JSON.stringify(generateFabricModJson(state.modMeta), null, 2));
  
  // META-INF
  zip.file('META-INF/mods.toml', generateModsToml(
    state.modMeta.id,
    state.modMeta.version,
    state.modMeta.name,
    state.modMeta.description,
    state.modMeta.authors
  ));
  zip.file('META-INF/neoforge.mods.toml', generateNeoForgeModsToml(
    state.modMeta.id,
    state.modMeta.version,
    state.modMeta.name,
    state.modMeta.description,
    state.modMeta.authors
  ));
  
  // Data structure
  const dataPath = 'data/puffish_skills/puffish_skills';
  
  // config.json
  zip.file(`${dataPath}/config.json`, JSON.stringify(generateConfigJson(state), null, 2));
  
  // Categories
  for (const category of state.categories) {
    const categoryPath = `${dataPath}/categories/${category.name}`;
    
    zip.file(`${categoryPath}/category.json`, JSON.stringify(generateCategoryJson(category.title), null, 2));
    zip.file(`${categoryPath}/skills.json`, JSON.stringify(generateSkillsJson(category.nodes), null, 2));
    zip.file(`${categoryPath}/connections.json`, JSON.stringify(generateConnectionsJson(category.connections), null, 2));
    zip.file(`${categoryPath}/definitions.json`, JSON.stringify(DEFINITIONS_JSON, null, 2));
    zip.file(`${categoryPath}/experience.json`, JSON.stringify(DEFAULT_EXPERIENCE_JSON, null, 2));
  }
  
  // Generate and save as .jar
  const content = await zip.generateAsync({ type: 'blob' });
  saveAs(content, `${state.modMeta.id}.jar`);
}
