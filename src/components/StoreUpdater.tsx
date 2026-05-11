import { useEffect } from "react";
import useDispatch from "../hooks/useDispatch";
import { type RootPropsType } from "../types";

type StoreUpdaterProps = {} & Pick<
  RootPropsType,
  "minZoom" | "maxZoom" | "defaultViewport" | "viewport"
>;

/**
 * 监听 props 变化，更新 store 中的数据
 */
export default function StoreUpdater(props: StoreUpdaterProps) {
  const { minZoom, maxZoom, defaultViewport, viewport } = props;
  const dispatch = useDispatch();

  useEffect(() => {
    if (minZoom !== undefined) {
      dispatch({ type: "setMinZoom", payload: minZoom });
    }
  }, [dispatch, minZoom]);
  useEffect(() => {
    if (maxZoom !== undefined) {
      dispatch({ type: "setMaxZoom", payload: maxZoom });
    }
  }, [dispatch, maxZoom]);
  useEffect(() => {
    if (defaultViewport) {
      // TODO 数据格式化
      dispatch({ type: "setDefaultViewport", payload: defaultViewport });
    }
  }, [dispatch, defaultViewport?.x, defaultViewport?.y, defaultViewport?.zoom]);
  useEffect(() => {
    if (viewport) {
      dispatch({ type: "syncViewport", payload: viewport });
    }
  }, [dispatch, viewport?.x, viewport?.y, viewport?.zoom]);

  return null;
}
