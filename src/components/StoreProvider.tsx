import DispatchContext from "../contexts/DispatchContext";
import ConfigContext from "../contexts/ConfigContext";
import DataContext from "../contexts/DataContext";
import ReactiveContext from "../contexts/ReactiveContext";
import { type StoreStateType, type StoreAction } from "../types";
import { useMemo, useReducer, type ReactNode } from "react";
import initialState from "../store/initialState";
import storeReducer from "../store/storeReducer";

type StoreProviderProps = {
  id: string;

  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;
  initialZoom?: number;

  children: ReactNode;
};

function initState(props: StoreProviderProps): StoreStateType {
  const initialZoom = props.initialZoom ?? initialState.initialZoom;

  const state = {
    ...initialState,
    id: props.id,
    initialZoom,
    minZoom: props.minZoom ?? initialState.minZoom,
    maxZoom: props.maxZoom ?? initialState.maxZoom,
    zoomStep: props.zoomStep ?? initialState.zoomStep,
    transform: {
      ...initialState.transform,
      zoom: initialZoom,
    },
  };
  return state;
}

export default function StoreProvider(props: StoreProviderProps) {
  const { children } = props;
  const [state, dispatch] = useReducer<StoreStateType, StoreProviderProps, [StoreAction]>(
    storeReducer,
    props,
    initState,
  );

  // useMemo 稳定各层的引用
  const configValue = useMemo(() => ({ id: state.id }), [state.id]);
  const dataValue = useMemo(
    () => ({
      minZoom: state.minZoom,
      maxZoom: state.maxZoom,
      zoomStep: state.zoomStep,
      initialZoom: state.initialZoom,
      panZoom: state.panZoom,
    }),
    [state.minZoom, state.maxZoom, state.zoomStep, state.initialZoom, state.panZoom],
  );
  const reactiveValue = useMemo(
    () => ({
      transform: {
        x: state.transform.x,
        y: state.transform.y,
        zoom: state.transform.zoom,
      },
      mousePosition: { x: state.mousePosition.x, y: state.mousePosition.y },
      selectedPoint: state.selectedPoint
        ? { x: state.selectedPoint.x, y: state.selectedPoint.y }
        : null,
      isPanning: state.isPanning,
    }),
    [
      state.transform.x,
      state.transform.y,
      state.transform.zoom,
      state.mousePosition.x,
      state.mousePosition.y,
      state.selectedPoint?.x,
      state.selectedPoint?.y,
      state.isPanning,
    ],
  );

  return (
    <DispatchContext.Provider value={dispatch}>
      <ConfigContext.Provider value={configValue}>
        <DataContext.Provider value={dataValue}>
          <ReactiveContext.Provider value={reactiveValue}>{children}</ReactiveContext.Provider>
        </DataContext.Provider>
      </ConfigContext.Provider>
    </DispatchContext.Provider>
  );
}
