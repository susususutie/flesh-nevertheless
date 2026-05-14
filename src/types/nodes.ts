import type { XYPosition } from ".";
import type { CSSProperties, ComponentType } from "react";

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

/** 用户输入的节点类型, 包含业务数据和节点配置，节点配置可能为空 */
export type Node<
  NodeData extends Record<string, unknown> = Record<string, unknown>,
  NodeType extends string | undefined = string | undefined,
> = NodeBase<NodeData, NodeType> & {
  style?: CSSProperties;
  className?: string;
};

/** 内部存储的节点类型，包含测量信息和处理后的非空节点配置 */
export type InternalNode<NodeType extends Node = Node> = NodeType & {
  internals: {
    // positionAbsolute: XYPosition;
    measured: { width?: number; height?: number };
    zIndex: number;
    // bounds
  };
};

/** 节点类型映射表 */
export type NodeTypes<NodeType extends Node = Node> = Record<
  string,
  ComponentType<NodeProps<NodeType>>
>;

export type NodeLookup<NodeType extends InternalNode = InternalNode> = Map<string, NodeType>;

/**
 * 注入给自定义节点的 props， 包含节点的基本信息和处理后的非空节点配置
 * @example
 * ```tsx
 *
 *export type CounterNode = Node<{ initialCount?: number }, 'counter'>;
 *
 *export default function CounterNode(props: NodeProps<CounterNode>) {
 *  const [count, setCount] = useState(props.data?.initialCount ?? 0);
 *
 *  return (
 *    <>
 *      <p>Count: {count}</p>
 *      <button onClick={() => setCount(count + 1)}>
 *        Increment
 *      </button>
 *    </>
 *  );
 *}
 *```
 */
export type NodeProps<NodeType extends Node = Node> = Pick<
  NodeType,
  "id" | "data" | "width" | "height" | "style" | "className"
> &
  Required<
    Pick<
      NodeType,
      | "type"
      | "draggable"
      | "selectable"
      | "connectable"
      | "deletable"
      | "dragging"
      | "selected"
      | "zIndex"
    >
  > & {
    rfId: string;
    /** Whether a node is connectable or not. */
    positionAbsoluteX: number;
    positionAbsoluteY: number;
  };
