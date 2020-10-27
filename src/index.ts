type Direction = 'all' | 'horizontal' | 'vertical'

type PositionInfo = {
  top?: number,
  left?: number
}

/**
 * @param {MouseEvent | TouchEvent} ev - MouseEvent 或 TouchEvent 事件对象
 * @param {object} ctx - 用于在拖动过程中携带信息的对象，dragStart 时产生，dragEnd 时被销毁
 */
type DragStartHandler = (ev: MouseEvent | TouchEvent, ctx?: Object) => void
/**
 * @param {MouseEvent | TouchEvent} ev - MouseEvent 或 TouchEvent 事件对象
 * @param {PositionInfo} pos - 提供拖拽时的位置信息
 * @param {object} ctx - 用于在拖动过程中携带信息的对象，dragStart 时产生，dragEnd 时被销毁
 */
type DraggingHandler = (ev: MouseEvent | TouchEvent, pos: PositionInfo, ctx?: Object) => void
/**
 * @param {MouseEvent | TouchEvent} ev - MouseEvent 或 TouchEvent 事件对象
 * @param {object} ctx - 用于在拖动过程中携带信息的对象，dragStart 时产生，dragEnd 时被销毁
 */
type DragEndHandler = (ev: MouseEvent | TouchEvent, ctx?: Object) => void
type DraggableHandler = DragStartHandler | DraggingHandler | DragEndHandler

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
  el: HTMLElement,
  movingBox?: HTMLElement,
  pcOnly?: boolean,
  hasBorder?: boolean,
  parent?: HTMLElement,
  useTransform?: boolean,
  stopPropagation?: boolean,
  direction?: Direction,
  reversed?: boolean,
}

export default class Draggable {
  protected box: HTMLElement
  protected parent: Element
  protected hasBorder: boolean
  protected movingBox: HTMLElement
  protected useTransform: boolean
  protected stopPropagation: boolean
  protected direction: Direction
  protected reversed: boolean
  protected isTouch: boolean
  protected startEventKey: string
  protected touchingEventKey: string
  protected endEventKey: string
  protected ctx: Object
  protected parentWidth: number
  protected parentHeight: number
  protected relativeX: number
  protected relativeY: number
  protected handlerMap: {
    dragstart?: DragStartHandler,
    dragging?: DraggingHandler,
    dragend?: DragEndHandler
  }

  constructor (options: DraggableOptions) {
    this.box = options.el
    this.parent = options.parent ?? options.el.offsetParent
    this.hasBorder = options.hasBorder ?? true
    this.movingBox = options.movingBox ?? options.el
    this.useTransform = options.useTransform ?? false
    this.stopPropagation = options.stopPropagation ?? false
    this.direction = options.direction ?? 'all'
    this.reversed = options.reversed ?? false
    this.isTouch = (options.pcOnly ?? true) ? false : 'ontouchstart' in window
    this.startEventKey = this.isTouch ? 'touchstart' : 'mousedown'
    this.touchingEventKey = this.isTouch ? 'touchmove' : 'mousemove'
    this.endEventKey = this.isTouch ? 'touchend' : 'mouseup'
    this.handlerMap = {}
    this.box.addEventListener(this.startEventKey, this.onDragStart, false)
  }

  on (eventName: string, handler: DraggableHandler) {
    if (!['dragstart', 'dragging', 'dragend'].includes(eventName.toLowerCase())) {
      console.warn('Invalid event name')
      return
    }
    this.handlerMap[eventName.toLowerCase()] = handler
  }

  onDragStart = (ev: MouseEvent | TouchEvent) => {
    ev.stopPropagation()
    this.ctx = Object.create(null)
    const touch = ev instanceof TouchEvent ? ev.touches[0] : ev
    const targetEl = touch.target
    if (this.stopPropagation && targetEl !== this.box) {
      return false
    }
    this.parentWidth = this.parent.clientWidth
    this.parentHeight = this.parent.clientHeight
    let offsetLeft = this.movingBox.offsetLeft
    let offsetTop = this.movingBox.offsetTop
    if (this.useTransform) {
      const rect = this.movingBox.getBoundingClientRect()
      const parentRect = this.parent.getBoundingClientRect()
      offsetLeft = rect.left - parentRect.left
      offsetTop = rect.top - parentRect.top
    }
    this.relativeX = (touch).clientX - offsetLeft
    this.relativeY = (touch).clientY - offsetTop
    if (this.handlerMap.dragstart) {
      this.handlerMap.dragstart(ev, this.ctx)
    }
    this.parent.addEventListener(this.touchingEventKey, this.onDragging, false)
    this.parent.addEventListener(this.endEventKey, this.onDragEnd, false)
    return false
  }

  onDragging = (ev: MouseEvent | TouchEvent) => {
    ev.stopPropagation()
    if (!this.isTouch) {
      ev.preventDefault()
    }
    const touch = ev instanceof TouchEvent ? ev.touches[0] : ev
    let left = touch.clientX - this.relativeX
    let top = touch.clientY - this.relativeY
    if (this.hasBorder) {
      if (this.reversed) {
        if (left > 0) {
          left = 0
        } else if (left < this.parentWidth - this.movingBox.offsetWidth) {
          left = this.parentWidth - this.movingBox.offsetWidth
        }
        if (top > 0) {
          top = 0
        } else if (top < this.parentHeight - this.movingBox.offsetHeight) {
          top = this.parentHeight - this.movingBox.offsetHeight
        }
      } else {
        if (left < 0) {
          left = 0
        } else if (left > this.parentWidth - this.movingBox.offsetWidth) {
          left = this.parentWidth - this.movingBox.offsetWidth
        }
        if (top < 0) {
          top = 0
        } else if (top > this.parentHeight - this.movingBox.offsetHeight) {
          top = this.parentHeight - this.movingBox.offsetHeight
        }
      }
    }
    if (!this.handlerMap.dragging) {
      return false
    }
    let pos: PositionInfo
    if (this.direction === 'horizontal') {
      pos = { left }
    } else if (this.direction === 'vertical') {
      pos = { top }
    } else {
      pos = { top, left }
    }
    this.handlerMap.dragging(ev, pos, this.ctx)
    return false
  }

  onDragEnd = (ev: MouseEvent | TouchEvent) => {
    ev.stopPropagation()
    this.parent.removeEventListener(this.touchingEventKey, this.onDragging)
    this.parent.removeEventListener(this.endEventKey, this.onDragEnd)
    if (this.handlerMap.dragend) {
      this.handlerMap.dragend(ev, this.ctx)
    }
    return false
  }

  destroy () {
    this.box.removeEventListener(this.startEventKey, this.onDragStart)
  }
}
