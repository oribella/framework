import {expect} from 'chai';
import * as sinon from 'sinon';
import {Engine, ExecStrategy, ExecStrategyState} from '../../src/engine';
import {Registry} from '../../src/registry';
import {DefaultGesture} from '../../src/default-gesture';
import {DefaultListener} from '../../src/default-listener';
import {ListenerHandle} from '../../src/listener-handle';
import {MouseFlow} from '../../src/flows/mouse';
import {TouchFlow} from '../../src/flows/touch';
import {PointerFlow} from '../../src/flows/pointer';
import {MSPointerFlow} from '../../src/flows/ms-pointer';
import {RETURN_FLAG, Supports, PointerData, Pointers, GESTURE_STRATEGY_FLAG} from '../../src/utils';
import {Point} from '../../src/point';
import {jsdom} from 'jsdom';

describe('Engine', () => {
  let instance: Engine;
  let mouseFlow: MouseFlow;
  let touchFlow: TouchFlow;
  let pointerFlow: PointerFlow;
  let msPointerFlow: MSPointerFlow;

  const registry = new Registry();
  const supports = { msPointerEnabled: false, pointerEnabled: false } as Supports;
  const element = {} as Element;

  let sandbox: Sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
    element.addEventListener = sandbox.spy();
    element.removeEventListener = sandbox.spy();
    instance = new Engine(element, supports, registry);
    mouseFlow = new MouseFlow(element);
    touchFlow = new TouchFlow(element);
    pointerFlow = new PointerFlow(element);
    msPointerFlow = new MSPointerFlow(element);
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should be a class', () => {
    expect(Engine).to.throw;
  });

  it('should register a gesture', () => {
    registry.register = sandbox.spy();
    instance.registerGesture('test', DefaultGesture);
    expect(registry.register).to.have.been.calledWithExactly('test', DefaultGesture);
  });

  it('should register flows', () => {
    instance.registerFlow(mouseFlow);
    instance.registerFlow(touchFlow);
    instance.registerFlow(msPointerFlow);
    instance.registerFlow(pointerFlow);
    expect(instance['flows']).to.have.length(4);
  });

  it('should call onStart', () => {
    const onStart = sandbox.stub(instance, 'onStart');
    instance.registerFlow(mouseFlow);
    const evt = {} as Event;
    const pointers = {} as Pointers;
    mouseFlow.emit('start', evt, pointers);
    expect(onStart).to.have.been.calledWithExactly(mouseFlow, evt, pointers);
  });

  it('should call onUpdate', () => {
    const onStart = sandbox.stub(instance, 'onUpdate');
    instance.registerFlow(mouseFlow);
    const evt = {} as Event;
    const pointers = {} as Pointers;
    mouseFlow.emit('update', evt, pointers);
    expect(onStart).to.have.been.calledWithExactly(mouseFlow, evt, pointers);
  });

  it('should call onEnd', () => {
    const onStart = sandbox.stub(instance, 'onEnd');
    instance.registerFlow(mouseFlow);
    const evt = {} as Event;
    const pointers = {} as Pointers;
    mouseFlow.emit('end', evt, pointers);
    expect(onStart).to.have.been.calledWithExactly(mouseFlow, evt, pointers);
  });

  it('should call onCancel', () => {
    const onStart = sandbox.stub(instance, 'onCancel');
    instance.registerFlow(mouseFlow);
    const evt = {} as Event;
    const pointers = {} as Pointers;
    mouseFlow.emit('cancel', evt, pointers);
    expect(onStart).to.have.been.calledWithExactly(mouseFlow, evt, pointers);
  });

  it('should activate', () => {
    instance.registerFlow(mouseFlow);
    instance.registerFlow(touchFlow);
    instance.registerFlow(msPointerFlow);
    instance.registerFlow(pointerFlow);
    expect(instance.activate()).to.have.length(4);
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
      const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
      gesture.cancel = sandbox.spy();
      gesture.startEmitted = true;
      instance['removeGesture'](gesture);
      expect(gesture.cancel).to.have.been.calledOnce;
    });

    it('should unbind gesture', () => {
      const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
      gesture.unbind = sandbox.spy();
      instance['removeGesture'](gesture);
      expect(gesture.unbind).to.have.been.calledOnce;
    });

    it('should remove gesture', () => {
      const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
      const g1 = new DefaultGesture({} as Element, {} as DefaultListener);
      const g2 = new DefaultGesture({} as Element, {} as DefaultListener);
      const g3 = new DefaultGesture({} as Element, {} as DefaultListener);
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
      const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
      expect(gesture.startEmitted).to.be.false;
      instance['evaluateStrategyReturnFlag']([], gesture, RETURN_FLAG.START_EMITTED);
      expect(gesture.startEmitted).to.be.true;
    });

    it('should remove gesture', () => {
      const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
      const removeGesture = sandbox.stub(instance, 'removeGesture');
      instance['evaluateStrategyReturnFlag']([], gesture, RETURN_FLAG.REMOVE);
      expect(removeGesture).to.have.been.calledWithExactly(gesture, instance['gestures'], instance['composedGestures']);
    });

    it('should remove other gestures', () => {
      const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
      const g1 = new DefaultGesture({} as Element, {} as DefaultListener);
      const g2 = new DefaultGesture({} as Element, {} as DefaultListener);
      const g3 = new DefaultGesture({} as Element, {} as DefaultListener);
      instance['gestures'] = [g1, gesture, g2, g3];
      instance['evaluateStrategyReturnFlag']([], gesture, RETURN_FLAG.REMOVE_OTHERS);
      expect(instance['gestures'][0]).to.equal(gesture);
    });

  });

  describe('While gestures', () => {

    it('should remove gesture', () => {
      const evt = {} as Event;
      sandbox.stub(instance, 'getPointersDelta').returns({ all: 1 });
      const gesture = new DefaultGesture({} as Element, {
        strategy: GESTURE_STRATEGY_FLAG.REMOVE_IF_POINTERS_GT
      } as DefaultListener);
      const gestures = [gesture];
      const pointers = {} as Pointers;
      const execStrategy = sandbox.spy() as ExecStrategy;
      const removeGesture = sandbox.stub(instance, 'removeGesture');
      instance['whileGestures'](evt, gestures, pointers, execStrategy);
      expect(removeGesture).to.have.been.calledWithExactly(gesture, instance['gestures'], instance['composedGestures']);
      expect(execStrategy).to.not.have.been.called;
    });

    it('should execute the strategy', () => {
      const evt = {} as Event;
      const pointersDelta = { all: 1, changed: 1 };
      sandbox.stub(instance, 'getPointersDelta').returns(pointersDelta);
      const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
      const gestures = [gesture];
      const pointers = {} as Pointers;
      const execStrategy = sandbox.spy() as ExecStrategy;
      const removeGesture = sandbox.stub(instance, 'removeGesture');
      instance['whileGestures'](evt, gestures, pointers, execStrategy);
      expect(removeGesture).to.not.have.been.called;
      expect(execStrategy).to.have.been.calledWithExactly({evt, gestures, gesture, pointers, pointersDelta});
    });

  });

  it('should add pointer id', () => {
    const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
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
    const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
    instance['addPointerId'](gesture, 'foo');
    instance['addPointerId'](gesture, 'bar');
    instance['addPointerId'](gesture, 'baz');
    expect(instance['removePointerIds'](gesture, ['foo', 'baz', 'foobar'])).to.deep.equal(['foo', 'baz']);
    expect(instance['getPointerIds'](gesture)).to.deep.equal(['bar']);
  });

  it('should return true if gesture has pointer', () => {
    const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
    instance['addPointerId'](gesture, 'bar');
    const map = new Map<string, PointerData>([
        ['foo', { page: new Point(1, 2), client: new Point(3, 4)} ],
        ['bar', { page: new Point(5, 6), client: new Point(7, 8)} ],
        ['baz', { page: new Point(9, 10), client: new Point(11, 12)} ]
      ]);
    expect(instance['hasPointer'](gesture, map)).to.be.true;
  });

  it('should return false if gesture has pointer', () => {
    const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
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
      const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
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
      const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
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
      expect(gesture.start).to.have.been.calledWithExactly(state.evt, [fooPointer, barPointer, bazPointer]);
    });

  });

  describe('Update strategy', () => {

    it('should be idle if no pointer changed', () => {
      const state = { pointers: {} } as ExecStrategyState;
      sandbox.stub(instance, 'hasPointer').returns(false);
      expect(instance['updateStrategy'](state)).to.equal(RETURN_FLAG.IDLE);
    });

    it('should call update', () => {
      const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
      sandbox.spy(gesture, 'update');
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
      const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
      const state = { gesture } as ExecStrategyState;
      expect(instance['endStrategy'](state)).to.equal(RETURN_FLAG.REMOVE);
    });

    it('should remove gesture if no pointers was removed', () => {
      const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
      gesture.startEmitted = true;
      sandbox.stub(instance, 'removePointerIds').returns([]);
      const pointers = { changed: new Map<string, PointerData>() } as Pointers;
      const state = { gesture, pointers } as ExecStrategyState;
      expect(instance['endStrategy'](state)).to.equal(RETURN_FLAG.REMOVE);
    });

    it('should call end', () => {
      const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
      gesture.startEmitted = true;
      sandbox.spy(gesture, 'end');
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
      const gesture = new DefaultGesture({} as Element, {} as DefaultListener);
      sandbox.spy(gesture, 'cancel');
      const state = { gesture } as ExecStrategyState;
      instance['cancelStrategy'](state);
      expect(gesture.cancel).to.have.been.calledWithExactly();
    });

  });

  describe('On start', () => {

    it('should return false if flow can not be activated', () => {
      sandbox.stub(instance, 'canActivateFlow').returns(false);
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
      const g1 = new DefaultGesture({} as Element, { prio: 1 } as DefaultListener);
      const g2 = new DefaultGesture({} as Element, { prio: 1 } as DefaultListener);
      const g3 = new DefaultGesture({} as Element, { prio: 1 } as DefaultListener);
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
      return instance['registerListener'](element, type, subscriber);
    };
    it('should add a handle', () => {
      add();
      expect(instance['handles']).to.have.length(1);
    });

    it('should remove a handle', () => {
      const remove = add();
      remove();
      expect(instance['handles']).to.have.length(0);
    });

    it('should not remove a handle if not found', () => {
      const remove = add();
      instance['handles'].length = 0;
      remove();
      expect(instance['handles']).to.have.length(0);
    });

  });

  describe('Add gesture', () => {

    it('should create a gesture from registry', () => {
      const element = {} as Element;
      const listener = new DefaultListener();
      const gesture = new DefaultGesture(element, listener);
      const create = sandbox.stub(instance['registry'], 'create').returns(gesture);
      const handle = new ListenerHandle(element, 'foo', listener);
      instance['addGesture'](element, handle);
      expect(create).to.have.been.calledWithExactly(element, handle.type, handle.listener);
    });

    it('should call gesture bind', () => {
      const element = {} as Element;
      const listener = new DefaultListener();
      const gesture = new DefaultGesture(element, listener);
      const bind = sandbox.stub(gesture, 'bind');
      sandbox.stub(instance['registry'], 'create').returns(gesture);
      const handle = new ListenerHandle(element, 'foo', listener);
      instance['addGesture'](element, handle);
      expect(bind).to.have.been.calledWithExactly(handle.element, sinon.match.func, sinon.match.func);
    });

  });

  describe('Match', () => {

    it('should call matchHandles', () => {
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
      const doc = jsdom(html);
      const target = doc.querySelector('.target');
      if (!target) {
        throw new Error(`target not found ${html}`);
      }
      const matchHandles = sandbox.stub(instance, 'matchHandles');
      instance['element'] = doc;
      instance['match'](target);
      expect(matchHandles.callCount).to.equal(5);
    });

    it('should call matchHandle', () => {
      const element = {} as Element;
      const gestures = [] as DefaultGesture[];
      const listener = {} as DefaultListener;
      instance['registerListener'](element, 'foo', listener);
      const matchHandle = sandbox.stub(instance, 'matchHandle');
      instance['matchHandles'](element, gestures);
      expect(matchHandle).to.have.been.calledWithExactly(element, instance['handles'][0]);
    });

    it('should add gesture', () => {
      const element = {} as Element;
      const gesture = {} as DefaultGesture;
      const gestures = [] as DefaultGesture[];
      const listener = {} as DefaultListener;
      instance['registerListener'](element, 'foo', listener);
      sandbox.stub(instance, 'matchHandle').returns(gesture);
      expect(instance['matchHandles'](element, gestures)).to.equal(gestures);
      expect(gestures).to.have.length(1);
      expect(gestures[0]).to.equal(gesture);
    });

    it('should return undefined if not matches handle', () => {
      const element = {} as Element;
      const handle = {} as ListenerHandle;
      sandbox.stub(instance, 'matchesHandle').returns(false);
      expect(instance['matchHandle'](element, handle)).be.undefined;
    });

    it('should call composeGesture', () => {
      const element = {} as Element;
      const handle = {} as ListenerHandle;
      sandbox.stub(instance, 'matchesHandle').returns(true);
      const composeGesture = sandbox.stub(instance, 'composeGesture');
      instance['matchHandle'](element, handle);
      expect(composeGesture).to.have.been.calledWithExactly(element, handle);
    });

    describe('Matches handle', () => {

      it('should return false if a selector is defined and the current element does not match', () => {
        const element = {} as Element;
        const refElement = {} as Element;
        element.webkitMatchesSelector = sandbox.stub().returns(false);
        refElement.contains = sandbox.stub().returns(true);
        const handle = { element: refElement, listener: { selector: 'foo' } } as ListenerHandle;
        expect(instance['matchesHandle'](element, handle)).to.be.false;
      });

      it('should return false if no selector and the current element does not match', () => {
        const element = {} as Element;
        const refElement = {} as Element;
        element.webkitMatchesSelector = sandbox.stub().returns(true);
        refElement.contains = sandbox.stub().returns(true);
        const handle = { element: refElement, listener: {} } as ListenerHandle;
        expect(instance['matchesHandle'](element, handle)).to.be.false;
      });

      it('should return false if the handle element does not contain the current element', () => {
        const element = {} as Element;
        const refElement = {} as Element;
        refElement.contains = sandbox.stub().returns(false); ;
        const handle = { element: refElement, listener: {} } as ListenerHandle;
        expect(instance['matchesHandle'](element, handle)).to.be.false;
      });

      it('should return false if a selector is defined and the handle element is the current element', () => {
        const refElement = {} as Element;
        refElement.contains = sandbox.stub().returns(true); ;
        const handle = { element: refElement, listener: { selector: 'foo' } } as ListenerHandle;
        expect(instance['matchesHandle'](refElement, handle)).to.be.false;
      });

      it('should return true if matches', () => {
        const refElement = {} as Element;
        refElement.webkitMatchesSelector = sandbox.stub().returns(true);
        refElement.contains = sandbox.stub().returns(true); ;
        const handle = { element: refElement, listener: {} } as ListenerHandle;
        expect(instance['matchesHandle'](refElement, handle)).to.be.true;
      });

    });

    describe('Compose gesture', () => {

      it('should use gesture that wants to be composed', () => {
        const element = {} as Element;
        const listener = {} as DefaultListener;
        const handle = { listener } as ListenerHandle;
        const gesture = { listener } as DefaultGesture;
        instance['composedGestures'].push(gesture);
        expect(instance['composeGesture'](element, handle)).to.equal(gesture); ;
      });

      it('should add gesture if no gesture wants to be composed', () => {
        const element = {} as Element;
        const listener = {} as DefaultListener;
        const handle = { listener } as ListenerHandle;
        const gesture = {} as DefaultGesture;
        sandbox.stub(instance, 'addGesture').returns(gesture);
        instance['composedGestures'].push(gesture);
        expect(instance['composeGesture'](element, handle)).to.equal(gesture); ;
      });

      it('should add gesture', () => {
        const element = {} as Element;
        const handle = {} as ListenerHandle;
        const gesture = {} as DefaultGesture;
        const addGesture = sandbox.stub(instance, 'addGesture').returns(gesture);
        expect(instance['composeGesture'](element, handle)).to.equal(gesture);
        expect(addGesture).to.have.been.calledWithExactly(element, handle);
      });

    });

  });

});
