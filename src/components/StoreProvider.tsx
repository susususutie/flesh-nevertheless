import { useMemo, useReducer, type ReactNode } from "react";
import ConfigContext from "../contexts/ConfigContext";
import DataContext from "../contexts/DataContext";
import DispatchContext from "../contexts/DispatchContext";
import ReactiveContext from "../contexts/ReactiveContext";
import initialState from "../store/initialState";
import storeReducer from "../store/storeReducer";
import { type RootPropsType, type StoreAction, type StoreStateType } from "../types";
import { adoptUserNodes } from "../helper";

type StoreProviderProps = {
  rfId: string;
  children: ReactNode;
} & Pick<
  RootPropsType,
  | "minZoom"
  | "maxZoom"
  | "defaultNodes"
  | "nodes"
  | "onNodesChange"
  | "nodesConnectable"
  | "nodesDraggable"
  | "nodesSelectable"
  | "defaultEdges"
  | "edges"
  | "onEdgesChange"
  | "defaultViewport"
  | "viewport"
  | "nodeTypes"
  | "edgeTypes"
  | "zoomOnScroll"
  | "zoomOnPinch"
  | "zoomOnDoubleClick"
  | "panOnScroll"
  | "preventScrolling"
>;

function normalizeEdges(edges: StoreStateType["edges"]) {
  let changed = false;
  const nextEdges = edges.map((edge, index) => {
    if (edge.id) return edge;
    changed = true;
    return { ...edge, id: `${edge.source}-${edge.target}-${index}` };
  });
  return changed ? nextEdges : edges;
}

function initState(props: StoreProviderProps): StoreStateType {
  const minZoom = props.minZoom ?? initialState.minZoom;
  const maxZoom = props.maxZoom ?? initialState.maxZoom;

  const edges = normalizeEdges(props.edges ?? props.defaultEdges ?? initialState.edges);
  const resolvedDefaultViewport = props.defaultViewport ?? initialState.defaultViewport;
  const zoomOnScroll = props.zoomOnScroll ?? initialState.zoomOnScroll;
  const zoomOnPinch = props.zoomOnPinch ?? initialState.zoomOnPinch;
  const zoomOnDoubleClick = props.zoomOnDoubleClick ?? initialState.zoomOnDoubleClick;
  const panOnScroll = props.panOnScroll ?? initialState.panOnScroll;
  const preventScrolling = props.preventScrolling ?? initialState.preventScrolling;
  const isControlled = props.viewport !== undefined;
  const resolvedInitialViewport = props.viewport ?? resolvedDefaultViewport;
  const initialZoom = isControlled
    ? resolvedInitialViewport.zoom
    : Math.max(Math.min(resolvedInitialViewport.zoom, maxZoom), minZoom);
  const clampedDefaultZoom = Math.max(Math.min(resolvedDefaultViewport.zoom, maxZoom), minZoom);
  const nodesConnectable = props.nodesConnectable ?? initialState.nodesConnectable;
  const nodesDraggable = props.nodesDraggable ?? initialState.nodesDraggable;
  const nodesSelectable = props.nodesSelectable ?? initialState.nodesSelectable;

  const { nodesInitialized, nodes, nodeLookup } = adoptUserNodes(
    props.nodes ?? props.defaultNodes ?? initialState.nodes,
    initialState.nodeLookup,
  );

  const state = {
    ...initialState,
    rfId: props.rfId,
    minZoom,
    maxZoom,
    nodes,
    edges,
    nodesControlled: props.nodes !== undefined,
    edgesControlled: props.edges !== undefined,
    nodesConnectable,
    nodesDraggable,
    nodesSelectable,
    nodesInitialized,
    nodeLookup,
    edgeLookup: new Map(edges.map((edge) => [edge.id!, edge])),
    nodeTypes: (props.nodeTypes ?? initialState.nodeTypes) as StoreStateType["nodeTypes"],
    edgeTypes: (props.edgeTypes ?? initialState.edgeTypes) as StoreStateType["edgeTypes"],
    onNodesChange: props.onNodesChange ?? null,
    onEdgesChange: props.onEdgesChange ?? null,
    defaultViewport: {
      x: resolvedDefaultViewport.x,
      y: resolvedDefaultViewport.y,
      zoom: clampedDefaultZoom,
    },
    zoomOnScroll,
    zoomOnPinch,
    zoomOnDoubleClick,
    panOnScroll,
    preventScrolling,
    transform: [resolvedInitialViewport.x, resolvedInitialViewport.y, initialZoom] as [
      number,
      number,
      number,
    ],
  };
  return state;
}

