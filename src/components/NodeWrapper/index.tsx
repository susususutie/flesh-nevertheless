import { type PointerEvent as ReactPointerEvent, useEffect, useRef } from "react";
import useData from "../../hooks/useData";
import useDispatch from "../../hooks/useDispatch";
import useReactive from "../../hooks/useReactive";
import NodeIdContext from "../../contexts/NodeIdContext";
import { builtinNodeTypes } from "./utils.ts";
import { type EdgeChange, type NodeChange, type InternalNode, type Node } from "../../types";

type NodeWrapperProps = {
  id: string;
  noDragClassName?: string;
  nodesConnectable: boolean;
  nodesDraggable: boolean;
  nodesSelectable: boolean;
};

export default function NodeWrapper(props: NodeWrapperProps) {
  const {
    id,
    noDragClassName = "nodrag",
    nodesConnectable,
    nodesDraggable,
    nodesSelectable,
  } = props;
  const data = useData();
  const dispatch = useDispatch();
  const reactive = useReactive();
  const nodeRef = useRef<HTMLDivElement | null>(null);
  const dragRef = useRef<{
    pointerId: number;
    startClientX: number;
    startClientY: number;
    startPositions: Map<string, { x: number; y: number }>;
    moved: boolean;
  } | null>(null);

  const node = data.nodeLookup.get(id) as InternalNode<Node>;

  const nodeInternals = node.internals;
  const nodeType = node.type || "default";
  const NodeComponent =
    data.nodeTypes[nodeType] ||
    builtinNodeTypes[nodeType as keyof typeof builtinNodeTypes] ||
    data.nodeTypes.default ||
    builtinNodeTypes.default;

  // 监听节点大小变化，更新测量数据
  // TODO: 优化性能，将 ResizeObserver 提取到上层组件，所有节点共享一个 ResizeObserver，并将更新操作批量切片处理
  useEffect(() => {
    const el = nodeRef.current;
    if (!el || node.hidden) return;

    const update = () => {
      const width = el.offsetWidth;
      const height = el.offsetHeight;
      dispatch({ type: "updateInternalNodeMeasured", payload: { id, width, height } });
    };
    const ro = new ResizeObserver(update);
    ro.observe(el);

    return () => ro.disconnect();
  }, [dispatch, id, node.hidden]);

  if (node.hidden) return null;

  const isSelectable = !!(
    node.selectable ||
    (nodesSelectable && typeof node.selectable === "undefined")
  );
  const isDeletable = true; //!!(node.deletable || (nodesDeletable && typeof node.deletable === "undefined"));
  const isDraggable = !!(
    node.draggable ||
    (nodesDraggable && typeof node.draggable === "undefined")
  );
  const isConnectable = !!(
    node.connectable ||
    (nodesConnectable && typeof node.connectable === "undefined")
  );

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
      nodeChanges.push({ id, type: "select", selected: !node.selected });
      applyChanges(nodeChanges, edgeChanges);
      return;
    }

    for (const n of data.nodes) {
      const selected = n.id === id;
      if (!!n.selected !== selected) {
        nodeChanges.push({ id: n.id, type: "select", selected });
      }
    }
    for (const e of data.edges) {
      if (e.id && e.selected) edgeChanges.push({ id: e.id, type: "select", selected: false });
    }

    applyChanges(nodeChanges, edgeChanges);
  };

  const isTargetInNoDrag = (target: Element): boolean => {
    const el = nodeRef.current;
    if (!el) return false;
    let current: Element | null = target;
    while (current && current !== el) {
      if (current.classList.contains(noDragClassName)) return true;
      current = current.parentElement;
    }
    return false;
  };

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;

    if (isTargetInNoDrag(event.target as Element)) return;

    event.preventDefault();
    event.stopPropagation();

    selectNode(event);

    if (node.draggable === false) return;

    const el = nodeRef.current;
    if (!el) return;
    el.setPointerCapture(event.pointerId);

    const selectedIds = data.nodes.filter((n) => n.selected).map((n) => n.id);
    const moveIds = node.selected && selectedIds.length > 0 ? selectedIds : ([id] as string[]);

    dragRef.current = {
      pointerId: event.pointerId,
      startClientX: event.clientX,
      startClientY: event.clientY,
      moved: false,
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

    if (!drag.moved) {
      drag.moved = true;
    }

    event.preventDefault();
    event.stopPropagation();

    const zoom = reactive.transform[2] || 1;
    const dx = (event.clientX - drag.startClientX) / zoom;
    const dy = (event.clientY - drag.startClientY) / zoom;

    const nodeChanges: NodeChange[] = [];
    for (const [nid, startPos] of drag.startPositions) {
      nodeChanges.push({
        id: nid,
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

    dragRef.current = null;
  };

  const wrapperStyle: React.CSSProperties = {
    position: "absolute",
    top: 0,
    left: 0,
    transform: `translate(${node.position.x}px, ${node.position.y}px)`,
    zIndex: node.zIndex ?? 0,
    border: node.selected ? "1px solid #2563eb" : "1px solid transparent",
    borderRadius: 8,
    cursor: node.draggable === false ? "default" : "grab",
  };

  return (
    <div
      ref={nodeRef}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={wrapperStyle}
      className={`react-flow__node react-flow__node-${nodeType}`}
    >
      <NodeIdContext.Provider value={id}>
        <NodeComponent
          id={node.id}
          type={nodeType}
          data={node.data}
          selected={!!node.selected}
          dragging={!!node.dragging}
          width={node.width}
          height={node.height}
          positionAbsoluteX={node.position.x}
          positionAbsoluteY={node.position.y}
          zIndex={nodeInternals.zIndex}
          connectable={isConnectable}
          deletable={isDeletable}
          draggable={isDraggable}
          selectable={isSelectable}
        />
      </NodeIdContext.Provider>
    </div>
  );
}
