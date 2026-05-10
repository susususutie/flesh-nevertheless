import Panel from "../../components/Panel";
import PlusIcon from "./PlusIcon";
import MinusIcon from "./MinusIcon";
import FitViewIcon from "./FitViewIcon";
import LockIcon from "./LockIcon";
import UnlockIcon from "./UnlockIcon";
import "./index.css";

type ControlsProps = {
  showZoom?: boolean;
  showFitView?: boolean;
  showInteractive?: boolean;
};

export default function Controls(props: ControlsProps) {
  const { showZoom = true, showFitView = true, showInteractive = true } = props;

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
          <button className="control-button">
            <PlusIcon />
          </button>
          <button className="control-button">
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
