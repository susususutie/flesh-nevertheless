ReactFlow 组件层级及dom对照

```jsx
<ReactFlow className='react-flow'>                                          {/* relative,overflow:hidden; */}
  <ReactFlowProvider>
    <StoreUpdater />                                                        {/* 数据同步 */}
    <ZoomPane className="react-flow__renderer">                             {/* absolute,width/height:100% */}
      <Pane className="react-flow__pane">                                   {/* 事件捕获层, 平移、取消选中 */}
        <Viewport className="react-flow__viewport">                         {/* 视口变换层, transform 实现位移/缩放 */}
          <EdgeRenderer className="react-flow__edges" />                    {/* 边层 */}
          <ConnectionLineWrapper className="react-flow__connectionline" />  {/* svg 临时连接线 */}
          <div className="react-flow__edgelabel-renderer" />                {/* absolute, 渲染自定义label */}
          <NodeRenderer className="react-flow__nodes" />                    {/* 节点层 */}
          <div className="react-flow__viewport-portal" />
        </Viewport>
        <UserSelection className="react-flow__selection" />                 {/* 框选矩形 */}
        <NodesSelection className="react-flow__nodesselection" />
      </Pane>
    <ZoomPane />
    <SelectionListener />
      {children}                                                            {/* MiniMap/Controls 等组件 */}
    <Attribution className="react-flow__attribution" />                     {/* absolute, 底部 attribution */}
    <A11yDescriptions />                                                    {/* absolute, 底部 a11y 描述 */}
  </ReactFlowProvider>
</ReactFlow>
```
