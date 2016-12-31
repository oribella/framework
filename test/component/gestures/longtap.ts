import { Options } from '../../../src/utils';
import { PointerData, RETURN_FLAG } from '../../../src/utils';
import { Gesture } from '../../../src/gesture';
import { Listener } from '../../../src/listener';
import { Point } from '../../../src/point';

export class LongtapOptions extends Options {
  public radiusThreshold: number = 2;
  public timeThreshold: number = 500;
}

export class LongtapListener extends Listener<LongtapOptions> {
  public timeEnd() { }
}

export class Longtap extends Gesture<LongtapListener> {
  public startPoint: Point;
  public timeoutId: number = 0;
  public timeEndEmitted: boolean = false;

  public start(evt: Event, pointers: PointerData[]): number {
    this.startPoint = pointers[0].page;
    this.timeoutId = window.setTimeout(() => {
      this.listener.timeEnd();
      this.timeEndEmitted = true;
    }, this.listener.options.timeThreshold);
    const result = this.listener.start(evt, { pointers }, this.target);
    return RETURN_FLAG.map(result) + RETURN_FLAG.START_EMITTED;
  }
  public update(_: Event, pointers: PointerData[]): number {
    const p = pointers[0].page;
    if (p.distanceTo(this.startPoint) > this.listener.options.radiusThreshold) {
      return RETURN_FLAG.REMOVE;
    }
    return RETURN_FLAG.IDLE;
  }
  public end(evt: Event, pointers: PointerData[]): number {
    window.clearTimeout(this.timeoutId);
    if (!this.timeEndEmitted) {
      return RETURN_FLAG.REMOVE;
    }
    const result = this.listener.end(evt, { pointers }, this.target);
    return RETURN_FLAG.map(result);
  }
  public cancel() {
    window.clearTimeout(this.timeoutId);
    return RETURN_FLAG.map(this.listener.cancel());
  }
}
