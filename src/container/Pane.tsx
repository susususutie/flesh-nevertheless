import type { ReactNode } from "react";

export default function Pane({ children }: { children: ReactNode }) {
  return (
    <div
      className="react-flow__pane"
      style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}
    >
      {children}
    </div>
  );
}
