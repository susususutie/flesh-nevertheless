import { type Node, type NodeLookup, type InternalNode } from "../types";

export function getIsNodesInitialized<N extends Node>(
  nodes: N[],
  nodeLookup: NodeLookup<InternalNode<N>>,
): boolean {
  if (nodeLookup.size === 0) {
    return false;
  }

  let nodesInitialized = nodes.length > 0;

  for (const userNode of nodes) {
    let internalNode = nodeLookup.get(userNode.id);

    // 尺寸还未测量出来，说明节点初始化未完成
    if (
      !internalNode ||
      internalNode.internals.measured.width === undefined ||
      internalNode.internals.measured.height === undefined
    ) {
      nodesInitialized = false;
      break;
    }
  }

  return nodesInitialized;
}

/**
 * 将用户提供的节点转换为内部节点
 * @param nodes 用户传入的nodes/defaultNodes数据
 * @param nodeLookup 处理过的内部节点数据
 */
export function adoptUserNodes<N extends Node>(
  nodes: N[],
  nodeLookup: NodeLookup<InternalNode<N>>,
): {
  nodesInitialized: boolean;
  nodes: N[];
  nodeLookup: NodeLookup<InternalNode<N>>;
} {
  const newNodeLookup: NodeLookup<InternalNode<N>> = new Map();
  const newNodes: N[] = [];
  let nodesInitialized = nodes.length > 0;

  // 遍历用户提供的节点，将每个节点转换为内部节点
  for (const userNode of nodes) {
    let internalNode = nodeLookup.get(userNode.id);
    // TODO origin, extent, clamp
    internalNode = {
      ...internalNode,
      ...userNode,
      internals: {
        ...internalNode?.internals,
        measured: {
          width: userNode?.width ?? internalNode?.internals?.measured?.width,
          height: userNode?.height ?? internalNode?.internals?.measured?.height,
        },
        positionAbsolute: {
          x: userNode.position?.x ?? internalNode?.internals?.positionAbsolute?.x ?? 0,
          y: userNode.position?.y ?? internalNode?.internals?.positionAbsolute?.y ?? 0,
        },
        zIndex: userNode.zIndex ?? 0,
      },
    };

    // 尺寸还未测量出来，说明节点初始化未完成
    if (
      internalNode.internals.measured.width === undefined ||
      internalNode.internals.measured.height === undefined
    ) {
      nodesInitialized = false;
    }

    newNodeLookup.set(userNode.id, internalNode);
    newNodes.push(userNode);
  }

  return { nodesInitialized, nodes: newNodes, nodeLookup: newNodeLookup };
}
