import { type StoreStateType, type StoreAction } from "../types";
import PanZoom from "../helper/PanZoom";

function isFiniteNumber(value: unknown): value is number {
  return typeof value === "number" && Number.isFinite(value);
}

function clampZoom(zoom: number, minZoom: number, maxZoom: number) {
  return Math.max(Math.min(zoom, maxZoom), minZoom);
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
    case "reset":
      return {
        ...state,
        transform: [state.defaultViewport.x, state.defaultViewport.y, state.defaultViewport.zoom],
      };
    case "incrementZoom": {
      let newZoom = state.transform[2] * 1.2;
      newZoom = clampZoom(newZoom, state.minZoom, state.maxZoom);
      if (newZoom === state.transform[2]) {
        return state;
      }
      return { ...state, transform: [state.transform[0], state.transform[1], newZoom] };
    }
    case "decrementZoom": {
      let newZoom = state.transform[2] * 0.8;
      newZoom = clampZoom(newZoom, state.minZoom, state.maxZoom);
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
