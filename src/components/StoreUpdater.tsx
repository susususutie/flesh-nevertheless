import { useEffect } from "react";
import useDispatch from "../hooks/useDispatch";

type StoreUpdaterProps = {
  minZoom?: number;
  maxZoom?: number;
  initialZoom?: number;
};

/**
 * 监听 props 变化，更新 store 中的数据
 */
export default function StoreUpdater(props: StoreUpdaterProps) {
  const { initialZoom, minZoom, maxZoom } = props;
  const dispatch = useDispatch();

  useEffect(() => {
    if (initialZoom !== undefined) {
      dispatch({ type: "setInitialZoom", payload: initialZoom });
    }
  }, [minZoom, maxZoom, initialZoom]);

  return null;
}
