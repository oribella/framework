import {Options, GESTURE_STRATEGY_FLAG, PointerData} from './utils';

export interface ListenerData {
  pointers: PointerData[];
}

export class Listener<T extends Options> {
  public pointers: number = 1;
  public which: number = 1;
  public prio: number = 100;
  public strategy: number = GESTURE_STRATEGY_FLAG.KEEP;
  public selector: string;

  constructor(public options: T, listener?: Partial<Listener<T>>) {
    Object.assign(this, listener);
  }

  public down(): number { return 0; }
  public start(evt: Event, data: ListenerData, target: Element): number;
  public start(): number;
  public start(): number { return 0; }
  public update(evt: Event, data: ListenerData, target: Element): number;
  public update(): number;
  public update(): number { return 0; }
  public end(): number { return 0; }
  public cancel(): number { return 0; }
}
