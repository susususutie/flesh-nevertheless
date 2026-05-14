import BaseEdge from "./BaseEdge";
import { type EdgeProps } from "../../types";

export default function StepEdge(props: EdgeProps) {
  const { sourceX, sourceY, targetX, targetY, selected, interactionWidth } = props;
  const midX = (sourceX + targetX) / 2;
  const path = `M ${sourceX} ${sourceY} L ${midX} ${sourceY} L ${midX} ${targetY} L ${targetX} ${targetY}`;

  return (
    <BaseEdge
      path={path}
      interactionWidth={interactionWidth}
      style={{ stroke: selected ? "#2563eb" : "#9ca3af", strokeWidth: 2 }}
    />
  );
}
