# Tier 1: Core Interaction Gaps — Implementation Plan

> For agentic workers: REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Implement cascade delete, SVG markers, and interactive connection line to close the core interaction gaps vs. reactflow.

**Architecture:** Three independent subsystems built sequentially: (1) cascade delete in store reducer, (2) SVG arrow markers on edges, (3) pointer-driven connection creation flow with temporary line rendering. Each adds types, store state, and components following the existing three-context pattern.

**Tech Stack:** React 19, TypeScript 6, Vite+/Vitest

---

### Task 1: Cascade Delete in Store Reducer

**Files:**

- Modify: `src/store/storeReducer.ts:33-84`

- [ ] **Step 1: Modify applyNodeChanges to return edge changes**

In `src/store/storeReducer.ts`, change the `applyNodeChanges` function signature and add edge collection logic.

Edit the function to accept edges as an optional third parameter:

```ts
function applyNodeChanges(
  nodes: StoreStateType["nodes"],
  changes: NodeChange[],
  edges?: StoreStateType["edges"],
): { nodes: StoreStateType["nodes"]; edgeChanges?: EdgeChange[] } {
```

After the `removeIds` collection loop, add cascade check:

```ts
let edgeChanges: EdgeChange[] | undefined;
if (edges && removeIds.size > 0) {
  edgeChanges = [];
  for (const edge of edges) {
    if (edge.id && (removeIds.has(edge.source) || removeIds.has(edge.target))) {
      edgeChanges.push({ id: edge.id, type: "remove" });
    }
  }
}
```

Change the return from `return changed ? nextNodes : nodes` to:

```ts
return { nodes: changed ? nextNodes : nodes, edgeChanges };
```

- [ ] **Step 2: Update the applyNodeChanges case in the reducer**

Replace the existing `case "applyNodeChanges"` block:

```ts
case "applyNodeChanges": {
  const { nodes: nextNodes, edgeChanges } = applyNodeChanges(
    state.nodes, action.payload, state.edges,
  );
  if (nextNodes === state.nodes && !edgeChanges) return state;
  const { nodes, nodeLookup } = adoptUserNodes(nextNodes, state.nodeLookup);

  let nextEdges = state.edges;
  if (edgeChanges && edgeChanges.length > 0) {
    nextEdges = applyEdgeChanges(state.edges, edgeChanges);
  }
  const normalized = normalizeEdges(nextEdges);
  const nextEdgeLookup = new Map(normalized.map((edge) => [edge.id!, edge]));

  return { ...state, nodes, nodeLookup, edges: normalized, edgeLookup: nextEdgeLookup };
}
```

- [ ] **Step 3: Build and verify**

Run: `vp build`
Expected: No type errors.

- [ ] **Step 4: Commit**

```
git add src/store/storeReducer.ts
git commit -m "fix(store): cascade delete edges when source/target node is removed"
```

---

### Task 2: Marker Types and Definitions

**Files:**

- Modify: `src/types/general.ts`
- Modify: `src/types/edges.ts`
- Create: `src/components/Edges/markers.tsx`

- [ ] **Step 1: Add Marker and Connection types to general.ts**

Add to `src/types/general.ts` after the `EdgeChange` type:

```ts
import type { ReactNode } from "react";

export type BuiltinMarkerType = "arrowclosed" | "arrow" | "circle" | "diamond";

export type Marker =
  | {
      type: BuiltinMarkerType;
      color?: string;
      width?: number;
      height?: number;
    }
  | {
      type: "custom";
      render: (params: { color: string; width: number; height: number }) => ReactNode;
      color?: string;
      width?: number;
      height?: number;
    };

export type Connection = {
  source: string;
  target: string;
  sourceHandle?: string | null;
  targetHandle?: string | null;
};
```

- [ ] **Step 2: Add ConnectionState type to general.ts**

```ts
export type ConnectionState = {
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
} | null;
```

- [ ] **Step 3: Add markerEnd/markerStart to EdgeBase**

In `src/types/edges.ts`, add to `EdgeBase`:

