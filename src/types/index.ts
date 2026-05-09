// 静态配置, 来自 props，初始化后不变（从 props 中获取初始化后恒定不变 ）
export type StoreConfig = {
  id: string;
};

// data 业务状态，中低频变化（秒级/分钟级）
export type StoreData = {
  minZoom: number; // 缩放百分比，整数
  maxZoom: number;
  zoomStep: number;
  initialZoom: number;
};

// reactive 实时状态，高频变化（帧级）
export type StoreReactive = {
  canvasTransform: {
    x: number; // 位移 X
    y: number; // 位移 Y
    zoom: number; // 缩放百分比例，整数方便计算
  };
  // 其他交互状态
  mousePosition: { x: number; y: number };
  selectedPoint: { x: number; y: number } | null;
  isPanning: boolean;
};

export type StoreStateType = StoreConfig & StoreData & StoreReactive;

export type StoreAction =
  | { type: "setZoom"; payload: number }
  | { type: "setInitialZoom"; payload: number }
  | { type: "incrementZoom" }
  | { type: "decrementZoom" }
  | { type: "reset" };
