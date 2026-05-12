# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Toolchain

This project uses Vite+, a unified toolchain built on Vite, Rolldown, Vitest, tsdown, Oxlint, and Oxfmt. The global CLI is `vp`. Vite+ wraps Vite — `vp dev` and `vp build` invoke Vite internally.

- `vp install` — install dependencies (run after pulling remote changes)
- `vp dev` — start dev server
- `vp build` — typecheck (tsc) then build
- `vp check` — format, lint, and type-check
- `vp test` — run tests
- `vp check --fix` — auto-fix lint/format issues
- `vp run <script>` — run a package.json script or vite.config task

Docs: `node_modules/vite-plus/docs` or https://viteplus.dev/guide/

## Architecture

This is a **from-scratch React Flow node editor** (not using the reactflow library). It renders an interactive canvas with pan/zoom, background grid, and controls.

### State Management: Three-Layer Context Split

State is split into three React contexts by update frequency to minimize re-renders:

| Context           | Frequency              | Contents                                                    |
| ----------------- | ---------------------- | ----------------------------------------------------------- |
| `ConfigContext`   | Static (never changes) | `id`                                                        |
| `DataContext`     | Low (seconds)          | `minZoom`, `maxZoom`, `defaultViewport`, `panZoom` instance |
| `ReactiveContext` | High (per-frame)       | `transform`, `mousePosition`, `selectedPoint`, `isPanning`  |

Plus `DispatchContext` for dispatching actions (`src/contexts/DispatchContext.ts`).

`StoreProvider` (`src/components/StoreProvider.tsx`) wraps all four contexts and initializes state via `useReducer` with `storeReducer` (`src/store/storeReducer.ts`), splitting the reducer state into memoized context values.

### Component Tree (from README)

```
<Root>            — outer div, relative/overflow:hidden
  <StoreProvider> — initializes the 4 contexts
    <StoreUpdater /> — syncs props changes into store (returns null)
    <ZoomPane>      — creates PanZoom instance, binds wheel/touch/gesture events
      <Pane>        — event capture layer
        <Viewport>  — applies CSS transform (translate + scale) from reactive state
          <NodeRenderer />
    {children}      — MiniMap, Controls, Background, Toolbar etc.
```

### Key Components

- **`Root`** (`src/Root.tsx`): Top-level component. Accepts `viewport` (controlled) or `defaultViewport` (uncontrolled). Uses custom `memo` comparator with deep `style` comparison.
- **`ZoomPane`** (`src/container/ZoomPane.tsx`): Creates a `PanZoom` instance on mount, binds it to the DOM element. Handles both controlled (viewport prop provided) and uncontrolled modes.
- **`PanZoom`** (`src/helper/PanZoom.ts`): Custom pan/zoom engine inspired by d3-zoom. Handles wheel zoom, mouse drag pan, touch pinch-zoom, gesture events (Safari), and double-click zoom. Uses rAF throttling for wheel events. Zoom is computed relative to the cursor position.
- **`Viewport`** (`src/container/Viewport.tsx`): Reads `transform` from ReactiveContext and applies `translate(x,y) scale(z)` via CSS `transform`. Uses `will-change: transform`.
- **`NodeRenderer`** (`src/container/NodeRenderer.tsx`): Currently hardcoded placeholder rendering two nodes ("1", "2").

### Types

- `Transform`: `[x: number, y: number, zoom: number]` — tuple for the viewport transform
- `Viewport`: `{ x, y, zoom }` — object form of the same data
- All types are re-exported from `src/types/index.ts`

### Transform vs Viewport

The codebase uses two representations for the same data: `Transform` (tuple, `[x, y, zoom]`) and `Viewport` (`{ x, y, zoom }`). The tuple form is used in the reactive state (to enable fine-grained memo dependencies on individual indices). Conversion happens at boundaries.

### Component Organization

- `src/container/` — core rendering components (ZoomPane, Pane, Viewport, NodeRenderer)
- `src/components/` — shared non-visual components (StoreProvider, StoreUpdater, Panel)
- `src/additional-components/` — optional plugin components (Background, Controls, Toolbar, DisplayZoom, ZoomController)
- `src/hooks/` — context access hooks (`useConfig`, `useData`, `useReactive`, `useDispatch`)
- `src/contexts/` — React context definitions
- `src/store/` — reducer and initial state
- `src/helper/` — PanZoom engine
- `src/types/` — TypeScript type definitions
