import { type EdgeChange, type NodeChange, type StoreAction, type StoreStateType } from "../types";
import PanZoom from "../helper/PanZoom";

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

  for (const change of changes) {
    if (change.type === "remove") {
      removeIds.add(change.id);
    } else if (change.type === "select") {
      selectMap.set(change.id, change.selected);
    } else if (change.type === "position") {
      positionMap.set(change.id, change.position);
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

    if (nextSelected === undefined && nextPosition === undefined) {
      nextNodes.push(node);
      continue;
    }

    changed = true;
    nextNodes.push({
      ...node,
      selected: nextSelected ?? node.selected,
      position: nextPosition ? { x: nextPosition.x, y: nextPosition.y } : node.position,
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
    case "setZoom": {
      let nextZoom = action.payload;
      if (!isFiniteNumber(nextZoom)) {
        return state;
      }
      nextZoom = clampZoom(nextZoom, state.minZoom, state.maxZoom);
      if (nextZoom === state.transform[2]) {
        return state;
      }
      return { ...state, transform: [state.transform[0], state.transform[1], nextZoom] };
    }
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
      if (x === state.transform[0] && y === state.transform[1] && zoom === state.transform[2]) {
        return state;
      }
      return { ...state, transform: [x, y, zoom] };
    }
    case "setDefaultViewport": {
      const { x, y, zoom } = action.payload;
      if (!isFiniteNumber(x) || !isFiniteNumber(y) || !isFiniteNumber(zoom)) {
        return state;
      }
      const nextZoom = clampZoom(zoom, state.minZoom, state.maxZoom);
      if (
        x === state.defaultViewport.x &&
        y === state.defaultViewport.y &&
        nextZoom === state.defaultViewport.zoom
      ) {
        return state;
      }
      return { ...state, defaultViewport: { x, y, zoom: nextZoom } };
    }
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
      const nextNodeLookup = new Map(
        nextNodes.map((node) => {
          const prev = state.nodeLookup.get(node.id);
          return [
            node.id,
            {
              ...node,
              internals: { measured: prev?.internals?.measured ?? {}, zIndex: node.zIndex ?? 0 },
            },
          ];
        }),
      );
      return {
        ...state,
        nodes: nextNodes,
        nodeLookup: nextNodeLookup,
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
      const nextDefaultZoom = clampZoom(state.defaultViewport.zoom, nextMinZoom, state.maxZoom);
      if (nextDefaultZoom === state.defaultViewport.zoom) {
        return { ...state, minZoom: nextMinZoom };
      }
      return {
        ...state,
        minZoom: nextMinZoom,
        defaultViewport: { ...state.defaultViewport, zoom: nextDefaultZoom },
      };
    }
    case "setMaxZoom": {
      const nextMaxZoom = action.payload;
      if (!isFiniteNumber(nextMaxZoom)) {
        return state;
      }
      if (nextMaxZoom === state.maxZoom) {
        return state;
      }
      const nextDefaultZoom = clampZoom(state.defaultViewport.zoom, state.minZoom, nextMaxZoom);
      if (nextDefaultZoom === state.defaultViewport.zoom) {
        return { ...state, maxZoom: nextMaxZoom };
      }
      return {
        ...state,
        maxZoom: nextMaxZoom,
        defaultViewport: { ...state.defaultViewport, zoom: nextDefaultZoom },
      };
    }
    case "setInteractivity": {
      if (typeof action.payload !== "boolean") return state;
      if (action.payload === state.isInteractive) return state;
      return { ...state, isInteractive: action.payload };
    }
    case "toggleInteractivity":
      return { ...state, isInteractive: !state.isInteractive };
    case "reset":
      return {
        ...state,
        transform: [state.defaultViewport.x, state.defaultViewport.y, state.defaultViewport.zoom],
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
        const nextNodes = value as StoreStateType["nodes"];
        const nextNodeLookup = new Map(
          nextNodes.map((node) => {
            const prev = state.nodeLookup.get(node.id);
            return [
              node.id,
              {
                ...node,
                internals: { measured: prev?.internals?.measured ?? {}, zIndex: node.zIndex ?? 0 },
              },
            ];
          }),
        );
        return {
          ...state,
          nodes: nextNodes,
          nodeLookup: nextNodeLookup,
        };
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
