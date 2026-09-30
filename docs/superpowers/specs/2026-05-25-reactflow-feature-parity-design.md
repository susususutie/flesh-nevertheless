# React Flow Feature Parity — Design Spec

## Scope

Bring this from-scratch React Flow node editor to feature parity with reactflow. Three tiers ordered by impact and dependency:

- **Tier 1** — Core interaction gaps
- **Tier 2** — Common UX features
- **Tier 3** — Advanced features

---

## Tier 1: Core Interaction Gaps

### 1. ConnectionLine (Interactive Edge Creation)

#### Type Changes

```ts
// src/types/general.ts — add Marker type
type Marker = {
  type: 'arrowclosed' | 'arrow' | 'circle' | 'diamond';
  color?: string;
  width?: number;
  height?: number;
} | {
  type: 'custom';
  render: (params: { color: string; width: number; height: number }) => ReactNode;
  color?: string;
  width?: number;
  height?: number;
};

// src/types/store.ts — extend StoreReactive
connectionState: {
  isValid: boolean;
  source: {
    nodeId: string;
    handleId: string;
    type: HandleType;
    position: PositionType;
    x: number;
    y: number;
  };
  target: {
    nodeId: string;
    handleId: string;
    type: HandleType;
    position: PositionType;
  } | null;
  mousePosition: { x: number; y: number } | null;
} | null

// src/types/store.ts — extend StoreAction
| { type: "setConnectionStart"; payload: { ... } }
| { type: "setConnectionMove"; payload: { clientX: number; clientY: number } }
| { type: "setConnectionEnd" }
| { type: "setConnectionTarget"; payload: { ... } | null }

// src/types/edges.ts — extend EdgeBase
markerEnd?: Marker | string;
markerStart?: Marker | string;

// src/types/component-props.ts — extend RootPropsType
onConnect?: (connection: Connection) => void;

// New type
type Connection = {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};

// src/types/component-props.ts — extend RootPropsType
connectionLineStyle?: CSSProperties;
connectionLineType?: EdgeType;
```

#### Components

**`ConnectionLineWrapper`** (new, `src/container/ConnectionLineWrapper.tsx`)

- Positioned between `EdgeRenderer` and `NodeRenderer` in the component tree
- Reads `connectionState` from ReactiveContext
- When active, renders an SVG layer with a temporary Bezier/Step/etc. path from source handle to mouse cursor
- Hit-tests target handles on pointermove using DOM coordinates and handle positions from nodeLookup
- On pointerup with valid target: creates edge via `onConnect` callback
- On pointerup without target: dispatches `setConnectionEnd` to cancel

**`Handle` changes** (`src/components/Handle/index.tsx`)

- Add `onPointerDown` that:
  - Sets `connectionState.source` (handle position, nodeId, type)
  - Calls `event.stopPropagation()` to prevent node drag
  - Captures pointer
- Add `data-flow-handle` attribute for hit-testing

**`Pane` changes** (`src/container/Pane.tsx`)

- When `connectionState` is active, pointer events on Pane surface handle connection move/end
- Or, the `ConnectionLineWrapper` can own its own pointer event handling via a full-size transparent overlay during connection

#### Data Flow

```
Handle onPointerDown
  → dispatch(setConnectionStart)
  → ConnectionLineWrapper renders temporary line
  → pointermove: update mousePosition, hit-test handles
  → pointerup on handle: dispatch(setConnectionTarget), then
    → store reducer creates edge
    → call onConnect({ source, target, sourceHandle, targetHandle })
  → pointerup on empty space: dispatch(setConnectionEnd)
```

#### `onConnect` Callback

- Called when a connection is completed
- Passes `{ source, target, sourceHandle?, targetHandle? }`
- If provided, the caller is responsible for adding the edge to state (controlled mode)
- If not provided (uncontrolled), the store reducer handles edge creation internally

### 2. Markers (Arrowheads)

#### Implementation

- `EdgeRenderer` renders a `<defs>` block at the top of its SVG
- For each unique marker configuration across all edges, generates a `<marker id="...">` element
- Marker ID pattern: `marker-{type}-{color}-{width}-{height}`
- Built-in shapes in `src/components/Edges/markers.tsx`:
  - `arrowclosed`: filled triangle pointing right
  - `arrow`: open V-shape
  - `circle`: filled circle
  - `diamond`: filled diamond
- Custom markers: `render` function returns SVG children

#### Edge Component Changes

Each edge type component (BezierEdge, StraightEdge, StepEdge, SmoothStepEdge, SimpleBezierEdge):

- Reads `markerEnd` / `markerStart` from props
- Resolves `Marker` object → marker ID string → `url(#marker-...)`
- Sets `markerEnd` / `markerStart` on the `<path>` element
- Default: bezier/smoothstep/simplebezier → `arrowclosed`

#### Props Flow

```
EdgeBase.markerEnd → EdgeProps.markerEnd → resolveMarkerUrl() → SVG path attribute
```

### 3. Cascade Delete

#### Store Reducer Change

In `storeReducer.ts`, function `applyNodeChanges`:

- After collecting `removeIds`, filter edges whose `source` or `target` is in `removeIds`
- Generate `EdgeChange[]` of type `"remove"` for those edges
- Apply both node and edge changes in the same reducer pass

#### Rationale

- Eliminates the gap between keyboard-triggered deletion (already handled in Pane.tsx) and API-triggered deletion
- Works consistently in both controlled and uncontrolled modes

---

## Tier 2: Common UX Features

### 4. FitView

#### PanZoom Changes

```ts
// PanZoom.tsx — new method
fitView(nodes?: { x: number; y: number; width: number; height: number }[]): Viewport | null
```

