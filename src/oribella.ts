import { Engine } from './engine';
import { MSPointerFlow } from './flows/ms-pointer';
import { PointerFlow } from './flows/pointer';
import { TouchFlow } from './flows/touch';
import { MouseFlow } from './flows/mouse';
import { Supports } from './utils';
import { Gesture } from './gesture';
import { Listener, DefaultListener } from './listener';
import { Options } from './utils';

export type ListenerType = { type: string, listener: Partial<DefaultListener> };

export class Oribella {
  private engine: Engine;
  private deactivateFlows: Array<Array<() => void>> | null = null;

  constructor(
    private element: Element | Document = window && window.document,
    private supports: Supports = {
      touchEnabled: ('ontouchstart' in window),
      pointerEnabled: (window && window.navigator.pointerEnabled),
      msPointerEnabled: (window && window.navigator.msPointerEnabled)
    }
  ) {
    this.engine = new Engine(this.element, this.supports);
  }
  public registerDefaultFlowStrategy() {
    if (this.supports.msPointerEnabled) {
      this.engine.registerFlow(new MSPointerFlow(this.element));
    }
    if (this.supports.pointerEnabled) {
      this.engine.registerFlow(new PointerFlow(this.element));
    }
    if (this.supports.touchEnabled) {
      this.engine.registerFlow(new TouchFlow(this.element));
    }
    this.engine.registerFlow(new MouseFlow(this.element));
  }
  public registerGesture<T extends typeof Gesture, U extends typeof Options, V extends typeof Listener>(Gesture: T, GestureOptions: U = Options as U, GestureListener: V = Listener as V) {
    this.engine.registerGesture(Gesture, GestureOptions, GestureListener);
  }
  public activate() {
    this.deactivateFlows = this.engine.activate();
  }
  public deactivate() {
    if (this.deactivateFlows) {
      this.deactivateFlows.forEach((flow) => flow.forEach((f) => f()));
      this.deactivateFlows = null;
    }
  }
  public on<T extends typeof Gesture>(Type: T, element: Element, listener: DefaultListener) {
    return this.engine.registerListener(Type, element, listener);
  }
}
