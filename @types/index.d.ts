declare type Direction = 'all' | 'horizontal' | 'vertical';
declare type PositionInfo = {
    top?: number;
    left?: number;
};
/**
 * @param {MouseEvent | TouchEvent} ev - MouseEvent 或 TouchEvent 事件对象
 * @param {object} ctx - 用于在拖动过程中携带信息的对象，dragStart 时产生，dragEnd 时被销毁
 */
declare type DragStartHandler = (ev: MouseEvent | TouchEvent, ctx?: Object) => void;
/**
 * @param {MouseEvent | TouchEvent} ev - MouseEvent 或 TouchEvent 事件对象
 * @param {PositionInfo} pos - 提供拖拽时的位置信息
 * @param {object} ctx - 用于在拖动过程中携带信息的对象，dragStart 时产生，dragEnd 时被销毁
 */
declare type DraggingHandler = (ev: MouseEvent | TouchEvent, pos: PositionInfo, ctx?: Object) => void;
/**
 * @param {MouseEvent | TouchEvent} ev - MouseEvent 或 TouchEvent 事件对象
 * @param {object} ctx - 用于在拖动过程中携带信息的对象，dragStart 时产生，dragEnd 时被销毁
 */
declare type DragEndHandler = (ev: MouseEvent | TouchEvent, ctx?: Object) => void;
declare type DraggableHandler = DragStartHandler | DraggingHandler | DragEndHandler;
/**
 * Draggable 的初始化参数
 *
 * @property {HTMLElement} el - 必需，触发拖拽操作的元素
 * @property {HTMLElement} [movingBox] - 需要移动的元素，默认为 el
 * @property {boolean} [pcOnly] - 是否只监听 mouse 相关事件，默认为 true
 * @property {boolean} [hasBorder] - 容器是否有边界，默认为 true
 * @property {HTMLElement} [parent] - 容器元素，默认为 el 的 offsetParent
 * @property {boolean} [useTransform] - 是否使用 CSS 中的 transform 控制元素的位置，默认为 false
 * @property {boolean} [stopPropagation] - 是否阻止拖拽事件传播，默认为 false
 * @property {string} [direction] - 允许拖拽的方向，可选值有 horizontal、vertical 与 all，默认为 all
 * @property {boolean} [reversed] - 是否反向计算拖拽距离（拖动组件与拖动背景的区别），默认为 false
 */
interface DraggableOptions {
    el: HTMLElement;
    movingBox?: HTMLElement;
    pcOnly?: boolean;
    hasBorder?: boolean;
    parent?: HTMLElement;
    useTransform?: boolean;
    stopPropagation?: boolean;
    direction?: Direction;
    reversed?: boolean;
}
export default class Draggable {
    protected box: HTMLElement;
    protected parent: Element;
    protected hasBorder: boolean;
    protected movingBox: HTMLElement;
    protected useTransform: boolean;
    protected stopPropagation: boolean;
    protected direction: Direction;
    protected reversed: boolean;
    protected isTouch: boolean;
    protected startEventKey: string;
    protected touchingEventKey: string;
    protected endEventKey: string;
    protected ctx: Object;
    protected parentWidth: number;
    protected parentHeight: number;
    protected relativeX: number;
    protected relativeY: number;
    protected handlerMap: {
        dragstart?: DragStartHandler;
        dragging?: DraggingHandler;
        dragend?: DragEndHandler;
    };
    constructor(options: DraggableOptions);
    on(eventName: string, handler: DraggableHandler): void;
    onDragStart: (ev: MouseEvent | TouchEvent) => boolean;
    onDragging: (ev: MouseEvent | TouchEvent) => boolean;
    onDragEnd: (ev: MouseEvent | TouchEvent) => boolean;
    destroy(): void;
}
export {};
