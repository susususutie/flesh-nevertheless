import DispatchContext from "../contexts/DispatchContext";
import { type ReactNode } from "react";
import { type StoreAction } from "../types";

export default function DispatchProvider(props: { children: ReactNode,value:React.ActionDispatch<[StoreAction]> }) {
  const { children,value } = props
  
  return <DispatchContext.Provider value={value}>
    {children}
  </DispatchContext.Provider>
}