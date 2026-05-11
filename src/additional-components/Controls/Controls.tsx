import Panel from "../../components/Panel";
import useData from "../../hooks/useData";
import useReactive from "../../hooks/useReactive";
import FitViewIcon from "./FitViewIcon";
import LockIcon from "./LockIcon";
import MinusIcon from "./MinusIcon";
import PlusIcon from "./PlusIcon";
import UnlockIcon from "./UnlockIcon";
import "./index.css";

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

  const minZoomReached = reactive.transform[2] <= data.minZoom;
  const maxZoomReached = reactive.transform[2] >= data.maxZoom;

  // 基于画框中心点缩放
  const handleZoomIn = () => {
    //
    console.log(reactive.transform);
    if (maxZoomReached) return;
    if (panZoom) {
      panZoom.zoomIn();
    }
  };
  const handleZoomOut = () => {
    if (minZoomReached) return;
    if (panZoom) {
      panZoom.zoomOut();
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
