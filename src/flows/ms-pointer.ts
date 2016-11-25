import {StartConfig, UpdateConfig, EndConfig, CancelConfig} from '../flow';
import {PointerFlow} from './pointer';

export class MSPointerFlow extends PointerFlow {
  constructor(element: Element) {
    super(
      element,
      new StartConfig('MSPointerDown'),
      new UpdateConfig('MSPointerMove'),
      new EndConfig('MSPointerUp'),
      new CancelConfig('MSPointerCancel', 'dragstart')
    );
  }
}
