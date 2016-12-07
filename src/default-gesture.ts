import {GestureOptions, PointerData, GESTURE_STRATEGY_FLAG} from './utils';
import {DefaultListener} from './default-listener';

export class DefaultGesture {
  static options: GestureOptions = {
    pointers: 1,
    which: 1,
    prio: 100,
    strategy: GESTURE_STRATEGY_FLAG.KEEP
  }
  __POINTERS__: Array<string> = [];
  startEmitted: boolean = false;
  listener: DefaultListener;
  element: Element;
  constructor(listener: DefaultListener, element: Element) {
    this.listener  = listener;
    this.element = element;
  }
  bind(
    element: Element,
    addListener: (element: Element, type: string, listener: DefaultListener) => () => void,
    remove: (gesture: DefaultGesture, ...arr: Array<DefaultGesture>) => void
    ) {
    element; addListener; remove;
  }
  unbind() {}
  start(evt: Event, pointers: Array<PointerData>): number { evt; pointers; return 0; }
  update(evt: Event, pointers: Array<PointerData>): number { evt; pointers; return 0; }
  end(evt: Event, pointers: Array<PointerData>): number { evt; pointers; return 0; }
  cancel(): number { return 0; }
}
