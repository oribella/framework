import {DefaultGesture} from './default-gesture';
import {DefaultListener} from './default-listener';

export class Registry {
  private gestures: Map<typeof DefaultGesture, typeof DefaultGesture> =
    new Map<typeof DefaultGesture, typeof DefaultGesture>();
  public register<T extends typeof DefaultGesture>(Gesture: T) {
    this.gestures.set(Gesture, Gesture);
  }
  public getTypes() {
    return Array.from(this.gestures.keys());
  }
  public create<T extends typeof DefaultGesture>(
    Type: T, element: Element, listener: Partial<DefaultListener & {options: {}}>) {
    const Gesture = this.gestures.get(Type);
    if (!Gesture) {
      throw new Error(`The type ${typeof Type} has not been registered`);
    }
    const options = Object.assign(DefaultGesture.options, Gesture.options, listener.options);
    return new Gesture(element, new DefaultListener(options, listener));
  }
}
