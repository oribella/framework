import { expect } from 'chai';
import * as sinon from 'sinon';
import { Oribella } from '../../src/oribella';
import { PointerData, RETURN_FLAG } from '../../src/utils';
import { Gesture } from '../../src/gesture';
import { Point } from '../../src/point';
import { jsdom } from 'jsdom';
import { Options } from '../../src/utils';

class TapOptions extends Options {
  public radiusThreshold: 2;
}
// tslint:disable-next-line:max-classes-per-file
class Tap extends Gesture<TapOptions> {
  public startPoint: Point;
  public start(evt: Event, pointers: PointerData[]): number {
    this.startPoint = pointers[0].page;
    console.log(pointers); //tslint:disable-line
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
}

function dispatchEvent(
  document: Document,
  target: Element,
  type: string = 'mousedown',
  pageX: number = 100,
  pageY: number = 100,
  clientX: number = 100,
  clientY: number = 100,
  button: number = 1) {
  const evt = document.createEvent('MouseEvents');
  (evt as any).pageX = pageX;
  (evt as any).pageY = pageY;
  evt.initMouseEvent(type,
    true, true, document.defaultView, 0, 0, 0, clientX, clientY, false, false, false, false, button, null);
  target.dispatchEvent(evt);
  return evt;
}

describe('Scenario', () => {
  let sandbox: Sinon.SinonSandbox;
  let instance: Oribella;
  let msPointerEnabled = false;
  let pointerEnabled = false;
  const html = `
    <html>
      <body>
        <div>
          <div></div>
          <div>
            <div class="target"></div>
          </div>
        </div>
      </body>
    </html>
  `;
  let document: Document;
  let target: Element | null;
  let listener: any;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    document = jsdom(html);
    const g = global as any;
    g.window = {
      ontouchstart: '',
      document,
      navigator: {
        msPointerEnabled,
        pointerEnabled
      }
    };
    instance = new Oribella();
    instance.registerDefaultFlowStrategy();
    instance.registerGesture(Tap, TapOptions);
    instance.activate();
    listener = {
      start: sandbox.spy()
    };
  });

  afterEach(() => {
    instance.deactivate();
    sandbox.restore();
  });

  it('call Tap start', () => {
    target = document.querySelector('.target');
    if (!target) {
      throw new Error(`target not found ${html}`);
    }
    instance.on(Tap, target, listener);
    const evt = dispatchEvent(document, target);
    expect(listener.start).to.have.been.calledWithExactly(evt, {
      pointers: [{ client: { x: 100, y: 100 }, page: { x: 100, y: 100 } }]
    }, target);
  });
});