export default function StoreProvider(props: StoreProviderProps) {
  const { children } = props;
  const [state, dispatch] = useReducer<StoreStateType, StoreProviderProps, [StoreAction]>(
    storeReducer,
    props,
    initState,
  );

  // useMemo 稳定各层的引用
  const configValue = useMemo(
    () => ({ rfId: state.rfId, domNode: state.domNode }),
    [state.rfId, state.domNode],
  );
  const dataValue = useMemo(
    () => ({
      minZoom: state.minZoom,
      maxZoom: state.maxZoom,
      nodes: state.nodes,
      edges: state.edges,
      nodesControlled: state.nodesControlled,
      edgesControlled: state.edgesControlled,
      nodesConnectable: state.nodesConnectable,
      nodesDraggable: state.nodesDraggable,
      nodesSelectable: state.nodesSelectable,
      nodesInitialized: state.nodesInitialized,
      nodeLookup: state.nodeLookup,
      edgeLookup: state.edgeLookup,
      nodeTypes: state.nodeTypes,
      edgeTypes: state.edgeTypes,
      onNodesChange: state.onNodesChange,
      onEdgesChange: state.onEdgesChange,
      defaultViewport: state.defaultViewport,
      panZoom: state.panZoom,
      zoomOnScroll: state.zoomOnScroll,
      zoomOnPinch: state.zoomOnPinch,
      zoomOnDoubleClick: state.zoomOnDoubleClick,
      panOnScroll: state.panOnScroll,
      preventScrolling: state.preventScrolling,
    }),
    [
      state.minZoom,
      state.maxZoom,
      state.nodes,
      state.edges,
      state.nodesControlled,
      state.edgesControlled,
      state.nodesConnectable,
      state.nodesDraggable,
      state.nodesSelectable,
      state.nodeLookup,
      state.edgeLookup,
      state.nodeTypes,
      state.edgeTypes,
      state.onNodesChange,
      state.onEdgesChange,
      state.defaultViewport.x,
      state.defaultViewport.y,
      state.defaultViewport.zoom,
      state.panZoom,
      state.zoomOnScroll,
      state.zoomOnPinch,
      state.zoomOnDoubleClick,
      state.panOnScroll,
      state.preventScrolling,
    ],
  );
  const reactiveValue = useMemo(
    () => ({
      transform: state.transform,
      mousePosition: { x: state.mousePosition.x, y: state.mousePosition.y },
      selectedPoint: state.selectedPoint
        ? { x: state.selectedPoint.x, y: state.selectedPoint.y }
        : null,
      isPanning: state.isPanning,
    }),
    [
      state.transform[0],
      state.transform[1],
      state.transform[2],
      state.mousePosition.x,
      state.mousePosition.y,
      state.selectedPoint?.x,
      state.selectedPoint?.y,
      state.isPanning,
    ],
  );

  return (
    <DispatchContext.Provider value={dispatch}>
      <ConfigContext.Provider value={configValue}>
        <DataContext.Provider value={dataValue}>
          <ReactiveContext.Provider value={reactiveValue}>{children}</ReactiveContext.Provider>
        </DataContext.Provider>
      </ConfigContext.Provider>
    </DispatchContext.Provider>
  );
}
