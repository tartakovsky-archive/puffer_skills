import JSZip from 'jszip';
import type { AppState, Category, SkillNode, Connection, ModMeta, ConfigJson, CategoryJson, SkillsJson, ConnectionsJson, FabricModJson } from './types';
import { MOD_GRID_STEP } from '@/store/useEditorStore';

// Convert mod coordinates to grid steps
function modCoordToGridStep(coord: number): number {
  return Math.round(coord / MOD_GRID_STEP);
}

// Parse a JSON file from the zip
async function parseJsonFile<T>(zip: JSZip, path: string): Promise<T | null> {
  const file = zip.file(path);
  if (!file) return null;
  
  try {
    const content = await file.async('string');
    return JSON.parse(content) as T;
  } catch {
    console.error(`Failed to parse ${path}`);
    return null;
  }
}

// Detect if this is a JAR (has data/ prefix) or ZIP (has config.json at root)
async function detectStructure(zip: JSZip): Promise<{ isJar: boolean; basePath: string }> {
  // Check for JAR structure
  if (zip.file('data/puffish_skills/puffish_skills/config.json')) {
    return { isJar: true, basePath: 'data/puffish_skills/puffish_skills' };
  }
  
  // Check for ZIP structure (config.json at various locations)
  if (zip.file('config.json')) {
    return { isJar: false, basePath: '' };
  }
  
  // Try to find config.json anywhere
  const files = Object.keys(zip.files);
  const configPath = files.find(f => f.endsWith('config.json'));
  if (configPath) {
    const basePath = configPath.replace('/config.json', '').replace('config.json', '');
    return { isJar: basePath.includes('data/'), basePath };
  }
  
  throw new Error('Could not find config.json in the archive');
}

// Parse ModMeta from fabric.mod.json (if JAR)
async function parseModMeta(zip: JSZip): Promise<Partial<ModMeta>> {
  const fabricMod = await parseJsonFile<FabricModJson>(zip, 'fabric.mod.json');
  
  if (fabricMod) {
    return {
      id: fabricMod.id,
      name: fabricMod.name,
      version: fabricMod.version,
      description: fabricMod.description,
      authors: fabricMod.authors,
    };
  }
  
  return {};
}

// Parse a single category
async function parseCategory(
  zip: JSZip,
  basePath: string,
  categoryName: string
): Promise<Category | null> {
  const categoryPath = basePath ? `${basePath}/categories/${categoryName}` : `categories/${categoryName}`;
  
  // Parse category.json for title
  const categoryJson = await parseJsonFile<CategoryJson>(zip, `${categoryPath}/category.json`);
  const title = categoryJson?.title ?? categoryName.charAt(0).toUpperCase() + categoryName.slice(1);
  
  // Parse skills.json
  const skillsJson = await parseJsonFile<SkillsJson>(zip, `${categoryPath}/skills.json`);
  const nodes: SkillNode[] = [];
  
  if (skillsJson) {
    for (const [nodeId, nodeData] of Object.entries(skillsJson)) {
      nodes.push({
        id: nodeId,
        x: modCoordToGridStep(nodeData.x),
        y: modCoordToGridStep(nodeData.y),
        definition: nodeData.definition,
        color: '#4b5563', // Default color since it's not stored in the mod format
      });
    }
  }
  
  // Parse connections.json
  const connectionsJson = await parseJsonFile<ConnectionsJson>(zip, `${categoryPath}/connections.json`);
  const connections: Connection[] = [];
  
  if (connectionsJson) {
    // Normal connections
    if (connectionsJson.normal?.bidirectional) {
      for (const [source, target] of connectionsJson.normal.bidirectional) {
        connections.push({
          source,
          target,
          type: 'normal',
          bidirectional: true,
        });
      }
    }
    
    // Exclusive connections
    if (connectionsJson.exclusive?.bidirectional) {
      for (const [source, target] of connectionsJson.exclusive.bidirectional) {
        connections.push({
          source,
          target,
          type: 'exclusive',
          bidirectional: true,
        });
      }
    }
  }
  
  return {
    name: categoryName,
    title,
    nodes,
    connections,
  };
}

// Main import function
export async function importFromFile(file: File): Promise<AppState> {
  const arrayBuffer = await file.arrayBuffer();
  const zip = await JSZip.loadAsync(arrayBuffer);
  
  // Detect structure
  const { isJar, basePath } = await detectStructure(zip);
  
  // Parse mod meta (only available in JAR)
  const modMetaPartial = isJar ? await parseModMeta(zip) : {};
  
  // Parse config.json
  const configPath = basePath ? `${basePath}/config.json` : 'config.json';
  const configJson = await parseJsonFile<ConfigJson>(zip, configPath);
  
  if (!configJson) {
    throw new Error('Could not parse config.json');
  }
  
  // Parse all categories
  const categories: Category[] = [];
  
  for (const categoryName of configJson.categories) {
    const category = await parseCategory(zip, basePath, categoryName);
    if (category) {
      categories.push(category);
    }
  }
  
  if (categories.length === 0) {
    throw new Error('No valid categories found in the archive');
  }
  
  // Build the final state
  const modMeta: ModMeta = {
    id: modMetaPartial.id ?? 'imported_skill_trees',
    name: modMetaPartial.name ?? 'Imported Skill Trees',
    version: modMetaPartial.version ?? '1.0',
    description: modMetaPartial.description ?? 'Imported from file',
    authors: modMetaPartial.authors ?? ['Unknown'],
  };
  
  return {
    modMeta,
    categories,
    activeCategory: categories[0].name,
  };
}
