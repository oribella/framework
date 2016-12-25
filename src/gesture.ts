import {PointerData, Options} from './utils';
import {Listener} from './listener';

// tslint:disable-next-line:max-classes-per-file
export class Gesture<T extends Options> {
  public __POINTERIDS__: string[] = [];
  public startEmitted: boolean = false;

  constructor(
    public options: T,
    public target: Element,
    public listener: Listener<T>,
    gesture?: Partial<Gesture<T>>) {
    Object.assign(this, gesture);
  }
  public bind(
    element: Element,
    registerListener: <U extends Options>(element: Element, type: string, listener: Listener<U>) => () => void,
    remove: <U extends Options>(gesture: Gesture<U>, ...arr: Array<Gesture<U>>) => void
    ): void;
  public bind() {} // tslint:disable-line:no-empty
  public unbind() {} // tslint:disable-line:no-empty
  public start(evt: Event, pointers: PointerData[]): number;
  public start() { return 0; }
  public update(evt: Event, pointers: PointerData[]): number;
  public update() { return 0; }
  public end(evt: Event, pointers: PointerData[]): number;
  public end() { return 0; }
  public cancel(): number { return 0; }
}
