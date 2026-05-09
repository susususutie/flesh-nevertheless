export type StoreStateType = {
  // 静态配置（从 props 中获取初始化后恒定不变 ）
  id: string;

  // data 低频数据（秒级/分钟级）
  minZoom: number; // 缩放百分比，整数
  maxZoom: number;
  zoomStep: number;
  initialZoom: number;

  // reactive 高频数据（帧级）
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

export type StoreAction =
  | { type: "setZoom"; payload: number }
  | { type: "setInitialZoom"; payload: number }
  | { type: "incrementZoom" }
  | { type: "decrementZoom" }
  | { type: "reset" };
