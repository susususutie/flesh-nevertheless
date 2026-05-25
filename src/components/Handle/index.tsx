import type { CSSProperties } from "react";
import type { HandleType, PositionType } from "../../types";

const handleStyle: CSSProperties = {
  width: 4,
  height: 4,
  position: "absolute",
  backgroundColor: "red",
};

type HandleProps = {
  id: string;
  nodeId: string;
  type: HandleType;
  position: PositionType;
};

export default function Handle(props: HandleProps) {
  const { id, nodeId, type, position } = props;
  return (
    <div
      data-role="handle"
      data-handle-id={id}
      data-handle-pos={position}
      data-handle-type={type}
      data-nodeid={nodeId}
      className={`react-flow__handle react-flow__handle-${type}`}
      style={{
        ...handleStyle,
        ...(position === "top" && {
          top: 0,
          left: "50%",
          transform: "translateX(-50%) translateY(-50%)",
        }),
        ...(position === "right" && {
          right: 0,
          top: "50%",
          transform: "translateX(-50%) translateY(-50%)",
        }),
        ...(position === "bottom" && {
          bottom: 0,
          left: "50%",
          transform: "translateX(-50%) translateY(-50%)",
        }),
        ...(position === "left" && {
          left: 0,
          top: "50%",
          transform: "translateX(-50%) translateY(-50%)",
        }),
      }}
    ></div>
  );
}
