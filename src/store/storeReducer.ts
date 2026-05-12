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
    case "setInteractionOptions": {
      const nextZoomOnScroll =
        action.payload.zoomOnScroll !== undefined
          ? action.payload.zoomOnScroll
          : state.zoomOnScroll;
      const nextZoomOnPinch =
        action.payload.zoomOnPinch !== undefined ? action.payload.zoomOnPinch : state.zoomOnPinch;
      const nextZoomOnDoubleClick =
        action.payload.zoomOnDoubleClick !== undefined
          ? action.payload.zoomOnDoubleClick
          : state.zoomOnDoubleClick;
      const nextPanOnScroll =
        action.payload.panOnScroll !== undefined ? action.payload.panOnScroll : state.panOnScroll;

      if (
        nextZoomOnScroll === state.zoomOnScroll &&
        nextZoomOnPinch === state.zoomOnPinch &&
        nextZoomOnDoubleClick === state.zoomOnDoubleClick &&
        nextPanOnScroll === state.panOnScroll
      ) {
        return state;
      }

      return {
        ...state,
        zoomOnScroll: nextZoomOnScroll,
        zoomOnPinch: nextZoomOnPinch,
        zoomOnDoubleClick: nextZoomOnDoubleClick,
        panOnScroll: nextPanOnScroll,
      };
    }
    case "setInteractivity": {
      if (typeof action.payload !== "boolean") return state;
      if (action.payload === state.isInteractive) return state;
      return { ...state, isInteractive: action.payload };
    }
    case "toggleInteractivity":
      return { ...state, isInteractive: !state.isInteractive };
    case "reset":
      return {
        ...state,
        transform: [state.defaultViewport.x, state.defaultViewport.y, state.defaultViewport.zoom],
      };
    case "setPanZoom": {
      if (action.payload === null) {
        if (state.panZoom === null) return state;
        return { ...state, panZoom: null };
      }
      if (!(action.payload instanceof PanZoom)) return state;
      if (action.payload === state.panZoom) return state;
      return { ...state, panZoom: action.payload };
    }
    default:
      return state;
  }
}
