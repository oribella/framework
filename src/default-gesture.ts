import {GestureOptions, PointerData, GESTURE_STRATEGY_FLAG} from './utils';
import {DefaultListener} from './default-listener';

export class DefaultGesture {
  static options: GestureOptions = {
    pointers: 1,
    which: 1,
    prio: 100,
    strategy: GESTURE_STRATEGY_FLAG.KEEP
  }
  __POINTERIDS__: string[] = [];
  startEmitted: boolean = false;
  constructor(public element: Element, public listener: DefaultListener) { this.element; this.listener; }
  bind(
    element: Element,
    registerListener: (element: Element, type: string, listener: DefaultListener) => () => void,
    remove: (gesture: DefaultGesture, ...arr: DefaultGesture[]) => void
    ) {
    element; registerListener; remove;
  }
  unbind() {}
  start(evt: Event, pointers: PointerData[]): number { evt; pointers; return 0; }
  update(evt: Event, pointers: PointerData[]): number { evt; pointers; return 0; }
  end(evt: Event, pointers: PointerData[]): number { evt; pointers; return 0; }
  cancel(): number { return 0; }
}
