import DispatchContext from "../contexts/DispatchContext";
import { type StoreStateType, type StoreAction } from "../types";
import { useReducer, type ReactNode } from "react";
import initialState from "../store/initialState";
import storeReducer from "../store/storeReducer";
import StateContext from "../contexts/StateContext";

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
  console.log("StoreProvider initState ", props.initialZoom);

  const state = {
    ...initialState,
    id: props.id,
    initialZoom,
    minZoom: props.minZoom ?? initialState.minZoom,
    maxZoom: props.maxZoom ?? initialState.maxZoom,
    zoomStep: props.zoomStep ?? initialState.zoomStep,
    canvasTransform: {
      ...initialState.canvasTransform,
      zoom: initialZoom,
    },
  };
  return state;
}

// TODO 四层 Context 架构
// // 1. Dispatch Layer - 永远不变
// const DispatchContext = createContext<React.Dispatch<Action> | null>(null);
// // 2. Static Config Layer - 来自 props，初始化后不变
// const ConfigContext = createContext<AppConfig | null>(null);
// // 3. Dynamic Data Layer - 业务状态，中低频变化
// const DataContext = createContext<AppData | null>(null);
// // 4. High-Frequency Layer - 实时状态，高频变化
// const ReactiveContext = createContext<ReactiveState | null>(null);

export default function StoreProvider(props: StoreProviderProps) {
  const { children } = props;
  const [state, dispatch] = useReducer<StoreStateType, StoreProviderProps, [StoreAction]>(
    storeReducer,
    props,
    initState,
  );

  // useMemo 稳定各层的引用

  return (
    <DispatchContext.Provider value={dispatch}>
      <StateContext.Provider value={state}>{children}</StateContext.Provider>
    </DispatchContext.Provider>
  );
}
