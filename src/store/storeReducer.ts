import { type EdgeChange, type NodeChange, type StoreAction, type StoreStateType } from "../types";
import PanZoom from "../helper/PanZoom";
import { adoptUserNodes } from "../helper/utils";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function clampZoom(zoom: number, minZoom: number, maxZoom: number) {
  return Math.max(Math.min(zoom, maxZoom), minZoom);
}

function normalizeEdges(edges: StoreStateType["edges"]) {
  let changed = false;
  const nextEdges = edges.map((edge, index) => {
    if (edge.id) return edge;
    changed = true;
    return { ...edge, id: `${edge.source}-${edge.target}-${index}` };
  });
  return changed ? nextEdges : edges;
}

function applyNodeChanges(
  nodes: StoreStateType["nodes"],
  changes: NodeChange[],
): StoreStateType["nodes"] {
  if (changes.length === 0) return nodes;

  const removeIds = new Set<string>();
  const selectMap = new Map<string, boolean>();
  const positionMap = new Map<string, { x: number; y: number }>();
  const draggingMap = new Map<string, boolean>();

  for (const change of changes) {
    if (change.type === "remove") {
      removeIds.add(change.id);
    } else if (change.type === "select") {
      selectMap.set(change.id, change.selected);
    } else if (change.type === "position") {
      positionMap.set(change.id, change.position);
      if (typeof change.dragging === "boolean") {
        draggingMap.set(change.id, change.dragging);
      }
    }
  }

  let changed = false;
  const nextNodes: StoreStateType["nodes"] = [];
  for (const node of nodes) {
    if (removeIds.has(node.id)) {
      changed = true;
      continue;
    }

    const nextSelected = selectMap.get(node.id);
    const nextPosition = positionMap.get(node.id);
    const nextDragging = draggingMap.get(node.id);

    if (nextSelected === undefined && nextPosition === undefined) {
      nextNodes.push(node);
      continue;
    }

    changed = true;
    nextNodes.push({
      ...node,
      selected: nextSelected ?? node.selected,
      position: nextPosition ? { x: nextPosition.x, y: nextPosition.y } : node.position,
      dragging: nextDragging !== undefined ? nextDragging : node.dragging,
    });
  }

  return changed ? nextNodes : nodes;
}

function applyEdgeChanges(
  edges: StoreStateType["edges"],
  changes: EdgeChange[],
): StoreStateType["edges"] {
  if (changes.length === 0) return edges;

  const removeIds = new Set<string>();
  const selectMap = new Map<string, boolean>();

  for (const change of changes) {
    if (change.type === "remove") {
      removeIds.add(change.id);
    } else if (change.type === "select") {
      selectMap.set(change.id, change.selected);
    }
  }

  let changed = false;
  const nextEdges: StoreStateType["edges"] = [];
  for (const edge of edges) {
    const id = edge.id;
    if (!id) {
      nextEdges.push(edge);
      continue;
    }
    if (removeIds.has(id)) {
      changed = true;
      continue;
    }

    const nextSelected = selectMap.get(id);
    if (nextSelected === undefined) {
      nextEdges.push(edge);
      continue;
    }

    changed = true;
    nextEdges.push({ ...edge, selected: nextSelected });
  }

  return changed ? nextEdges : edges;
}

