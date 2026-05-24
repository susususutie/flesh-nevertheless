import { useState } from "react";
import Basic from "./examples/Basic";
import CustomNode from "./examples/CustomNode";
import DefaultNodes from "./examples/DefaultNodes";
import DefaultEdges from "./examples/DefaultEdges";
import Edges from "./examples/Edges";

const options = [
  { value: "edges", label: "Edges", component: Edges },
  { value: "basic", label: "Basic", component: Basic },
  { value: "default-nodes", label: "Default Nodes", component: DefaultNodes },
  { value: "default-edges", label: "Default Edges", component: DefaultEdges },
  { value: "custom-node", label: "Custom Node", component: CustomNode },
];

export default function App() {
  const [count, setCount] = useState(80);
  const [selected, setSelected] = useState(options[0].value);
  const SelectedComponent = options.find((option) => option.value === selected)?.component;

  return (
    <>
      <header style={{ display: "flex", flexWrap: "wrap", gap: 16, padding: 16 }}>
        <button onClick={() => setCount(Math.round(Math.random() * 100))}>
          changeCount {count}
        </button>
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </header>

      {SelectedComponent && (
        <div style={{ width: "100%", height: "calc(100% - 53.5px)" }}>
          <SelectedComponent />
        </div>
      )}
    </>
  );
}
