import {expect} from 'chai';
import * as sinon from 'sinon';
import {Flow, StartConfig, UpdateConfig, EndConfig, CancelConfig} from '../src/flow';
import {EventEmitter} from 'events';

describe('Flow', () => {
  let instance: Flow;
  let sandbox: Sinon.SinonSandbox;
  let config = {
    element: {} as Element,
    start: new StartConfig(),
    update: new UpdateConfig(),
    end: new EndConfig(),
    cancel: new CancelConfig()
  };

  beforeEach(() => {
    instance = new Flow();
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('should extend EventEmitter', () => {
    expect(instance).to.be.an.instanceOf(EventEmitter);
  })

  it('should bind start', () => {
    config.start = new StartConfig('mousedown');
    const getEvents = sandbox.spy(config.start, 'getEvents');
    const bind = sandbox.spy(instance.addDOMEventListener, 'bind');
    instance.bind(config);
    expect(getEvents).to.have.been.calledOnce;
    expect(bind).to.have.been.calledWithExactly(instance, config.element, 'mousedown', sinon.match.func);
  });

  it('should return start function', () => {
    config.start = new StartConfig('mousedown');
    const startListen = instance.bind(config).startListen;
    expect(startListen).to.have.length(1);
  });

  it('should return continue function', () => {
    config.update = new UpdateConfig('mousemove');
    config.end = new EndConfig('mouseup');
    config.cancel = new CancelConfig('cancel');
    const continueListen = instance.bind(config).continueListen;
    expect(continueListen).to.have.length(3);
  });

  it('should add start listeners', () => {
    config.start = new StartConfig('mousedown');
    const listenerSpy = sandbox.spy();
    config.element.addEventListener = listenerSpy;
    const startListen = instance.bind(config).startListen;
    startListen.forEach(f => f());
    expect(listenerSpy).to.have.been.calledWithExactly('mousedown', sinon.match.func, false);
  });

  it('should call setPointers for events', () => {
    config.start = new StartConfig('mousedown');
    const listenerSpy = sandbox.spy();
    const setPointersSpy = sandbox.spy(instance, 'setPointers');
    config.element.addEventListener = listenerSpy;
    const startListen = instance.bind(config).startListen;
    startListen.forEach(f => f());
    listenerSpy.callArg(1);
    expect(setPointersSpy).to.have.been.calledOnce;
  });

  it('should add continue listeners', () => {
    config.update = new UpdateConfig('mousemove');
    config.end = new EndConfig('mouseup');
    config.cancel = new CancelConfig('cancel');
    const listenerSpy = sandbox.spy();
    config.element.addEventListener = listenerSpy;
    const continueListen = instance.bind(config).continueListen;
    continueListen.forEach(f => f());

    expect(listenerSpy.firstCall).to.have.been.calledWithExactly('mousemove', sinon.match.func, false);
    expect(listenerSpy.secondCall).to.have.been.calledWithExactly('mouseup', sinon.match.func, false);
    expect(listenerSpy.thirdCall).to.have.been.calledWithExactly('cancel', sinon.match.func, false);
  });

  it('should bind update', () => {
    config.start = new UpdateConfig('mousemove');
    const getEvents = sandbox.spy(config.update, 'getEvents');
    const bind = sandbox.spy(instance.addDOMEventListener, 'bind');
    instance.bind(config);
    expect(getEvents).to.have.been.calledOnce;
    expect(bind).to.have.been.calledWithExactly(instance, config.element, 'mousemove', sinon.match.func);
  });

  it('should bind end', () => {
    config.start = new EndConfig('mouseup');
    const getEvents = sandbox.spy(config.end, 'getEvents');
    const bind = sandbox.spy(instance.addDOMEventListener, 'bind');
    instance.bind(config);
    expect(getEvents).to.have.been.calledOnce;
    expect(bind).to.have.been.calledWithExactly(instance, config.element, 'mouseup', sinon.match.func);
  });

  it('should bind cancel', () => {
    config.start = new CancelConfig('cancel');
    const getEvents = sandbox.spy(config.cancel, 'getEvents');
    const bind = sandbox.spy(instance.addDOMEventListener, 'bind');
    instance.bind(config);
    expect(getEvents).to.have.been.calledOnce;
    expect(bind).to.have.been.calledWithExactly(instance, config.element, 'cancel', sinon.match.func);
  });


  it('should activate start listener and return an array of unlisten functions', () => {
    config.start = new StartConfig('mousedown');
    const startListenerSpy = sandbox.spy();
    const removeListenerSpy = sandbox.spy();
    config.element.addEventListener = startListenerSpy;
    config.element.removeEventListener = removeListenerSpy;
    const remove = instance.activate(config);
    expect(remove).to.have.length(1);
    remove.forEach(f => f());
    expect(removeListenerSpy).to.have.been.calledWithExactly('mousedown', sinon.match.func, false);
  });

  it('should emit start', () => {
    const emitSpy = sandbox.spy(instance, 'emit');
    const e = {} as Event;
    instance.start(e);
    expect(emitSpy).to.have.been.calledWithExactly('start', e, sinon.match.instanceOf(Map));
  });

  it('should emit update', () => {
    const emitSpy = sandbox.spy(instance, 'emit');
    const e = {} as Event;
    instance.update(e);
    expect(emitSpy).to.have.been.calledWithExactly('update', e, sinon.match.instanceOf(Map));
  });

  it('should emit end', () => {
    const emitSpy = sandbox.spy(instance, 'emit');
    const e = {} as Event;
    instance.allPointers.set('dummy');
    instance.end(e);
    expect(emitSpy).to.have.been.calledWithExactly('end', e, sinon.match.instanceOf(Map));
  });

  it('should emit end and call stop', () => {
    const emitSpy = sandbox.spy(instance, 'emit');
    const stopSpy = sandbox.spy(instance, 'stop');
    const e = {} as Event;
    instance.allPointers.clear();
    instance.end(e);
    expect(emitSpy).to.have.been.calledWithExactly('end', e, sinon.match.instanceOf(Map));
    expect(stopSpy).to.have.been.calledOnce;
  });

  it('should emit cancel and call stop', () => {
    const emitSpy = sandbox.spy(instance, 'emit');
    const stopSpy = sandbox.spy(instance, 'stop');
    const e = {} as Event;
    instance.cancel(e);
    expect(emitSpy).to.have.been.calledWithExactly('cancel', e, sinon.match.instanceOf(Map));
    expect(stopSpy).to.have.been.calledOnce;
  });

  it('should continue', () => {
    const spy1 = sandbox.stub().returns(() => {});
    const spy2 = sandbox.stub().returns(() => {});
    instance.continueListen = [spy1, spy2];
    instance.continue();
    expect(spy1).to.have.been.calledOnce;
    expect(spy2).to.have.been.calledOnce;
    expect(instance.removeListeners).to.have.length(2);
  });

  it('should emit stop and remove listeners', () => {
    const emitSpy = sandbox.spy(instance, 'emit');
    const spy1 = sandbox.spy();
    const spy2 = sandbox.spy();
    instance.removeListeners = [spy1, spy2];
    instance.stop();
    expect(emitSpy).to.have.been.calledWithExactly('stop');
    expect(spy1).to.have.been.calledOnce;
    expect(spy2).to.have.been.calledOnce;
    expect(instance.removeListeners).to.have.length(0);
  });
});
