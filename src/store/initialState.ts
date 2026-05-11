import { type StoreStateType } from "../types";

const initialState: StoreStateType = {
  id: "",
  initialZoom: 1,
  minZoom: 0.5,
  maxZoom: 2,
  panZoom: null,
  transform: [0, 0, 1],
  mousePosition: { x: 0, y: 0 },
  selectedPoint: null,
  isPanning: false,
};

export default initialState;
