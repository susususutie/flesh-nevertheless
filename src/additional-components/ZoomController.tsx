import useDispatch from "../hooks/useDispatch";

export default function ZoomController() {
  const dispatch = useDispatch();

  return (
    <div style={{ display: "flex", gap: 8 }}>
      <button onClick={() => dispatch({ type: "incrementZoom" })}>Increment</button>
      <button onClick={() => dispatch({ type: "decrementZoom" })}>Decrement</button>
      <button onClick={() => dispatch({ type: "reset" })}>Reset</button>
    </div>
  );
}
