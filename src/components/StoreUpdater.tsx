import { useEffect } from "react"
import useDispatch from "../hooks/useDispatch";
import { type RootPropsType } from "../types";

type StoreUpdaterProps = Omit<RootPropsType, 'children'> & {id: string}

/**
 * 监听 props 变化，更新 store 中的数据
 */
export default function StoreUpdater(props: StoreUpdaterProps) {
  const { id, zoom } = props
  const dispatch = useDispatch()

  useEffect(() => {
    console.log('StoreUpdater ', id, zoom)
    // dispatch({ type: 'setZoom', payload: zoom })
  }, [id, zoom])

  return null
}