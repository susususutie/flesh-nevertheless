import { useMemo, useReducer, type ReactNode } from "react";
import ConfigContext from "../contexts/ConfigContext";
import DataContext from "../contexts/DataContext";
import DispatchContext from "../contexts/DispatchContext";
import ReactiveContext from "../contexts/ReactiveContext";
import initialState from "../store/initialState";
import storeReducer from "../store/storeReducer";
import { type RootPropsType, type StoreAction, type StoreStateType } from "../types";

type StoreProviderProps = {
  id: string;
  children: ReactNode;
} & Pick<
  RootPropsType,
  "minZoom" | "maxZoom" | "defaultViewport" | "viewport" | "onViewportChange"
>;

function initState(props: StoreProviderProps): StoreStateType {
  const minZoom = props.minZoom ?? initialState.minZoom;
  const maxZoom = props.maxZoom ?? initialState.maxZoom;
  const resolvedDefaultViewport = props.defaultViewport ?? initialState.defaultViewport;
  const isControlled = props.viewport !== undefined;
  const resolvedInitialViewport = props.viewport ?? resolvedDefaultViewport;
  const initialZoom = isControlled
    ? resolvedInitialViewport.zoom
    : Math.max(Math.min(resolvedInitialViewport.zoom, maxZoom), minZoom);
  const clampedDefaultZoom = Math.max(Math.min(resolvedDefaultViewport.zoom, maxZoom), minZoom);

  const state = {
    ...initialState,
    id: props.id,
    minZoom,
    maxZoom,
    defaultViewport: {
      x: resolvedDefaultViewport.x,
      y: resolvedDefaultViewport.y,
      zoom: clampedDefaultZoom,
    },
    transform: [resolvedInitialViewport.x, resolvedInitialViewport.y, initialZoom] as [
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
      defaultViewport: state.defaultViewport,
      panZoom: state.panZoom,
    }),
    [
      state.minZoom,
      state.maxZoom,
      state.defaultViewport.x,
      state.defaultViewport.y,
      state.defaultViewport.zoom,
      state.panZoom,
    ],
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
