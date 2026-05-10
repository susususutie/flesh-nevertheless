import { type StoreStateType } from "../types";

const initialState: StoreStateType = {
  id: "",
  initialZoom: 100,
  minZoom: 50,
  maxZoom: 200,
  zoomStep: 10,
  panZoom: null,
  transform: {
    x: 0,
    y: 0,
    zoom: 100,
  },
  mousePosition: { x: 0, y: 0 },
  selectedPoint: null,
  isPanning: false,
};

export default initialState;
