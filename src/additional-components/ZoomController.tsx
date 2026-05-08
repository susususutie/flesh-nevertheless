import useDispatch  from "../hooks/useDispatch";

export default function ZoomController() {
  const dispatch = useDispatch()
  
  return <div>
    <button onClick={() => dispatch({ type: 'incrementZoom', })}>Increment</button>
    <button onClick={() => dispatch({ type: 'decrementZoom', })}>Decrement</button>
  </div>
}