import {Flow, FlowConfig, EventConfig} from '../flow';
import {Point} from '../point';

export const PointerConfig = {
  start: new EventConfig('pointerdown'),
  update: new EventConfig('pointermove'),
  end: new EventConfig('pointerup'),
  cancel: new EventConfig('pointercancel', 'dragstart')
}
export class PointerFlow extends Flow {
  constructor(element: Element, config: FlowConfig = PointerConfig) {
    super(element, config);
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
