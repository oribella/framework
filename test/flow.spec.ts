import {expect} from 'chai';
import * as sinon from 'sinon';
import {Flow, StartConfig, UpdateConfig, EndConfig, CancelConfig} from '../src/flow';
import {EventEmitter} from 'events';

describe('Flow', () => {
  let instance: Flow;

  beforeEach(() => {
    instance = new Flow();
  });

  it('should extend EventEmitter', () => {
    expect(instance).to.be.an.instanceOf(EventEmitter);
  })

  describe('Config', () => {
    let sandbox: Sinon.SinonSandbox;
    let config = {
      element: {} as Element,
      start: new StartConfig(),
      update: new UpdateConfig(),
      end: new EndConfig(),
      cancel: new CancelConfig()
    };

    beforeEach(() => {
      sandbox = sinon.sandbox.create();
    });

    afterEach(() => {
      sandbox.restore();
    });

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
      config.element.addEventListener = sandbox.spy();
      const startListen = instance.bind(config).startListen;
      startListen.forEach(f => f());
      expect(config.element.addEventListener).to.have.been.calledWithExactly('mousedown', sinon.match.func, false);
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
      //expect(listenerSpy.thirdCall).to.have.been.calledWithExactly('cancel', sinon.match.func, false);
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

  });

});
