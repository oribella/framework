import { Gesture } from './gesture';
import { Listener, DefaultListener } from './listener';
import { Options } from './utils';

interface Value {
  Gesture: typeof Gesture;
  GestureOptions: typeof Options;
  GestureListener: typeof Listener;
}

export class Registry {
  private gestures: Map<typeof Gesture, Value> = new Map<typeof Gesture, Value>();
  public register<T extends typeof Gesture, U extends typeof Options, V extends typeof Listener>(Gesture: T, GestureOptions: U = Options as U, GestureListener: V = Listener as V) {
    this.gestures.set(Gesture, { Gesture, GestureOptions, GestureListener });
  }
  public getTypes() {
    return Array.from(this.gestures.keys());
  }
  public create<T extends typeof Gesture>(Type: T, element: Element, listener: Partial<DefaultListener>) {
    const val = this.gestures.get(Type);
    if (!val) {
      throw new Error(`The type ${typeof Type} has not been registered`);
    }
    const options = Object.assign(new val.GestureOptions(), listener.options);
    return new val.Gesture(new val.GestureListener(options, listener), element);
  }
}
