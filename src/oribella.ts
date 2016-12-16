import {Engine} from './engine';
import {MSPointerFlow} from './flows/ms-pointer';
import {PointerFlow} from './flows/pointer';
import {TouchFlow} from './flows/touch';
import {MouseFlow} from './flows/mouse';
import {Supports} from './utils';
import {DefaultGesture} from './default-gesture';
import {DefaultListener} from './default-listener';

export type ListenerType = { type: string, handleGesture: Partial<DefaultListener> };
export type GestureType = { type: string, gesture: Partial<DefaultGesture> };

export class Oribella {
  private engine: Engine;
  private deactivateFlows: Array<Array<() => void>> | null = null;

  constructor(
    private element: Element | Document = window && window.document,
    private supports: Supports = {
      touchEnabled: ('ontouchstart' in window),
      pointerEnabled: (window && window.navigator.pointerEnabled),
      msPointerEnabled: (window && window.navigator.msPointerEnabled) }
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
  public registerGesture(...gestures: GestureType[]) {
    gestures.forEach((g) => this.engine.registerGesture(g.type, g.gesture));
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
  public on(element: Element, ...listeners: ListenerType[]) {
    return listeners.map((l) => this.engine.registerListener(element, l.type, l.handleGesture));
  }
}
