import type { XYPosition } from ".";
import type { CSSProperties } from "react";

export type NodeBase<
  NodeData extends Record<string, unknown> = Record<string, unknown>,
  NodeType extends string | undefined = string | undefined,
> = {
  /** unique id */
  id: string;
  /** node type, include builtin type and custom type */
  type?: NodeType;
  // 暂时固定为 [0, 0] left-top
  // origin: NodeOrigin
  position: XYPosition;
  /** business data */
  data?: NodeData;

  width?: number;
  height?: number;
  hidden?: boolean;
  zIndex?: number;

  draggable?: boolean;
  selectable?: boolean;
  connectable?: boolean;
  deletable?: boolean;

  dragging?: boolean;
  selected?: boolean;
};

/** 用户输入的节点类型 */
export type Node<
  NodeData extends Record<string, unknown> = Record<string, unknown>,
  NodeType extends string | undefined = string | undefined,
> = NodeBase<NodeData, NodeType> & {
  style?: CSSProperties;
  className?: string;
};

/** 内部存储的节点类型 */
export type InternalNode<TNode extends Node = Node> = TNode & {
  // 测量后的真实尺寸
  measured: { width?: number; height?: number };
  // 等等其他内部数据
  // internals: {};
};

export type NodeLookup<NodeType extends InternalNode = InternalNode> = Map<string, NodeType>;
