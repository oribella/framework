import { Options } from '../../../src/utils';
import { PointerData, RETURN_FLAG } from '../../../src/utils';
import { Gesture } from '../../../src/gesture';
import { Listener } from '../../../src/listener';
import { Point } from '../../../src/point';

export class SwipeOptions extends Options {
  public radiusThreshold: number = 2;
}

export class Swipe extends Gesture<Listener<SwipeOptions>> {
  public startPoint: Point;

  public start(evt: Event, pointers: PointerData[]): number {
    this.startPoint = pointers[0].page;
    return this.listener.down(evt, { pointers }, this.target);
  }
  public update(evt: Event, pointers: PointerData[]): number {
    const p = pointers[0].page;
    if (p.distanceTo(this.startPoint) < this.listener.options.radiusThreshold) {
      return RETURN_FLAG.IDLE;
    }
    if (!this.startEmitted) {
      return this.listener.start(evt, { pointers }, this.target);
    } else {
      return this.listener.update(evt, { pointers }, this.target);
    }
  }
  public end(evt: Event, pointers: PointerData[]): number {
    return this.listener.end(evt, { pointers }, this.target);
  }
  public cancel() {
    return this.listener.cancel();
  }
}
