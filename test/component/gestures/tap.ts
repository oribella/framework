import { Options } from '../../../src/utils';
import { PointerData, RETURN_FLAG } from '../../../src/utils';
import { Gesture } from '../../../src/gesture';
import { Point } from '../../../src/point';

export class TapOptions extends Options {
  public radiusThreshold: number = 2;
}

// tslint:disable-next-line:max-classes-per-file
export class Tap extends Gesture<TapOptions> {
  public startPoint: Point;

  public start(evt: Event, pointers: PointerData[]): number {
    this.startPoint = pointers[0].page;
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
    const result = this.listener.end(evt, { pointers }, this.target);
    return RETURN_FLAG.map(result);
  }
  public cancel() {
    return RETURN_FLAG.map(this.listener.cancel());
  }
}
