import type { CSSProperties, PointerEvent as ReactPointerEvent } from "react";
import type { HandleType, PositionType } from "../../types";
import useDispatch from "../../hooks/useDispatch";

const handleStyle: CSSProperties = {
  width: 4,
  height: 4,
  position: "absolute",
  backgroundColor: "red",
};

type HandleProps = {
  id: string;
  nodeId: string;
  type: HandleType;
  position: PositionType;
};

export default function Handle(props: HandleProps) {
  const { id, nodeId, type, position } = props;
  const dispatch = useDispatch();

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.stopPropagation();

    const handleRect = event.currentTarget.getBoundingClientRect();
    dispatch({
      type: "setConnectionStart",
      payload: {
        nodeId,
        handleId: id,
        type,
        position,
        x: handleRect.left + handleRect.width / 2,
        y: handleRect.top + handleRect.height / 2,
      },
    });
  };

  const posStyles: Record<string, CSSProperties> = {
    top: { top: 0, left: "50%", transform: "translateX(-50%) translateY(-50%)" },
    right: { right: 0, top: "50%", transform: "translateX(50%) translateY(-50%)" },
    bottom: { bottom: 0, left: "50%", transform: "translateX(-50%) translateY(50%)" },
    left: { left: 0, top: "50%", transform: "translateX(-50%) translateY(-50%)" },
  };

  return (
    <div
      data-role="handle"
      data-handle-id={id}
      data-handle-pos={position}
      data-handle-type={type}
      data-nodeid={nodeId}
      className={`react-flow__handle react-flow__handle-${type}`}
      style={{ ...handleStyle, ...posStyles[position] }}
      onPointerDown={onPointerDown}
    />
  );
}
