interface BaseEdgeProps {
  path: string;
  interactionWidth?: number;
  style?: React.CSSProperties;
  className?: string;
  markerEnd?: string;
  markerStart?: string;
}

export default function BaseEdge({
  path,
  interactionWidth = 20,
  style,
  className,
  markerEnd,
  markerStart,
}: BaseEdgeProps) {
  return (
    <>
      <path
        d={path}
        fill="none"
        className={className}
        style={style}
        markerEnd={markerEnd}
        markerStart={markerStart}
      />
      {interactionWidth > 0 && (
        <path
          d={path}
          fill="none"
          strokeOpacity={0}
          strokeWidth={interactionWidth}
          style={{ pointerEvents: "stroke" }}
        />
      )}
    </>
  );
}
