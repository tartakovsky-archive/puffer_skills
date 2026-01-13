# Minecraft Pufferfish Skills Mod Config Editor V1

## Core Purpose

A web-based visual editor for Pufferfish Skills mod configuration. Creates, edits, and imports skill tree configs. Outputs downloadable full mod ZIP and JAR.

## Tech Stack

- **Next.js** (App Router) - latest LTS
- **React + TypeScript** - latest LTS
- **React Flow** - node/edge rendering, interactions
- **Zustand** - state management with undo/redo middleware
- **JSZip** - generate ZIP/JAR, parse imported files

## Data Model

### Internal State
```typescript
interface AppState {
  modMeta: ModMeta;
  categories: Category[];
  activeCategory: string;
}

interface ModMeta {
  id: string;             // e.g. "default_skill_trees"
  name: string;           // e.g. "Default Skill Trees"
  version: string;        // e.g. "1.1"
  description: string;
  authors: string[];
}

interface Category {
  name: string;           // folder name, tab label
  title: string;          // display title in category.json
  nodes: SkillNode[];
  connections: Connection[];
}

interface SkillNode {
  id: string;             // skill_node_name
  x: number;              // grid steps
  y: number;              // grid steps
  definition: string;
  color: string;          // hex
}

interface Connection {
  source: string;
  target: string;
  type: 'normal' | 'exclusive';
  bidirectional: boolean; // always true for now
}
```
## Coordinate System

- Grid center is `(0, 0)`
- Each grid step = 32px in mod coordinates
- Grid dot at step `(-1, 0)` = mod coordinates `(-32, 0)`
- React Flow position = step * gridSpacing (for visual rendering)
- On export: multiply step coordinates by 32 for skills.json
- On import: divide mod coordinates by 32 for grid steps

## UI Layout

```
┌─────────────────────────────────────────────────────┐
│  [Tab: Combat] [Tab: Mining] [+ Add Tab]   [Export] │
├─────────────────────────────────────────────────────┤
│                                                     │
│                                                     │
│              React Flow Canvas                      │
│              (dot grid background)                  │
│                                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

## Output Structures

### JAR/ZIP Export
```
{mod_id}.jar/zip
├── data/
│   └── puffish_skills/
│       └── puffish_skills/
│           ├── config.json
│           └── categories/
│               └── {category_name}/
│                   ├── category.json
│                   ├── connections.json
│                   ├── definitions.json
│                   ├── experience.json
│                   └── skills.json
├── fabric.mod.json
├── LICENSE
├── pack.mcmeta
└── META-INF/
    ├── mods.toml
    └── neoforge.mods.toml
```

## Generated Files

### config.json
```json
{
  "version": 3,
  "categories": ["combat", "mining"]
}
```

### category.json
```json
{
  "unlocked_by_default": true,
  "title": "{Category Title}",
  "icon": {
    "type": "item",
    "data": {
      "item": "diamond_sword"
    }
  },
  "background": "textures/gui/advancements/backgrounds/adventure.png"
}
```

### skills.json
```json
{
  "skill_node_1": {
    "x": 0,
    "y": 0,
    "definition": "health+2"
  }
}
```

### connections.json
```json
{
  "normal": {
    "bidirectional": [
      ["node_a", "node_b"]
    ]
  },
  "exclusive": {
    "bidirectional": [
      ["node_c", "node_d"]
    ]
  }
}
```

### definitions.json
```json
{}
```

### experience.json
```json
{
  "experience_per_level": {
    "type": "expression",
    "data": {
      "expression": "min(level ^ 1.432 + 10, 200)"
    }
  },
  "sources": []
}
```

### fabric.mod.json
```json
{
  "schemaVersion": 1,
  "id": "{mod_id}",
  "version": "{version}",
  "name": "{name}",
  "description": "{description}",
  "authors": ["{authors}"],
  "license": "Unlicense",
  "environment": "*"
}
```

### pack.mcmeta
```json
{
  "pack": {
    "pack_format": 8,
    "supported_formats": [0, 999],
    "description": "{description}"
  }
}
```

### META-INF/mods.toml
```toml
modLoader="lowcodefml"
loaderVersion="[40,)"
license="Unlicense"

[[mods]]
modId="{mod_id}"
version="{version}"
displayName="{name}"
description="{description}"
authors="{authors}"
```

### META-INF/neoforge.mods.toml
```toml
modLoader="lowcodefml"
loaderVersion="[1,)"
license="Unlicense"

[[mods]]
modId="{mod_id}"
version="{version}"
displayName="{name}"
description="{description}"
authors="{authors}"
```

### LICENSE
```
This is free and unencumbered software released into the public domain.

Anyone is free to copy, modify, publish, use, compile, sell, or
distribute this software, either in source code form or as a compiled
binary, for any purpose, commercial or non-commercial, and by any
means.

In jurisdictions that recognize copyright laws, the author or authors
of this software dedicate any and all copyright interest in the
software to the public domain. We make this dedication for the benefit
of the public at large and to the detriment of our heirs and
successors. We intend this dedication to be an overt act of
relinquishment in perpetuity of all present and future rights to this
software under copyright law.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS BE LIABLE FOR ANY CLAIM, DAMAGES OR
OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

