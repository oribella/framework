import {GestureOptions, PointerData, GESTURE_STRATEGY_FLAG} from './utils';
import {DefaultListener} from './default-listener';

export class DefaultGesture {
  public static options: GestureOptions = {
    pointers: 1,
    which: 1,
    prio: 100,
    strategy: GESTURE_STRATEGY_FLAG.KEEP
  };
  public __POINTERIDS__: string[] = [];
  public startEmitted: boolean = false;

  constructor(public target: Element, public listener: DefaultListener, gesture?: Partial<DefaultGesture>) {
    Object.assign(this, gesture);
  }
  public bind(
    element: Element,
    registerListener: (element: Element, type: string, listener: DefaultListener) => () => void,
    remove: (gesture: DefaultGesture, ...arr: DefaultGesture[]) => void
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
