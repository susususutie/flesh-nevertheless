import { type NodeProps, Position, HandleTypeEnum } from "../../types";
import Handle from "../Handle";

export default function InputNode(props: NodeProps) {
  const data = props.data;
  const raw =
    data && typeof data === "object" && "label" in data
      ? (data as Record<string, unknown>).label
      : undefined;
  const label = typeof raw === "string" ? raw : "";

  return (
    <>
      <Handle id="source" nodeId={props.id} type={HandleTypeEnum.Source} position={Position.Left} />
      <div style={{ fontSize: 11, color: "#3b82f6", marginBottom: 2, fontWeight: 600 }}>INPUT</div>
      <div style={{ fontWeight: 600 }}>{label || props.id}</div>
    </>
  );
}
