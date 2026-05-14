import { type PointerEvent as ReactPointerEvent, useLayoutEffect, useRef } from "react";
import useData from "../hooks/useData";
import useDispatch from "../hooks/useDispatch";
import useReactive from "../hooks/useReactive";
import { type EdgeChange, type NodeBase, type NodeChange } from "../types";

export default function NodeRenderer() {
  const { nodes } = useData();

  return (
    <div
      className="react-flow__nodes"
      style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}
    >
      {nodes.map((node) => (
        <NodeWrapper key={node.id} node={node} />
      ))}
    </div>
  );
}

function NodeWrapper(props: { node: NodeBase }) {
  const { node } = props;
  const data = useData();
  const dispatch = useDispatch();
  const reactive = useReactive();
  const rootRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startPositions: Map<string, { x: number; y: number }>;
  } | null>(null);

  const label =
    node.data && typeof node.data === "object" && "label" in node.data
      ? (node.data as { label?: unknown }).label
      : undefined;

  useLayoutEffect(() => {
    const el = rootRef.current;
    if (!el) return;

    const update = () => {
      const rect = el.getBoundingClientRect();
      const zoom = reactive.transform[2] || 1;
      dispatch({
        type: "setNodeLayout",
        payload: { id: node.id, width: rect.width / zoom, height: rect.height / zoom },
      });
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    return () => ro.disconnect();
  }, [dispatch, node.id, reactive.transform[2]]);

  const applyChanges = (nodeChanges: NodeChange[], edgeChanges: EdgeChange[]) => {
    if (nodeChanges.length > 0) data.onNodesChange?.(nodeChanges);
    if (edgeChanges.length > 0) data.onEdgesChange?.(edgeChanges);

    if (nodeChanges.length > 0) {
      dispatch({ type: "applyNodeChanges", payload: nodeChanges });
    }
    if (edgeChanges.length > 0) {
      dispatch({ type: "applyEdgeChanges", payload: edgeChanges });
    }
  };

  const selectNode = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (node.selectable === false) return;

    const multi = event.shiftKey || event.metaKey || event.ctrlKey;
    const nodeChanges: NodeChange[] = [];
    const edgeChanges: EdgeChange[] = [];

    if (multi) {
      nodeChanges.push({ id: node.id, type: "select", selected: !node.selected });
      applyChanges(nodeChanges, edgeChanges);
      return;
    }

    for (const n of data.nodes) {
      const selected = n.id === node.id;
      if (!!n.selected !== selected) {
        nodeChanges.push({ id: n.id, type: "select", selected });
      }
    }
    for (const e of data.edges) {
      if (e.id && e.selected) edgeChanges.push({ id: e.id, type: "select", selected: false });
    }

    applyChanges(nodeChanges, edgeChanges);
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    if (node.draggable === false) return;

    event.preventDefault();
    event.stopPropagation();

    selectNode(event);

    const el = rootRef.current;
    if (!el) return;
    el.setPointerCapture(event.pointerId);

    const selectedIds = data.nodes.filter((n) => n.selected).map((n) => n.id);
    const moveIds = node.selected && selectedIds.length > 0 ? selectedIds : ([node.id] as string[]);

    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      startPositions: new Map(
        data.nodes
          .filter((n) => moveIds.includes(n.id))
          .map((n) => [n.id, { x: n.position.x, y: n.position.y }] as const),
      ),
    };
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();
    event.stopPropagation();

    const zoom = reactive.transform[2] || 1;
    const dx = (event.clientX - drag.startClientX) / zoom;
    const dy = (event.clientY - drag.startClientY) / zoom;

    const nodeChanges: NodeChange[] = [];
    for (const [id, startPos] of drag.startPositions) {
      nodeChanges.push({
        id,
        type: "position",
        position: { x: startPos.x + dx, y: startPos.y + dy },
        dragging: true,
      });
    }
    applyChanges(nodeChanges, []);
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;

    event.preventDefault();
    event.stopPropagation();
    dragRef.current = null;
  };

  return (
    <div
      ref={rootRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: `translate(${node.position.x}px, ${node.position.y}px)`,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        border: node.selected ? "1px solid #2563eb" : "1px solid #e5e5e5",
        borderRadius: 8,
        background: "#fff",
        boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
        minWidth: 80,
        cursor: node.draggable === false ? "default" : "grab",
      }}
    >
      <div style={{ fontSize: 12, color: "#666" }}>{node.type ?? "default"}</div>
      <div style={{ fontSize: 14, fontWeight: 600 }}>{node.id}</div>
      {typeof label === "string" ? <div style={{ marginTop: 6, fontSize: 13 }}>{label}</div> : null}
    </div>
  );
}
