import type { ReactNode } from "react";

/**
 * @description 交互事件层
 * TODO 处理用户框选节点/边的完整交互流程（pointer down → move → up）
 * - 自动平移：框选接近容器边缘时触发画布自动滚动
 * - 点击 pane 空白处取消选择、重置选中元素
 * - 右键菜单、滚轮事件代理
 * - 渲染 `UserSelection`（框选矩形可视化）
 */
export default function Pane({ children }: { children: ReactNode }) {
  return (
    <div
      className="react-flow__pane"
      style={{ position: "absolute", width: "100%", height: "100%", top: 0, left: 0 }}
    >
      {children}
    </div>
  );
}
