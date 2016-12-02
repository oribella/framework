import {Registry, DefaultGesture, DefaultSubscriber} from './registry';
import {Flow} from  './flow';
import {Pointers, PointerMap,Pointer, isMouse, isValidMouseButton, RETURN_FLAG, GESTURE_STRATEGY_FLAG} from './utils';
import {Handle} from './handle';

export interface Supports {
  MSPointerEvent: boolean;
  PointerEvent: boolean;
}

export type PointersDelta = { all: number, changed: number };
export type ExecStrategy = (event: Event, gestures: Array<DefaultGesture>, gesture: DefaultGesture, pointers: Pointers, pointersDelta: PointersDelta) => number;

export class Engine {
  private flows: Array<Flow> = [];
  private activeFlow: Flow | null = null;
  private handles: Array<Handle> = [];
  private gestures: Array<DefaultGesture> = [];
  private composedGestures: Array<DefaultGesture> = [];

  constructor(private registry: Registry, private supports: Supports, private element: Element) {}

  registerGesture(type: string, Gesture: typeof DefaultGesture) {
    this.registry.register(type, Gesture);
  }
  registerFlows(...flows: Array<Flow>) {
    this.flows.push.apply(this.flows, flows);
    flows.forEach(flow => {
      flow.on('start', (e: Event, p: Pointers) => this.start(flow, e, p));
      flow.on('update', (e: Event, p: Pointers) => this.update(flow, e, p));
      flow.on('end', (e: Event, p: Pointers) => this.end(flow, e, p));
      flow.on('cancel', (e: Event, p: Pointers) => this.cancel(flow, e, p));
    });
  }
  activate() {
    return this.flows.map(f => f.activate());
  }

  private canActivateFlow(flow: Flow) {
    return (this.activeFlow === null || this.activeFlow === flow);
  }
  getPointersDelta(
    event: Event,
    pointers: Pointers,
    configuredPointers: number,
    configuredWhich: Array<number>|number) : PointersDelta {

    if (isMouse(this.supports, event) &&
      !isValidMouseButton(event as MouseEvent, configuredWhich)) {
      return { all: -1, changed: -1 };
    }
    const all = pointers.all.size - configuredPointers;
    const current = pointers.changed.size - configuredPointers;
    return {
      all: all,
      changed: current
    };
  }
  removeGesture(gesture: DefaultGesture, ...arr: Array<Array<DefaultGesture>>) {
    if(gesture.startEmitted) {
      gesture.cancel();
    }
    gesture.unbind();
    let gestures;
    while(gestures = arr.shift()) {
      let ix = gestures.indexOf(gesture);
      if (ix !== -1) {
        gestures.splice(ix, 1);
      }
    }
  }
  execEnterStrategies(
    event: Event,
    gestures: Array<DefaultGesture>,
    gesture: DefaultGesture,
    pointers: Pointers,
    pointersDelta: PointersDelta): number {
    event;gestures;gesture;pointers;pointersDelta;

    if(pointersDelta.all > 0 &&
      gesture.subscriber.options.strategy === GESTURE_STRATEGY_FLAG.REMOVE_IF_POINTERS_GT) {
        return RETURN_FLAG.REMOVE_AND_CONTINUE;
      }
    return RETURN_FLAG.IDLE;
  }
  execExitStrategies(
    event: Event,
    gestures: Array<DefaultGesture>,
    gesture: DefaultGesture,
    pointerMaps: Pointers,
    flag: number) {
    event;gestures;pointerMaps;

    if(flag & RETURN_FLAG.START_EMITTED) {
      gesture.startEmitted = true;
    }
    if(flag & RETURN_FLAG.REMOVE) {
      this.removeGesture(gesture, this.gestures, this.composedGestures);
    }
    if(flag & RETURN_FLAG.REMOVE_OTHERS) {
      const others = this.gestures.slice();
      let otherGesture;
      while(otherGesture = others.shift()) {
        if(gesture === otherGesture) {
          continue;
        }
        this.removeGesture(otherGesture, this.gestures, this.composedGestures);
      }
    }
  }
  forGestures(
    event: Event,
    gestures: Array<DefaultGesture>,
    pointerMaps: Pointers,
    execStrategy: ExecStrategy) {

    let gesture;
    while(gesture = gestures.shift()) {
      const { pointers, which } = gesture.subscriber.options;
      const pointersDelta = this.getPointersDelta(event, pointerMaps, pointers, which);
      const enterFlag = this.execEnterStrategies(event, gestures, gesture, pointerMaps, pointersDelta);
      if(enterFlag & RETURN_FLAG.REMOVE_AND_CONTINUE) {
        this.removeGesture(gesture, this.gestures, this.composedGestures);
        continue;
      }
      const execFlag = execStrategy(event, gestures, gesture, pointerMaps, pointersDelta);
      this.execExitStrategies(event, gestures, gesture, pointerMaps, execFlag);
    }
  }
  addPointerId(gesture: DefaultGesture, pointerId: string) {
    gesture.__POINTERS__.push(pointerId);
  }
  removePointerIds(gesture: DefaultGesture, changed: Array<string>): Array<string> {
    const pointerIds = [];
    let pointerId;
    while(pointerId = changed.shift()) {
      const ix = gesture.__POINTERS__.indexOf(pointerId);
      if(ix !== -1) {
        const removed = gesture.__POINTERS__.splice(ix, 1)[0];
        pointerIds.push(removed);
      }
    }
    return pointerIds;
  }
  getPointerIds(gesture: DefaultGesture) {
    return gesture.__POINTERS__;
  }
  getPointers(map: PointerMap, pointerIds: Array<string>): Array<Pointer> {
    return pointerIds.map((pointerId) => {
      return map.get(pointerId) as Pointer;
    });
  }
  hasPointer(gesture: DefaultGesture, map: PointerMap): boolean {
    const lockedPointers = this.getPointerIds(gesture);
    const changed = Array.prototype.slice.call(map.keys());
    let pointerId;
    while(pointerId = changed.shift()) {
      if(lockedPointers.indexOf(pointerId) !== -1) {
        return true;
      }
    }
    return false;
  }
  startStrategy(
    event: Event,
    gestures: Array<DefaultGesture>,
    gesture: DefaultGesture,
    pointers: Pointers,
    pointersDelta: PointersDelta): number {
    gestures;gesture;pointersDelta;

    if(pointersDelta.all !== 0) {
      return RETURN_FLAG.IDLE;
    }
    //Lock pointer ids on gesture
    pointers.all.forEach((_, pointerId) => this.addPointerId(gesture, pointerId));
    return gesture.start(event, this.getPointers(pointers.all, gesture.__POINTERS__));
  }
  updateStrategy(
    gestures: Array<DefaultGesture>,
    gesture: DefaultGesture,
    pointers: Pointers,
    pointersDelta: PointersDelta): number {
    gestures;gesture;pointers;pointersDelta;

    if(!this.hasPointer(gesture, pointers.changed)) {
      return RETURN_FLAG.IDLE;
    };
    return gesture.update(event, this.getPointers(pointers.all, gesture.__POINTERS__));
  }
  endStrategy(
    gestures: Array<DefaultGesture>,
    gesture: DefaultGesture,
    pointers: Pointers,
    pointersDelta: PointersDelta) {
    gestures;gesture;pointers;pointersDelta;

    if(!gesture.startEmitted) {
      return RETURN_FLAG.REMOVE;
    }

    const removedPointerIds = this.removePointerIds(gesture, Array.prototype.slice.call(pointers.changed.keys()));
    if(gesture.__POINTERS__.length !== 0) {
      return RETURN_FLAG.REMOVE;
    }
    return gesture.end(event, this.getPointers(pointers.changed, removedPointerIds));
  }
  cancelStrategy(
    gestures: Array<DefaultGesture>,
    gesture: DefaultGesture,
    pointers: Pointers,
    pointersDelta: PointersDelta): number {
    gestures;gesture;pointers;pointersDelta;

    return gesture.cancel(/*event, this.getPointers(pointers.all, gesture.__POINTERS__)*/);
  }
  start(flow: Flow, event: Event, pointers: Pointers): boolean {
    if(!this.canActivateFlow(flow)) {
      return false;
    }
    this.activeFlow = flow;

    this.gestures = this.gestures
                      .concat(this.match(event.target as Node))
                      .sort( (g1, g2) => {
                        return g1.subscriber.options.prio -
                          g2.subscriber.options.prio;
                      });

    if (!this.gestures.length) {
      return false; //No match don't continue
    }

    this.forGestures(event, this.gestures.slice(), pointers, this.startStrategy.bind(this));

    return true;
  }
  update(flow: Flow, event: Event, pointers: Pointers) {
    if (this.activeFlow !== flow) {
      return;
    }
    this.forGestures(event, this.gestures.slice(), pointers, this.updateStrategy.bind(this));
  }
  end(flow: Flow, event: Event, pointers: Pointers) {
    if (this.activeFlow !== flow) {
      return;
    }
    this.forGestures(event, this.gestures.slice(), pointers, this.endStrategy.bind(this));
  }
  cancel(flow: Flow, event: Event, pointers: Pointers) {
    flow; event; pointers;
    if (this.activeFlow !== flow) {
      return;
    }
    this.forGestures(event, this.gestures, pointers, this.cancelStrategy.bind(this));
  }

