import { type ReactNode, type Dispatch, type useReducer } from "react";

export type StoreStateType = {
  id: string
  zoom: number
}

export type RootPropsType = {
  zoom?: number
  children: ReactNode
}


export type StoreAction =
  | {type:'setZoom', payload: number}
  | { type: 'incrementZoom';  }
  | { type: 'decrementZoom'; }
  | { type: 'reset' };
