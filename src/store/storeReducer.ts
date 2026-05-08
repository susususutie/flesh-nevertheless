import { type StoreStateType, type StoreAction } from "../types";

export default  function storeReducer(state: StoreStateType, action: StoreAction) {
  switch (action.type) {
    case 'setZoom':
      return { ...state, zoom: action.payload }
    case 'reset':
      return { ...state, zoom: 1 }
    case 'incrementZoom':
      return { ...state, zoom: state.zoom + 1 }
    case 'decrementZoom':
      return { ...state, zoom: state.zoom - 1 }
    default:
      return state
  }

}
