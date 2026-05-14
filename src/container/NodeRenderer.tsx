import useData from "../hooks/useData";
import NodeWrapper from "../components/NodeWrapper";

export default function NodeRenderer() {
  const { nodes } = useData();

  return (
    <div
      className="react-flow__nodes"
      style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}
    >
      {nodes.map((node) => (
        <NodeWrapper key={node.id} id={node.id} />
      ))}
    </div>
  );
}
