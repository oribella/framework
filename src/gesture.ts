import {PointerData, Options} from './utils';
import {Listener} from './listener';

// tslint:disable-next-line:max-classes-per-file
export class Gesture<T extends Options> {
  public __POINTERIDS__: string[] = [];
  public startEmitted: boolean = false;

  constructor(
    public options: T,
    public target: Element,
    public listener: Listener<T>
    /*gesture?: Partial<Gesture<T>>*/) {
    // Object.assign(this, gesture);
  }
  public bind(
    target: Element,
    registerListener: <T extends typeof Gesture>(
      Type: T,
      element: Element,
      listener: Partial<Listener<Options>>
    ) => () => void,
    remove: () => void
    ): void;
  public bind() {} // tslint:disable-line:no-empty
  public unbind(): number { return 0; }
  public start(evt: Event, pointers: PointerData[]): number;
  public start() { return 0; }
  public update(evt: Event, pointers: PointerData[]): number;
  public update() { return 0; }
  public end(evt: Event, pointers: PointerData[]): number;
  public end() { return 0; }
  public cancel(): number { return 0; }
}
