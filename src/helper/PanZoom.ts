import { type Transform, type Viewport } from "../types";

type Options = {
  el: HTMLElement;
  minZoom: number;
  maxZoom: number;
  viewport: Viewport;
  onTransformChange: (transform: Transform) => void;
};

/** 参考 d3-zoom 实现一个 PanZoom 类 */
class PanZoom {
  private el: HTMLElement | null;
  private minZoom: number;
  private maxZoom: number;
  private viewport: Viewport;
  private onTransformChange: (transform: Transform) => void;
  private destroyed: boolean;

  constructor(options: Options) {
    if (!options.el) throw new Error("el is required");

    this.el = options.el;
    this.minZoom = options.minZoom;
    this.maxZoom = options.maxZoom;
    this.viewport = options.viewport;
    this.onTransformChange = options.onTransformChange;
    this.destroyed = false;
  }

  #getLocalCoords(clientX: number, clientY: number) {
    const rect = this.el?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  #zoomAtClient(clientX: number, clientY: number, nextZoomRaw: number): Viewport | undefined {
    // 限制缩放范围
    const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, nextZoomRaw));
    const currentZoom = this.viewport.zoom;
    const currentX = this.viewport.x;
    const currentY = this.viewport.y;

    if (currentZoom === 0) return;
    if (clampedZoom === currentZoom) return;

    const { x: originX, y: originY } = this.#getLocalCoords(clientX, clientY);

    const ratio = clampedZoom / currentZoom;
    // 新偏移量计算公式
    const nextX = originX - (originX - currentX) * ratio;
    const nextY = originY - (originY - currentY) * ratio;

    return {
      x: nextX,
      y: nextY,
      zoom: clampedZoom,
    };
  }

  zoomIn(config?: { x: number; y: number }): Viewport | null {
    if (this.destroyed) return null;

    let clientX = 0;
    let clientY = 0;
    if (!config) {
      const rect = this.el?.getBoundingClientRect();
      if (!rect) return null;

      clientX = rect.width / 2 + rect.left;
      clientY = rect.height / 2 + rect.top;
    } else {
      clientX = config.x;
      clientY = config.y;
    }

    const viewport = this.#zoomAtClient(clientX, clientY, this.viewport.zoom * 1.2);

    if (!viewport) return null;

    this.viewport = viewport;
    this.onTransformChange?.([viewport.x, viewport.y, viewport.zoom]);
    return viewport;
  }

  zoomOut(): Viewport | null {
    if (this.destroyed) return null;
    const rect = this.el?.getBoundingClientRect();
    if (!rect) return null;

    const centerClient = {
      x: rect.width / 2 + rect.left,
      y: rect.height / 2 + rect.top,
    };

    const viewport = this.#zoomAtClient(centerClient.x, centerClient.y, this.viewport.zoom * 0.8);

    if (!viewport) return null;

    this.viewport = viewport;
    this.onTransformChange?.([viewport.x, viewport.y, viewport.zoom]);
    return viewport;
  }

  destroy() {
    this.el = null;
    this.destroyed = true;
  }
}

export default PanZoom;
