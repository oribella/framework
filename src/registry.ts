import {getOwnPropertyDescriptors, PointerData, GESTURE_STRATEGY_FLAG} from './utils';

export type GestureOptions = { pointers: number, which: number, prio: number, strategy: number };
export class DefaultGesture {
  static options: GestureOptions = {
    pointers: 1,
    which: 1,
    prio: 100,
    strategy: GESTURE_STRATEGY_FLAG.KEEP
  }
  __POINTERS__: Array<string> = [];
  startEmitted: boolean = false;
  subscriber: DefaultListener;
  element: Element;
  constructor(subscriber: DefaultListener, element: Element) {
    this.subscriber  = subscriber;
    this.element = element;
  }
  bind(
    element: Element,
    add: (element: Element, type: string, subscriber: DefaultListener) => () => void,
    remove: (gesture: DefaultGesture, ...arr: Array<DefaultGesture>) => void
    ) {
    element; add; remove;
  }
  unbind() {}
  start(evt: Event, pointers: Array<PointerData>): number { evt; pointers; return 0; }
  update(evt: Event, pointers: Array<PointerData>): number { evt; pointers; return 0; }
  end(evt: Event, pointers: Array<PointerData>): number { evt; pointers; return 0; }
  cancel(): number { return 0; }
}

export class DefaultListener {
  options: GestureOptions;
  selector: string;
  down() {}
  start() {}
  update() {}
  end() {}
  cancel() {}
}

export class Registry {
  private gestures: Map<string, typeof DefaultGesture> = new Map<string, typeof DefaultGesture>();
  register(type: string, Gesture: typeof DefaultGesture) {
    this.gestures.set(type, Gesture);
  }
  getTypes() {
    return Object.keys(this.gestures);
  }
  create(type: string, subscriber: any, element: Element) {
    const Gesture = this.gestures.get(type);
    if(!Gesture) {
      throw new Error(`The type ${type} has not been registered`);
    }
    subscriber.options = Object.create(Gesture.options,
      getOwnPropertyDescriptors(subscriber.options));
    return new Gesture(subscriber as DefaultListener, element);
  }
}
