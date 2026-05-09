import { useMemo, type ReactNode } from "react";

export default function Toolbar({
  position = "bottom-right",
  children,
}: {
  position?: "top-left" | "top-right" | "bottom-left" | "bottom-right";
  children: ReactNode;
}) {
  const style: React.CSSProperties = useMemo(
    () => ({
      position: "absolute",
      top: position === "top-left" || position === "top-right" ? 0 : undefined,
      left: position === "top-left" || position === "bottom-left" ? 0 : undefined,
      right: position === "top-right" || position === "bottom-right" ? 0 : undefined,
      bottom: position === "bottom-left" || position === "bottom-right" ? 0 : undefined,
      display: "flex",
      justifyContent:
        position === "top-left" || position === "bottom-left" ? "flex-start" : "flex-end",
      alignItems:
        position === "top-left" || position === "bottom-right" ? "flex-start" : "flex-end",
      gap: 16,
    }),
    [position],
  );

  return <div style={style}>{children}</div>;
}
