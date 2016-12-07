import {expect} from 'chai';
import * as sinon from 'sinon';
import {Engine, Supports, ExecStrategy, ExecStrategyState} from '../src/engine';
import {Registry} from '../src/registry';
import {DefaultGesture} from '../src/default-gesture';
import {DefaultListener} from '../src/default-listener';
import {ListenerHandle} from '../src/listener-handle';
import {MouseFlow} from '../src/flows/mouse';
import {TouchFlow} from '../src/flows/touch';
import {PointerFlow} from '../src/flows/pointer';
import {MSPointerFlow} from '../src/flows/ms-pointer';
import {RETURN_FLAG, PointerData, Pointers, GESTURE_STRATEGY_FLAG} from '../src/utils';
import {Point} from '../src/point';

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
      const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
      gesture.cancel = sandbox.spy();
      gesture.startEmitted = true;
      instance['removeGesture'](gesture);
      expect(gesture.cancel).to.have.been.calledOnce;
    });

    it('should unbind gesture', () => {
      const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
      gesture.unbind = sandbox.spy();
      instance['removeGesture'](gesture);
      expect(gesture.unbind).to.have.been.calledOnce;
    });

    it('should remove gesture', () => {
      const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
      const g1 = new DefaultGesture({} as DefaultListener, {} as Element);
      const g2 = new DefaultGesture({} as DefaultListener, {} as Element);
      const g3 = new DefaultGesture({} as DefaultListener, {} as Element);
      const gestures = [g1, gesture, g2, g3];
      const gestures2 = [g1, g2, g3];
      instance['removeGesture'](gesture, gestures, gestures2);
      expect(gestures).to.have.length(3);
      expect(gestures.indexOf(gesture)).to.equal(-1);
      expect(gestures2).to.have.length(3);
    });

  });

  describe('Evaluate strategy return flag', () => {

    it('should set startEmitted', () => {
      const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
      expect(gesture.startEmitted).to.be.false;
      instance['evaluateStrategyReturnFlag']([], gesture, RETURN_FLAG.START_EMITTED);
      expect(gesture.startEmitted).to.be.true;
    });

    it('should remove gesture', () => {
      const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
      const removeGesture = sandbox.stub(instance, 'removeGesture');
      instance['evaluateStrategyReturnFlag']([], gesture, RETURN_FLAG.REMOVE);
      expect(removeGesture).to.have.been.calledWithExactly(gesture, instance['gestures'], instance['composedGestures']);
    });

    it('should remove other gestures', () => {
      const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
      const g1 = new DefaultGesture({} as DefaultListener, {} as Element);
      const g2 = new DefaultGesture({} as DefaultListener, {} as Element);
      const g3 = new DefaultGesture({} as DefaultListener, {} as Element);
      instance['gestures'] = [g1, gesture, g2, g3];
      instance['evaluateStrategyReturnFlag']([], gesture, RETURN_FLAG.REMOVE_OTHERS);
      expect(instance['gestures'][0]).to.equal(gesture);
    });

  });

  describe('While gestures', () => {

    it('should remove gesture', () => {
      const evt = {} as Event;
      sandbox.stub(instance, 'getPointersDelta').returns({ all: 1 });
      const gesture = new DefaultGesture({ options: { strategy: GESTURE_STRATEGY_FLAG.REMOVE_IF_POINTERS_GT } } as DefaultListener, {} as Element);
      const gestures = [gesture];
      const pointers = {} as Pointers;
      const execStrategy = sandbox.spy() as ExecStrategy
      const removeGesture = sandbox.stub(instance, 'removeGesture');
      instance['whileGestures'](evt, gestures, pointers, execStrategy);
      expect(removeGesture).to.have.been.calledWithExactly(gesture, instance['gestures'], instance['composedGestures']);
      expect(execStrategy).to.not.have.been.called;
    });

    it('should execute the strategy', () => {
      const evt = {} as Event;
      const pointersDelta = { all: 1, changed: 1 };
      sandbox.stub(instance, 'getPointersDelta').returns(pointersDelta);
      const gesture = new DefaultGesture({ options: {} } as DefaultListener, {} as Element);
      const gestures = [gesture];
      const pointers = {} as Pointers;
      const execStrategy = sandbox.spy() as ExecStrategy
      const removeGesture = sandbox.stub(instance, 'removeGesture');
      instance['whileGestures'](evt, gestures, pointers, execStrategy);
      expect(removeGesture).to.not.have.been.called;
      expect(execStrategy).to.have.been.calledWithExactly({evt, gestures, gesture, pointers, pointersDelta});
    });

  });

  it('should add pointer id', () => {
    const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
    instance['addPointerId'](gesture, 'foo');
    expect(instance['getPointerIds'](gesture)).to.deep.equal(['foo']);
  });

  it('should get pointers', () => {
    const map = new Map<string, PointerData>([
        ['foo', { page: new Point(1, 2), client: new Point(3, 4)} ],
        ['bar', { page: new Point(5, 6), client: new Point(7, 8)} ],
        ['baz', { page: new Point(9, 10), client: new Point(11, 12)} ]
      ]);
    expect(instance['getPointers'](map, ['foo', 'bar', 'baz'])).to.deep.equal([
      { page: new Point(1, 2), client: new Point(3, 4)},
      { page: new Point(5, 6), client: new Point(7, 8)},
      { page: new Point(9, 10), client: new Point(11, 12)}
    ]);
  });

  it('should remove pointer ids', () => {
    const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
    instance['addPointerId'](gesture, 'foo');
    instance['addPointerId'](gesture, 'bar');
    instance['addPointerId'](gesture, 'baz');
    expect(instance['removePointerIds'](gesture, ['foo','baz', 'foobar'])).to.deep.equal(['foo', 'baz']);
    expect(instance['getPointerIds'](gesture)).to.deep.equal(['bar']);
  });

  it('should return true if gesture has pointer', () => {
    const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
    instance['addPointerId'](gesture, 'bar');
    const map = new Map<string, PointerData>([
        ['foo', { page: new Point(1, 2), client: new Point(3, 4)} ],
        ['bar', { page: new Point(5, 6), client: new Point(7, 8)} ],
        ['baz', { page: new Point(9, 10), client: new Point(11, 12)} ]
      ]);
    expect(instance['hasPointer'](gesture, map)).to.be.true;
  });

  it('should return false if gesture has pointer', () => {
    const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
    instance['addPointerId'](gesture, 'foobarbaz');
    const map = new Map<string, PointerData>([
        ['foo', { page: new Point(1, 2), client: new Point(3, 4)} ],
        ['bar', { page: new Point(5, 6), client: new Point(7, 8)} ],
        ['baz', { page: new Point(9, 10), client: new Point(11, 12)} ]
      ]);
    expect(instance['hasPointer'](gesture, map)).to.be.false;
  });

  describe('Start strategy', () => {

    it('should be idle if pointers not met', () => {
      const state = { pointersDelta: { all: 1 } } as ExecStrategyState;
      expect(instance['startStrategy'](state)).to.equal(RETURN_FLAG.IDLE);
    });

    it('should lock pointers', () => {
      const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
      const pointers = { all: new Map<string, PointerData>([
        ['foo', { page: new Point(1, 2), client: new Point(3, 4)} ],
        ['bar', { page: new Point(5, 6), client: new Point(7, 8)} ],
        ['baz', { page: new Point(9, 10), client: new Point(11, 12)} ]
      ]) } as Pointers;
      const state = { gesture, pointers, pointersDelta: { all: 0 } } as ExecStrategyState;
      instance['startStrategy'](state);
      expect(instance['getPointerIds'](gesture)).to.deep.equal(['foo', 'bar', 'baz']);
    });

    it('should call start', () => {
      const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
      gesture.start = sandbox.spy();
      const fooPointer = { page: new Point(1, 2), client: new Point(3, 4)};
      const barPointer = { page: new Point(5, 6), client: new Point(7, 8)};
      const bazPointer = { page: new Point(9, 10), client: new Point(11, 12)};
      const pointers = { all: new Map<string, PointerData>([
        ['foo', fooPointer ],
        ['bar', barPointer ],
        ['baz', bazPointer ]
      ]) } as Pointers;
      const state = { gesture, pointers, pointersDelta: { all: 0 } } as ExecStrategyState;
      instance['startStrategy'](state);
      expect(gesture.start).to.have.been.calledWithExactly(state.evt, [fooPointer, barPointer, bazPointer])
    });

  });

  describe('Update strategy', () => {

    it('should be idle if no pointer changed', () => {
      const state = { pointers: {} } as ExecStrategyState;
      sandbox.stub(instance, 'hasPointer').returns(false);
      expect(instance['updateStrategy'](state)).to.equal(RETURN_FLAG.IDLE);
    });

    it('should call update', () => {
      const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
      gesture.update = sandbox.spy();
      const fooPointer = { page: new Point(1, 2), client: new Point(3, 4)};
      const barPointer = { page: new Point(5, 6), client: new Point(7, 8)};
      const bazPointer = { page: new Point(9, 10), client: new Point(11, 12)};
      const pointers = { all: new Map<string, PointerData>([
        ['foo', fooPointer ],
        ['bar', barPointer ],
        ['baz', bazPointer ]
      ]) } as Pointers;
      const state = { gesture, pointers } as ExecStrategyState;
      sandbox.stub(instance, 'hasPointer').returns(true);
      instance['addPointerId'](gesture, 'foo');
      instance['addPointerId'](gesture, 'bar');
      instance['addPointerId'](gesture, 'baz');
      instance['updateStrategy'](state);
      expect(gesture.update).to.have.been.calledWithExactly(state.evt, [fooPointer, barPointer, bazPointer]);
    });

  });

  describe('End strategy', () => {

    it('should remove gesture if start has not been emitted', () => {
      const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
      const state = { gesture } as ExecStrategyState;
      expect(instance['endStrategy'](state)).to.equal(RETURN_FLAG.REMOVE);
    });

    it('should remove gesture if no pointers was removed', () => {
      const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
      gesture.startEmitted = true;
      sandbox.stub(instance, 'removePointerIds').returns([]);
      const pointers = { changed: new Map<string, PointerData>() } as Pointers;
      const state = { gesture, pointers } as ExecStrategyState;
      expect(instance['endStrategy'](state)).to.equal(RETURN_FLAG.REMOVE);
    });

    it('should call end', () => {
      const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
      gesture.startEmitted = true;
      gesture.end = sandbox.spy();
      const fooPointer = { page: new Point(1, 2), client: new Point(3, 4)};
      const barPointer = { page: new Point(5, 6), client: new Point(7, 8)};
      const bazPointer = { page: new Point(9, 10), client: new Point(11, 12)};
      const pointers = { changed: new Map<string, PointerData>([
        ['foo', fooPointer ],
        ['bar', barPointer ],
        ['baz', bazPointer ]
      ]) } as Pointers;
      const state = { gesture, pointers } as ExecStrategyState;
      instance['addPointerId'](gesture, 'foo');
      instance['addPointerId'](gesture, 'bar');
      instance['addPointerId'](gesture, 'baz');
      instance['endStrategy'](state);
      expect(gesture.end).to.have.been.calledWithExactly(state.evt, [fooPointer, barPointer, bazPointer]);
    });

  });

  describe('Cancel strategy', () => {

    it('should call cancel', () => {
      const gesture = new DefaultGesture({} as DefaultListener, {} as Element);
      gesture.cancel = sandbox.spy();
      const state = { gesture } as ExecStrategyState;
      instance['cancelStrategy'](state);
      expect(gesture.cancel).to.have.been.calledWithExactly();
    });

  });

  describe('On start', () => {

    it('should return false if flow can not be activated', () => {
      sandbox.stub(instance, 'canActivateFlow').returns(false);;
      const flow = {} as MouseFlow;
      const evt = {} as Event;
      const pointers = {} as Pointers;
      expect(instance['onStart'](flow, evt, pointers)).to.be.false;
    });

    it('should return false if no gestures are matched', () => {
      sandbox.stub(instance, 'canActivateFlow').returns(true);
      sandbox.stub(instance, 'match').returns([]);
      const flow = {} as MouseFlow;
      const evt = {} as Event;
      const pointers = {} as Pointers;
      expect(instance['onStart'](flow, evt, pointers)).to.be.false;
    });

    it('should call whileGestures', () => {
      const g1 = new DefaultGesture({ options: { prio: 1 } } as DefaultListener, {} as Element);
      const g2 = new DefaultGesture({ options: { prio: 1 } } as DefaultListener, {} as Element);
      const g3 = new DefaultGesture({ options: { prio: 1 } } as DefaultListener, {} as Element);
      sandbox.stub(instance, 'canActivateFlow').returns(true);
      const gestures = [g1, g2, g3];
      sandbox.stub(instance, 'match').returns(gestures);
      const whileGestures = sandbox.stub(instance, 'whileGestures');
      const flow = {} as MouseFlow;
      const evt = {} as Event;
      const pointers = {} as Pointers;
      expect(instance['onStart'](flow, evt, pointers)).to.be.true;
      expect(whileGestures).to.have.been.calledWithExactly(evt, gestures, pointers, sinon.match.func);
    });

  });

  describe('On update', () => {

    it('should return if not the same flow', () => {
      const whileGestures = sandbox.spy(instance, 'whileGestures');
      const flow = {} as MouseFlow;
      const evt = {} as Event;
      const pointers = {} as Pointers;
      instance['onUpdate'](flow, evt, pointers);
      expect(whileGestures).to.not.have.been.called;
    });

    it('should call whileGestures', () => {
      const whileGestures = sandbox.spy(instance, 'whileGestures');
      const flow = {} as MouseFlow;
      instance['activeFlow'] = flow;
      const evt = {} as Event;
      const pointers = {} as Pointers;
      instance['onUpdate'](flow, evt, pointers);
      expect(whileGestures).to.have.been.calledWithExactly(evt, instance['gestures'], pointers, sinon.match.func);
    });

  });

  describe('On end', () => {

    it('should return if not the same flow', () => {
      const whileGestures = sandbox.spy(instance, 'whileGestures');
      const flow = {} as MouseFlow;
      const evt = {} as Event;
      const pointers = {} as Pointers;
      instance['onEnd'](flow, evt, pointers);
      expect(whileGestures).to.not.have.been.called;
    });

    it('should call whileGestures', () => {
      const whileGestures = sandbox.spy(instance, 'whileGestures');
      const flow = {} as MouseFlow;
      instance['activeFlow'] = flow;
      const evt = {} as Event;
      const pointers = {} as Pointers;
      instance['onEnd'](flow, evt, pointers);
      expect(whileGestures).to.have.been.calledWithExactly(evt, instance['gestures'], pointers, sinon.match.func);
    });

  });

  describe('On cancel', () => {

    it('should return if not the same flow', () => {
      const whileGestures = sandbox.spy(instance, 'whileGestures');
      const flow = {} as MouseFlow;
      const evt = {} as Event;
      const pointers = {} as Pointers;
      instance['onCancel'](flow, evt, pointers);
      expect(whileGestures).to.not.have.been.called;
    });

    it('should call whileGestures', () => {
      const whileGestures = sandbox.spy(instance, 'whileGestures');
      const flow = {} as MouseFlow;
      instance['activeFlow'] = flow;
      const evt = {} as Event;
      const pointers = {} as Pointers;
      instance['onCancel'](flow, evt, pointers);
      expect(whileGestures).to.have.been.calledWithExactly(evt, instance['gestures'], pointers, sinon.match.func);
    });

  });

  describe('Listener handle', () => {
    const add = () => {
      const element = {} as Element;
      const type = 'foo';
      const subscriber = {} as DefaultListener;
      return instance['addListener'](element, type, subscriber);
    }
    it('should add a handle', () => {
      add();
      expect(instance['handles']).to.have.length(1);
    });

    it('should remove a handle', () => {
      const remove = add();
      remove();
      expect(instance['handles']).to.have.length(0)
    })

    it('should not remove a handle if not found', () => {
      const remove = add();
      instance['handles'].length = 0;
      remove();
      expect(instance['handles']).to.have.length(0)
    })

  });

  describe('Add gesture', () => {

    it('should create a gesture from registry', () => {
      const element = {} as Element;
      const listener = new DefaultListener();
      const gesture = new DefaultGesture(listener, element);
      const create = sandbox.stub(instance['registry'], 'create').returns(gesture);
      const handle = new ListenerHandle(element, 'foo', listener);
      instance['addGesture'](handle, element);
      expect(create).to.have.been.calledWithExactly(handle.type, handle.listener, element);
    });

    it('should call gesture bind', () => {
      const element = {} as Element;
      const listener = new DefaultListener();
      const gesture = new DefaultGesture(listener, element);
      const bind = sandbox.stub(gesture, 'bind');
      sandbox.stub(instance['registry'], 'create').returns(gesture);
      const handle = new ListenerHandle(element, 'foo', listener);
      instance['addGesture'](handle, element);
      expect(bind).to.have.been.calledWithExactly(handle.element, sinon.match.func, sinon.match.func);
    });

  })

});
