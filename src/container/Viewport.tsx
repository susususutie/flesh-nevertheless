import type { ReactNode } from "react";
import useReactive from "../hooks/useReactive";

export default function Viewport({ children }: { children: ReactNode }) {
  const reactive = useReactive();
  const transform = `translate(${reactive.transform.x}px,${reactive.transform.y}px) scale(${reactive.transform.zoom / 100})`;

  return (
    <div
      className="react-flow__viewport"
      style={{
        position: "absolute",
        width: "100%",
        height: "100%",
        top: 0,
        left: 0,
        transformOrigin: "0 0",
        willChange: "transform",
        transform,
      }}
    >
      {children}
    </div>
  );
}
