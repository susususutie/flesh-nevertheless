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

      <div style={{ width: "100%", height: 400, border: "1px solid" }}>
        <Root
          defaultNodes={[
            {
              id: "1",
              type: "input",
              position: { x: 60, y: 80 },
              data: { label: `Count ${count}` },
            },
            { id: "2", position: { x: 300, y: 160 }, data: { label: "Transform" } },
            { id: "3", type: "output", position: { x: 560, y: 80 }, data: { label: "Result" } },
          ]}
          defaultEdges={[
            { id: "e1-2", source: "1", target: "2", animated: true },
            { id: "e2-3", source: "2", target: "3" },
          ]}
        >
          <Toolbar>
            <DisplayZoom />
            <ZoomController />
          </Toolbar>
          <Background id="1" variant="lines" gap={10} color="#f4f4f480" />
          <Background id="3" variant="lines" gap={100} />
          <Controls />
        </Root>
      </div>

      <div style={{ width: "100%", height: 400, border: "1px solid" }}>
        <Root>
          <Toolbar>
            <DisplayZoom />
          </Toolbar>
        </Root>
      </div>

      <div style={{ width: "100%", height: 400, border: "1px solid" }}>
        <Root>
          <Toolbar>
            <DisplayZoom />
          </Toolbar>
        </Root>
      </div>
    </div>
  );
}
