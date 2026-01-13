# Pufferfish Skills Mod Config Editor

A web-based visual editor for creating and editing Pufferfish Skills mod configuration files. Create skill trees visually and export them as ready-to-use mod files.

## Features

- **Visual Skill Tree Editor**: Create and arrange skill nodes on a grid-based canvas
- **Multiple Categories**: Organize skills into multiple tabs/categories
- **Connection Types**: Create normal or exclusive connections between skills
- **Import/Export**: Import existing mod configurations or export new ones as ZIP or JAR
- **Undo/Redo**: Full undo/redo support with keyboard shortcuts
- **Grid Snapping**: Nodes snap to grid for precise positioning

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Creating Nodes
- **Double-click** on the canvas to create a new skill node
- Nodes automatically snap to the grid

### Editing Nodes
- **Click** a node to select it
- Edit the node's ID, definition, and color in the properties panel
- **Drag** nodes to reposition them

### Creating Connections
- **Drag** from a node's handle to another node's handle to create a connection
- **Click** a connection to select it
- Toggle between **normal** and **exclusive** connection types

### Managing Categories
- **Click** a tab to switch categories
- **Double-click** a tab to rename it
- **Right-click** a tab to delete it (if more than one exists)
- Click **+ Add** to create a new category

### Keyboard Shortcuts
- `Ctrl/Cmd + Z`: Undo
- `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y`: Redo
- `Delete` or `Backspace`: Delete selected nodes/connections
- `Shift + Click`: Multi-select
- `Shift + Drag`: Box select

### Export
- **Export ZIP**: Creates a datapack-style ZIP file
- **Export JAR**: Creates a mod-style JAR file with fabric.mod.json and META-INF

### Import
- Click **Import** to load an existing ZIP or JAR file
- The editor will parse the configuration and load it for editing

## Tech Stack

- **Next.js 15** with App Router and Turbopack
- **React 19** + TypeScript
- **React Flow** (@xyflow/react) for the node-based canvas
- **Zustand** + **Zundo** for state management with undo/redo
- **JSZip** + **FileSaver.js** for ZIP/JAR generation
- **Tailwind CSS v4** for styling

## Project Structure

```
src/
├── app/
│   ├── globals.css      # Global styles
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Main page
├── components/
│   ├── ConnectionEdge.tsx   # Custom edge component
│   ├── Editor.tsx           # Main editor layout
│   ├── GridCanvas.tsx       # React Flow canvas wrapper
│   ├── ModMetaModal.tsx     # Mod settings dialog
│   ├── PropertiesPanel.tsx  # Node/edge properties
│   ├── SkillNode.tsx        # Custom node component
│   ├── TabBar.tsx           # Category tabs
│   └── Toolbar.tsx          # Top toolbar
├── lib/
│   ├── exportZip.ts     # ZIP/JAR export logic
│   ├── importConfig.ts  # Import parsing logic
│   ├── templates.ts     # File templates (LICENSE, etc.)
│   └── types.ts         # TypeScript interfaces
└── store/
    └── useEditorStore.ts  # Zustand store with zundo
```

## Output Structure

### JAR Export
```
{mod_id}.jar
├── data/puffish_skills/puffish_skills/
│   ├── config.json
│   └── categories/{category}/
│       ├── category.json
│       ├── connections.json
│       ├── definitions.json
│       ├── experience.json
│       └── skills.json
├── fabric.mod.json
├── LICENSE
├── pack.mcmeta
└── META-INF/
    ├── mods.toml
    └── neoforge.mods.toml
```

## License

MIT
