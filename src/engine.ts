import {Registry, DefaultGesture, DefaultSubscriber} from './registry';
import {Flow} from  './flow';
import {Pointers, PointerDataMap,PointerData, isMouse, isValidMouseButton, RETURN_FLAG, GESTURE_STRATEGY_FLAG} from './utils';
import {Handle} from './handle';

export interface Supports {
  MSPointerEvent: boolean;
  PointerEvent: boolean;
}

export type PointersDelta = { all: number, changed: number };
export interface ExecStrategyState {
  evt: Event;
  gestures: Array<DefaultGesture>;
  gesture: DefaultGesture;
  pointers: Pointers;
  pointersDelta: PointersDelta;
}
export type ExecStrategy = (state: ExecStrategyState) => number;

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
      flow.on('start', (e: Event, p: Pointers) => this.onStart(flow, e, p));
      flow.on('update', (e: Event, p: Pointers) => this.onUpdate(flow, e, p));
      flow.on('end', (e: Event, p: Pointers) => this.onEnd(flow, e, p));
      flow.on('cancel', (e: Event, p: Pointers) => this.onCancel(flow, e, p));
    });
  }
  activate() {
    return this.flows.map(f => f.activate());
  }
  private canActivateFlow(flow: Flow) {
    return (this.activeFlow === null || this.activeFlow === flow);
  }
  private getPointersDelta(
    evt: Event,
    pointers: Pointers,
    configuredPointers: number,
    configuredWhich: Array<number>|number) : PointersDelta {

    if (isMouse(this.supports, evt) &&
      !isValidMouseButton(evt as MouseEvent, configuredWhich)) {
      return { all: -1, changed: -1 };
    }
    const all = pointers.all.size - configuredPointers;
    const changed = pointers.changed.size - configuredPointers;
    return {
      all: all,
      changed: changed
    };
  }
  private removeGesture(gesture: DefaultGesture, ...arr: Array<Array<DefaultGesture>>) {
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
  private evaluateStrategyReturnFlag(gestures: Array<DefaultGesture>, gesture: DefaultGesture, flag: number) {
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
        this.removeGesture(otherGesture, gestures, this.gestures, this.composedGestures);
      }
    }
  }
  private whileGestures(
    evt: Event,
    gestures: Array<DefaultGesture>,
    pointers: Pointers,
    execStrategy: ExecStrategy) {

    let gesture;
    while(gesture = gestures.shift()) {
      const { pointers: configuredPointers, which } = gesture.subscriber.options;
      const pointersDelta = this.getPointersDelta(evt, pointers, configuredPointers, which);
      if(pointersDelta.all > 0 && gesture.subscriber.options.strategy === GESTURE_STRATEGY_FLAG.REMOVE_IF_POINTERS_GT) {
        this.removeGesture(gesture, this.gestures, this.composedGestures);
        continue;
      }
      const flag = execStrategy({evt, gestures, gesture, pointers, pointersDelta});
      this.evaluateStrategyReturnFlag(gestures, gesture, flag);
    }
  }
  private addPointerId(gesture: DefaultGesture, pointerId: string) {
    gesture.__POINTERS__.push(pointerId);
  }
  private removePointerIds(gesture: DefaultGesture, changed: Array<string>): Array<string> {
    const pointerIds = this.getPointerIds(gesture);
    const removedPointerIds = [];
    let pointerId;
    while(pointerId = changed.shift()) {
      const ix = pointerIds.indexOf(pointerId);
      if(ix !== -1) {
        const removed = pointerIds.splice(ix, 1)[0];
        removedPointerIds.push(removed);
      }
    }
    return removedPointerIds;
  }
  private getPointerIds(gesture: DefaultGesture) {
    return gesture.__POINTERS__;
  }
  private getPointers(map: PointerDataMap, pointerIds: Array<string>): Array<PointerData> {
    return pointerIds.map((pointerId) => map.get(pointerId) as PointerData);
  }
  private hasPointer(gesture: DefaultGesture, map: PointerDataMap): boolean {
    const pointerIds = this.getPointerIds(gesture);
    return !!pointerIds.filter(pointerId => map.has(pointerId)).length;
  }
  private startStrategy(state: ExecStrategyState): number {
    if(state.pointersDelta.all !== 0) {
      return RETURN_FLAG.IDLE;
    }
    //Lock pointer ids on gesture
    state.pointers.all.forEach((_, pointerId) => this.addPointerId(state.gesture, pointerId));
    return state.gesture.start(state.evt, this.getPointers(state.pointers.all, this.getPointerIds(state.gesture)));
  }
  private updateStrategy(state: ExecStrategyState): number {
    if(!this.hasPointer(state.gesture, state.pointers.changed)) {
      return RETURN_FLAG.IDLE;
    };
    return state.gesture.update(state.evt, this.getPointers(state.pointers.all, this.getPointerIds(state.gesture)));
  }
  private endStrategy(state: ExecStrategyState): number {
    if(!state.gesture.startEmitted) {
      return RETURN_FLAG.REMOVE;
    }
    const removedPointerIds = this.removePointerIds(state.gesture, Array.from(state.pointers.changed.keys()));
    if(removedPointerIds.length === 0) {
      return RETURN_FLAG.REMOVE;
    }
    return state.gesture.end(state.evt, this.getPointers(state.pointers.changed, removedPointerIds));
  }
  private cancelStrategy(state: ExecStrategyState): number {
    return state.gesture.cancel();
  }
  private onStart(flow: Flow, evt: Event, pointers: Pointers): boolean {
    if(!this.canActivateFlow(flow)) {
      return false;
    }
    this.activeFlow = flow;

    this.gestures = this.gestures
                      .concat(this.match(evt.target as Node))
                      .sort( (g1, g2) => {
                        return g1.subscriber.options.prio -
                          g2.subscriber.options.prio;
                      });

    if (!this.gestures.length) {
      return false; //No match don't continue
    }

    this.whileGestures(evt, this.gestures.slice(), pointers, this.startStrategy.bind(this));

    return true;
  }
  private onUpdate(flow: Flow, evt: Event, pointers: Pointers) {
    if (this.activeFlow !== flow) {
      return;
    }
    this.whileGestures(evt, this.gestures.slice(), pointers, this.updateStrategy.bind(this));
  }
  private onEnd(flow: Flow, evt: Event, pointers: Pointers) {
    if (this.activeFlow !== flow) {
      return;
    }
    this.whileGestures(evt, this.gestures.slice(), pointers, this.endStrategy.bind(this));
  }
  private onCancel(flow: Flow, evt: Event, pointers: Pointers) {
    if (this.activeFlow !== flow) {
      return;
    }
    this.whileGestures(evt, this.gestures.slice(), pointers, this.cancelStrategy.bind(this));
  }
  private addHandle(element: Element, type: string, subscriber: DefaultSubscriber): () => void {
    const handle = new Handle(element, type, subscriber);

    this.handles.push(handle);

    return () => {
      const ix = this.handles.indexOf(handle);
      if (ix !== -1) {
        this.handles.splice(ix, 1);
      }
    };
  }
  private addGesture(handle: Handle, element: Element): DefaultGesture {
    const gesture = this.registry.create(handle.type, handle.subscriber, element);
    gesture.bind(handle.element, this.addHandle.bind(this), this.removeGesture.bind(this, gesture, this.gestures, this.composedGestures));
    return gesture;
  }
  private match(startElement: Node): Array<DefaultGesture> {
    const gestures: Array<DefaultGesture> = [];

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
  private matchesSelector(element: any, selector: string) {
    return (element.matchesSelector ||
      element.webkitMatchesSelector ||
      element.mozMatchesSelector ||
      element.msMatchesSelector ||
      element.oMatchesSelector
    ).call(element, selector);
  }
}
