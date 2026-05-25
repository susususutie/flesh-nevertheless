import { type Edge, type Node } from ".";

export type Transform = [x: number, y: number, zoom: number];
export type Viewport = {
  x: number;
  y: number;
  zoom: number;
};
export type XYPosition = {
  x: number;
  y: number;
};

export type NodeDimensions = {
  width: number;
  height: number;
};

export const Position = {
  Left: "left",
  Right: "right",
  Top: "top",
  Bottom: "bottom",
} as const;
export type PositionType = (typeof Position)[keyof typeof Position];
export const HandleTypeEnum = {
  Source: "source",
  Target: "target",
} as const;
export type HandleType = (typeof HandleTypeEnum)[keyof typeof HandleTypeEnum];
export type Handle = {
  id: string;
  nodeId: string;
  type: HandleType;
  position: PositionType;
  x: number;
  y: number;
  width: number;
  height: number;
};
export type StyleObject = Record<string, unknown>;

export type NodeChange<NodeType extends Node = Node> =
  | { id: string; type: "select"; selected: boolean }
  | { id: string; type: "position"; position: XYPosition; dragging?: boolean }
  | { id: string; type: "remove" }
  | { item: NodeType; type: "add"; index?: number | undefined };

export type EdgeChange<EdgeType extends Edge = Edge> =
  | { id: string; type: "select"; selected: boolean }
  | { id: string; type: "remove" }
  | { item: EdgeType; type: "add"; index?: number | undefined };
