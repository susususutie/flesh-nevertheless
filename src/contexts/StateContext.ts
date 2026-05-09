import { createContext } from "react";
import { type StoreStateType } from "../types";

export default createContext<StoreStateType | undefined>(undefined);
