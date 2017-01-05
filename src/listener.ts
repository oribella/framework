import { Options, PointerData, RETURN_FLAG } from './utils';

export class Data {
  public pointers: PointerData[];
}

export class Listener<T extends Options, U extends Data> {
  public selector: string = '';
  public listener: Listener<T, U>;
  constructor(public options: T, listener: Listener<T, U> = {} as Listener<T, U>) {
    this.listener = Object.assign({
      down(_1, _2, _3) { },
      start(_1, _2, _3) { },
      update(_1, _2, _3) { },
      end(_1, _2, _3) { },
      cancel() { }
    } as DefaultListener, listener);
  }
  public down(evt: Event, data: U, target: Element): number { return RETURN_FLAG.map(this.listener.down(evt, data, target)); }
  public start(evt: Event, data: U, target: Element): number {
    let result = RETURN_FLAG.map(this.listener.start(evt, data, target));
    if (!(result & RETURN_FLAG.START_EMITTED)) {
      result += RETURN_FLAG.START_EMITTED;
    }
    return result;
  }
  public update(evt: Event, data: U, target: Element): number { return RETURN_FLAG.map(this.listener.update(evt, data, target)); } //tslint:disable-line
  public end(evt: Event, data: U, target: Element): number { return RETURN_FLAG.map(this.listener.end(evt, data, target)); }
  public cancel(): number { return RETURN_FLAG.map(this.listener.cancel()); }
}

export class DefaultListener extends Listener<Options, Data> { }
