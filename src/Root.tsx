import StoreProvider from "./components/StoreProvider";
import StoreUpdater from "./components/StoreUpdater";
import NodeRenderer from "./container/NodeRenderer";
import Pane from "./container/Pane";
import FlowViewport from "./container/Viewport";
import ZoomPane from "./container/ZoomPane";
import { type RootPropsType, type Viewport } from "./types";
import { memo, useId, type CSSProperties } from "react";

const initViewport: Viewport = { x: 0, y: 0, zoom: 1 };

function Root(props: RootPropsType) {
  const {
    id: _id,
    style,
    children,
    minZoom,
    maxZoom,
    defaultViewport = initViewport,
    viewport,
    onViewportChange,
    zoomOnScroll,
    zoomOnPinch,
    zoomOnDoubleClick,
    panOnScroll,
  } = props;

  const id = _id ?? `Root-${useId()}`;
  // console.log("Root render", id);

  return (
    <div
      id={id}
      style={{ position: "relative", width: "100%", height: "100%", overflow: "hidden", ...style }}
    >
      {/* 根据 props 初始化全局状态  */}
      <StoreProvider
        id={id}
        minZoom={minZoom}
        maxZoom={maxZoom}
        defaultViewport={defaultViewport}
        viewport={viewport}
        onViewportChange={onViewportChange}
        zoomOnScroll={zoomOnScroll}
        zoomOnPinch={zoomOnPinch}
        zoomOnDoubleClick={zoomOnDoubleClick}
        panOnScroll={panOnScroll}
      >
        {/* 后续 props 变更，同步到全局状态 */}
        <StoreUpdater
          minZoom={minZoom}
          maxZoom={maxZoom}
          defaultViewport={defaultViewport}
          viewport={viewport}
          zoomOnScroll={zoomOnScroll}
          zoomOnPinch={zoomOnPinch}
          zoomOnDoubleClick={zoomOnDoubleClick}
          panOnScroll={panOnScroll}
        />
        <ZoomPane isControlledViewport={!!viewport} onViewportChange={onViewportChange}>
          <Pane>
            <FlowViewport>
              <NodeRenderer />
            </FlowViewport>
          </Pane>
        </ZoomPane>
        {children}
      </StoreProvider>
    </div>
  );
}

/** 深度比较 style 对象是否相等，不同应用若属性/值全相等也认为是相等 */
function styleAreEqual(
  prevStyle: undefined | null | CSSProperties,
  nextStyle: undefined | null | CSSProperties,
) {
  // 引用相同或都为 null/undefined
  if (prevStyle === nextStyle) return true;
  if (!prevStyle || !nextStyle) return false;

  // 获取所有 keys
  const prevKeys = Object.keys(prevStyle) as (keyof CSSProperties)[];
  const nextKeys = Object.keys(nextStyle) as (keyof CSSProperties)[];

  // 数量不同
  if (prevKeys.length !== nextKeys.length) return false;

  // 比较每个属性值（使用 Object.is）
  for (let key of prevKeys) {
    if (!Object.is(prevStyle[key], nextStyle[key])) {
      return false;
    }
  }

  return true;
}

// 自定义比较函数：style 深度比较，其他 props 浅比较
function propsAreEqual<P extends object>(prevProps: Readonly<P>, nextProps: Readonly<P>): boolean {
  // 快速路径：引用相同
  if (prevProps === nextProps) return true;

  // 获取所有 props keys
  const allKeys = new Set<keyof P>([
    ...(Object.keys(prevProps) as (keyof P)[]),
    ...(Object.keys(nextProps) as (keyof P)[]),
  ]);

  for (let key of allKeys) {
    const prevValue = prevProps[key];
    const nextValue = nextProps[key];

    // style 使用自定义比较
    if (key === ("style" as keyof P)) {
      if (!styleAreEqual(prevValue as CSSProperties, nextValue as CSSProperties)) {
        return false;
      }
    }
    // 其他 props 使用 Object.is 浅比较（React 默认方式）
    else {
      if (!Object.is(prevValue, nextValue)) {
        return false;
      }
    }
  }

  return true;
}

/** 若仅 style 发生变化，则判断内部具体是否改变 */
export default memo(Root, propsAreEqual);
