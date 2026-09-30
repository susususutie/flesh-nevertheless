# Glossary

## ConnectionLine

A temporary SVG path rendered while the user drags from a source handle to create a new edge. Disappears when the connection is completed or cancelled. Not an actual edge — a preview.

## Marker

An SVG `<marker>` element rendered at the end or start of an edge path, typically an arrowhead. Built-in types: `arrowclosed`, `arrow`, `circle`, `diamond`. Supports custom shapes via `render` function.

## Cascade Delete

Automatic removal of all edges connected to a node when that node is deleted. Implemented at the store reducer level so it fires regardless of how the node removal is triggered.

## FitView

An operation that computes a viewport transform (`x`, `y`, `zoom`) that encloses all visible nodes (or a given set of nodes), then animates or snaps the canvas to that viewport.

## Edge Label

A text or React node rendered along or near an edge path, typically at the midpoint.

## MiniMap

A small inset view showing a zoomed-out overview of the entire graph, with a viewport indicator showing the currently visible area.
