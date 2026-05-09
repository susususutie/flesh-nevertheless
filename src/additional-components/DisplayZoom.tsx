import useStore from "../hooks/useState";

export default function DisplayZoom() {
  const store = useStore();
  return <div>Zoom: {store?.canvasTransform?.zoom ?? "none"}</div>;
}
