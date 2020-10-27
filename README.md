# @dupfioire/draggable

一个拖拽相关的库，能实现元素的**移动**与**缩放**等功能。

# 使用方法
```javascript
import Draggable from '@dupfioire/draggable'

const instance = new Draggable(DraggableOptions)
instance.on('dragStart', DragStartHandler)
instance.on('dragging', DraggingHandler)
instance.on('dragEnd', DragEndHandler)

instance.destroy()
```

# 类型
```typescript
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

type PositionInfo = {
  top?: number,
  left?: number
}
```

# 例子
使用`yarn start`启动，可参考`examples`中的代码。

## 拖动
```javascript
const moveInstance = new Draggable({
  el: barEl,
  movingBox: cardEl,
  parent: document.body
})
moveInstance.on('dragging', (ev, { top, left }) => {
  cardEl.style.top = `${top}px`
  cardEl.style.left = `${left}px`
})
```
通常只需要监听`dragging`事件，使用 top 与 left 设置元素的位置。

## 缩放
```javascript
const resizeInstance = new Draggable({
  el: resizeEl,
  movingBox: cardEl,
  parent: document.body,
  hasBorder: false
})
resizeInstance.on('dragStart', (ev, ctx) => {
  ctx.width = cardEl.getBoundingClientRect().width
  ctx.height = cardEl.getBoundingClientRect().height
})
resizeInstance.on('dragging', (ev, { top, left }, ctx) => {
  const { x, y } = cardEl.getBoundingClientRect()
  const calcHeight = ctx.height + top - y
  const calcWidth = ctx.width + left - x
  cardEl.style.width = `${calcWidth < 300 ? 300 : calcWidth}px`
  cardEl.style.height = `${calcHeight < 200 ? 200 : calcHeight}px`
})
```
由于 dragging 阶段返回的 top 与 left 是 movingBox 的**实时坐标**，所以 movingBox 的**实时宽高**需要通过计算得出。
```
鼠标与 movingBox 内部的距离 = 鼠标在 viewport 的位置（拖拽开始时） - movingBox 距离容器的位置
实时坐标 = 鼠标在 viewport 的位置（拖拽中） - 鼠标与 movingBox 内部的距离
```
在拖拽开始时记录 movingBox 的**初始宽高**（**缩放前的尺寸**）与**初始位置**。

在拖拽中通过`当前位置 - 初始位置`得到鼠标的偏移量，加上**初始宽高**得到**实时宽高**。

要注意的是，如果要实现“缩放”功能，请把`hasBorder`设置为`false`，因为限制了边界会导致位置计算结果被重置。
