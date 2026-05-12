import { useEffect } from "react";
import useDispatch from "../hooks/useDispatch";
import { type RootPropsType } from "../types";

type StoreUpdaterProps = {} & Pick<
  RootPropsType,
  | "minZoom"
  | "maxZoom"
  | "defaultViewport"
  | "viewport"
  | "zoomOnScroll"
  | "zoomOnPinch"
  | "zoomOnDoubleClick"
  | "panOnScroll"
>;

/**
 * 监听 props 变化，更新 store 中的数据
 */
export default function StoreUpdater(props: StoreUpdaterProps) {
  const {
    minZoom,
    maxZoom,
    defaultViewport,
    viewport,
    zoomOnScroll,
    zoomOnPinch,
    zoomOnDoubleClick,
    panOnScroll,
  } = props;
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

  useEffect(() => {
    const payload: Partial<{
      zoomOnScroll: boolean;
      zoomOnPinch: boolean;
      zoomOnDoubleClick: boolean;
      panOnScroll: boolean;
    }> = {};
    if (zoomOnScroll !== undefined) payload.zoomOnScroll = zoomOnScroll;
    if (zoomOnPinch !== undefined) payload.zoomOnPinch = zoomOnPinch;
    if (zoomOnDoubleClick !== undefined) payload.zoomOnDoubleClick = zoomOnDoubleClick;
    if (panOnScroll !== undefined) payload.panOnScroll = panOnScroll;
    if (Object.keys(payload).length === 0) return;
    dispatch({ type: "setInteractionOptions", payload });
  }, [dispatch, zoomOnScroll, zoomOnPinch, zoomOnDoubleClick, panOnScroll]);

  return null;
}
