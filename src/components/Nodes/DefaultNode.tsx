import { type NodeProps } from "../../types";

export default function DefaultNode(props: NodeProps) {
  const data = props.data;
  const raw =
    data && typeof data === "object" && "label" in data
      ? (data as Record<string, unknown>).label
      : undefined;
  const label = typeof raw === "string" ? raw : "";

  return (
    <div
      style={{
        padding: "10px 16px",
        display: "flex",
        flexDirection: "column",
        minWidth: 80,
        background: "#fff",
        border: "1px solid #e5e5e5",
        borderRadius: 8,
        fontSize: 13,
        boxShadow: props.selected
          ? "0 0 0 2px #2563eb, 0 2px 6px rgba(0,0,0,0.1)"
          : "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ fontSize: 11, color: "#999", marginBottom: 2 }}>{props.type || "default"}</div>
      <div style={{ fontWeight: 600 }}>{label || props.id}</div>
    </div>
  );
}
