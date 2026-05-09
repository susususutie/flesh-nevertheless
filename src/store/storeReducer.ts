import { type StoreStateType, type StoreAction } from "../types";

export default function storeReducer(state: StoreStateType, action: StoreAction) {
  switch (action.type) {
    case "setZoom": {
      return { ...state, canvasTransform: { ...state.canvasTransform, zoom: action.payload } };
    }
    case "setInitialZoom": {
      let initialZoom = action.payload;
      if (initialZoom === state.initialZoom) {
        return state;
      }
      if (typeof initialZoom !== "number") {
        return state;
      }
      initialZoom = Math.round(initialZoom);
      if (initialZoom < state.minZoom || initialZoom > state.maxZoom) {
        return state;
      }
      return { ...state, initialZoom };
    }
    case "reset":
      return { ...state, canvasTransform: { ...state.canvasTransform, zoom: state.initialZoom } };
    case "incrementZoom": {
      let newZoom = Math.round(state.canvasTransform.zoom + state.zoomStep);
      newZoom = Math.max(Math.min(newZoom, state.maxZoom), state.minZoom);
      if (newZoom === state.canvasTransform.zoom) {
        return state;
      }
      return { ...state, canvasTransform: { ...state.canvasTransform, zoom: newZoom } };
    }
    case "decrementZoom": {
      let newZoom = Math.round(state.canvasTransform.zoom - state.zoomStep);
      newZoom = Math.max(Math.min(newZoom, state.maxZoom), state.minZoom);
      if (newZoom === state.canvasTransform.zoom) {
        return state;
      }
      return { ...state, canvasTransform: { ...state.canvasTransform, zoom: newZoom } };
    }
    default:
      return state;
  }
}
