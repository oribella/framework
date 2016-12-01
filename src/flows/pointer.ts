import {Flow, StartConfig, UpdateConfig, EndConfig, CancelConfig} from '../flow';
import {Point} from '../point';

export class PointerFlow extends Flow {
  constructor(
    element: Element,
    start: StartConfig = new StartConfig('pointerdown'),
    update: UpdateConfig = new UpdateConfig('pointermove'),
    end: EndConfig = new EndConfig('pointerup'),
    cancel: CancelConfig = new CancelConfig('pointercancel', 'dragstart')
    ) {
    super({
      element: element,
      start: start,
      update: update,
      end: end,
      cancel: cancel
    });
  }
  setPointers(event: PointerEvent) {
    this.changedPointers.clear();
    const page = new Point(event.pageX, event.pageY);
    const client = new Point(event.clientX, event.clientY);
    const pointerId = event.pointerId.toString();
    const pointers = { page: page, client: client };
    this.changedPointers.set(pointerId, pointers);

    switch (event.type) {
      case "pointerdown":
      case "pointermove":
        this.allPointers.set(pointerId, pointers);
        break;
      default:
        this.allPointers.delete(pointerId);
        break;
    }
  }
}
