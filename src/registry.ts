import {getOwnPropertyDescriptors, Pointer, GESTURE_STRATEGY_FLAG} from './utils';

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
  subscriber: DefaultSubscriber;
  element: Element;
  constructor(subscriber: DefaultSubscriber, element: Element) {
    this.subscriber  = subscriber;
    this.element = element;
  }
  bind(
    element: Element,
    add: (element: Element, type: string, subscriber: DefaultSubscriber) => () => void,
    remove: (gesture: DefaultGesture, ...arr: Array<DefaultGesture>) => void
    ) {
    element; add; remove;
  }
  unbind() {}
  start(event: Event, pointers: Array<Pointer>): number { event; pointers; return 0; }
  update(event: Event, pointers: Array<Pointer>): number { event; pointers; return 0; }
  end(event: Event, pointers: Array<Pointer>): number { event; pointers; return 0; }
  cancel() {}
}

export class DefaultSubscriber {
  options: GestureOptions;
  selector: string;
  down() {}
  start() {}
  update() {}
  end() {}
  cancel() {}
}

export class Registry {
  private gestures: { [key: string]: typeof DefaultGesture } = {};
  register(type: string, Gesture: typeof DefaultGesture) {
    this.gestures[type] = Gesture;
  }
  getTypes() {
    return Object.keys(this.gestures);
  }
  create(type: string, subscriber: any, element: Element) {
    const Gesture = this.gestures[type];
    subscriber.options = Object.create(Gesture.options,
      getOwnPropertyDescriptors(subscriber.options));
    return new Gesture(subscriber as DefaultSubscriber, element);
  }
}
