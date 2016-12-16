import {expect} from 'chai';
import * as sinon from 'sinon';

describe.skip('Scenario', () => {
  let sandbox: Sinon.SinonSandbox;

  beforeEach(() => {
    sandbox = sinon.sandbox.create();
  });

  afterEach(() => {
    sandbox.restore();
  });

  it('', () => {
    expect(true).to.be.true;
  });
});
