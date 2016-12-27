import { expect } from 'chai';
import * as sinon from 'sinon';
import { Oribella } from '../../src/oribella';
import { jsdom } from 'jsdom';
import { Tap, TapOptions } from './gestures/tap';
import {dispatchEvent} from './utils';

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
      start: sandbox.spy(),
      cancel: sandbox.spy()
    };
  });

  afterEach(() => {
    instance.deactivate();
    sandbox.restore();
  });

  it('should call Tap start', () => {
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

  it('should call Tap cancel', () => {
    target = document.querySelector('.target');
    if (!target) {
      throw new Error(`target not found ${html}`);
    }
    instance.on(Tap, target, listener);
    dispatchEvent(document, target);
    dispatchEvent(document, target, 'mousemove', 200, 200, 200, 200);
    expect(listener.cancel).to.have.been.calledWithExactly();
  });

});
