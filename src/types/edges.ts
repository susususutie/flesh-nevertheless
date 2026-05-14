import type { CSSProperties, ComponentType } from "react";

export type EdgePosition = {
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  // sourcePosition: Position;
  // targetPosition: Position;
};

export type EdgeBase<
  EdgeData extends Record<string, unknown> = Record<string, unknown>,
  EdgeType extends string | undefined = string | undefined,
> = {
  /** unique id */
  id: string;
  /** edge type, include builtin type and custom type */
  type?: EdgeType;
  data?: EdgeData;

  /** source node id */
  source: string;
  /** target node id */
  target: string;
  // 暂时不加 handle，后续再考虑
  // sourceHandle?: string | null;
  // targetHandle?: string | null;

  hidden?: boolean;
  animated?: boolean;
  deletable?: boolean;
  selectable?: boolean;
  zIndex?: number;

  selected?: boolean;
  interactionWidth?: number;
};

export type Edge<
  EdgeData extends Record<string, unknown> = Record<string, unknown>,
  EdgeType extends string | undefined = string | undefined,
> = EdgeBase<EdgeData, EdgeType> & {
  style?: CSSProperties;
  className?: string;
};

/** 边类型映射表 */
export type EdgeTypes<EdgeType extends Edge = Edge> = Record<
  string,
  ComponentType<EdgeProps<EdgeType>>
>;

export type EdgeLookup<EdgeType extends EdgeBase = EdgeBase> = Map<string, EdgeType>;

/**
 * 注入给自定义边的 props
 * @public
 */
export type EdgeProps<EdgeType extends Edge = Edge> = Pick<
  EdgeType,
  | "id"
  | "type"
  | "animated"
  | "data"
  | "style"
  | "selected"
  | "source"
  | "target"
  | "selectable"
  | "deletable"
> &
  EdgePosition &
  // EdgeLabelOptions &
  {
    interactionWidth?: number;
  };
