import { Gesture } from './gesture';
import { Listener } from './listener';
import { Options } from './utils';

export class Registry {
  private gestures: Map<typeof Gesture,
  { Ctor: typeof Gesture, Options: typeof Options }> =
  new Map<typeof Gesture, { Ctor: typeof Gesture, Options: typeof Options }>();
  public register<T extends typeof Gesture, U extends typeof Options>(Ctor: T, Options: U) {
    this.gestures.set(Ctor, { Ctor, Options });
  }
  public getTypes() {
    return Array.from(this.gestures.keys());
  }
  public create<T extends typeof Gesture>(
    Type: T, element: Element,
    listener: Partial<Listener<Options>>) {

    const val = this.gestures.get(Type);
    if (!val) {
      throw new Error(`The type ${typeof Type} has not been registered`);
    }
    const options = Object.assign(new val.Options(), listener.options);
    return new val.Ctor(options, element, new Listener(options, listener));
  }
}