- If no nodes provided, uses all nodes from store (passed in via `data.nodeLookup`)
- Computes bounding box of all nodes (position + measured dimensions)
- Calculates zoom to fit within container with padding
- Calculates center offset
- Calls `setViewport()` to snap

#### Controls Integration

- `FitViewIcon` already exists — wire onClick to `panZoom.fitView(data.nodes, data.nodeLookup)`
- Optional: animate via CSS transition on the viewport transform

### 5. Edge Labels

#### Type Changes

```ts
// src/types/edges.ts — extend EdgeBase
label?: string | ReactNode;
labelStyle?: CSSProperties;
labelClassName?: string;
labelBgStyle?: CSSProperties;
labelBgPadding?: [number, number];
labelBgBorderRadius?: number;
```

#### Rendering

- `EdgeWrapper` renders a foreignObject SVG element at the edge midpoint
- Midpoint computed from `EdgePosition` (sourceX/Y, targetX/Y)
- ForeignObject contains a `div` with label content, styled per props
- Optional background (`labelBgStyle`) rendered as a separate `<rect>` behind the label
- Z-index: edge labels render above edge paths but below nodes

### 6. MiniMap

#### Component

**`MiniMap`** (new, `src/additional-components/MiniMap.tsx`)

- Renders an inset `<div>` in the bottom-right corner (configurable position)
- Contains a `<svg>` that draws simplified rectangles for each node
- Viewport indicator: a dashed rectangle showing the currently visible area
- Node rectangles: use `positionAbsolute` and `measured` dimensions, scaled by a fixed ratio
- Reads `nodeLookup` from DataContext and `transform` from ReactiveContext

#### Props

```ts
type MiniMapProps = {
  position?: PanelPosition;
  nodeColor?: string | ((node: Node) => string);
  nodeStrokeColor?: string | ((node: Node) => string);
  nodeBorderRadius?: number;
  maskColor?: string;
  style?: CSSProperties;
  className?: string;
};
```

#### Performance

- Renders via simplified SVG (no edge paths on minimap in initial version)
- Avoids re-rendering on every frame — throttled to ~10fps via rAF or `useDeferredValue`

---

## Tier 3: Advanced Features

### 7. Group Nodes (Parent/Child)

- `NodeBase` gains optional `parentId: string`
- Extent clamping for child nodes within parent bounds
- `positionAbsolute` computation accounts for parent position chain
- Parent node `extent: 'parent'` option clamps children

### 8. Node Resize

- Resize handles at corners/edges of selected nodes
- Controlled via `resizeable?: boolean` on NodeBase
- Updates node `width`/`height` and re-measures handles

### 9. UserSelection / NodesSelection

- Extract box selection visual from inline code in Pane.tsx to separate `UserSelection` component
- `NodesSelection`: dashed bounding box around all selected nodes when dragging them

### 10. Accessibility / Attribution / Portal

- `A11yDescriptions`: ARIA live region describing canvas state
- `Attribution`: "Built with React Flow" link
- `ViewportPortal`: portal for rendering overlays inside the viewport coordinate system

---

## Implementation Order

Strictly sequential within each tier:

Tier 1: Cascade Delete → Markers → ConnectionLine
Tier 2: FitView → Edge Labels → MiniMap
Tier 3: Group Nodes → Node Resize → UserSelection/NodesSelection → A11y/Attribution/Portal

## Files to Modify/Create

| File                                              | Action                                                         |
| ------------------------------------------------- | -------------------------------------------------------------- |
| `src/types/general.ts`                            | Add `Marker`, `Connection` types                               |
| `src/types/edges.ts`                              | Add `markerEnd`, `markerStart`, `label*` to EdgeBase           |
| `src/types/store.ts`                              | Add `connectionState` to StoreReactive; add connection actions |
| `src/types/component-props.ts`                    | Add `onConnect`, `connectionLineType`, etc.                    |
| `src/store/storeReducer.ts`                       | Cascade delete in applyNodeChanges; connection actions         |
| `src/store/initialState.ts`                       | Add `connectionState: null`                                    |
| `src/components/Handle/index.tsx`                 | onPointerDown for connection start                             |
| `src/container/ConnectionLineWrapper.tsx`         | **NEW** — temporary line + hit testing                         |
| `src/container/EdgeRenderer.tsx`                  | Inject `<defs>` for markers                                    |
| `src/components/Edges/markers.tsx`                | **NEW** — marker shape definitions                             |
| `src/components/Edges/BaseEdge.tsx`               | Add markerEnd/Start resolution logic                           |
| `src/helper/PanZoom.ts`                           | Add `fitView()` method                                         |
| `src/additional-components/Controls/Controls.tsx` | Wire FitViewIcon                                               |
| `src/components/EdgeWrapper/index.tsx`            | Render edge labels via foreignObject                           |
| `src/additional-components/MiniMap.tsx`           | **NEW**                                                        |
| `src/components/Panel.tsx`                        | Add `PanelPosition` type export                                |

## File Sizing Notes

- `PanZoom.tsx` (628 lines) and `storeReducer.tsx` (356 lines) are approaching large-file territory. If they grow significantly, consider splitting:
  - `PanZoom.ts` → `PanZoom.ts` + `PanZoom.wheel.ts` + `PanZoom.touch.ts`
  - `storeReducer.tsx` → keep unified for now (reducer logic tends to be cohesive)

---

## Test Strategy

- ConnectionLine: simulate pointer events from Handle → move → target handle → verify edge created; move → empty space → verify nothing created
- Cascade Delete: remove node → verify edges removed; verify edge removal triggers onEdgesChange
- Markers: verify marker ID generation, verify URL reference on SVG path
- FitView: verify computed viewport encloses all nodes
- MiniMap: verify node rectangles match positions, viewport indicator matches transform
