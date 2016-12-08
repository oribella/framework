import {getOwnPropertyDescriptors} from './utils';
import {DefaultGesture} from './default-gesture';
import {DefaultListener} from './default-listener';

export class Registry {
  private gestures: Map<string, typeof DefaultGesture> = new Map<string, typeof DefaultGesture>();
  register(type: string, Gesture: typeof DefaultGesture) {
    this.gestures.set(type, Gesture);
  }
  getTypes() {
    return Array.from(this.gestures.keys());
  }
  create(type: string, listener: any, element: Element) {
    const Gesture = this.gestures.get(type);
    if(!Gesture) {
      throw new Error(`The type ${type} has not been registered`);
    }
    listener.options = Object.create(Gesture.options,
      getOwnPropertyDescriptors(listener.options));
    return new Gesture(listener as DefaultListener, element);
  }
}
