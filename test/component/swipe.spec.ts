import { expect } from 'chai';
import * as sinon from 'sinon';
import { Oribella } from '../../src/oribella';
import { jsdom } from 'jsdom';
import { Swipe, SwipeOptions } from './gestures/swipe';
import { dispatchEvent } from './utils';

describe('Swipe', () => {
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
  let target: Element;
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
    instance.registerGesture(Swipe, SwipeOptions);
    instance.activate();
    listener = {
      down: sandbox.spy(),
      start: sandbox.spy(),
      update: sandbox.spy(),
      end: sandbox.spy(),
      cancel: sandbox.spy()
    };

    target = document.querySelector('.target') as Element;
    if (!target) {
      throw new Error(`target not found ${html}`);
    }
  });

  afterEach(() => {
    instance.deactivate();
    sandbox.restore();
  });

  it('should call listener down', () => {
    instance.on(Swipe, target, listener);
    const evt = dispatchEvent(document, target);
    expect(listener.down).to.have.been.calledWithExactly(evt, {
      pointers: [{ client: { x: 100, y: 100 }, page: { x: 100, y: 100 } }]
    }, target);
  });

  it('should call listener start', () => {
    instance.on(Swipe, target, listener);
    dispatchEvent(document, target);
    const evt = dispatchEvent(document, target, 'mousemove', 200, 200, 200, 200);
    expect(listener.start).to.have.been.calledWithExactly(evt, {
      pointers: [{ client: { x: 200, y: 200 }, page: { x: 200, y: 200 } }]
    }, target);
  });

  it('should call listener update', () => {
    instance.on(Swipe, target, listener);
    dispatchEvent(document, target);
    dispatchEvent(document, target, 'mousemove', 250, 250, 250, 250);
    const evt = dispatchEvent(document, target, 'mousemove', 300, 300, 300, 300);
    expect(listener.update).to.have.been.calledWithExactly(evt, {
      pointers: [{ client: { x: 300, y: 300 }, page: { x: 300, y: 300 } }]
    }, target);
  });

  it('should call listener end', () => {
    instance.on(Swipe, target, listener);
    dispatchEvent(document, target);
    dispatchEvent(document, target, 'mousemove', 250, 250, 250, 250);
    dispatchEvent(document, target, 'mousemove', 300, 300, 300, 300);
    const evt = dispatchEvent(document, target, 'mouseup', 350, 350, 350, 350);
    expect(listener.end).to.have.been.calledWithExactly(evt, {
      pointers: [{ client: { x: 350, y: 350 }, page: { x: 350, y: 350 } }]
    }, target);
  });

  it('should call listener cancel', () => {
    instance.on(Swipe, target, listener);
    dispatchEvent(document, target);
    dispatchEvent(document, target, 'dragstart', 200, 200, 200, 200);
    expect(listener.cancel).to.have.been.calledWithExactly();
  });

});