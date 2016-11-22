import {EventEmitter} from 'events';
import {Point} from './point';

export class TypeConfig {
  constructor(private events: Array<string>){}
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
  private startListen: Array<() => () => void>;
  private continueListen: Array<() => () => void>;
  private removeListeners: Array<() => void>;
  private allPointers = new Map<string, Pointer>();
  private currentPointers = new Map<string, Pointer>();

  constructor(private config: Config) {
    super();
    this.bind();
  }

  addDOMEventListener(element: Element, event: string, fn: () => void) {
    element.addEventListener(event, fn, false);
    return this.removeDOMEventListener.bind(null, element, event, fn);
  }

  removeDOMEventListener(element: Element, event: string, fn: () => void) {
    element.removeEventListener(event, fn, false);
  }

  private bind() {
    this.startListen = this.config.start.getEvents().map(e => {
      return this.addDOMEventListener.bind(this.config.element, e, this.start.bind(this));
    });
    this.continueListen = this.config.update.getEvents().map(e => {
      return this.addDOMEventListener.bind(this.config.element, e, this.update.bind(this));
    });
    this.continueListen.concat(
      this.config.end.getEvents().map(e => {
        return this.addDOMEventListener.bind(this.config.element, e, this.end.bind(this));
      })
    );
    this.continueListen.concat(
      this.config.cancel.getEvents().map(e => {
        return this.addDOMEventListener.bind(this.config.element, e, this.cancel.bind(this));
      })
    );
  }
  activate() : Array<() => void> {
    return this.startListen.map(f => f());
  }
  getPointers(event: Event) {
    event;
    return [this.allPointers, this.currentPointers];
  }
  start(event: Event) {
    this.emit('start', event, ...this.getPointers(event));
  }
  update(event: Event) {
    this.emit('update', event, ...this.getPointers(event));
  }
  end(event: Event) {
    this.emit('end', event, ...this.getPointers(event));
    if(this.allPointers.size === 0) {
      this.stop();
    }
  }
  cancel(event: Event) {
    this.emit('cancel', event, ...this.getPointers(event));
    this.stop();
  }
  continue() {
    this.removeListeners = this.continueListen.map(f => f());
  }
  stop() {
    this.removeListeners.forEach(remove => remove());
    this.emit('stop');
  }
}
