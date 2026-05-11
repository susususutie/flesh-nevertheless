import { type StoreStateType, type StoreAction } from "../types";
import PanZoom from "../helper/PanZoom";

export default function storeReducer(state: StoreStateType, action: StoreAction) {
  switch (action.type) {
    case "setZoom": {
      let nextZoom = action.payload;
      if (typeof nextZoom !== "number" || !Number.isFinite(nextZoom)) {
        return state;
      }
      nextZoom = Math.round(nextZoom);
      nextZoom = Math.max(Math.min(nextZoom, state.maxZoom), state.minZoom);
      if (nextZoom === state.transform.zoom) {
        return state;
      }
      return { ...state, transform: { ...state.transform, zoom: nextZoom } };
    }
    case "transform": {
      const { x, y, zoom } = action.payload;

      if (
        typeof x !== "number" ||
        !Number.isFinite(x) ||
        typeof y !== "number" ||
        !Number.isFinite(y) ||
        typeof zoom !== "number" ||
        !Number.isFinite(zoom)
      ) {
        return state;
      }

      let nextZoom = zoom;
      nextZoom = Math.round(nextZoom);
      nextZoom = Math.max(Math.min(nextZoom, state.maxZoom), state.minZoom);

      if (x === state.transform.x && y === state.transform.y && nextZoom === state.transform.zoom) {
        return state;
      }

      return { ...state, transform: { x, y, zoom: nextZoom } };
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
      return { ...state, transform: { ...state.transform, zoom: state.initialZoom } };
    case "incrementZoom": {
      let newZoom = Math.round(state.transform.zoom * 1.2);
      newZoom = Math.max(Math.min(newZoom, state.maxZoom), state.minZoom);
      if (newZoom === state.transform.zoom) {
        return state;
      }
      return { ...state, transform: { ...state.transform, zoom: newZoom } };
    }
    case "decrementZoom": {
      let newZoom = Math.round(state.transform.zoom * 0.8);
      newZoom = Math.max(Math.min(newZoom, state.maxZoom), state.minZoom);
      if (newZoom === state.transform.zoom) {
        return state;
      }
      return { ...state, transform: { ...state.transform, zoom: newZoom } };
    }
    case "setPanZoom": {
      if (action.payload instanceof PanZoom) {
        return { ...state, panZoom: action.payload };
      }
      return state;
    }
    default:
      return state;
  }
}
