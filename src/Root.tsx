
import StoreProvider from "./components/StoreProvider";
import StoreUpdater from "./components/StoreUpdater";

import { type RootPropsType } from "./types";
import { useId } from "react";


export default function Root(props: RootPropsType) {
  const { children, zoom } = props

  const id = `Comp-${useId()}`

  return <div id={id}>
    <StoreProvider id={id} zoom={zoom}>
      <StoreUpdater id={id} zoom={zoom} />
      {children}
    </StoreProvider>
  </div>
}
