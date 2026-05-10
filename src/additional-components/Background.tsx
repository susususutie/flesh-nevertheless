import useConfig from "../hooks/useConfig";
import useReactive from "../hooks/useReactive";

type BackgroundProps = {
  // variant?: string;
  id?: string;
  gap?: number | [number, number];
  size?: number;
  color?: string;
  bgColor?: string;
};

export default function Background(props: BackgroundProps) {
  const { id: _backgroundId, gap = 20, size = 2, color = "#cdcdcd", bgColor } = props;
  const { id } = useConfig();
  const reactive = useReactive();
  const { x, y, zoom } = reactive.canvasTransform;

  const scale = zoom / 100;
  const gapXY: [number, number] = Array.isArray(gap) ? gap : [gap, gap];
  const scaledGap: [number, number] = [gapXY[0] * scale || 1, gapXY[1] * scale || 1];
  const scaledSize = size * scale;
  const patternId = `pattern-${id}-${_backgroundId ?? ""}`;

  return (
    <svg
      className="react-flow__background"
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        zIndex: -1,
        backgroundColor: bgColor,
        pointerEvents: "none",
      }}
    >
      <pattern
        id={patternId}
        x={x % scaledGap[0]}
        y={y % scaledGap[1]}
        width={scaledGap[0]}
        height={scaledGap[1]}
        patternUnits="userSpaceOnUse"
        patternTransform={`transform: translate(-20.752, -20.752);`}
      >
        <circle cx={scaledSize / 2} cy={scaledSize / 2} r={scaledSize} fill={color} />
      </pattern>
      <rect x="0" y="0" width="100%" height="100%" fill={`url(#${patternId})`} />
    </svg>
  );
}
