import { type StoreStateType } from "../types";

const initialState: StoreStateType = {
  id: "",
  minZoom: 0.5,
  maxZoom: 2,
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
