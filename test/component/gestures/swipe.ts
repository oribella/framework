import { Options, Data } from '../../../src/utils';
import { RETURN_FLAG } from '../../../src/utils';
import { Gesture } from '../../../src/gesture';
import { Listener } from '../../../src/listener';
import { Point } from '../../../src/point';

export class Observation {
  constructor(public point: Point, public timeStamp: number) { }
}

export class SwipeData extends Data {
  public timeSeries: Observation[] = [];
  constructor(public maxObservations: number = 5) {
    super();
  }
  public add(point: Point, timeStamp: number) {
    if (this.timeSeries.length === this.maxObservations) {
      this.timeSeries.shift();
    }
    this.timeSeries.push(new Observation(point, timeStamp));
  }
}

export class SwipeOptions extends Options {
  public radiusThreshold: number = 2;
}

export class Swipe extends Gesture<SwipeData, Listener<SwipeOptions, SwipeData>> {
  public startPoint: Point;

  public start(evt: Event, data: SwipeData): number {
    this.startPoint = data.pointers[0].page;
    console.log(data.add); //tslint:disable-line
    // data.add(this.startPoint, evt.timeStamp);
    return this.listener.down(evt, data, this.target);
  }
  public update(evt: Event, data: SwipeData): number {
    const p = data.pointers[0].page;
    if (p.distanceTo(this.startPoint) < this.listener.options.radiusThreshold) {
      return RETURN_FLAG.IDLE;
    }
    if (!this.startEmitted) {
      return this.listener.start(evt, data, this.target);
    } else {
      return this.listener.update(evt, data, this.target);
    }
  }
  public end(evt: Event, data: SwipeData): number {
    return this.listener.end(evt, data, this.target);
  }
  public cancel() {
    return this.listener.cancel();
  }
}
