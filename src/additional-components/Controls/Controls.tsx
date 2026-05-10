import Panel from "../../components/Panel";
import PlusIcon from "./PlusIcon";
import MinusIcon from "./MinusIcon";
import FitViewIcon from "./FitViewIcon";
import LockIcon from "./LockIcon";
import UnlockIcon from "./UnlockIcon";
import "./index.css";
import useData from "../../hooks/useData";
import useReactive from "../../hooks/useReactive";
import useDispatch from "../../hooks/useDispatch";

type ControlsProps = {
  showZoom?: boolean;
  showFitView?: boolean;
  showInteractive?: boolean;
};

export default function Controls(props: ControlsProps) {
  const { showZoom = true, showFitView = true, showInteractive = true } = props;
  const data = useData();
  const panZoom = data.panZoom;
  const reactive = useReactive();
  const dispatch = useDispatch();

  const minZoomReached = reactive.transform.zoom <= data.minZoom;
  const maxZoomReached = reactive.transform.zoom >= data.maxZoom;

  // 基于画框中心点缩放
  const handleZoomIn = () => {
    //
    console.log(reactive.transform);
    if (maxZoomReached) return;
    if (panZoom) {
      const transform = panZoom.zoomIn();
      if (transform) {
        dispatch({ type: "transform", payload: transform });
      }
    }
  };
  const handleZoomOut = () => {
    if (minZoomReached) return;
    if (panZoom) {
      const transform = panZoom.zoomOut();
      if (transform) {
        dispatch({ type: "transform", payload: transform });
      }
    }
  };

  // const
  const isInteractive = false;
  return (
    <Panel
      position="bottom-left"
      style={{
        display: "flex",
        flexDirection: "column",
        boxShadow: "0 0 2px 1px rgba(0, 0, 0, .08)",
      }}
    >
      {showZoom ? (
        <>
          <button className="control-button" disabled={maxZoomReached} onClick={handleZoomIn}>
            <PlusIcon />
          </button>
          <button className="control-button" disabled={minZoomReached} onClick={handleZoomOut}>
            <MinusIcon />
          </button>
        </>
      ) : null}
      {showFitView ? (
        <button className="control-button">
          <FitViewIcon />
        </button>
      ) : null}
      {showInteractive ? (
        <button className="control-button">{isInteractive ? <UnlockIcon /> : <LockIcon />}</button>
      ) : null}
    </Panel>
  );
}
