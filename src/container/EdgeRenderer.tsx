import useData from "../hooks/useData";
import useDispatch from "../hooks/useDispatch";
import { type EdgeChange, type NodeChange } from "../types";

export default function EdgeRenderer() {
  const data = useData();
  const dispatch = useDispatch();
  const { edges, nodeLookup } = data;

  if (edges.length === 0) return null;

  return (
    <div
      className="react-flow__edges"
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 0,
      }}
    >
      {edges.map((edge) => {
        const source = nodeLookup.get(edge.source);
        const target = nodeLookup.get(edge.target);
        if (!source || !target) return null;

        const sWidth = source.measured?.width ?? source.width ?? 80;
        const sHeight = source.measured?.height ?? source.height ?? 40;
        const tWidth = target.measured?.width ?? target.width ?? 80;
        const tHeight = target.measured?.height ?? target.height ?? 40;

        const x1 = source.position.x + sWidth / 2;
        const y1 = source.position.y + sHeight / 2;
        const x2 = target.position.x + tWidth / 2;
        const y2 = target.position.y + tHeight / 2;

        const dx = Math.abs(x2 - x1);
        const c = Math.max(dx * 0.5, 60);
        const c1x = x1 + c;
        const c2x = x2 - c;
        const d = `M ${x1} ${y1} C ${c1x} ${y1} ${c2x} ${y2} ${x2} ${y2}`;

        const key = edge.id ?? `${edge.source}-${edge.target}`;
        return (
          <svg
            key={key}
            style={{
              position: "absolute",
              width: "100%",
              height: "100%",
              top: 0,
              left: 0,
              overflow: "visible",
              pointerEvents: "none",
              zIndex: edge.selected ? 1 : 0,
            }}
          >
            <path
              d={d}
              fill="none"
              stroke={edge.selected ? "#2563eb" : "#9ca3af"}
              strokeWidth={2}
              opacity={edge.animated ? 0.85 : 1}
              style={{ pointerEvents: "stroke" }}
              onPointerDown={(event) => {
                if (!edge.id) return;
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
                    const selected = e.id === edge.id;
                    if (e.id && !!e.selected !== selected) {
                      edgeChanges.push({ id: e.id, type: "select", selected });
                    }
                  }
                  for (const n of data.nodes) {
                    if (n.selected) nodeChanges.push({ id: n.id, type: "select", selected: false });
                  }
                }

                if (nodeChanges.length > 0) data.onNodesChange?.(nodeChanges);
                if (edgeChanges.length > 0) data.onEdgesChange?.(edgeChanges);

                if (nodeChanges.length > 0) {
                  dispatch({ type: "applyNodeChanges", payload: nodeChanges });
                }
                if (edgeChanges.length > 0) {
                  dispatch({ type: "applyEdgeChanges", payload: edgeChanges });
                }
              }}
            />
          </svg>
        );
      })}
    </div>
  );
}
