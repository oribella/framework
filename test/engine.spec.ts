import {expect} from 'chai';
import * as sinon from 'sinon';
import {Engine, Supports} from '../src/engine';
import {Registry, DefaultGesture} from '../src/registry';
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

});
