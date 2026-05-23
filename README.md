# puffer_skills

> Web-based visual editor for [Pufferfish Skills](https://modrinth.com/mod/puffish-skills) Minecraft mod config. Drag skill nodes on a grid, wire them up, and export a ready-to-drop `.jar` or datapack `.zip`.

[![Next.js](https://img.shields.io/badge/Next.js-15-000000?logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React Flow](https://img.shields.io/badge/React_Flow-12-FF0072)](https://reactflow.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-state-443E38)](https://zustand-demo.pmnd.rs/)
[![Status](https://img.shields.io/badge/status-archived-lightgrey)](#lineage)

**Archived.** A weekend side project. All work and no play is bad for you, and this was the play.

The author runs a lot of trading and research infra during the day. Some nights he plays Minecraft with his kid. The mod they use is **Pufferfish Skills** - a fork that adds talent trees to vanilla. Editing the JSON by hand is a slog. So one Saturday this was the answer to it.

---

## Table of contents

- [What this was](#what-this-was)
- [Tech stack](#tech-stack)
- [Features](#features)
- [Shortcuts](#shortcuts)
- [Export format](#export-format)
- [Build and run](#build-and-run)
- [Lineage](#lineage)
- [Sibling repos](#sibling-repos)

## What this was

A small Next.js app that turns Pufferfish Skills mod configs into something a human (or a kid) can edit.

The flow: draw skill nodes on a grid, drag edges between them to mark normal or exclusive links, group them into tabs, then hit **Export** and out comes a `.jar` or `.zip` you drop into your Minecraft instance.

The whole tool runs in the browser. No login, no backend, no analytics. State lives in memory and goes away on refresh.

## Tech stack

| Layer | Tools |
|---|---|
| Web | Next.js 15 (App Router + Turbopack) |
| UI | React 19, Tailwind CSS v4 |
| Graph | [`@xyflow/react`](https://reactflow.dev/) for the node canvas |
| State | Zustand + [Zundo](https://github.com/charkour/zundo) for undo / redo |
| Files | JSZip + FileSaver.js for `.zip` and `.jar` builds |

## Features

- Drag-and-drop skill nodes on a snapped grid
- Tabbed categories (rename via double-click, delete via right-click)
- Normal or exclusive edges between skills
- Full undo / redo
- Import a `.zip` or `.jar` and keep editing
- Export a datapack `.zip` or a mod `.jar` with `fabric.mod.json` and `META-INF`

## Shortcuts

| Combo | Action |
|---|---|
| `Ctrl/Cmd + Z` | Undo |
| `Ctrl/Cmd + Shift + Z` or `Ctrl/Cmd + Y` | Redo |
| `Delete` or `Backspace` | Remove selected nodes or edges |
| `Shift + Click` | Multi-select |
| `Shift + Drag` | Box select |
| `Double-click` on canvas | New node |

## Export format

```
{mod_id}.jar
  data/puffish_skills/puffish_skills/
    config.json
    categories/{category}/
      category.json
      connections.json
      definitions.json
      experience.json
      skills.json
  fabric.mod.json
  LICENSE
  pack.mcmeta
  META-INF/
    mods.toml
    neoforge.mods.toml
```

## Build and run

```
npm install
npm run dev
```

Then open `http://localhost:3000`.

## Lineage

- Origin: `tartakovsky/puffer_skills` (private side project)
- Archive: `tartakovsky-archive/puffer_skills` (this repo)
- Target mod: [Pufferfish Skills](https://modrinth.com/mod/puffish-skills)

## Sibling repos

Other public archives of the same author's work live in [tartakovsky-archive](https://github.com/tartakovsky-archive).
