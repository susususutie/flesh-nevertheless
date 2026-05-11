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
    transform: [initialState.transform[0], initialState.transform[1], initialZoom] as [
      number,
      number,
      number,
    ],
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
      initialZoom: state.initialZoom,
      panZoom: state.panZoom,
    }),
    [state.minZoom, state.maxZoom, state.initialZoom, state.panZoom],
  );
  const reactiveValue = useMemo(
    () => ({
      transform: state.transform,
      mousePosition: { x: state.mousePosition.x, y: state.mousePosition.y },
      selectedPoint: state.selectedPoint
        ? { x: state.selectedPoint.x, y: state.selectedPoint.y }
        : null,
      isPanning: state.isPanning,
    }),
    [
      state.transform[0],
      state.transform[1],
      state.transform[2],
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
