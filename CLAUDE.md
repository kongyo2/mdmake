# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

mdmake is a Windows desktop application built with Tauri 2 + React + TypeScript. It converts web pages to Markdown using @mizchi/readability, designed for creating LLM context from web content.

## Commands

```bash
# Development
npm run tauri dev      # Start dev server with hot reload

# Build
npm run build          # Build frontend (tsc + vite)
npm run tauri build    # Build complete Windows app (MSI/NSIS installers)

# Lint
npm run lint           # TypeScript type checking (tsc --noEmit)
```

## Architecture

### Data Flow
1. **Frontend (React)** → User enters URL → calls Tauri command `fetch_url`
2. **Backend (Rust)** → `fetch_url` in `src-tauri/src/lib.rs` fetches HTML via reqwest
3. **Frontend** → Receives HTML → `src/lib/converter.ts` uses `@mizchi/readability` to extract content and convert to Markdown
4. **Output** → Display in UI, copy to clipboard, or save as .md file

### Key Files
- `src/App.tsx` - Main UI component (URL input, options, output display)
- `src/lib/converter.ts` - HTML→Markdown conversion using `readable()` from @mizchi/readability
- `src-tauri/src/lib.rs` - Rust backend with `fetch_url` Tauri command

### Tauri Plugins Used
- `tauri-plugin-fs` - File system access for saving .md files
- `tauri-plugin-dialog` - Native save dialog
- `tauri-plugin-opener` - URL/file opening

## Development Guidelines

From docs/amp.md:

- **Ruthless Simplicity**: Keep everything as simple as possible. Every abstraction must justify its existence.
- **Analyze First**: For complex tasks, analyze the problem before coding. Break down into components, consider multiple approaches, identify trade-offs.
- **Ask When Unclear**: If requirements are vague, ask clarifying questions before proceeding.
- **No Sycophancy**: Provide honest technical assessment. Focus on trade-offs and implications rather than praise.
