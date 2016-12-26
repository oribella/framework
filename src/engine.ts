import { Registry } from './registry';
import { Gesture } from './gesture';
import { Listener } from './listener';
import { Flow } from './flow';
import {
  Pointers, PointerDataMap, PointerData, isMouse,
  isValidMouseButton, RETURN_FLAG, GESTURE_STRATEGY_FLAG, Options
} from './utils';
import { ListenerHandle } from './listener-handle';
import { Supports, matchesSelector } from './utils';

export type PointersDelta = { all: number, changed: number };
export interface ExecStrategyState<T extends Options> {
  evt: Event;
  gestures: Array<Gesture<T>>;
  gesture: Gesture<T>;
  pointers: Pointers;
  pointersDelta: PointersDelta;
}
export type ExecStrategy = <T extends Options>(state: ExecStrategyState<T>) => number;
export class Engine {
  private flows: Flow[] = [];
  private activeFlow: Flow | null = null;
  private handles: Array<ListenerHandle<& typeof Gesture>> = [];
  private gestures: Array<Gesture<Options>> = [];
  private composedGestures: Array<Gesture<Options>> = [];

  constructor(
    private element: Element | Document,
    private supports: Supports,
    private registry: Registry = new Registry(),
  ) { }

  public registerGesture<T extends typeof Gesture, U extends typeof Options>(
    Gesture: T,
    Options: U) {
    this.registry.register(Gesture, Options);
  }
  public registerFlow(flow: Flow) {
    this.flows.push(flow);
    flow.on('start', (e: Event, p: Pointers) => this.onStart(flow, e, p));
    flow.on('update', (e: Event, p: Pointers) => this.onUpdate(flow, e, p));
    flow.on('end', (e: Event, p: Pointers) => this.onEnd(flow, e, p));
    flow.on('cancel', (e: Event, p: Pointers) => this.onCancel(flow, e, p));
  }
  public registerListener<T extends typeof Gesture>(
    Type: T,
    element: Element,
    listener: Partial<Listener<Options>>): () => void {
    const handle = new ListenerHandle(Type, element, listener);

    this.handles.push(handle);

    return () => {
      const ix = this.handles.indexOf(handle);
      if (ix !== -1) {
        this.handles.splice(ix, 1);
      }
    };
  }
  public activate() {
    return this.flows.map((f) => f.activate());
  }
  private canActivateFlow(flow: Flow) {
    return (this.activeFlow === null || this.activeFlow === flow);
  }
  private getPointersDelta(
    evt: Event,
    pointers: Pointers,
    configuredPointers: number,
    configuredWhich: number[] | number): PointersDelta {

    if (isMouse(this.supports, evt) &&
      !isValidMouseButton(evt as MouseEvent, configuredWhich)) {
      return { all: -1, changed: -1 };
    }
    const all = pointers.all.size - configuredPointers;
    const changed = pointers.changed.size - configuredPointers;
    return { all, changed };
  }
  private removeGesture(
    gesture: Gesture<Options>, ...arr: Array<Array<Gesture<Options>>>) {
    if (gesture.startEmitted) {
      gesture.cancel();
    }
    gesture.unbind();
    let gestures;
    while (gestures = arr.shift()) {
      let ix = gestures.indexOf(gesture);
      if (ix !== -1) {
        gestures.splice(ix, 1);
      }
    }
  }
  private evaluateStrategyReturnFlag(
    gestures: Array<Gesture<Options>>,
    gesture: Gesture<Options>,
    flag: number) {
    if (flag & RETURN_FLAG.START_EMITTED) {
      gesture.startEmitted = true;
    }
    if (flag & RETURN_FLAG.REMOVE) {
      this.removeGesture(gesture, this.gestures, this.composedGestures);
    }
    if (flag & RETURN_FLAG.REMOVE_OTHERS) {
      const others = this.gestures.slice();
      let otherGesture;
      while (otherGesture = others.shift()) {
        if (gesture === otherGesture) {
          continue;
        }
        this.removeGesture(otherGesture, gestures, this.gestures, this.composedGestures);
      }
    }
  }
  private whileGestures(
    evt: Event,
    gestures: Array<Gesture<Options>>,
    pointers: Pointers,
    execStrategy: ExecStrategy) {

    let gesture;
    while (gesture = gestures.shift()) {
      const { pointers: configuredPointers, which, strategy } = gesture.listener.options;
      const pointersDelta = this.getPointersDelta(evt, pointers, configuredPointers, which);
      if (pointersDelta.all > 0 && strategy === GESTURE_STRATEGY_FLAG.REMOVE_IF_POINTERS_GT) {
        this.removeGesture(gesture, this.gestures, this.composedGestures);
        continue;
      }
      const flag = execStrategy({ evt, gestures, gesture, pointers, pointersDelta });
      this.evaluateStrategyReturnFlag(gestures, gesture, flag);
    }
  }
  private addPointerId(gesture: Gesture<Options>, pointerId: string) {
    gesture.__POINTERIDS__.push(pointerId);
  }
  private removePointerIds(gesture: Gesture<Options>, changed: string[]): string[] {
    const pointerIds = this.getPointerIds(gesture);
    const removedPointerIds = [];
    let pointerId;
    while (pointerId = changed.shift()) {
      const ix = pointerIds.indexOf(pointerId);
      if (ix !== -1) {
        const removed = pointerIds.splice(ix, 1)[0];
        removedPointerIds.push(removed);
      }
    }
    return removedPointerIds;
  }
  private getPointerIds(gesture: Gesture<Options>) {
    return gesture.__POINTERIDS__;
  }
  private getPointers(map: PointerDataMap, pointerIds: string[]): PointerData[] {
    return pointerIds.map((pointerId) => map.get(pointerId) as PointerData);
  }
  private hasPointer(gesture: Gesture<Options>, map: PointerDataMap): boolean {
    const pointerIds = this.getPointerIds(gesture);
    return !!pointerIds.filter((pointerId) => map.has(pointerId)).length;
  }
  private startStrategy(state: ExecStrategyState<Options>): number {
    if (state.pointersDelta.all !== 0) {
      return RETURN_FLAG.IDLE;
    }
    // Lock pointer ids on gesture
    state.pointers.all.forEach((_, pointerId) => this.addPointerId(state.gesture, pointerId));
    return state.gesture.start(state.evt, this.getPointers(state.pointers.all, this.getPointerIds(state.gesture)));
  }
  private updateStrategy(state: ExecStrategyState<Options>): number {
    if (!this.hasPointer(state.gesture, state.pointers.changed)) {
      return RETURN_FLAG.IDLE;
    }
    return state.gesture.update(state.evt, this.getPointers(state.pointers.all, this.getPointerIds(state.gesture)));
  }
  private endStrategy(state: ExecStrategyState<Options>): number {
    if (!state.gesture.startEmitted) {
      return RETURN_FLAG.REMOVE;
    }
    const removedPointerIds = this.removePointerIds(state.gesture, Array.from(state.pointers.changed.keys()));
    if (removedPointerIds.length === 0) {
      return RETURN_FLAG.REMOVE;
    }
    return state.gesture.end(state.evt, this.getPointers(state.pointers.changed, removedPointerIds));
  }
  private cancelStrategy(state: ExecStrategyState<Options>): number {
    return state.gesture.cancel();
  }
  private onStart(flow: Flow, evt: Event, pointers: Pointers): boolean {
    if (!this.canActivateFlow(flow)) {
      return false;
    }
    this.activeFlow = flow;
    this.activeFlow.continue();

    this.gestures = this.gestures
      .concat(this.match(evt.target as Node))
      .sort((g1, g2) => {
        return g1.listener.options.prio -
          g2.listener.options.prio;
      });

    if (!this.gestures.length) {
      return false; // No match don't continue
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
  private addGesture<T extends typeof Gesture>(
    Type: T, element: Element, handle: ListenerHandle<T>): Gesture<Options> {
    const gesture = this.registry.create<T>(Type, element, handle.listener);
    gesture.bind(handle.element,
      this.registerListener.bind(this),
      this.removeGesture.bind(this, gesture, this.gestures, this.composedGestures));
    return gesture;
  }
  private composeGesture<T extends typeof Gesture>(
    Type: T, element: Element, handle: ListenerHandle<T>): Gesture<Options> {
    let gesture;
    while (gesture = this.composedGestures.shift()) {
      if (gesture.listener === handle.listener) {
        break;
      }
    }
    if (!gesture) {
      gesture = this.addGesture(Type, element, handle);
    }
    return gesture;
  }
  private matchesHandle<T extends typeof Gesture>(element: Element, handle: ListenerHandle<T>): boolean {
    const { element: refElement, listener: { selector } } = handle;

    if (!refElement.contains(element)) {
      return false;
    }
    if (selector && refElement === element) {
      return false;
    }
    if (selector && !matchesSelector(element, selector)) {
      return false;
    }
    if (!selector && element !== refElement) {
      return false;
    }
    return true;
  }
  private matchHandle<T extends typeof Gesture>(
    Type: T, element: Element, handle: ListenerHandle<T>): Gesture<Options> | undefined {
    if (!this.matchesHandle(element, handle)) {
      return;
    }
    return this.composeGesture(Type, element, handle);
  }
  private matchHandles(
    element: Element,
    gestures: Array<Gesture<Options>>): Array<Gesture<Options>> {
    for (const handle of this.handles) { // Always evaluate length since gestures could bind gestures
      const gesture = this.matchHandle(handle.Type, element, handle);
      if (gesture) {
        gestures.push(gesture);
      }
    }
    return gestures;
  }
  private match(target: Node): Array<Gesture<Options>> {
    const gestures: Array<Gesture<Options>> = [];
    for (let node: Node | null = target; node && node.nodeType === 1 && node !== this.element; node = node.parentNode) {
      this.matchHandles(node as Element, gestures);
    }
    return gestures;
  }
}
