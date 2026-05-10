import useReactive from "../hooks/useReactive";

export default function DisplayZoom() {
  const reactive = useReactive();
  return <div>Zoom: {reactive.transform.zoom ?? "none"}</div>;
}
