import { type Transform } from "../types";

type Options = {
  el: HTMLElement;
  minZoom: number;
  maxZoom: number;
  transform: Transform;
};

/** 参考 d3-zoom 实现一个 PanZoom 类 */
class PanZoom {
  private el: HTMLElement;
  private minZoom: number;
  private maxZoom: number;
  private transform: Transform;
  private destroyed: boolean;

  constructor(options: Options) {
    if (!options.el) throw new Error("el is required");

    this.el = options.el;
    this.minZoom = options.minZoom;
    this.maxZoom = options.maxZoom;
    this.transform = options.transform;
    this.destroyed = false;
  }

  #getLocalCoords(clientX: number, clientY: number) {
    const rect = this.el.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }

  #zoomAtClient(clientX: number, clientY: number, nextZoomRaw: number) {
    // 限制缩放范围
    const clampedZoom = Math.max(this.minZoom, Math.min(this.maxZoom, nextZoomRaw));
    const currentZoom = this.transform.zoom;
    const currentX = this.transform.x;
    const currentY = this.transform.y;

    if (currentZoom === 0) return;
    if (clampedZoom === currentZoom) return;

    const { x: originX, y: originY } = this.#getLocalCoords(clientX, clientY);

    const ratio = clampedZoom / currentZoom;
    // 新偏移量计算公式
    const nextX = originX - (originX - currentX) * ratio;
    const nextY = originY - (originY - currentY) * ratio;

    return { x: nextX, y: nextY, zoom: clampedZoom };
  }

  zoomIn(config?: { x: number; y: number }): { x: number; y: number; zoom: number } {
    if (this.destroyed) return;

    let clientX = 0;
    let clientY = 0;
    if (!config) {
      const rect = this.el.getBoundingClientRect();
      if (!rect) return;

      clientX = rect.width / 2 + rect.left;
      clientY = rect.height / 2 + rect.top;
    } else {
      clientX = config.x;
      clientY = config.y;
    }

    const transform = this.#zoomAtClient(clientX, clientY, this.transform.zoom * 1.2);

    if (!transform) return;

    this.transform = transform;
    return transform;
  }

  zoomOut(): { x: number; y: number; zoom: number } | null {
    if (this.destroyed) return;
    const rect = this.el.getBoundingClientRect();
    if (!rect) return;

    const centerClient = {
      x: rect.width / 2 + rect.left,
      y: rect.height / 2 + rect.top,
    };

    const transform = this.#zoomAtClient(centerClient.x, centerClient.y, this.transform.zoom * 0.8);

    if (!transform) return;

    this.transform = transform;
    return transform;
  }

  destroy() {
    this.el = null;
    this.destroyed = true;
  }
}

export default PanZoom;