  addHandle(element: Element, type: string, subscriber: DefaultSubscriber): () => void {
    const handle = new Handle(element, type, subscriber);

    this.handles.push(handle);

    return () => {
      const ix = this.handles.indexOf(handle);
      if (ix !== -1) {
        this.handles.splice(ix, 1);
      }
    };
  }
  addGesture(handle: Handle, element: Element): DefaultGesture {
    const gesture = this.registry.create(handle.type, handle.subscriber, element);
    gesture.bind(handle.element, this.addHandle.bind(this), this.removeGesture.bind(this, gesture, this.gestures, this.composedGestures));
    return gesture;
  }
  match(startElement: Node): Array<DefaultGesture> {
    let gestures: Array<DefaultGesture> = [];

    for (let element = startElement; element !== this.element; element = element.parentNode) {
      for (let i = 0; i < this.handles.length; ++i) { //Always evaluate length since gestures could bind gestures
        const handle = this.handles[i];
        const selector = handle.subscriber.selector;
        let matched = false;

        if (!handle.element.contains(element) || (selector && handle.element === element)) {
          continue;
        }

        if (!selector && element === handle.element) {
          matched = true;
        } else if (selector) {
          if (this.matchesSelector(element, selector)) {
            matched = true;
          }
        }
        if (matched) {
          let gesture;
          while (gesture = this.composedGestures.shift()) {
            if (gesture.subscriber === handle.subscriber) {
              break;
            }
          }
          if (!gesture) {
            gesture = this.addGesture(handle, element as Element);
          }
          gestures.push(gesture);
        }
      }
    }

    return gestures;
  }
  matchesSelector(element: any, selector: string) {
    return (element.matchesSelector ||
      element.webkitMatchesSelector ||
      element.mozMatchesSelector ||
      element.msMatchesSelector ||
      element.oMatchesSelector
    ).call(element, selector);
  }
}
