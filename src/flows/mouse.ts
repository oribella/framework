import {Flow, EventConfig} from '../flow';
import {Point} from '../point';

export const MouseConfig = {
  start: new EventConfig('mousedown'),
  update: new EventConfig('mousemove'),
  end: new EventConfig('mouseup'),
  cancel: new EventConfig('dragstart', 'contextmenu')
}

export class MouseFlow extends Flow {
  constructor(element: Element) {
    super(element, MouseConfig);
  }
  setPointers(event: MouseEvent) {
    const page = new Point(event.pageX, event.pageY);
    const client = new Point(event.clientX, event.clientY);
    this.changedPointers.set('1', { page: page, client: client });

    switch (event.type) {
      case "mousedown":
      case "mousemove":
        this.allPointers.set('1', { page: page, client: client });
        break;
      default:
        this.allPointers.clear();
        break;
    }
  }
}
