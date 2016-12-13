import {EventEmitter} from 'events';
import {PointerData, Pointers} from './utils';

export class EventConfig {
  private events: string[];
  constructor(...events: string[]){ this.events = events; }
  getEvents() {
    return this.events;
  }
}

export interface FlowConfig {
  start: EventConfig;
  update: EventConfig;
  end: EventConfig;
  cancel: EventConfig;
}

export class Flow extends EventEmitter {
  config: FlowConfig;
  startListen: (() => () => void)[] = [];
  continueListen: (() => () => void)[] = [];
  removeListeners: (() => void)[] = [];
  allPointers: Map<string, PointerData> = new Map<string, PointerData>();
  changedPointers: Map<string, PointerData> = new Map<string, PointerData>();
  pointers: Pointers = { all: this.allPointers, changed: this.changedPointers };

  constructor(private element: Element | Document, config: FlowConfig) {
    super();
    this.config = config;
  }

  addDOMEventListener(element: Element, evt: string, fn: () => void): () => void {
    const proxyFn = (e: Event) => {
      this.setPointers(e);
      fn();
    };
    element.addEventListener(evt, proxyFn, false);
    return this.removeDOMEventListener.bind(this, element, evt, proxyFn);
  }

  removeDOMEventListener(element: Element, evt: string, fn: () => void) {
    element.removeEventListener(evt, fn, false);
  }

  bind(config: FlowConfig): { startListen: (() => () => void)[], continueListen: (() => () => void)[] } {
    this.startListen = config.start.getEvents().map(e => {
      return this.addDOMEventListener.bind(this, this.element, e, this.start.bind(this));
    });
    this.continueListen = config.update.getEvents().map(e => {
      return this.addDOMEventListener.bind(this, this.element, e, this.update.bind(this));
    });
    this.continueListen.push.apply(
      this.continueListen,
      config.end.getEvents().map(e => {
        return this.addDOMEventListener.bind(this, this.element, e, this.end.bind(this));
      })
    );
    this.continueListen.push.apply(
      this.continueListen,
      config.cancel.getEvents().map(e => {
        return this.addDOMEventListener.bind(this, this.element, e, this.cancel.bind(this));
      })
    );
    return { startListen: this.startListen, continueListen: this.continueListen };
  }
  public activate(): (() => void)[] {
    return this.bind(this.config).startListen.map(f => f());
  }
  setPointers(evt: Event) {
    evt;
  }
  start(evt: Event) {
    this.emit('start', evt, this.pointers);
  }
  update(evt: Event) {
    this.emit('update', evt, this.pointers);
  }
  end(evt: Event) {
    this.emit('end', evt, this.pointers);
    if(this.allPointers.size === 0) {
      this.stop();
    }
  }
  cancel(evt: Event) {
    this.emit('cancel', evt, this.pointers);
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
