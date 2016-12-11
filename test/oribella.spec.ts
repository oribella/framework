import {expect} from 'chai';
import * as sinon from 'sinon';
import {Oribella} from '../src/oribella';
import {MSPointerFlow} from '../src/flows/ms-pointer';
import {PointerFlow} from '../src/flows/pointer';
import {TouchFlow} from '../src/flows/touch';
import {DefaultGesture} from '../src/default-gesture';

describe("Oribella", () => {
  let instance: Oribella;
  let sandbox: Sinon.SinonSandbox;
  let document: Document;
  let msPointerEnabled = false;
  let pointerEnabled = false;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    document = {} as Document;
    const g = global as any;
    g.window = {
      ontouchstart: '',
      document: document,
      navigator: {
        msPointerEnabled: msPointerEnabled,
        pointerEnabled: pointerEnabled
      }
    };
    instance = new Oribella();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should use defaults', () => {
    expect(instance['element']).to.equal(document);
    expect(instance['supports']).to.deep.equal({ pointerEnabled: false, msPointerEnabled: false, touchEnabled: true });
  });

  it('should use parameters', () => {
    const element = {} as Element;
    const supports = { msPointerEnabled: true, pointerEnabled: true, touchEnabled: false };
    instance = new Oribella(element, supports);
    expect(instance['element']).to.equal(element);
    expect(instance['supports']).to.deep.equal({ pointerEnabled: true, msPointerEnabled: true, touchEnabled: false });
  });

  describe('Register default flow strategy', () => {

    it('should register MSPointerFlow', () => {
      const element = {} as Element;
      const supports = { msPointerEnabled: true, pointerEnabled: false, touchEnabled: false };
      instance = new Oribella(element, supports);
      const registerFlow = sandbox.stub(instance['engine'], 'registerFlow');
      instance.registerDefaultFlowStrategy();
      expect(registerFlow).to.have.been.calledWithExactly(sinon.match.instanceOf(MSPointerFlow));
    });

    it('should register PointerFlow', () => {
      const element = {} as Element;
      const supports = { msPointerEnabled: false, pointerEnabled: true, touchEnabled: false };
      instance = new Oribella(element, supports);
      const registerFlow = sandbox.stub(instance['engine'], 'registerFlow');
      instance.registerDefaultFlowStrategy();
      expect(registerFlow).to.have.been.calledWithExactly(sinon.match.instanceOf(PointerFlow));
    });

    it('should register TouchFlow', () => {
      const element = {} as Element;
      const supports = { msPointerEnabled: false, pointerEnabled: false, touchEnabled: true };
      instance = new Oribella(element, supports);
      const registerFlow = sandbox.stub(instance['engine'], 'registerFlow');
      instance.registerDefaultFlowStrategy();
      expect(registerFlow).to.have.been.calledWithExactly(sinon.match.instanceOf(TouchFlow));
    });

  });

  it('should register gestures', () => {
    const registerGesture = sandbox.stub(instance['engine'], 'registerGesture');
    const gesture = {} as typeof DefaultGesture;
    instance.registerGesture('foo', gesture);
    expect(registerGesture).to.have.been.calledWithExactly('foo', gesture);
  });

  it('should activate', () => {
    const deactivateFlows: (() => void)[][] = [];
    const activate = sandbox.stub(instance['engine'], 'activate').returns(deactivateFlows);
    instance.activate();
    expect(activate).to.have.been.calledWithExactly();
    expect(instance['deactivateFlows']).to.equal(deactivateFlows);
  });

  it('should deactivate', () => {
    const f1 =  sandbox.spy();
    const f2 =  sandbox.spy();
    const f3 =  sandbox.spy();
    const deactivateFlows: (() => void)[][] = [[f1, f2, f3]];
    sandbox.stub(instance['engine'], 'activate').returns(deactivateFlows);
    instance.activate();
    instance.deactivate();
    expect(f1).to.have.been.calledWithExactly();
    expect(f2).to.have.been.calledWithExactly();
    expect(f3).to.have.been.calledWithExactly();
  });

  it('should deactivate', () => {
    const activate = sandbox.stub(instance['engine'], 'activate');
    instance.deactivate();
    expect(activate).to.not.have.been.called;
  });

  it('should add listeners', () => {
    const element = {} as Element;
    const type = 'foo' as string;
    const listener = {};
    const addListener = sandbox.stub(instance['engine'], 'addListener');
    instance.on(element, type, listener);
    expect(addListener).to.have.been.calledWithExactly(element, type, listener);
  })

});
