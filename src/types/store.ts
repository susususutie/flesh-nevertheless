import PanZoom from "../helper/PanZoom";
import {
  type Edge,
  type EdgeChange,
  type EdgeTypes,
  type Node,
  type NodeChange,
  type NodeTypes,
  type Transform,
  type Viewport,
  type InternalNode,
  type NodeLookup,
  type EdgeLookup,
} from ".";

// 静态配置, 来自 props，初始化后不变（从 props 中获取初始化后恒定不变 ）
export type StoreConfig = {
  rfId: string;
  domNode: HTMLDivElement | null;
};

// data 业务状态，中低频变化（秒级/分钟级）
export type StoreData<NodeType extends Node = Node, EdgeType extends Edge = Edge> = {
  minZoom: number;
  maxZoom: number;

  nodes: NodeType[];
  edges: EdgeType[];
  nodeLookup: NodeLookup<InternalNode<NodeType>>;
  edgeLookup: EdgeLookup<EdgeType>;
  nodeTypes: NodeTypes<NodeType>;
  edgeTypes: EdgeTypes<EdgeType>;
  onNodesChange: ((changes: NodeChange<NodeType>[]) => void) | null;
  onEdgesChange: ((changes: EdgeChange<EdgeType>[]) => void) | null;

  defaultViewport: Viewport;
  panZoom: PanZoom | null;
  isInteractive: boolean;
  zoomOnScroll: boolean;
  zoomOnPinch: boolean;
  zoomOnDoubleClick: boolean;
  panOnScroll: boolean;
};

// reactive 实时状态，高频变化（帧级）
export type StoreReactive = {
  transform: Transform;
  // 其他交互状态
  mousePosition: { x: number; y: number };
  selectedPoint: { x: number; y: number } | null;
  isPanning: boolean;
};

export type StoreStateType<
  NodeType extends Node = Node,
  EdgeType extends Edge = Edge,
> = StoreConfig & StoreData<NodeType, EdgeType> & StoreReactive;

export type StoreAction =
  | { type: "setZoom"; payload: number }
  | { type: "transform"; payload: StoreReactive["transform"] }
  | { type: "syncViewport"; payload: Viewport }
  | { type: "setDefaultViewport"; payload: Viewport }
  // 更新节点测量尺寸
  | { type: "updateInternalNodeMeasured"; payload: { id: string; width: number; height: number } }
  | { type: "applyNodeChanges"; payload: NodeChange[] }
  | { type: "applyEdgeChanges"; payload: EdgeChange[] }
  | { type: "setMinZoom"; payload: number }
  | { type: "setMaxZoom"; payload: number }
  | { type: "setInteractivity"; payload: boolean }
  | { type: "toggleInteractivity" }
  | { type: "reset" }
  | { type: "setPanZoom"; payload: PanZoom | null }
  | {
      type: "setStore";
      payload: { key: keyof StoreStateType; value: StoreStateType[keyof StoreStateType] };
    };
