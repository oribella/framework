import {Flow, EventConfig} from '../flow';
import {Point} from '../point';
import {Pointer} from '../utils';

export const TouchConfig = {
  start: new EventConfig('touchstart'),
  update: new EventConfig('touchmove'),
  end: new EventConfig('touchend'),
  cancel: new EventConfig('touchcancel', 'dragstart')
}

export class TouchFlow extends Flow {
  constructor(element: Element) {
    super(element, TouchConfig);
  }
  setPointerMapFromList(list: TouchList, pointerMap: Map<string, Pointer>) {
    for(let i = 0, len = list.length; i < len; ++i) {
      const touch = list[i];
      const page = new Point(touch.pageX, touch.pageY);
      const client = new Point(touch.clientX, touch.clientY);
      const pointerId = touch.identifier.toString();
      const pointers = { page: page, client: client };
      pointerMap.set(pointerId, pointers);
    }
  }
  setPointers(evt: TouchEvent) {
    this.allPointers.clear();
    this.changedPointers.clear();
    this.setPointerMapFromList(evt.touches, this.allPointers);
    this.setPointerMapFromList(evt.changedTouches, this.changedPointers);
  }
}
