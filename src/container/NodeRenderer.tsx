export default function NodeRenderer() {
  const nodeIds = ["1", "2"];

  return (
    <div
      className="react-flow__nodes"
      style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}
    >
      {nodeIds.map((nodeId) => (
        <NodeWrapper key={nodeId} id={nodeId} />
      ))}
    </div>
  );
}

function NodeWrapper(props: { id: string }) {
  const { id } = props;

  return (
    <div
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        transform: `translate(0px, 0px)`,
        padding: 10,
        display: "flex",
        flexDirection: "column",
        border: "1px solid #ededed",
      }}
    >
      {id}
    </div>
  );
}
