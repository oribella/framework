import {expect} from 'chai';
import * as sinon from 'sinon';
import {Engine, Supports} from '../src/engine';
import {Registry, DefaultGesture, DefaultSubscriber} from '../src/registry';
import {MouseFlow} from '../src/flows/mouse';
import {TouchFlow} from '../src/flows/touch';
import {PointerFlow} from '../src/flows/pointer';
import {MSPointerFlow} from '../src/flows/ms-pointer';

describe('Engine', () => {
  let instance: Engine;
  let mouseFlow: MouseFlow;
  let touchFlow: TouchFlow;
  let pointerFlow: PointerFlow;
  let msPointerFlow: MSPointerFlow;

  const registry = new Registry();
  const supports = { MSPointerEvent: false, PointerEvent: false } as Supports;
  const element = {} as Element;

  let sandbox: Sinon.SinonSandbox;

  beforeEach(() => {
    instance = new Engine(registry, supports, element);
    mouseFlow = new MouseFlow(element);
    touchFlow = new TouchFlow(element);
    pointerFlow = new PointerFlow(element);
    msPointerFlow = new MSPointerFlow(element);
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  })

  it('should be a class', () => {
    expect(Engine).to.throw;
  });

  it('should register a gesture', () => {
    registry.register = sandbox.spy();
    instance.registerGesture('test', DefaultGesture);
    expect(registry.register).to.have.been.calledWithExactly('test', DefaultGesture);
  });

  it('should register flows', () => {
    instance.registerFlows(mouseFlow, touchFlow, pointerFlow, msPointerFlow);
    expect(instance['flows']).to.have.length(4);
  });

  it('should activate flow', () => {
    expect(instance['canActivateFlow'](mouseFlow)).to.be.true;
  });

  it('should not activate flow', () => {
    instance['activeFlow'] = touchFlow;
    expect(instance['canActivateFlow'](mouseFlow)).to.be.false;
  });

  describe('Pointers delta calculation', () => {

    it('should return -1 for non valid mouse', () => {
      const event = { type: 'mouse' } as Event;
      expect(instance['getPointersDelta'](event, mouseFlow['pointers'], -1, -1)).to.deep.equal({
        all: -1, changed: -1
      });
    });

    it('should return correct delta', () => {
      const event = { type: 'foo' } as Event;
      expect(instance['getPointersDelta'](event, mouseFlow['pointers'], 3, -1)).to.deep.equal({
        all: -3, changed: -3
      });

    });

  });

  describe('remove gesture', () => {

    it('should cancel gesture', () => {
      const gesture = new DefaultGesture({} as DefaultSubscriber, {} as Element);
      gesture.cancel = sandbox.spy();
      gesture.startEmitted = true;
      instance['removeGesture'](gesture);
      expect(gesture.cancel).to.have.been.calledOnce;
    });

    it('should unbind gesture', () => {
      const gesture = new DefaultGesture({} as DefaultSubscriber, {} as Element);
      gesture.unbind = sandbox.spy();
      instance['removeGesture'](gesture);
      expect(gesture.unbind).to.have.been.calledOnce;
    });

    it('should remove gesture', () => {
      const gesture = new DefaultGesture({} as DefaultSubscriber, {} as Element);
      const g1 = new DefaultGesture({} as DefaultSubscriber, {} as Element);
      const g2 = new DefaultGesture({} as DefaultSubscriber, {} as Element);
      const g3 = new DefaultGesture({} as DefaultSubscriber, {} as Element);
      const gestures = [g1, gesture, g2, g3];
      const gestures2 = [g1, g2, g3];
      instance['removeGesture'](gesture, gestures, gestures2);
      expect(gestures).to.have.length(3);
      expect(gestures.indexOf(gesture)).to.equal(-1);
      expect(gestures2).to.have.length(3);
    });

  });

});
