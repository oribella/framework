import {getOwnPropertyDescriptors} from './utils';

export class DefaultGesture {
  static options: { pointers: number, which: number, prio: number } = {
    pointers: 1,
    which: 1,
    prio: 100
  }
  constructor(subscriber: DefaultSubscriber, element: Element) {
    subscriber;
    element;
  }
  start() {}
  update() {}
  end() {}
  cancel() {}
}

export class DefaultSubscriber {
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
    return new Gesture(<DefaultSubscriber>subscriber, element);
  }
}
