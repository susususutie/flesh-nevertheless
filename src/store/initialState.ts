import { type StoreStateType } from "../types";

const initialState: StoreStateType = {
  rfId: "",
  domNode: null,
  minZoom: 0.5,
  maxZoom: 2,
  nodes: [],
  edges: [],
  nodeLookup: new Map(),
  edgeLookup: new Map(),
  onNodesChange: undefined,
  onEdgesChange: undefined,
  defaultViewport: { x: 0, y: 0, zoom: 1 },
  panZoom: null,
  isInteractive: true,
  zoomOnScroll: true,
  zoomOnPinch: true,
  zoomOnDoubleClick: true,
  panOnScroll: false,
  transform: [0, 0, 1],
  mousePosition: { x: 0, y: 0 },
  selectedPoint: null,
  isPanning: false,
};

export default initialState;
