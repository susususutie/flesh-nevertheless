import { type HTMLAttributes } from "react";
import {
  type Edge,
  type EdgeChange,
  type EdgeTypes,
  type Node,
  type NodeChange,
  type NodeTypes,
  type Viewport,
} from ".";

/**
 * 如果使用自定义节点:
 * type MyNode = Node | CustomNode
 */
export type RootPropsType<
  NodeType extends Node = Node,
  EdgeType extends Edge = Edge,
> = HTMLAttributes<HTMLDivElement> & {
  minZoom?: number;
  maxZoom?: number;

  /**
   * 非受控模式，默认节点，不会自动更新
   */
  defaultNodes?: NodeType[];
  /**
   * 手动传入 nodes 时，受控模式
   */
  nodes?: NodeType[];
  onNodesChange?: (changes: NodeChange[]) => void;

  /**
   * 非受控模式，默认边，不会自动更新
   */
  defaultEdges?: EdgeType[];
  /**
   * 手动传入 edges 时，受控模式
   */
  edges?: EdgeType[];
  onEdgesChange?: (changes: EdgeChange[]) => void;

  /**
   * 自定义节点类型映射表。
   * key 对应 node.type，value 为用户自定义组件。
   * 必须用 useMemo 或在组件外定义，以避免每次渲染重建导致 bug。
   */
  nodeTypes?: NodeTypes<NodeType>;
  /**
   * 自定义边类型映射表。
   * key 对应 edge.type，value 为用户自定义组件。
   * 必须用 useMemo 或在组件外定义。
   */
  edgeTypes?: EdgeTypes<EdgeType>;

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
