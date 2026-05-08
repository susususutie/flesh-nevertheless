import DispatchContext from "../contexts/DispatchContext";
import { type RootPropsType, type StoreStateType, type StoreAction } from "../types";
import { useReducer } from "react";
import initialState from "../store/initialState";
import storeReducer from "../store/storeReducer";
import StateContext from "../contexts/StateContext";

export default function StoreProvider(props: RootPropsType & {id: string}) {
  const { id, zoom, children } = props

  const [state, dispatch] = useReducer<StoreStateType, [StoreAction]>(storeReducer,  {...initialState, id, zoom: zoom ?? initialState.zoom})

  
  return <DispatchContext.Provider value={dispatch}>
    <StateContext.Provider value={state}>
    {children}
    </StateContext.Provider>
    </DispatchContext.Provider>
}