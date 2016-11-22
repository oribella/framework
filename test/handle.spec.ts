import {expect} from 'chai';
import {Handle} from "../src/handle";
import {DefaultSubscriber} from '../src/registry';

describe("Handle", () => {

  it("should be a constructor", () => {
    expect(Handle).to.throw();
  });

  it("should set element, type, subscriber, active", () => {
    const element = {};
    const type = "foo";
    const subscriber = {};
    const active = false;
    const handle = new Handle(<Element>element, type, <DefaultSubscriber>subscriber, active);
    expect(handle.element).to.equal(element);
    expect(handle.type).to.equal(type);
    expect(handle.subscriber).to.equal(subscriber);
    expect(handle.active).to.equal(active);
  });

});
