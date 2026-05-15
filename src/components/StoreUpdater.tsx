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
  | "nodeTypes"
  | "edgeTypes"
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
  "nodeTypes",
  "edgeTypes",
  "viewport",
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
  nodeTypes: initialState.nodeTypes,
  edgeTypes: initialState.edgeTypes,
  viewport: undefined,
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
        if (fieldName === "nodes") {
          dispatch({
            type: "setStore",
            payload: { key: "nodesControlled", value: fieldValue !== undefined },
          });
        }
        if (fieldName === "edges") {
          dispatch({
            type: "setStore",
            payload: { key: "edgesControlled", value: fieldValue !== undefined },
          });
        }
        if (fieldValue === undefined) continue;
        if (fieldName === "minZoom") {
          if (typeof fieldValue === "number") {
            dispatch({ type: "setMinZoom", payload: fieldValue });
          }
          continue;
        }
        if (fieldName === "maxZoom") {
          if (typeof fieldValue === "number") {
            dispatch({ type: "setMaxZoom", payload: fieldValue });
          }
          continue;
        }
        if (fieldName === "viewport") {
          dispatch({
            type: "syncViewport",
            payload: fieldValue as NonNullable<RootPropsType["viewport"]>,
          });
          continue;
        }
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
