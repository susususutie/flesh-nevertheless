import { useEffect, useRef, type ReactNode, useCallback } from "react";
import useDispatch from "../hooks/useDispatch";
import useData from "../hooks/useData";
import PanZoom from "../helper/PanZoom";
import { type Transform, type RootPropsType } from "../types";

type ZoomPaneProps = {
  children: ReactNode;
  isControlledViewport: boolean;
} & Pick<RootPropsType, "defaultViewport" | "onViewportChange">;

/**
 * TODO 实现有问题
 
 */
export default function ZoomPane(props: ZoomPaneProps) {
  const { children, isControlledViewport, onViewportChange } = props;

  const dispatch = useDispatch();
  const data = useData();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const minZoomRef = useRef(data.minZoom);
  const maxZoomRef = useRef(data.maxZoom);
  const defaultViewportRef = useRef(data.defaultViewport);

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
        minZoom: minZoomRef.current,
        maxZoom: maxZoomRef.current,
        viewport: defaultViewportRef.current,
        onTransformChange,
        zoomOnScroll: true,
        zoomOnPinch: true,
        zoomOnDoubleClick: true,
        panOnScroll: false,
      });
      dispatch({ type: "setPanZoom", payload: panZoom.current });
      return () => {
        panZoom.current?.destroy();
        dispatch({ type: "setPanZoom", payload: null });
      };
    }
  }, []);

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
