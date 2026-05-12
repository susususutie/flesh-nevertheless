import { useState } from "react";
import Root from "./Root";
import Background from "./additional-components/Background";
import DisplayZoom from "./additional-components/DisplayZoom";
import Controls from "./additional-components/Controls";
import ZoomController from "./additional-components/ZoomController";
import Toolbar from "./additional-components/Toolbar";

export default function App() {
  const [count, setCount] = useState(80);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: 16 }}>
        <button onClick={() => setCount(Math.round(Math.random() * 100))}>
          changeCount {count}
        </button>
      </div>

      <Root style={{ width: "100%", height: 400, border: "1px solid" }}>
        <Toolbar>
          <DisplayZoom />
          <ZoomController />
        </Toolbar>
        <Background id="1" />
        {/* <Background id="2" gap={[35, 35]} color="red" /> */}
        <Controls />
      </Root>

      <Root style={{ width: 300, height: 200, border: "1px solid" }}>
        <Toolbar>
          <DisplayZoom />
        </Toolbar>
      </Root>

      <Root style={{ width: 300, height: 200, border: "1px solid" }}>
        <Toolbar>
          <DisplayZoom />
        </Toolbar>
      </Root>
    </div>
  );
}
