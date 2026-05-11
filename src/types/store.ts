import PanZoom from "../helper/PanZoom";
import { type Transform, type Viewport } from ".";

// 静态配置, 来自 props，初始化后不变（从 props 中获取初始化后恒定不变 ）
export type StoreConfig = {
  id: string;
};

// data 业务状态，中低频变化（秒级/分钟级）
export type StoreData = {
  minZoom: number; // 缩放比例（scale）
  maxZoom: number;
  defaultViewport: Viewport;
  panZoom: PanZoom | null;
};

// reactive 实时状态，高频变化（帧级）
export type StoreReactive = {
  transform: Transform;
  // 其他交互状态
  mousePosition: { x: number; y: number };
  selectedPoint: { x: number; y: number } | null;
  isPanning: boolean;
};

export type StoreStateType = StoreConfig & StoreData & StoreReactive;

export type StoreAction =
  | { type: "setZoom"; payload: number }
  | { type: "transform"; payload: StoreReactive["transform"] }
  | { type: "syncViewport"; payload: Viewport }
  | { type: "setDefaultViewport"; payload: Viewport }
  | { type: "setMinZoom"; payload: number }
  | { type: "setMaxZoom"; payload: number }
  | { type: "incrementZoom" }
  | { type: "decrementZoom" }
  | { type: "reset" }
  | { type: "setPanZoom"; payload: PanZoom | null };
