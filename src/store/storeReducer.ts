import { type StoreStateType, type StoreAction } from "../types";
import PanZoom from "../helper/PanZoom";

export default function storeReducer(state: StoreStateType, action: StoreAction): StoreStateType {
  switch (action.type) {
    case "setZoom": {
      let nextZoom = action.payload;
      if (typeof nextZoom !== "number" || !Number.isFinite(nextZoom)) {
        return state;
      }
      nextZoom = Math.max(Math.min(nextZoom, state.maxZoom), state.minZoom);
      if (nextZoom === state.transform[2]) {
        return state;
      }
      return { ...state, transform: [state.transform[0], state.transform[1], nextZoom] };
    }
    case "transform": {
      const [x, y, zoom] = action.payload;

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
      nextZoom = Math.max(Math.min(nextZoom, state.maxZoom), state.minZoom);

      if (x === state.transform[0] && y === state.transform[1] && nextZoom === state.transform[2]) {
        return state;
      }

      return { ...state, transform: [x, y, nextZoom] };
    }
    case "setInitialZoom": {
      let initialZoom = action.payload;
      if (initialZoom === state.initialZoom) {
        return state;
      }
      if (typeof initialZoom !== "number" || !Number.isFinite(initialZoom)) {
        return state;
      }
      if (initialZoom < state.minZoom || initialZoom > state.maxZoom) {
        return state;
      }
      return { ...state, initialZoom };
    }
    case "reset":
      return { ...state, transform: [state.transform[0], state.transform[1], state.initialZoom] };
    case "incrementZoom": {
      let newZoom = state.transform[2] * 1.2;
      newZoom = Math.max(Math.min(newZoom, state.maxZoom), state.minZoom);
      if (newZoom === state.transform[2]) {
        return state;
      }
      return { ...state, transform: [state.transform[0], state.transform[1], newZoom] };
    }
    case "decrementZoom": {
      let newZoom = state.transform[2] * 0.8;
      newZoom = Math.max(Math.min(newZoom, state.maxZoom), state.minZoom);
      if (newZoom === state.transform[2]) {
        return state;
      }
      return { ...state, transform: [state.transform[0], state.transform[1], newZoom] };
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