For more information, please refer to <https://unlicense.org>
```

## UI Layout

```
┌──────────────────────────────────────────────────────────────────┐
│  [Import ZIP/JAR]  [Export ZIP ▾] [Export JAR ▾]   [Undo] [Redo] │
├──────────────────────────────────────────────────────────────────┤
│  [Tab: Combat] [Tab: Mining] [+ Add Tab]                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│                      React Flow Canvas                           │
│                      (dot grid, center 0,0)                      │
│                                                                  │
├──────────────────────────────────────────────────────────────────┤
│  Selected Node:  ID [________]  Definition [________]  Color [■] │
└──────────────────────────────────────────────────────────────────┘
```

Settings modal (gear icon or menu) for ModMeta fields.

## Interactions

### Viewport
- Scroll wheel: zoom in/out
- Click + drag empty space: pan canvas
- Double-click disabled for zoom (used for node creation)

### Tabs (Categories)
- Click tab: switch active category
- Double-click tab: rename category (updates folder name, config.json, category.json title)
- Click "+": create new category tab
- Right-click tab: delete category (with confirmation)

### Node Operations
- Double-click empty grid space: create node at snapped position
- Drag node: reposition (grid-snapped)
- Click node: select
- Delete key: remove selected node(s)
- Shift + click: multi-select
- Shift + drag: box select

### Node Properties (on select or create)
- Text input: node ID (skill_node_name)
- Text input: skill ID ("definition" field)
- Color picker: node color

### Connections
- Drag from node handle to another node handle: create connection
- Default type: `normal`, bidirectional
- Click edge: select
- Delete key: remove selected edge
- Toggle type: click selected edge cycles normal ↔ exclusive
- Visual: black stroke = normal, red stroke = exclusive

### Undo/Redo
- Ctrl+Z / Cmd+Z: undo
- Ctrl+Shift+Z / Cmd+Shift+Z: redo
- Buttons in toolbar

## Import

- Accept `.zip` or `.jar` file
- Parse with JSZip
- Detect structure (JAR has `data/puffish_skills/...`, ZIP has root `config.json`)
- Extract ModMeta from fabric.mod.json if JAR
- Parse config.json for category list
- For each category: parse skills.json, connections.json, category.json
- Convert mod coordinates to grid steps
- Populate state

## Project Structure

```
/src
  /app
    page.tsx
    layout.tsx
  /components
    Editor.tsx
    TabBar.tsx
    GridCanvas.tsx
    SkillNode.tsx
    ConnectionEdge.tsx
    PropertiesPanel.tsx
    Toolbar.tsx
    ModMetaModal.tsx
  /lib
    types.ts
    exportZip.ts
    exportJar.ts
    importConfig.ts
    templates.ts          # static file contents (LICENSE, etc.)
  /store
    useEditorStore.ts     # Zustand with temporal middleware
```

## Dependencies

```json
{
  "dependencies": {
    "next": "latest LTS",
    "react": "latest LTS",
    "react-dom": "latest LTS",
    "@xyflow/react": "latest",
    "zustand": "latest",
    "zundo": "latest",
    "jszip": "latest",
    "file-saver": "latest"
  },
  "devDependencies": {
    "typescript": "latest LTS",
    "@types/react": "latest",
    "@types/file-saver": "latest"
  }
}
```

## File Generation

### config.json
```json
{
  "version": 3,
  "categories": ["combat", "mining"]
}
```
Array populated from category names.

### category.json (per category)
```json
{
  "unlocked_by_default": true,
  "title": "{Category Title}",
  "icon": {
    "type": "item",
    "data": {
      "item": "diamond_sword"
    }
  },
  "background": "textures/gui/advancements/backgrounds/adventure.png"
}
```
Icon always diamond_sword. Title from category rename.

### skills.json (per category)
```json
{
  "skill_node_1": {
    "x": 0,
    "y": 0,
    "definition": "health+2"
  },
  "skill_node_2": {
    "x": -32,
    "y": 0,
    "definition": "health+2"
  }
}
```
Coordinates = grid step * 32.

### connections.json (per category)
```json
{
  "normal": {
    "bidirectional": [
      ["skill_node_1", "skill_node_2"]
    ]
  },
  "exclusive": {
    "bidirectional": []
  }
}
```

### definitions.json (per category)
```json
{}
```
Empty object. Not managed by this tool.

### experience.json (per category)
```json
{
  "experience_per_level": {
    "type": "expression",
    "data": {
      "expression": "min(level ^ 1.432 + 10, 200)"
    }
  },
  "sources": []
}
```
Default template. Not managed by this tool.

## Export Flow

1. User clicks "Export ZIP/JAR"
2. `exportConfig()` transforms Zustand state to mod JSON structure
3. `zipGenerator()` creates folder hierarchy in JSZip
4. Browser downloads `mod_name.zip

## Not In Scope (v1)

- Editing definitions.json content
- Editing experience.json sources
- Choosing category icons
- Node resize
- Minimap / controls panel