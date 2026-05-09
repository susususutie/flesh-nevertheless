import StoreProvider from "./components/StoreProvider";
import StoreUpdater from "./components/StoreUpdater";
import { memo, useId, type CSSProperties, type ReactNode } from "react";

type RootPropsType = {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  zoomStep?: number;

  style?: CSSProperties;
  children: ReactNode;
};

function Root(props: RootPropsType) {
  const { style, children, initialZoom, minZoom, maxZoom, zoomStep } = props;

  const id = `Root-${useId()}`;

  return (
    <div id={id} style={style}>
      {/* 根据 props 初始化全局状态  */}
      <StoreProvider
        id={id}
        initialZoom={initialZoom}
        zoomStep={zoomStep}
        minZoom={minZoom}
        maxZoom={maxZoom}
      >
        {/* 后续 props 变更，同步到全局状态 */}
        <StoreUpdater
          initialZoom={initialZoom}
          zoomStep={zoomStep}
          minZoom={minZoom}
          maxZoom={maxZoom}
        />
        {children}
      </StoreProvider>
    </div>
  );
}

export default memo(Root);