```ts
markerEnd?: Marker | string;
markerStart?: Marker | string;
```

- [ ] **Step 4: Add markerEnd/markerStart to EdgeProps**

In `src/types/edges.ts`, add to the `EdgeProps` type:

```ts
markerEnd?: string;
markerStart?: string;
```

- [ ] **Step 5: Create marker shape definitions**

Create `src/components/Edges/markers.tsx`:

```tsx
import type { BuiltinMarkerType } from "../../types";

export const MARKER_DEFAULTS = {
  arrowclosed: { width: 20, height: 20, color: "#9ca3af" },
  arrow: { width: 20, height: 20, color: "#9ca3af" },
  circle: { width: 16, height: 16, color: "#9ca3af" },
  diamond: { width: 20, height: 20, color: "#9ca3af" },
} as const;

export function toMarkerId(
  type: BuiltinMarkerType,
  color: string,
  width: number,
  height: number,
): string {
  return `marker-${type}-${color}-${width}-${height}`.replace(/[^a-zA-Z0-9#-]/g, "_");
}

export function renderMarkerDef(
  type: BuiltinMarkerType,
  color: string,
  width: number,
  height: number,
): JSX.Element {
  const id = toMarkerId(type, color, width, height);
  switch (type) {
    case "arrowclosed":
      return (
        <marker
          id={id}
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth={width}
          markerHeight={height}
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10 z" fill={color} />
        </marker>
      );
    case "arrow":
      return (
        <marker
          id={id}
          viewBox="0 0 10 10"
          refX="10"
          refY="5"
          markerWidth={width}
          markerHeight={height}
          orient="auto-start-reverse"
        >
          <path d="M 0 0 L 10 5 L 0 10" fill="none" stroke={color} strokeWidth="1.5" />
        </marker>
      );
    case "circle":
      return (
        <marker
          id={id}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth={width}
          markerHeight={height}
          orient="auto-start-reverse"
        >
          <circle cx="5" cy="5" r="5" fill={color} />
        </marker>
      );
    case "diamond":
      return (
        <marker
          id={id}
          viewBox="0 0 10 10"
          refX="5"
          refY="5"
          markerWidth={width}
          markerHeight={height}
          orient="auto-start-reverse"
        >
          <path d="M 5 0 L 10 5 L 5 10 L 0 5 z" fill={color} />
        </marker>
      );
  }
}

export function resolveMarkerUrl(marker: {
  type: BuiltinMarkerType;
  color?: string;
  width?: number;
  height?: number;
}): string {
  const defaults = MARKER_DEFAULTS[marker.type];
  const color = marker.color ?? defaults.color;
  const width = marker.width ?? defaults.width;
  const height = marker.height ?? defaults.height;
  return `url(#${toMarkerId(marker.type, color, width, height)})`;
}
```

- [ ] **Step 6: Build and verify**

Run: `vp build`
Expected: No type errors.

- [ ] **Step 7: Commit**

```
git add src/types/general.ts src/types/edges.ts src/components/Edges/markers.tsx
git commit -m "feat(types,edges): add Marker type and SVG marker definitions"
```

---

### Task 3: Integrate Markers into Edge Components

**Files:**

- Modify: `src/components/Edges/BaseEdge.tsx`
- Modify: `src/components/Edges/BezierEdge.tsx`
- Modify: `src/components/Edges/StraightEdge.tsx`
- Modify: `src/components/Edges/StepEdge.tsx`
- Modify: `src/components/Edges/SmoothStepEdge.tsx`
- Modify: `src/components/Edges/SimpleBezierEdge.tsx`
- Modify: `src/components/EdgeWrapper/index.tsx`

- [ ] **Step 1: Update BaseEdge to pass marker props to path**

Edit `src/components/Edges/BaseEdge.tsx`:

```tsx
interface BaseEdgeProps {
  path: string;
  interactionWidth?: number;
  style?: React.CSSProperties;
  className?: string;
  markerEnd?: string;
  markerStart?: string;
}

