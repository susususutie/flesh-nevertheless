import { useState } from "react";
import Root from "./Root";
import Background from "./additional-components/Background";
import DisplayZoom from "./additional-components/DisplayZoom";
import Controls from "./additional-components/Controls";
import ZoomController from "./additional-components/ZoomController";
import Toolbar from "./additional-components/Toolbar";
import { type NodeProps, type Node, type NodeTypes } from "./types";

type CustomInputNode = Node<{ label?: string; count?: number }, "customInput">;
function CustomInputNode(props: NodeProps<CustomInputNode>) {
  const [count, setCount] = useState(props.data?.count ?? 0);
  return (
    <div
      style={{
        padding: "12px 16px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        color: "#fff",
        borderRadius: 10,
        minWidth: 100,
        boxShadow: props.selected
          ? "0 0 0 2px #2563eb, 0 4px 12px rgba(0,0,0,0.15)"
          : "0 2px 6px rgba(0,0,0,0.1)",
        fontSize: 13,
      }}
    >
      <div style={{ opacity: 0.7, fontSize: 11, marginBottom: 4 }}>INPUT</div>
      <div style={{ fontWeight: 600 }}>
        {typeof props.data?.label === "string" ? props.data.label : props.id}
        <button
          className="nodrag"
          onClick={(e) => {
            console.log(e);
            setCount(Math.round(Math.random() * 100));
          }}
        >
          changeCount {count}
        </button>
      </div>
      {props.dragging && <div style={{ fontSize: 11, opacity: 0.6 }}>dragging...</div>}
    </div>
  );
}

const nodeTypes = {
  customInput: CustomInputNode,
} as NodeTypes;

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
          nodeTypes={nodeTypes}
          defaultNodes={[
            {
              id: "1",
              type: "customInput",
              position: { x: 60, y: 80 },
              data: { label: `Count ${count}`, count },
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
        <Root
          defaultNodes={[
            { id: "a", position: { x: 40, y: 40 }, data: { label: "bezier" } },
            { id: "b", position: { x: 40, y: 140 }, data: { label: "straight" } },
            { id: "c", position: { x: 40, y: 240 }, data: { label: "step" } },
            { id: "d", position: { x: 40, y: 340 }, data: { label: "smoothstep" } },
            { id: "ax", position: { x: 260, y: 40 }, data: { label: "target" } },
            { id: "bx", position: { x: 260, y: 140 }, data: { label: "target" } },
            { id: "cx", position: { x: 260, y: 240 }, data: { label: "target" } },
            { id: "dx", position: { x: 260, y: 340 }, data: { label: "target" } },
          ]}
          defaultEdges={[
            { id: "ea", source: "a", target: "ax" },
            { id: "eb", source: "b", target: "bx", type: "straight" },
            { id: "ec", source: "c", target: "cx", type: "step" },
            { id: "ed", source: "d", target: "dx", type: "smoothstep" },
          ]}
        >
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
