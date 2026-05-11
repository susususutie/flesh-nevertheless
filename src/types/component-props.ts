import { type HTMLAttributes } from "react";
import { type Viewport } from ".";

export type RootPropsType = HTMLAttributes<HTMLDivElement> & {
  minZoom?: number;
  maxZoom?: number;

  defaultViewport?: Viewport;
  /**
   * 手动传入 viewport 时，受控模式，viewport 变更时触发 onViewportChange
   */
  viewport?: Viewport;
  onViewportChange?: (viewport: Viewport) => void;
};
