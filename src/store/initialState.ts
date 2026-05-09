import { type StoreStateType } from "../types";

const initialState: StoreStateType = {
  id: "",
  initialZoom: 100,
  minZoom: 10,
  maxZoom: 500,
  zoomStep: 10,
  canvasTransform: {
    x: 0,
    y: 0,
    zoom: 100,
  },
  mousePosition: { x: 0, y: 0 },
  selectedPoint: null,
  isPanning: false,
};

export default initialState;
