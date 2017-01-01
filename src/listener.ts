import {Options, PointerData} from './utils';

export interface ListenerData {
  pointers: PointerData[];
}

export interface DefaultListener extends Listener<Options> {}

export class Listener<T extends Options> {
  public selector: string = '';
  constructor(public options: T, listener?: Partial<Listener<T>>) {
    Object.assign(this, listener);
  }

  public down(evt: Event, data: ListenerData, target: Element): number;
  public down(): number;
  public down(): number { return 0; }
  public start(evt: Event, data: ListenerData, target: Element): number;
  public start(): number;
  public start(): number { return 0; }
  public update(evt: Event, data: ListenerData, target: Element): number;
  public update(): number;
  public update(): number { return 0; }
  public end(evt: Event, data: ListenerData, target: Element): number;
  public end(): number;
  public end(): number { return 0; }
  public cancel(): number { return 0; }
}
