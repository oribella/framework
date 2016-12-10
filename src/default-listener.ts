import {GESTURE_STRATEGY_FLAG} from './utils';

export class DefaultListener {;
  pointers: number = 1;
  which: number = 1;
  prio: number = 100;
  strategy: number = GESTURE_STRATEGY_FLAG.KEEP;
  selector: string;
  constructor(defaultOptions?: Partial<DefaultListener>, listener?: Partial<DefaultListener>) {
    Object.assign(this, defaultOptions, listener);
  }
  down(): number { return 0; }
  start(): number { return 0; }
  update(): number { return 0; }
  end(): number { return 0; }
  cancel(): number { return 0; }
}
