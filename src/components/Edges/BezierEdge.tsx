import BaseEdge from "./BaseEdge";
import { type EdgeProps } from "../../types";

export default function BezierEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, selected, interactionWidth } = props;
  const dx = Math.abs(targetX - sourceX);
  const c = Math.max(dx * 0.5, 60);
  const c1x = sourceX + c;
  const c2x = targetX - c;
  const path = `M ${sourceX} ${sourceY} C ${c1x} ${sourceY} ${c2x} ${targetY} ${targetX} ${targetY}`;

  return (
    <BaseEdge
      path={path}
      interactionWidth={interactionWidth}
      style={{ stroke: selected ? "#2563eb" : "#9ca3af", strokeWidth: 2 }}
    />
  );
}
