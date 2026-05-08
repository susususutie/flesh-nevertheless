import { useContext } from "react";
import StateContext from "../contexts/StateContext";


export default function useStore() {
  const value = useContext(StateContext)
  if (!value) {
    throw new Error('useStore must be used within a StateContext.Provider')
  }
  return value
}