import { createContext } from "react";
import { type StoreAction } from "../types";

export default createContext<React.ActionDispatch<[StoreAction]>>(null)
