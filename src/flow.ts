import {EventEmitter} from 'events';
import {Point} from './point';

export class TypeConfig {
  private events: string[];
  constructor(...events: string[]){ this.events = events; }
  getEvents() {
    return this.events;
  }
}
export class StartConfig extends TypeConfig {}
export class UpdateConfig extends TypeConfig {}
export class EndConfig extends TypeConfig {}
export class CancelConfig extends TypeConfig {}
export interface Config {
  element: Element;
  start: StartConfig;
  update: UpdateConfig;
  end: EndConfig;
  cancel: CancelConfig;
}
export interface Pointer {
  page: Point;
  client: Point;
}

export class Flow extends EventEmitter {
  startListen: Array<() => () => void> = [];
  continueListen: Array<() => () => void> = [];
  removeListeners: Array<() => void> = [];
  allPointers: Map<string, Pointer> = new Map<string, Pointer>();
  currentPointers: Map<string, Pointer> = new Map<string, Pointer>();
  pointers: { all: Map<string, Pointer>, current: Map<string, Pointer> } = { all: this.allPointers, current: this.currentPointers };

  addDOMEventListener(element: Element, event: string, fn: () => void): () => void {
    const proxyFn = (e: Event) => {
      this.setPointers(e);
      fn();
    };
    element.addEventListener(event, proxyFn, false);
    return this.removeDOMEventListener.bind(this, element, event, proxyFn);
  }

  removeDOMEventListener(element: Element, event: string, fn: () => void) {
    element.removeEventListener(event, fn, false);
  }

  bind(config: Config): { startListen: Array<() => () => void>, continueListen: Array<() => () => void> } {
    this.startListen = config.start.getEvents().map(e => {
      return this.addDOMEventListener.bind(this, config.element, e, this.start.bind(this));
    });
    this.continueListen = config.update.getEvents().map(e => {
      return this.addDOMEventListener.bind(this, config.element, e, this.update.bind(this));
    });
    this.continueListen.push.apply(
      this.continueListen,
      config.end.getEvents().map(e => {
        return this.addDOMEventListener.bind(this, config.element, e, this.end.bind(this));
      })
    );
    this.continueListen.push.apply(
      this.continueListen,
      config.cancel.getEvents().map(e => {
        return this.addDOMEventListener.bind(this, config.element, e, this.cancel.bind(this));
      })
    );
    return { startListen: this.startListen, continueListen: this.continueListen };
  }
  activate(config: Config) : Array<() => void> {
    return this.bind(config).startListen.map(f => f());
  }
  setPointers(event: Event) {
    event;
  }
  start(event: Event) {
    this.emit('start', event, this.pointers);
  }
  update(event: Event) {
    this.emit('update', event, this.pointers);
  }
  end(event: Event) {
    this.emit('end', event, this.pointers);
    if(this.allPointers.size === 0) {
      this.stop();
    }
  }
  cancel(event: Event) {
    this.emit('cancel', event, this.pointers);
    this.stop();
  }
  continue() {
    this.removeListeners = this.continueListen.map(f => f());
  }
  stop() {
    this.removeListeners.forEach(remove => remove());
    this.removeListeners = [];
    this.emit('stop');
  }
}