export default function BaseEdge({
  path,
  interactionWidth = 20,
  style,
  className,
  markerEnd,
  markerStart,
}: BaseEdgeProps) {
  return (
    <>
      <path
        d={path}
        fill="none"
        className={className}
        style={style}
        markerEnd={markerEnd}
        markerStart={markerStart}
      />
      {interactionWidth > 0 && (
        <path
          d={path}
          fill="none"
          strokeOpacity={0}
          strokeWidth={interactionWidth}
          style={{ pointerEvents: "stroke" }}
        />
      )}
    </>
  );
}
```

- [ ] **Step 2: Update all 5 edge components to pass markerEnd/markerStart**

For each of `BezierEdge.tsx`, `StraightEdge.tsx`, `StepEdge.tsx`, `SmoothStepEdge.tsx`, `SimpleBezierEdge.tsx`:

Add `markerEnd, markerStart` to the destructuring:

```tsx
const {
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  selected,
  interactionWidth,
  markerEnd,
  markerStart,
} = props;
```

Pass to BaseEdge:

```tsx
<BaseEdge
  path={path}
  interactionWidth={interactionWidth}
  style={{ stroke: selected ? "#2563eb" : "#9ca3af", strokeWidth: 2 }}
  markerEnd={markerEnd}
  markerStart={markerStart}
/>
```

- [ ] **Step 3: Update EdgeWrapper to resolve markers and inject defs**

In `src/components/EdgeWrapper/index.tsx`, add imports:

```tsx
import { renderMarkerDef, resolveMarkerUrl, MARKER_DEFAULTS } from "../Edges/markers";
import type { BuiltinMarkerType } from "../../types";
```

Before the return statement, add marker resolution:

```tsx
const markerDefs: JSX.Element[] = [];
let resolvedMarkerEnd: string | undefined;
let resolvedMarkerStart: string | undefined;

