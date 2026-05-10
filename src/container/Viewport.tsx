import type { ReactNode } from "react";
import useReactive from "../hooks/useReactive";

export default function Viewport({ children }: { children: ReactNode }) {
  const reactive = useReactive();
  const transform = `translate(${reactive.canvasTransform.x}px,${reactive.canvasTransform.y}px) scale(${reactive.canvasTransform.zoom / 100})`;

  return (
    <div
      className="react-flow__viewport"
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        transform,
      }}
    >
      {children}
    </div>
  );
}
