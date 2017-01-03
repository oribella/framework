import { Options, PointerData, RETURN_FLAG } from './utils';

export interface ListenerData {
  pointers: PointerData[];
}

export interface DefaultListener extends Listener<Options> { }

export class Listener<T extends Options> {
  public selector: string = '';
  public listener: Listener<T>;
  constructor(public options: T, listener: Listener<T> = {} as Listener<T>) {
    this.listener = Object.assign({
      down(_1, _2, _3) { },
      start(_1, _2, _3) { },
      update(_1, _2, _3) { },
      end(_1, _2, _3) { },
      cancel() { }
    } as Listener<T>, listener);
  }
  public down(evt: Event, data: ListenerData, target: Element): number { return RETURN_FLAG.map(this.listener.down(evt, data, target)); }
  public start(evt: Event, data: ListenerData, target: Element): number { return RETURN_FLAG.map(this.listener.start(evt, data, target)) + RETURN_FLAG.START_EMITTED; }
  public update(evt: Event, data: ListenerData, target: Element): number { return RETURN_FLAG.map(this.listener.update(evt, data, target)); }
  public end(evt: Event, data: ListenerData, target: Element): number { return RETURN_FLAG.map(this.listener.end(evt, data, target)); }
  public cancel(): number { return RETURN_FLAG.map(this.listener.cancel()); }
}
