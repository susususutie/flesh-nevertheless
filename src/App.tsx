import Root from "./Root"
import DisplayZoom from "./additional-components/DisplayZoom"
import ZoomController from "./additional-components/ZoomController"

export default function App() {
  return <Root>
    Hello React + TypeScript!
    <DisplayZoom />
    <ZoomController />
    </Root>
}