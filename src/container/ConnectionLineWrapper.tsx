import useReactive from "../hooks/useReactive";
import useDispatch from "../hooks/useDispatch";
import { useEffect, useRef } from "react";

export default function ConnectionLineWrapper() {
  const reactive = useReactive();
  const dispatch = useDispatch();
  const paneRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    paneRef.current = document.querySelector<HTMLDivElement>(".react-flow__pane");
  }, []);

  useEffect(() => {
    const cs = reactive.connectionState;
    if (!cs?.source) return;

    const onPointerMove = (event: PointerEvent) => {
      dispatch({
        type: "setConnectionMove",
        payload: { clientX: event.clientX, clientY: event.clientY },
      });

      const el = document.elementFromPoint(event.clientX, event.clientY);
      const handleEl = el?.closest<HTMLDivElement>("[data-role='handle']");
      if (handleEl) {
        const nid = handleEl.getAttribute("data-nodeid") || "";
        const hid = handleEl.getAttribute("data-handle-id") || "";
        const htype = handleEl.getAttribute("data-handle-type") || "";
        const hpos = handleEl.getAttribute("data-handle-pos") || "";
        if (htype === "target") {
          dispatch({
            type: "setConnectionTarget",
            payload: { nodeId: nid, handleId: hid, type: htype as any, position: hpos as any },
          });
          return;
        }
      }
      dispatch({ type: "setConnectionTarget", payload: null });
    };

    const onPointerUp = () => {
      const currentState = reactive.connectionState;
      if (currentState?.target && currentState.isValid) {
        dispatch({
          type: "applyEdgeChanges",
          payload: [
            {
              type: "add",
              item: {
                id: "",
                source: currentState.source.nodeId,
                target: currentState.target.nodeId,
                sourceHandle: currentState.source.handleId,
                targetHandle: currentState.target.handleId,
              },
            },
          ],
        });
      }
      dispatch({ type: "setConnectionEnd" });
    };

    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);
    return () => {
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
  }, [
    reactive.connectionState?.source,
    reactive.connectionState?.source?.nodeId,
    reactive.connectionState?.source?.handleId,
    dispatch,
    reactive.connectionState,
  ]);

  const cs = reactive.connectionState;
  if (!cs?.source) return null;

  const pane = paneRef.current;
  const paneRect = pane?.getBoundingClientRect();
  if (!paneRect) return null;

  const x1 = cs.source.x - paneRect.left;
  const y1 = cs.source.y - paneRect.top;
  const mx = cs.mousePosition ? cs.mousePosition.x - paneRect.left : x1;
  const my = cs.mousePosition ? cs.mousePosition.y - paneRect.top : y1;
  const midX = (x1 + mx) / 2;
  const path = `M ${x1} ${y1} C ${midX} ${y1} ${midX} ${my} ${mx} ${my}`;

  return (
    <svg
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        pointerEvents: "none",
        zIndex: 10,
      }}
    >
      <path
        d={path}
        fill="none"
        stroke={cs.isValid ? "#2563eb" : "#ef4444"}
        strokeWidth={2}
        strokeDasharray="5 5"
      />
    </svg>
  );
}
