import {Flow, StartConfig, UpdateConfig, EndConfig, CancelConfig, Pointer} from '../flow';
import {Point} from '../point';

export class TouchFlow extends Flow {
  constructor(
    element: Element,
    start: StartConfig = new StartConfig('touchstart'),
    update: UpdateConfig = new UpdateConfig('touchmove'),
    end: EndConfig = new EndConfig('touchend'),
    cancel: CancelConfig = new CancelConfig('touchcancel', 'dragstart')
    ) {
    super({
      element: element,
      start: start,
      update: update,
      end: end,
      cancel: cancel
    });
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
  setPointers(event: TouchEvent) {
    this.allPointers.clear();
    this.currentPointers.clear();
    this.setPointerMapFromList(event.touches, this.allPointers);
    this.setPointerMapFromList(event.changedTouches, this.currentPointers);
  }
}
