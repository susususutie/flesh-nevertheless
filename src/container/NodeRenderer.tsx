import useData from "../hooks/useData";
import NodeWrapper from "../components/NodeWrapper";
import type { CSSProperties } from "react";

const nodeRendererStyle: CSSProperties = {
  position: "absolute",
  width: "100%",
  height: "100%",
  top: 0,
  left: 0,
};

type NodeRendererProps = {
  rfId: string;
};

export default function NodeRenderer(props: NodeRendererProps) {
  const { rfId } = props;
  const { nodes, nodesConnectable, nodesDraggable, nodesSelectable } = useData();
  // TODO：
  // 1. 只渲染 !hide 的节点
  // 2. 所有节点共用一个 ResizeObserver 实例
  return (
    <div className="react-flow__nodes" style={nodeRendererStyle}>
      {nodes.map((node) => (
        <NodeWrapper
          key={node.id}
          rfId={rfId}
          id={node.id}
          nodesDraggable={nodesDraggable}
          nodesSelectable={nodesSelectable}
          nodesConnectable={nodesConnectable}
        />
      ))}
    </div>
  );
}
