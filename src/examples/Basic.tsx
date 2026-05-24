import DisplayZoom from "../additional-components/DisplayZoom";
import Toolbar from "../additional-components/Toolbar";
import Root from "../Root";

export default function Basic() {
  return (
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
  );
}
