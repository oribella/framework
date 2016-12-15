import {DefaultGesture} from './default-gesture';
import {DefaultListener} from './default-listener';

export class Registry {
  private gestures: Map<string, typeof DefaultGesture | Partial<DefaultGesture & { options: {}}>> = new Map<string, typeof DefaultGesture>();
  register(type: string, Gesture: typeof DefaultGesture | Partial<DefaultGesture>) {
    this.gestures.set(type, Gesture);
  }
  getTypes() {
    return Array.from(this.gestures.keys());
  }
  create(element: Element, type: string, listener: Partial<DefaultListener>) {
    const Gesture = this.gestures.get(type);
    if(!Gesture) {
      throw new Error(`The type ${type} has not been registered`);
    }
    return typeof Gesture === 'function' ?
      new Gesture(element, new DefaultListener(Gesture.options, listener)) :
      new DefaultGesture(element, new DefaultListener(Gesture.options, listener), Gesture);
  }
}
