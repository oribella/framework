import {GESTURE_STRATEGY_FLAG} from './utils';

export class DefaultListener {
  public pointers: number = 1;
  public which: number = 1;
  public prio: number = 100;
  public strategy: number = GESTURE_STRATEGY_FLAG.KEEP;
  public selector: string;

  constructor(defaultOptions?: Partial<DefaultListener>, listener?: Partial<DefaultListener>) {
    Object.assign(this, defaultOptions, listener);
  }

  public down(): number { return 0; }
  public start(): number { return 0; }
  public update(): number { return 0; }
  public end(): number { return 0; }
  public cancel(): number { return 0; }
}
