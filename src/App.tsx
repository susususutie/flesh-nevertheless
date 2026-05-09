import { useState } from "react";
import Root from "./Root";
import DisplayZoom from "./additional-components/DisplayZoom";
import ZoomController from "./additional-components/ZoomController";

export default function App() {
  const [zoom, setZoom] = useState(80);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 16 }}>
      <div style={{ width: "100%", display: "flex", flexWrap: "wrap", gap: 16 }}>
        <button onClick={() => setZoom(Math.round(Math.random() * 100))}>changeZoom</button>
      </div>

      <Root
        initialZoom={zoom}
        style={{ padding: 16, width: 300, height: 200, border: "1px solid" }}
      >
        1. Hello React + TypeScript!
        <DisplayZoom />
        <ZoomController />
      </Root>

      {/* <Root style={{ padding: 16, width: 300, height: 200, border: "1px solid" }}>
        2. Hello React + TypeScript!
        <DisplayZoom />
        <ZoomController />
      </Root>

      <Root style={{ padding: 16, width: 300, height: 200, border: "1px solid" }}>
        3. Hello React + TypeScript!
        <DisplayZoom />
        <ZoomController />
      </Root> */}
    </div>
  );
}
