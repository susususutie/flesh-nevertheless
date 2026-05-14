import { useEffect, useRef } from "react";
import useDispatch from "../hooks/useDispatch";
import { type RootPropsType } from "../types";
import initialState from "../store/initialState";

type StoreUpdaterProps = { rfId: string } & Pick<
  RootPropsType,
  | "minZoom"
  | "maxZoom"
  | "nodes"
  | "onNodesChange"
  | "edges"
  | "onEdgesChange"
  | "defaultViewport"
  | "viewport"
  | "zoomOnScroll"
  | "zoomOnPinch"
  | "zoomOnDoubleClick"
  | "panOnScroll"
>;

const fieldsToTrack = [
  "rfId",
  "minZoom",
  "maxZoom",
  "nodes",
  "onNodesChange",
  "edges",
  "onEdgesChange",
  "defaultViewport",
  "zoomOnScroll",
  "zoomOnPinch",
  "zoomOnDoubleClick",
  "panOnScroll",
] as const;
const fieldsInitialValues = {
  rfId: initialState.rfId,
  minZoom: initialState.minZoom,
  maxZoom: initialState.maxZoom,
  nodes: initialState.nodes,
  onNodesChange: initialState.onNodesChange,
  edges: initialState.edges,
  onEdgesChange: initialState.onEdgesChange,
  defaultViewport: initialState.defaultViewport,
  zoomOnScroll: initialState.zoomOnScroll,
  zoomOnPinch: initialState.zoomOnPinch,
  zoomOnDoubleClick: initialState.zoomOnDoubleClick,
  panOnScroll: initialState.panOnScroll,
};

/**
 * 监听 props 指定字段(fieldsToTrack)的变化，更新 store 中的对应数据
 */
export default function StoreUpdater(props: StoreUpdaterProps) {
  const dispatch = useDispatch();

  const previousFields = useRef<Partial<StoreUpdaterProps>>(
    fieldsInitialValues as Partial<StoreUpdaterProps>,
  );
  useEffect(
    () => {
      for (const fieldName of fieldsToTrack) {
        const fieldValue = props[fieldName];
        const previousFieldValue = previousFields.current[fieldName];

        if (fieldValue === previousFieldValue) continue;
        if (typeof fieldValue === "undefined") continue;
        dispatch({
          type: "setStore",
          payload: { key: fieldName, value: fieldValue },
        });
      }
      previousFields.current = props;
    },
    fieldsToTrack.map((fieldName) => props[fieldName]),
  );

  return null;
}