function resolveEdgeMarker(
  raw: unknown,
  defType: BuiltinMarkerType,
  set: (url: string | undefined) => void,
): void {
  if (!raw) {
    const d = MARKER_DEFAULTS[defType];
    markerDefs.push(renderMarkerDef(defType, d.color, d.width, d.height));
    set(resolveMarkerUrl({ type: defType }));
    return;
  }
  if (typeof raw === "string") {
    set(raw);
    return;
  }
  const m = raw as any;
  if (m.type === "custom") {
    const color = m.color ?? "#9ca3af";
    const width = m.width ?? 20;
    const height = m.height ?? 20;
    const safeId = `marker-custom-${color}-${width}-${height}`.replace(/[^a-zA-Z0-9#-]/g, "_");
    markerDefs.push(
      <marker
        id={safeId}
        viewBox="0 0 10 10"
        refX="10"
        refY="5"
        markerWidth={width}
        markerHeight={height}
        orient="auto-start-reverse"
      >
        {m.render({ color, width, height })}
      </marker>,
    );
    set(`url(#${safeId})`);
    return;
  }
  const d = MARKER_DEFAULTS[m.type as BuiltinMarkerType] ?? MARKER_DEFAULTS.arrowclosed;
  const color = m.color ?? d.color;
  const width = m.width ?? d.width;
  const height = m.height ?? d.height;
  markerDefs.push(renderMarkerDef(m.type as BuiltinMarkerType, color, width, height));
  set(resolveMarkerUrl({ type: m.type as BuiltinMarkerType, color, width, height }));
}

resolveEdgeMarker(edge.markerEnd, "arrowclosed", (url) => {
  resolvedMarkerEnd = url;
});
resolveEdgeMarker(edge.markerStart, "arrowclosed", (url) => {
  resolvedMarkerStart = url;
});
```

In the SVG, add `<defs>` before the `<g>` element:

```tsx
{
  markerDefs.length > 0 && <defs>{markerDefs}</defs>;
}
```

And pass markerEnd/markerStart to EdgeComponent:

```tsx
<EdgeComponent
  id={edge.id}
  type={edgeType}
  data={edge.data}
  selected={!!edge.selected}
  source={edge.source}
  target={edge.target}
  sourceX={sourceX}
  sourceY={sourceY}
  targetX={targetX}
  targetY={targetY}
  sourcePosition={sourcePosition}
  targetPosition={targetPosition}
  interactionWidth={interactionWidth}
  markerEnd={resolvedMarkerEnd}
  markerStart={resolvedMarkerStart}
/>
```

- [ ] **Step 4: Build and verify**

Run: `vp build`
Expected: No errors.

- [ ] **Step 5: Commit**

```
git add src/components/Edges/ src/components/EdgeWrapper/index.tsx
git commit -m "feat(edges): integrate SVG arrow markers into edge components"
```

---

### Task 4: Connection Types and Store Actions

**Files:**

- Modify: `src/types/store.ts`
- Modify: `src/store/initialState.ts`
- Modify: `src/store/storeReducer.ts`
- Modify: `src/types/component-props.ts`

- [ ] **Step 1: Add connectionState to StoreReactive**

In `src/types/store.ts`, add to `StoreReactive`:

```ts
connectionState: ConnectionState;
```

Add `ConnectionState` to the import from `"."`.

- [ ] **Step 2: Add connection actions to StoreAction**

In `src/types/store.ts`, add to `StoreAction`:

```ts
| { type: "setConnectionStart"; payload: { nodeId: string; handleId: string; type: HandleType; position: PositionType; x: number; y: number } }
| { type: "setConnectionMove"; payload: { clientX: number; clientY: number } }
| { type: "setConnectionTarget"; payload: { nodeId: string; handleId: string; type: HandleType; position: PositionType } | null }
| { type: "setConnectionEnd" }
```

- [ ] **Step 3: Add connectionState to initial state**

In `src/store/initialState.ts`, add:

```ts
connectionState: null,
```

- [ ] **Step 4: Add connection reducer cases**

In `src/store/storeReducer.ts`, add before `default`:

```ts
case "setConnectionStart": {
  return {
    ...state,
    connectionState: {
      isValid: false,
      source: action.payload,
      target: null,
      mousePosition: null,
    },
  };
}
case "setConnectionMove": {
  if (!state.connectionState) return state;
  return {
    ...state,
    connectionState: { ...state.connectionState, mousePosition: action.payload },
  };
}
case "setConnectionTarget": {
  if (!state.connectionState) return state;
  const target = action.payload;
  const isValid = target !== null && state.connectionState.source.nodeId !== target.nodeId;
  return {
    ...state,
    connectionState: { ...state.connectionState, target, isValid },
  };
}
case "setConnectionEnd": {
  return { ...state, connectionState: null };
}
```

- [ ] **Step 5: Add onConnect to RootPropsType**

In `src/types/component-props.ts`:

- Add `Connection` to the imports from `"."`
- Add to `RootPropsType`:

```ts
onConnect?: (connection: Connection) => void;
```

- [ ] **Step 6: Build and verify**

Run: `vp build` — Expected: No type errors.

- [ ] **Step 7: Commit**

```
git add src/types/store.ts src/store/initialState.ts src/store/storeReducer.ts src/types/component-props.ts
git commit -m "feat(store): add connection state, types, and reducer actions"
```

---

### Task 5: Handle Connection Events and ConnectionLineWrapper

**Files:**

- Modify: `src/components/Handle/index.tsx`
- Create: `src/container/ConnectionLineWrapper.tsx`
- Modify: `src/Root.tsx`

- [ ] **Step 1: Update Handle component for connection pointer events**

Replace `src/components/Handle/index.tsx`:

```tsx
import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import type { HandleType, PositionType } from "../../types";
import useDispatch from "../../hooks/useDispatch";

const handleStyle: CSSProperties = {
  width: 4,
  height: 4,
  position: "absolute",
  backgroundColor: "red",
};

type HandleProps = {
  id: string;
  nodeId: string;
  type: HandleType;
  position: PositionType;
};

export default function Handle(props: HandleProps) {
  const { id, nodeId, type, position } = props;
  const dispatch = useDispatch();

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.stopPropagation();

    const handleRect = event.currentTarget.getBoundingClientRect();
    const x = handleRect.left + handleRect.width / 2;
    const y = handleRect.top + handleRect.height / 2;

    dispatch({
      type: "setConnectionStart",
      payload: { nodeId, handleId: id, type, position, x, y },
    });
  };

  const posStyles: Record<string, CSSProperties> = {
    top: { top: 0, left: "50%", transform: "translateX(-50%) translateY(-50%)" },
    right: { right: 0, top: "50%", transform: "translateX(50%) translateY(-50%)" },
    bottom: { bottom: 0, left: "50%", transform: "translateX(-50%) translateY(50%)" },
    left: { left: 0, top: "50%", transform: "translateX(-50%) translateY(-50%)" },
  };

  return (
    <div
      data-role="handle"
      data-handle-id={id}
      data-handle-pos={position}
      data-handle-type={type}
      data-nodeid={nodeId}
      className={`react-flow__handle react-flow__handle-${type}`}
      style={{ ...handleStyle, ...posStyles[position] }}
      onPointerDown={onPointerDown}
    />
  );
}
```

- [ ] **Step 2: Create ConnectionLineWrapper**

Create `src/container/ConnectionLineWrapper.tsx`:

```tsx
import useReactive from "../hooks/useReactive";
import useDispatch from "../hooks/useDispatch";
import { useEffect, useRef } from "react";

export default function ConnectionLineWrapper() {
  const reactive = useReactive();
  const dispatch = useDispatch();
  const cs = reactive.connectionState;
  const csRef = useRef(cs);
  csRef.current = cs;

  useEffect(() => {
    if (!cs) return;

    const onPointerMove = (event: PointerEvent) => {
      dispatch({
        type: "setConnectionMove",
        payload: { clientX: event.clientX, clientY: event.clientY },
      });

      const el = document.elementFromPoint(event.clientX, event.clientY);
      const handleEl = el?.closest<HTMLDivElement>("[data-role='handle']");
      if (handleEl) {
        const nid = handleEl.getAttribute("data-nodeid") || "";
        const hid = handleEl.getAttribute("data-handle-id") || "";
        const htype = handleEl.getAttribute("data-handle-type") || "";
        const hpos = handleEl.getAttribute("data-handle-pos") || "";
        if (htype === "target") {
          dispatch({
            type: "setConnectionTarget",
            payload: { nodeId: nid, handleId: hid, type: htype as any, position: hpos as any },
          });
          return;
        }
      }
      dispatch({ type: "setConnectionTarget", payload: null });
    };

    const onPointerUp = () => {
      const cur = csRef.current;
      if (cur?.target && cur.isValid) {
        dispatch({
          type: "applyEdgeChanges",
          payload: [
            {
              type: "add",
              item: {
                source: cur.source.nodeId,
                target: cur.target.nodeId,
                sourceHandle: cur.source.handleId,
                targetHandle: cur.target.handleId,
              },
            },
          ],
        });
      }
      dispatch({ type: "setConnectionEnd" });
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [cs, dispatch]);

  if (!cs) return null;

  const x1 = cs.source.x;
  const y1 = cs.source.y;
  const mx = cs.mousePosition ? cs.mousePosition.clientX : x1;
  const my = cs.mousePosition ? cs.mousePosition.clientY : y1;
  const midX = (x1 + mx) / 2;
  const path = `M ${x1} ${y1} C ${midX} ${y1} ${midX} ${my} ${mx} ${my}`;

  return (
    <svg
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <path
        d={path}
        fill="none"
        stroke={cs.isValid ? "#2563eb" : "#ef4444"}
        strokeWidth={2}
        strokeDasharray="5 5"
      />
    </svg>
  );
}
```

- [ ] **Step 3: Wire ConnectionLineWrapper into Root**

In `src/Root.tsx`, add import:

```tsx
import ConnectionLineWrapper from "./container/ConnectionLineWrapper";
```

Add `<ConnectionLineWrapper />` after the `</ZoomPane>` closing tag and before `{children}`.

- [ ] **Step 4: Build and verify**

Run: `vp build` — Expected: No errors.

- [ ] **Step 5: Test manually**

Run: `vp dev` — Navigate to Basic example. Drag from a source handle to a target handle. A dashed bezier line should follow the cursor. On release over a valid target, an edge is created.

- [ ] **Step 6: Commit**

```
git add src/components/Handle/index.tsx src/container/ConnectionLineWrapper.tsx src/Root.tsx
git commit -m "feat(core): add interactive connection line for edge creation"
```

---

### Task 6: FitView Method in PanZoom

**Files:**

- Modify: `src/helper/PanZoom.ts`
- Modify: `src/additional-components/Controls/Controls.tsx`

- [ ] **Step 1: Add fitView method to PanZoom**

In `src/helper/PanZoom.ts`, add after `panBy`:

```ts
fitView(
  nodes: Array<{ x: number; y: number; width: number; height: number }>,
  opts?: { padding?: number },
): Viewport | null {
  if (this.destroyed || nodes.length === 0) return null;

  const padding = opts?.padding ?? 0.1;
  const rect = this.el?.getBoundingClientRect();
  if (!rect) return null;

  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const n of nodes) {
    if (n.x < minX) minX = n.x;
    if (n.y < minY) minY = n.y;
    if (n.x + n.width > maxX) maxX = n.x + n.width;
    if (n.y + n.height > maxY) maxY = n.y + n.height;
  }

  const nw = maxX - minX;
  const nh = maxY - minY;
  if (nw <= 0 || nh <= 0) return null;

  const availW = rect.width * (1 - padding * 2);
  const availH = rect.height * (1 - padding * 2);

  let zoom = Math.min(availW / nw, availH / nh);
  zoom = Math.max(this.minZoom, Math.min(this.maxZoom, zoom));

  const cx = (minX + maxX) / 2;
  const cy = (minY + maxY) / 2;
  const tx = rect.width / 2 - cx * zoom;
  const ty = rect.height / 2 - cy * zoom;

  this.#commitViewport({ x: tx, y: ty, zoom });
  return { x: tx, y: ty, zoom };
}
```

- [ ] **Step 2: Wire Controls FitView button**

In `src/additional-components/Controls/Controls.tsx`, add handler:

```tsx
const handleFitView = () => {
  if (!panZoom) return;
  const nodes = Array.from(data.nodeLookup.values()).map((n) => ({
    x: n.internals.positionAbsolute.x,
    y: n.internals.positionAbsolute.y,
    width: n.internals.measured.width ?? 100,
    height: n.internals.measured.height ?? 50,
  }));
  panZoom.fitView(nodes);
};
```

Replace the FitView button:

```tsx
<button className="control-button" onClick={handleFitView}>
  <FitViewIcon />
</button>
```

- [ ] **Step 3: Build and verify**

Run: `vp build` — Expected: No errors.

- [ ] **Step 4: Commit**

```
git add src/helper/PanZoom.ts src/additional-components/Controls/Controls.tsx
git commit -m "feat(panzoom): add fitView method and wire Controls button"
```

---

### Self-Review Checklist

1. **Spec coverage:** Cascade delete (Task 1), markers (Tasks 2-3), connection line (Tasks 4-5), FitView (Task 6) — all covered from the design spec.

2. **Placeholder scan:** All steps contain actual code, no TBD or implement later.

3. **Type consistency:**
   - `Marker` defined in general.ts (Task 2) — used in edges.ts, EdgeWrapper (Task 3), markers.tsx (Task 2) — consistent
   - `ConnectionState` defined in general.ts (Task 2) — used in store.ts (Task 4), ConnectionLineWrapper (Task 5) — consistent
   - Resolved marker URLs are strings `url(#id)` — matched by renderMarkerDef ID scheme — consistent

4. **Edge cases:**
   - Cascade: self-loop edge (source=target) correctly removed when either ref is deleted
   - Connection: self-connection blocked (isValid=false, red line shown)
   - FitView: empty nodes returns null, min/max zoom respected
   - Handle stopPropagation prevents simultaneous node drag during connection