export default function storeReducer(state: StoreStateType, action: StoreAction): StoreStateType {
  switch (action.type) {
    case "transform": {
      const [x, y, zoom] = action.payload;

      if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(zoom)) {
        return state;
      }

      let nextZoom = zoom;
      nextZoom = clampZoom(nextZoom, state.minZoom, state.maxZoom);

      if (x === state.transform[0] && y === state.transform[1] && nextZoom === state.transform[2]) {
        return state;
      }

      return { ...state, transform: [x, y, nextZoom] };
    }
    case "syncViewport": {
      const { x, y, zoom } = action.payload;
      if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(zoom)) {
        return state;
      }
      const nextZoom = clampZoom(zoom, state.minZoom, state.maxZoom);
      if (x === state.transform[0] && y === state.transform[1] && nextZoom === state.transform[2]) {
        return state;
      }
      return { ...state, transform: [x, y, nextZoom] };
    }
    /** 更新内部节点的测量尺寸，在渲染后调用 */
    case "updateInternalNodeMeasured": {
      const { id, width, height } = action.payload;
      if (typeof id !== "string" || id.length === 0) return state;
      if (!isFiniteNumber(width) || !isFiniteNumber(height)) return state;
      if (width < 0 || height < 0) return state;

      const node = state.nodeLookup.get(id);
      if (!node) return state;
      const prevMeasured = node.internals.measured;
      if (prevMeasured && prevMeasured.width === width && prevMeasured.height === height) {
        return state;
      }

      const nextNodeLookup = new Map(state.nodeLookup);
      nextNodeLookup.set(id, {
        ...node,
        internals: { ...node.internals, measured: { width, height } },
      });
      return { ...state, nodeLookup: nextNodeLookup };
    }
    case "applyNodeChanges": {
      const nextNodes = applyNodeChanges(state.nodes, action.payload);
      if (nextNodes === state.nodes) return state;
      const { nodes, nodeLookup } = adoptUserNodes(nextNodes, state.nodeLookup);
      return {
        ...state,
        nodes,
        nodeLookup,
      };
    }
    case "applyEdgeChanges": {
      const nextEdges = applyEdgeChanges(state.edges, action.payload);
      if (nextEdges === state.edges) return state;
      const normalized = normalizeEdges(nextEdges);
      const nextEdgeLookup = new Map(normalized.map((edge) => [edge.id!, edge]));
      return { ...state, edges: normalized, edgeLookup: nextEdgeLookup };
    }
    case "setMinZoom": {
      const nextMinZoom = action.payload;
      if (!isFiniteNumber(nextMinZoom)) {
        return state;
      }
      if (nextMinZoom === state.minZoom) {
        return state;
      }
      return { ...state, minZoom: nextMinZoom };
    }
    case "setMaxZoom": {
      const nextMaxZoom = action.payload;
      if (!isFiniteNumber(nextMaxZoom)) {
        return state;
      }
      if (nextMaxZoom === state.maxZoom) {
        return state;
      }
      return { ...state, maxZoom: nextMaxZoom };
    }
    case "setInteractivity": {
      if (typeof action.payload !== "boolean") return state;
      const isInteractive = action.payload;
      return {
        ...state,
        nodesSelectable: isInteractive,
        nodesDraggable: isInteractive,
        nodesConnectable: isInteractive,
      };
    }
    case "toggleInteractivity":
      const isInteractive = state.nodesDraggable || state.nodesConnectable || state.nodesSelectable;
      return {
        ...state,
        nodesSelectable: !isInteractive,
        nodesDraggable: !isInteractive,
        nodesConnectable: !isInteractive,
      };
    case "setPanZoom": {
      if (action.payload === null) {
        if (state.panZoom === null) return state;
        return { ...state, panZoom: null };
      }
      if (!(action.payload instanceof PanZoom)) return state;
      if (action.payload === state.panZoom) return state;
      return { ...state, panZoom: action.payload };
    }
    case "setStore": {
      const { key, value } = action.payload;
      if (state[key] === value) return state;
      if (key === "nodes" && Array.isArray(value)) {
        const { nodes, nodeLookup } = adoptUserNodes(
          value as StoreStateType["nodes"],
          state.nodeLookup,
        );
        return { ...state, nodes, nodeLookup };
      }
      if (key === "edges" && Array.isArray(value)) {
        const nextEdges = normalizeEdges(value as StoreStateType["edges"]);
        const nextEdgeLookup = new Map(nextEdges.map((edge) => [edge.id!, edge]));
        return { ...state, edges: nextEdges, edgeLookup: nextEdgeLookup };
      }
      return { ...state, [key]: value };
    }
    default:
      return state;
  }
}
