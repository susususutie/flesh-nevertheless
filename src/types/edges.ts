import type { CSSProperties } from "react";

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
  // 展示固定为 8px
  // interactionWidth?: number;
};

export type Edge<
  EdgeData extends Record<string, unknown> = Record<string, unknown>,
  EdgeType extends string | undefined = string | undefined,
> = EdgeBase<EdgeData, EdgeType> & {
  style?: CSSProperties;
  className?: string;
};

export type EdgeLookup<EdgeType extends EdgeBase = EdgeBase> = Map<string, EdgeType>;
