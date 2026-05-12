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

  /**
   * 是否允许鼠标滚轮缩放。
   * 默认值：true。
   *
   * 当同时开启 panOnScroll 时：仅在按住 Ctrl 键时触发缩放，否则滚轮用于平移。
   */
  zoomOnScroll?: boolean;
  /**
   * 是否允许触摸/触控板双指捏合缩放（touch pinch 与 Safari gesture）。
   * 默认值：true。
   */
  zoomOnPinch?: boolean;
  /**
   * 是否允许双击放大。
   * 默认值：true。
   */
  zoomOnDoubleClick?: boolean;
  /**
   * 是否允许滚轮平移（根据 deltaX/deltaY）。
   * 默认值：false。
   *
   * 当同时开启 zoomOnScroll 时：滚轮默认平移，按住 Ctrl 键时滚轮缩放。
   */
  panOnScroll?: boolean;
};
