interface BaseEdgeProps {
  path: string;
  interactionWidth?: number;
  style?: React.CSSProperties;
  className?: string;
}

export default function BaseEdge({ path, interactionWidth = 20, style, className }: BaseEdgeProps) {
  return (
    <>
      <path d={path} fill="none" className={className} style={style} />
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
