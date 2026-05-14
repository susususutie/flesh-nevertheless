import BaseEdge from "./BaseEdge";
import { type EdgeProps } from "../../types";

export default function SmoothStepEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, selected, interactionWidth } = props;
  const midX = (sourceX + targetX) / 2;
  const r = Math.min(Math.abs(targetY - sourceY) * 0.5, Math.abs(targetX - sourceX) * 0.25, 20);
  const path = [
    `M ${sourceX} ${sourceY}`,
    `L ${midX - r} ${sourceY}`,
    `A ${r} ${r} 0 0 1 ${midX} ${sourceY + Math.sign(targetY - sourceY) * r}`,
    `L ${midX} ${targetY - Math.sign(targetY - sourceY) * r}`,
    `A ${r} ${r} 0 0 0 ${midX + r} ${targetY}`,
    `L ${targetX} ${targetY}`,
  ].join(" ");

  return (
    <BaseEdge
      path={path}
      interactionWidth={interactionWidth}
      style={{ stroke: selected ? "#2563eb" : "#9ca3af", strokeWidth: 2 }}
    />
  );
}
