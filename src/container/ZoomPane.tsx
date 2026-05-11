import { useEffect, useRef, type ReactNode, useCallback } from "react";
import useDispatch from "../hooks/useDispatch";
import useData from "../hooks/useData";
import useReactive from "../hooks/useReactive";
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
  const reactive = useReactive();

  const rootRef = useRef<HTMLDivElement | null>(null);
  const transform = useRef<Transform>(reactive.transform);
  const minZoomRef = useRef(data.minZoom);
  const maxZoomRef = useRef(data.maxZoom);
  const defaultViewportRef = useRef(data.defaultViewport);

  const lastPointerRef = useRef<{ x: number; y: number } | null>(null);

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
      });
      dispatch({ type: "setPanZoom", payload: panZoom.current });
      return () => {
        panZoom.current?.destroy();
        dispatch({ type: "setPanZoom", payload: null });
      };
    }
  }, []);

  const pinchStartDistanceRef = useRef<number | null>(null);
  const pinchStartZoomRef = useRef<number | null>(null);

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const getWheelFactor = (deltaY: number, sensitivity: number) => {
      const clamped = Math.max(Math.min(deltaY, 300), -300);
      return Math.exp(-clamped * sensitivity);
    };

    const getLocalPoint = (clientX: number, clientY: number) => {
      const rect = el.getBoundingClientRect();
      return { x: clientX - rect.left, y: clientY - rect.top };
    };

    const getCenterPoint = () => {
      const rect = el.getBoundingClientRect();
      return { x: rect.width / 2, y: rect.height / 2 };
    };

    const getDistance = (touches: TouchList) => {
      const [t1, t2] = [touches[0], touches[1]];
      const dx = t2.clientX - t1.clientX;
      const dy = t2.clientY - t1.clientY;
      return Math.hypot(dx, dy);
    };

    const getMidPoint = (touches: TouchList) => {
      const [t1, t2] = [touches[0], touches[1]];
      return { x: (t1.clientX + t2.clientX) / 2, y: (t1.clientY + t2.clientY) / 2 };
    };

    const dispatchZoomAroundPoint = (nextZoom: number, origin: { x: number; y: number }) => {
      const currentZoom = transform.current[2];
      if (!Number.isFinite(currentZoom) || currentZoom <= 0) return;

      const ratio = nextZoom / currentZoom;
      const currentX = transform.current[0];
      const currentY = transform.current[1];

      const nextX = origin.x - ratio * (origin.x - currentX);
      const nextY = origin.y - ratio * (origin.y - currentY);

      dispatch({ type: "transform", payload: [nextX, nextY, nextZoom] });
    };

    // TODO
    const onWheel = (e: WheelEvent) => {
      console.log("onWheel", e);
      const currentZoom = transform.current[2];
      const sensitivity = e.ctrlKey ? 0.01 : 0.003;
      const factor = getWheelFactor(e.deltaY, sensitivity);
      const nextZoomRaw = currentZoom * factor;
      const origin = getLocalPoint(e.clientX, e.clientY);
      lastPointerRef.current = origin;
      // dispatchZoomAroundPoint(nextZoomRaw, origin);
      e.preventDefault();
    };

    const onTouchStart = (e: TouchEvent) => {
      console.log("onTouchStart", e);
      if (e.touches.length !== 2) return;
      pinchStartDistanceRef.current = getDistance(e.touches);
      pinchStartZoomRef.current = transform.current[2];
      e.preventDefault();
    };

    const onTouchMove = (e: TouchEvent) => {
      console.log("onTouchMove", e);

      if (e.touches.length !== 2) return;

      const startDistance = pinchStartDistanceRef.current;
      const startZoom = pinchStartZoomRef.current;
      if (!startDistance || !startZoom) return;

      const currentDistance = getDistance(e.touches);
      if (!Number.isFinite(currentDistance) || currentDistance <= 0) return;

      const nextZoomRaw = startZoom * (currentDistance / startDistance);
      const mid = getMidPoint(e.touches);
      const origin = getLocalPoint(mid.x, mid.y);
      lastPointerRef.current = origin;
      dispatchZoomAroundPoint(nextZoomRaw, origin);

      e.preventDefault();
    };

    let gestureStartZoom: number | null = null;

    const onGestureStart = (e: Event) => {
      console.log("onGestureStart", e);
      gestureStartZoom = transform.current[2];
      (e as Event).preventDefault?.();
    };

    const onGestureChange = (e: Event) => {
      console.log("onGestureChange", e);
      if (gestureStartZoom === null) return;
      const scale = (e as any).scale;
      if (typeof scale !== "number" || !Number.isFinite(scale) || scale <= 0) return;
      const origin = lastPointerRef.current ?? getCenterPoint();
      dispatchZoomAroundPoint(gestureStartZoom * scale, origin);
      (e as Event).preventDefault?.();
    };

    const onGestureEnd = (e: Event) => {
      console.log("onGestureEnd", e);
      gestureStartZoom = null;
      (e as Event).preventDefault?.();
    };

    // const onDoubleClick = (e: MouseEvent) => {
    //   const currentZoom = zoomRef.current;
    //   const step = zoomStepRef.current || 10;
    //   const origin = getLocalPoint(e.clientX, e.clientY);
    //   lastPointerRef.current = origin;
    //   dispatchZoomAroundPoint(currentZoom + step, origin);
    //   e.preventDefault();
    // };

    const resetPinch = () => {
      pinchStartDistanceRef.current = null;
      pinchStartZoomRef.current = null;
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) resetPinch();
    };

    const onTouchCancel = () => {
      resetPinch();
    };

    el.addEventListener("wheel", onWheel, { passive: false });
    el.addEventListener("touchstart", onTouchStart, { passive: false });
    el.addEventListener("touchmove", onTouchMove, { passive: false });
    el.addEventListener("touchend", onTouchEnd);
    el.addEventListener("touchcancel", onTouchCancel);
    el.addEventListener("gesturestart", onGestureStart, {
      passive: false,
    } as AddEventListenerOptions);
    el.addEventListener("gesturechange", onGestureChange, {
      passive: false,
    } as AddEventListenerOptions);
    el.addEventListener("gestureend", onGestureEnd, { passive: false } as AddEventListenerOptions);

    return () => {
      el.removeEventListener("wheel", onWheel);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchmove", onTouchMove);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchCancel);
      el.removeEventListener("gesturestart", onGestureStart);
      el.removeEventListener("gesturechange", onGestureChange);
      el.removeEventListener("gestureend", onGestureEnd);
      // el.removeEventListener("dblclick", onDoubleClick);
    };
  }, [dispatch]);

  // ---------- 双击缩放 ----------
  useEffect(() => {
    const container = rootRef.current;
    if (!container) return;

    const onDoubleClick = (e: MouseEvent) => {
      e.preventDefault();
      if (!panZoom.current) return;
      panZoom.current.zoomIn({ x: e.clientX, y: e.clientY });
    };

    container.addEventListener("dblclick", onDoubleClick);
    return () => container.removeEventListener("dblclick", onDoubleClick);
  }, [dispatch]);

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
