import useDispatch from "../hooks/useDispatch";
import useData from "../hooks/useData";

export default function ZoomController() {
  const dispatch = useDispatch();
  const data = useData();

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
      <button
        onClick={() =>
          dispatch({ type: "setInteractionOptions", payload: { zoomOnScroll: !data.zoomOnScroll } })
        }
      >
        Wheel Zoom: {data.zoomOnScroll ? "On" : "Off"}
      </button>
      <button
        onClick={() =>
          dispatch({ type: "setInteractionOptions", payload: { panOnScroll: !data.panOnScroll } })
        }
      >
        Wheel Pan: {data.panOnScroll ? "On" : "Off"}
      </button>
      <button
        onClick={() =>
          dispatch({
            type: "setInteractionOptions",
            payload: { zoomOnDoubleClick: !data.zoomOnDoubleClick },
          })
        }
      >
        Double Click: {data.zoomOnDoubleClick ? "On" : "Off"}
      </button>
      <button
        onClick={() =>
          dispatch({ type: "setInteractionOptions", payload: { zoomOnPinch: !data.zoomOnPinch } })
        }
      >
        Pinch: {data.zoomOnPinch ? "On" : "Off"}
      </button>
    </div>
  );
}
