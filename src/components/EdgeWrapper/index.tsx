import { getEdgePosition } from "../../helper/utils";
import useData from "../../hooks/useData";
import useDispatch from "../../hooks/useDispatch";
import { type Edge, type EdgeChange, type InternalNode, type NodeChange } from "../../types";
import { builtinEdgeTypes } from "./utils";

type EdgeWrapperProps = {
  id: string;
};

export default function EdgeWrapper(props: EdgeWrapperProps) {
  const { id } = props;
  const data = useData();
  const dispatch = useDispatch();
  const { nodeLookup, edgeLookup } = data;

  const edge = edgeLookup.get(id) as Edge | undefined;
  if (!edge || edge.hidden) return null;

  const source = nodeLookup.get(edge.source) as InternalNode | undefined;
  const target = nodeLookup.get(edge.target) as InternalNode | undefined;
  if (!source || !target) return null;

  const edgePosition = getEdgePosition(
    source,
    target,
    edge.sourceHandle || null,
    edge.targetHandle || null,
  );

  if (!edgePosition) return null;

  const { sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition } = edgePosition;

  const edgeType = edge.type || "default";
  const EdgeComponent =
    data.edgeTypes[edgeType] ||
    builtinEdgeTypes[edgeType as keyof typeof builtinEdgeTypes] ||
    data.edgeTypes.default ||
    builtinEdgeTypes.default;

  const handleSelect = (event: React.PointerEvent) => {
    if (!edge.id) return;
    if (edge.selectable === false) return;
    if (event.button !== 0) return;
    event.preventDefault();
    event.stopPropagation();

    const multi = event.shiftKey || event.metaKey || event.ctrlKey;
    const edgeChanges: EdgeChange[] = [];
    const nodeChanges: NodeChange[] = [];

    if (multi) {
      edgeChanges.push({ id: edge.id, type: "select", selected: !edge.selected });
    } else {
      for (const e of data.edges) {
        const isTarget = e.id === edge.id;
        if (e.id && !!e.selected !== isTarget) {
          edgeChanges.push({ id: e.id, type: "select", selected: isTarget });
        }
      }
      for (const n of data.nodes) {
        if (n.selected) nodeChanges.push({ id: n.id, type: "select", selected: false });
      }
    }

    if (nodeChanges.length > 0) data.onNodesChange?.(nodeChanges);
    if (edgeChanges.length > 0) data.onEdgesChange?.(edgeChanges);

    if (nodeChanges.length > 0 && !data.nodesControlled) {
      dispatch({ type: "applyNodeChanges", payload: nodeChanges });
    }
    if (edgeChanges.length > 0 && !data.edgesControlled) {
      dispatch({ type: "applyEdgeChanges", payload: edgeChanges });
    }
  };

  const interactionWidth = edge.interactionWidth ?? 20;

  return (
    <svg
      key={id}
      data-flow-edge=""
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        overflow: "visible",
        zIndex: edge.zIndex ?? (edge.selected ? 1 : 0),
      }}
      className={`react-flow__edge react-flow__edge-${edgeType}`}
    >
      <g onPointerDown={handleSelect} style={{ cursor: "pointer" }}>
        <EdgeComponent
          id={edge.id}
          type={edgeType}
          data={edge.data}
          selected={!!edge.selected}
          source={edge.source}
          target={edge.target}
          sourceX={sourceX}
          sourceY={sourceY}
          targetX={targetX}
          targetY={targetY}
          sourcePosition={sourcePosition}
          targetPosition={targetPosition}
          interactionWidth={interactionWidth}
        />
      </g>
    </svg>
  );
}
