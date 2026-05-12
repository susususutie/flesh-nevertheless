import { useEffect, useRef, type ReactNode, useCallback } from "react";
import useDispatch from "../hooks/useDispatch";
import useData from "../hooks/useData";
import PanZoom from "../helper/PanZoom";
import { type Transform, type RootPropsType } from "../types";

type ZoomPaneProps = {
  children: ReactNode;
  isControlledViewport: boolean;
} & Pick<RootPropsType, "onViewportChange">;

/**
 * TODO 实现有问题
 
 */
export default function ZoomPane(props: ZoomPaneProps) {
  const { children, isControlledViewport, onViewportChange } = props;

  const dispatch = useDispatch();
  const data = useData();

  const rootRef = useRef<HTMLDivElement | null>(null);

  const onTransformChange = useCallback(
    (transform: Transform) => {
      onViewportChange?.({ x: transform[0], y: transform[1], zoom: transform[2] });

      if (!isControlledViewport) {
        dispatch({ type: "transform", payload: transform });
      }
    },
    [onViewportChange, isControlledViewport],
  );

  const panZoom = useRef<PanZoom | null>(null);
  useEffect(() => {
    if (rootRef.current) {
      panZoom.current = new PanZoom({
        el: rootRef.current,
        minZoom: data.minZoom,
        maxZoom: data.maxZoom,
        viewport: data.defaultViewport,
        isInteractive: data.isInteractive,
        zoomOnScroll: data.zoomOnScroll,
        zoomOnPinch: data.zoomOnPinch,
        zoomOnDoubleClick: data.zoomOnDoubleClick,
        panOnScroll: data.panOnScroll,
        onTransformChange,
      });
      dispatch({ type: "setPanZoom", payload: panZoom.current });
      return () => {
        panZoom.current?.destroy();
        dispatch({ type: "setPanZoom", payload: null });
      };
    }
  }, []);

  useEffect(() => {
    panZoom.current?.setOptions({
      isInteractive: data.isInteractive,
      zoomOnScroll: data.zoomOnScroll,
      zoomOnPinch: data.zoomOnPinch,
      zoomOnDoubleClick: data.zoomOnDoubleClick,
      panOnScroll: data.panOnScroll,
    });
  }, [
    data.isInteractive,
    data.zoomOnScroll,
    data.zoomOnPinch,
    data.zoomOnDoubleClick,
    data.panOnScroll,
  ]);

  return (
    <div
      ref={rootRef}
      className="react-flow__renderer"
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        touchAction: "none",
      }}
    >
      {children}
    </div>
  );
}
