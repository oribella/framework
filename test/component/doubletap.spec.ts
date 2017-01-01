import { expect } from 'chai';
import * as sinon from 'sinon';
import { Oribella } from '../../src/oribella';
import { jsdom } from 'jsdom';
import { Tap, TapOptions } from './gestures/tap';
import { Doubletap, DoubletapOptions } from './gestures/doubletap';
import { dispatchEvent } from './utils';

describe('Doubletap', () => {
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
  let setTimeout: Sinon.SinonStub;
  let clearTimeout: Sinon.SinonSpy;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    document = jsdom(html);
    const g = global as any;
    setTimeout = sandbox.stub().returns(1);
    clearTimeout = sandbox.spy();

    g.window = {
      ontouchstart: '',
      document,
      navigator: {
        msPointerEnabled,
        pointerEnabled
      },
      setTimeout,
      clearTimeout
    };
    instance = new Oribella();
    instance.registerDefaultFlowStrategy();
    instance.registerGesture(Tap, TapOptions);
    instance.registerGesture(Doubletap, DoubletapOptions);
    instance.activate();
    listener = {
      start: sandbox.spy(),
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

  it('should call listener end', () => {
    instance.on(Doubletap, target, listener);
    dispatchEvent(document, target);
    dispatchEvent(document, target, 'mouseup');
    dispatchEvent(document, target);
    const evt = dispatchEvent(document, target, 'mouseup');
    expect(listener.end).to.have.been.calledWithExactly(evt, {
      pointers: [{ client: { x: 100, y: 100 }, page: { x: 100, y: 100 } }]
    }, target);
  });

  it('should reset after time threshold', () => {
    instance.on(Doubletap, target, listener);
    dispatchEvent(document, target);
    dispatchEvent(document, target, 'mouseup');
    dispatchEvent(document, target);
    setTimeout.callArg(0);
    expect(listener.end).not.to.have.been.calledWithExactly();
  });

});